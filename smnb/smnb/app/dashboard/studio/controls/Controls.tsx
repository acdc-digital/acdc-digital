// STUDIO CONTROLS (REFACTORED)
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/Controls.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSimpleLiveFeedStore } from '@/lib/stores/livefeed/simpleLiveFeedStore';
import { useHostAgentStore } from '@/lib/stores/host/hostAgentStore';
import { useBroadcastOrchestrator, useIsBroadcasting, useIsTransitioning, useBroadcastError } from '@/lib/stores/orchestrator/broadcastOrchestrator';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Maximize2,
  Minimize2,
  RefreshCw
} from "lucide-react";

// Import components
import {
  SubredditManager,
  SearchDomainManager,
  ConfigPanel,
  convertLiveFeedPostToEnhanced,
  ControlsProps,
  FeedbackState
} from './_components';

export default function Controls({ mode }: ControlsProps) {
  const profileId = 'default';

  const controlsResponse = useQuery(api.system.studioControls.getControlsState, { profileId });
  const setSearchDomainsMutation = useMutation(api.system.studioControls.setSearchDomains);
  const regenerateSubreddits = useAction(api.reddit.subredditSources.regenerateSubredditList);
  const regenerationProgress = useQuery(api.reddit.subredditSourcesMutations.getRegenerationProgress);
  const isRegeneratingServer = useQuery(api.reddit.subredditSourcesMutations.isRegenerationRunning);

  const [newDomain, setNewDomain] = useState('');
  const [enabledDefaults, setEnabledDefaults] = useState<string[]>([]);
  const [customSubreddits, setCustomSubreddits] = useState<string[]>([]);
  const [searchDomains, setSearchDomainsState] = useState<string[]>([]);
  const [domainFeedback, setDomainFeedback] = useState<FeedbackState>({ status: 'idle' });
  const [processedPostIds, setProcessedPostIds] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [regenerateStatus, setRegenerateStatus] = useState<string>('');
  
  // Use server state for isRegenerating to persist across tab switches
  const isRegenerating = isRegeneratingServer ?? false;

  const combinedSelectedSubreddits = useMemo(() => {
    const merged: string[] = [];
    enabledDefaults.forEach((subreddit) => {
      if (!merged.includes(subreddit)) {
        merged.push(subreddit);
      }
    });
    customSubreddits.forEach((subreddit) => {
      if (!merged.includes(subreddit)) {
        merged.push(subreddit);
      }
    });
    return merged;
  }, [enabledDefaults, customSubreddits]);

  // Column 1: First 7 subreddits, Column 2: Remainder (scrollable)
  const primarySubreddits = combinedSelectedSubreddits.slice(0, 7);
  const secondarySubreddits = combinedSelectedSubreddits.slice(7);

  useEffect(() => {
    if (!controlsResponse) {
      return;
    }

    setEnabledDefaults(controlsResponse.enabledDefaults);
    setCustomSubreddits(controlsResponse.customSubreddits);
    setSearchDomainsState(controlsResponse.searchDomains);
  }, [controlsResponse]);

  useEffect(() => {
    if (domainFeedback.status === 'error') {
      const timeout = setTimeout(() => setDomainFeedback({ status: 'idle' }), 4000);
      return () => clearTimeout(timeout);
    }
  }, [domainFeedback]);

  const handleAddDomain = useCallback(async () => {
    const value = newDomain.trim();
    if (!value || domainFeedback.status === 'working') {
      return;
    }

    if (searchDomains.some((domain) => domain.toLowerCase() === value.toLowerCase())) {
      setDomainFeedback({ status: 'error', message: 'Domain already added.' });
      return;
    }

    setDomainFeedback({ status: 'working' });

    try {
      const result = await setSearchDomainsMutation({
        profileId,
        domains: [...searchDomains, value],
      });
      setSearchDomainsState(result.searchDomains);
      setNewDomain('');
      setDomainFeedback({ status: 'idle' });
    } catch (error) {
      console.error('🎛️ CONTROLS: Failed to update search domains', error);
      setDomainFeedback({ status: 'error', message: (error as Error).message ?? 'Failed to update search domains.' });
    }
  }, [domainFeedback.status, newDomain, profileId, searchDomains, setSearchDomainsMutation]);

  const handleRemoveDomain = useCallback(async (domain: string) => {
    if (domainFeedback.status === 'working') {
      return;
    }

    setDomainFeedback({ status: 'working' });

    try {
      const result = await setSearchDomainsMutation({
        profileId,
        domains: searchDomains.filter((value) => value !== domain),
      });
      setSearchDomainsState(result.searchDomains);
      setDomainFeedback({ status: 'idle' });
    } catch (error) {
      console.error('🎛️ CONTROLS: Failed to remove search domain', error);
      setDomainFeedback({ status: 'error', message: (error as Error).message ?? 'Failed to update search domains.' });
    }
  }, [domainFeedback.status, profileId, searchDomains, setSearchDomainsMutation]);
  
  const {
    posts,
    setSelectedSubreddits
  } = useSimpleLiveFeedStore();

  const {
    stats: hostStats,
    processLiveFeedPost
  } = useHostAgentStore();

  // Orchestrator hooks - centralized broadcast state
  const { startBroadcast, stopBroadcast } = useBroadcastOrchestrator();
  const isLive = useIsBroadcasting();
  const isTransitioning = useIsTransitioning();
  const broadcastError = useBroadcastError();

  // Simplified broadcast toggle - orchestrator handles all coordination
  const handleBroadcastToggle = async () => {
    try {
      if (isLive) {
        await stopBroadcast();
      } else {
        // For Controls.tsx, use general session (TODO: integrate with session selector)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await startBroadcast(null as any); // Orchestrator will handle null/general case
      }
    } catch (error) {
      console.error('🎙️ CONTROLS: Error toggling broadcast:', error);
    }
  };

  // Auto-feed live feed posts to host agent when live
  useEffect(() => {
    // Orchestrator ensures host is active when isLive is true
    if (!isLive || posts.length === 0) {
      return;
    }

    // Find new posts that haven't been processed yet
    const newPosts = posts.filter(post => !processedPostIds.has(post.id));

    if (newPosts.length === 0) {
      return; // No new posts to process
    }

    console.log(`🔄 HOST FEED: Found ${newPosts.length} new posts to process`);
    
    // Process new posts one by one with delays - limit to prevent overflow
    const postsToProcess = newPosts.slice(0, 3); // Process up to 3 new posts at a time
    postsToProcess.forEach((post, index) => {
      setTimeout(() => {
        // Double-check the post wasn't processed by another effect
        if (processedPostIds.has(post.id)) {
          console.log(`⏭️ HOST FEED: Post ${post.id} already processed, skipping`);
          return;
        }
        
        console.log(`📤 HOST FEED: Sending post ${index + 1}/${postsToProcess.length} to host: ${post.title.substring(0, 50)}...`);
        
        const enhancedPost = convertLiveFeedPostToEnhanced(post);
        processLiveFeedPost(enhancedPost);
        
        // Mark this post as processed immediately
        setProcessedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.add(post.id);
          return newSet;
        });
        console.log(`✅ HOST FEED: Marked post as processed: ${post.id}`);
      }, index * 3000); // 3-second delay between posts for better pacing
    });

  }, [posts, isLive, processLiveFeedPost, processedPostIds]);

  // Reset processed posts when broadcast stops
  useEffect(() => {
    if (!isLive) {
      setProcessedPostIds(new Set()); // Clear processed posts when broadcast stops
      console.log('🗑️ HOST FEED: Cleared processed posts cache');
    }
  }, [isLive, setProcessedPostIds]);

  useEffect(() => {
    if (!controlsResponse) {
      return;
    }

    const merged = [...enabledDefaults, ...customSubreddits];
    setSelectedSubreddits(merged);
  }, [controlsResponse, customSubreddits, enabledDefaults, setSelectedSubreddits]);

  // Responsive helper functions
  // Dynamic grid columns with fixed widths for consistency
  const getGridCols = () => {
    // 4 columns: SubredditManager (2 cols) + Search (1 col) + Config (1 col)
    return 'grid-cols-4';
  };

  // Render collapsed view
  if (isCollapsed) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-light text-muted-foreground">Control Panel</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Feed: {posts.length} | Queue: {hostStats.queueLength}</span>
            </div>
            {/* Live Button in collapsed view */}
            <button
              onClick={handleBroadcastToggle}
              disabled={isTransitioning}
              className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-move flex items-center gap-1 ${
                isLive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-card text-muted-foreground border border-border hover:bg-card/80'
              } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTransitioning ? (
                <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              )}
              <span>{isLive ? 'LIVE' : 'Live'}</span>
            </button>

            {/* Error Display */}
            {broadcastError && (
              <div className="text-xs text-red-400 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
                {broadcastError}
              </div>
            )}
          </div>
          <button
            title="Expand Panel"
            onClick={() => setIsCollapsed(false)}
            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors text-muted-foreground/70 hover:text-muted-foreground"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-t-xs rounded-b-lg shadow-sm">
      {/* Header with responsive controls and Live button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-light text-muted-foreground font-sans">Control Panel</span>
          
          {/* Regenerate Subs Button */}
          <button
            onClick={async () => {
              setRegenerateStatus('Starting validation...');
              try {
                const result = await regenerateSubreddits({});
                setRegenerateStatus(result.message);
                setTimeout(() => setRegenerateStatus(''), 8000);
              } catch (error) {
                setRegenerateStatus(`Error: ${(error as Error).message}`);
                setTimeout(() => setRegenerateStatus(''), 8000);
              }
            }}
            disabled={isRegenerating}
            className="px-2 py-1 text-xs rounded-sm transition-colors flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Validate and update subreddit list from Reddit API (~10 min process)"
          >
            <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="font-medium">{isRegenerating ? 'Validating' : 'Regenerate Subs'}</span>
          </button>
          
          {/* Progress/Status Display */}
          {isRegenerating && (
            <div className="flex items-center gap-2 text-xs">
              <div className="text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                {regenerationProgress || 'Initializing...'}
              </div>
              <div className="text-muted-foreground/70">
                Est. 8-12 min • Live progress
              </div>
            </div>
          )}
          
          {/* Completion Message */}
          {!isRegenerating && regenerateStatus && (
            <div className="text-xs text-blue-400 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded font-medium max-w-lg truncate" title={regenerateStatus}>
              {regenerateStatus}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            title="Minimize"
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors text-muted-foreground/70 hover:text-muted-foreground"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <div className="p-3">
        <div className={`grid ${getGridCols()} gap-2`}>
          {/* Columns 1-2: Subreddit Manager (2 columns, display only) */}
          <SubredditManager
            enabledDefaults={enabledDefaults}
            customSubreddits={customSubreddits}
            primarySubreddits={primarySubreddits}
            secondarySubreddits={secondarySubreddits}
            selectionError={null}
            isLoadingControls={false}
            handleToggleDefaultSubreddit={() => {}} // No-op function
            handleRemoveSubreddit={() => {}} // No-op function
            showHeaders={false}
          />

          {/* Column 3: Search Domain Manager */}
          <SearchDomainManager
            searchDomains={searchDomains}
            newDomain={newDomain}
            setNewDomain={setNewDomain}
            domainFeedback={domainFeedback}
            handleAddDomain={handleAddDomain}
            handleRemoveDomain={handleRemoveDomain}
            showConfigInline={false}
            showHeaders={false}
          />

          {/* Column 4: Config Panel */}
          <ConfigPanel
            enabledDefaultsCount={enabledDefaults.length}
            customSubredditsCount={customSubreddits.length}
            hostStats={{ totalNarrations: hostStats.totalNarrations }}
            mode={mode}
            showHeaders={false}
            postsCount={posts.length}
            queueLength={hostStats.queueLength}
          />
        </div>
      </div>
    </div>
  );
}