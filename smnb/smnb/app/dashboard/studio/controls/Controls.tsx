// STUDIO CONTROLS (REFACTORED)
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/Controls.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSimpleLiveFeedStore } from '@/lib/stores/livefeed/simpleLiveFeedStore';
import { useHostAgentStore } from '@/lib/stores/host/hostAgentStore';
import { useProducerStore } from '@/lib/stores/producer/producerStore';
import { useApiKeyStore } from '@/lib/stores/auth/apiKeyStore';
import { useBroadcastSessionStore } from '@/lib/stores/session/broadcastSessionStore';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react";

// Import components
import {
  SubredditManager,
  SearchDomainManager,
  Sessions,
  ConfigPanel,
  convertLiveFeedPostToEnhanced,
  ControlsProps,
  FeedbackState
} from './_components';

export default function Controls({ mode }: ControlsProps) {
  const profileId = 'default';

  const controlsResponse = useQuery(api.system.studioControls.getControlsState, { profileId });
  const saveSelection = useMutation(api.system.studioControls.saveSubredditSelection);
  const setSearchDomainsMutation = useMutation(api.system.studioControls.setSearchDomains);
  const addCustomSubreddit = useAction(api.system.studioControlsActions.addCustomSubreddit);

  const [newSubreddit, setNewSubreddit] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [enabledDefaults, setEnabledDefaults] = useState<string[]>([]);
  const [customSubreddits, setCustomSubreddits] = useState<string[]>([]);
  const [searchDomains, setSearchDomainsState] = useState<string[]>([]);
  const [hasCustomSelection, setHasCustomSelection] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [subredditFeedback, setSubredditFeedback] = useState<FeedbackState>({ status: 'idle' });
  const [domainFeedback, setDomainFeedback] = useState<FeedbackState>({ status: 'idle' });
  const [processedPostIds, setProcessedPostIds] = useState<Set<string>>(new Set());

  // Responsive design state
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<'compact' | 'tablet' | 'desktop' | 'wide'>('desktop');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [manualSize, setManualSize] = useState<'compact' | 'tablet' | 'desktop' | 'wide' | null>(null);

  // Size presets for different viewport sizes
  const SIZE_PRESETS = useMemo(() => ({
    compact: { cols: 3, hideSecondary: true, hideFilters: true, minWidth: 640 },
    tablet: { cols: 4, hideSecondary: true, hideFilters: false, minWidth: 768 },
    desktop: { cols: 5, hideSecondary: false, hideFilters: false, minWidth: 1024 },
    wide: { cols: 5, hideSecondary: false, hideFilters: false, minWidth: 1280 }
  }), []);

  const isLoadingControls = controlsResponse === undefined;
  const defaultGroups = useMemo(() => controlsResponse?.defaultGroups ?? [], [controlsResponse?.defaultGroups]);

  const groupMap = useMemo(() => {
    const map = new Map<string, string[]>();
    defaultGroups.forEach((group) => {
      map.set(group.id, group.subreddits);
    });
    return map;
  }, [defaultGroups]);



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

  // Column 1: Fixed 6 subreddits, Column 2: Remainder (up to 7 more)
  const primarySubreddits = combinedSelectedSubreddits.slice(0, 6);
  const secondarySubreddits = combinedSelectedSubreddits.slice(6);

  const defaultPreset = defaultGroups[0];

  useEffect(() => {
    if (!controlsResponse) {
      return;
    }

    setEnabledDefaults(controlsResponse.enabledDefaults);
    setCustomSubreddits(controlsResponse.customSubreddits);
    setSearchDomainsState(controlsResponse.searchDomains);
    setHasCustomSelection(controlsResponse.hasCustomizations);
    setActiveFilter(controlsResponse.hasCustomizations ? null : controlsResponse.activeGroupId);
  }, [controlsResponse]);

  useEffect(() => {
    if (subredditFeedback.status === 'success' || subredditFeedback.status === 'error') {
      const timeout = setTimeout(() => setSubredditFeedback({ status: 'idle' }), 4000);
      return () => clearTimeout(timeout);
    }
  }, [subredditFeedback]);

  useEffect(() => {
    if (domainFeedback.status === 'error') {
      const timeout = setTimeout(() => setDomainFeedback({ status: 'idle' }), 4000);
      return () => clearTimeout(timeout);
    }
  }, [domainFeedback]);

  // Monitor container width and auto-adjust view size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        
        // Auto-adjust view size if no manual override
        if (!manualSize) {
          if (width < SIZE_PRESETS.compact.minWidth) {
            setViewSize('compact');
          } else if (width < SIZE_PRESETS.tablet.minWidth) {
            setViewSize('tablet');
          } else if (width < SIZE_PRESETS.wide.minWidth) {
            setViewSize('desktop');
          } else {
            setViewSize('wide');
          }
        } else {
          setViewSize(manualSize);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [manualSize, SIZE_PRESETS]);

  const persistSelection = useCallback(
    async (nextEnabled: string[], nextCustom: string[], hint?: { activeGroupId?: string | null; customSelection?: boolean }) => {
      if (hint) {
        if (hint.customSelection !== undefined) {
          setHasCustomSelection(hint.customSelection);
        }
        if (hint.activeGroupId !== undefined) {
          setActiveFilter(hint.activeGroupId);
        }
      }

      setEnabledDefaults(nextEnabled);
      setCustomSubreddits(nextCustom);
      setIsSavingSelection(true);
      setSelectionError(null);

      try {
        const result = await saveSelection({
          profileId,
          enabledDefaults: nextEnabled,
          customSubreddits: nextCustom,
        });
        setEnabledDefaults(result.enabledDefaults);
        setCustomSubreddits(result.customSubreddits);
        setHasCustomSelection(result.hasCustomizations);
        setActiveFilter(result.hasCustomizations ? null : result.activeGroupId);
      } catch (error) {
        console.error('🎛️ CONTROLS: Failed to update subreddit selection', error);
        setSelectionError((error as Error).message ?? 'Failed to update subreddit selection.');
        if (controlsResponse) {
          setEnabledDefaults(controlsResponse.enabledDefaults);
          setCustomSubreddits(controlsResponse.customSubreddits);
          setHasCustomSelection(controlsResponse.hasCustomizations);
          setActiveFilter(controlsResponse.hasCustomizations ? null : controlsResponse.activeGroupId);
        }
      } finally {
        setIsSavingSelection(false);
      }
    },
    [controlsResponse, profileId, saveSelection]
  );

  const handleToggleFilter = useCallback(
    async (groupId: string) => {
      if (!groupMap.has(groupId) || isSavingSelection) {
        return;
      }

      const groupSubreddits = groupMap.get(groupId)!;
      const currentlyActive = !hasCustomSelection && activeFilter === groupId;

      if (currentlyActive) {
        await persistSelection([], [], { activeGroupId: null, customSelection: true });
      } else {
        await persistSelection(groupSubreddits, [], { activeGroupId: groupId, customSelection: false });
      }
    },
    [activeFilter, groupMap, hasCustomSelection, isSavingSelection, persistSelection]
  );

  const handleToggleDefaultSubreddit = useCallback(
    async (subreddit: string) => {
      if (isSavingSelection) {
        return;
      }

      const isEnabled = enabledDefaults.includes(subreddit);
      const nextEnabled = isEnabled
        ? enabledDefaults.filter((value) => value !== subreddit)
        : [...enabledDefaults, subreddit];

      await persistSelection(nextEnabled, customSubreddits, { activeGroupId: null, customSelection: true });
    },
    [customSubreddits, enabledDefaults, isSavingSelection, persistSelection]
  );

  const handleRemoveSubreddit = useCallback(
    async (subreddit: string) => {
      if (isSavingSelection) {
        return;
      }

      const nextEnabled = enabledDefaults.filter((value) => value !== subreddit);
      const nextCustom = customSubreddits.filter((value) => value !== subreddit);

      await persistSelection(nextEnabled, nextCustom, { activeGroupId: null, customSelection: true });
    },
    [customSubreddits, enabledDefaults, isSavingSelection, persistSelection]
  );

  const handleResetPresets = useCallback(async () => {
    if (!defaultPreset || isSavingSelection) {
      return;
    }

    await persistSelection(defaultPreset.subreddits, [], { activeGroupId: defaultPreset.id, customSelection: false });
  }, [defaultPreset, isSavingSelection, persistSelection]);

  // Parse and clean subreddit input - handles single or multiple subreddits
  const parseSubredditInput = useCallback((input: string): string[] => {
    // Split by comma, semicolon, or whitespace
    const subreddits = input.split(/[,;\s]+/)
      .map(sub => {
        // Remove r/ prefix if present, trim whitespace
        let cleaned = sub.trim().toLowerCase();
        if (cleaned.startsWith('r/')) {
          cleaned = cleaned.substring(2);
        }
        // Remove any remaining special characters except alphanumeric and underscore
        cleaned = cleaned.replace(/[^a-z0-9_]/g, '');
        return cleaned;
      })
      .filter(sub => sub.length > 0); // Remove empty strings
    
    return subreddits;
  }, []);

  const handleAddSubreddit = useCallback(async () => {
    const value = newSubreddit.trim();
    if (!value || subredditFeedback.status === 'working') {
      return;
    }

    // Parse the input - could be single or multiple subreddits
    const subredditsToAdd = parseSubredditInput(value);
    
    if (subredditsToAdd.length === 0) {
      setSubredditFeedback({ status: 'error', message: 'Please enter valid subreddit name(s).' });
      return;
    }

    setSubredditFeedback({ status: 'working' });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    try {
      // Process each subreddit individually
      for (const subreddit of subredditsToAdd) {
        try {
          const result = await addCustomSubreddit({ profileId, subreddit });

          if (result.ok) {
            successCount++;
            // Update state with the latest result
            if (result.state) {
              setEnabledDefaults(result.state.enabledDefaults);
              setCustomSubreddits(result.state.customSubreddits);
              setSearchDomainsState(result.state.searchDomains);
              setHasCustomSelection(result.state.hasCustomizations);
              setActiveFilter(result.state.hasCustomizations ? null : result.state.activeGroupId);
            }
          } else {
            errorCount++;
            errors.push(`${subreddit}: ${result.message ?? 'Failed to add'}`);
          }
        } catch (subError) {
          errorCount++;
          errors.push(`${subreddit}: ${(subError as Error).message ?? 'Unknown error'}`);
        }
      }

      // Set appropriate feedback based on results
      if (successCount > 0 && errorCount === 0) {
        const message = successCount === 1
          ? `r/${subredditsToAdd[0]} added successfully.`
          : `${successCount} subreddits added successfully.`;
        setSubredditFeedback({ status: 'success', message });
      } else if (successCount > 0 && errorCount > 0) {
        setSubredditFeedback({
          status: 'success',
          message: `${successCount} added, ${errorCount} failed. ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? '...' : ''}`
        });
      } else {
        setSubredditFeedback({
          status: 'error',
          message: `Failed to add subreddit(s). ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? '...' : ''}`
        });
      }

      // Clear input only if at least one subreddit was added successfully
      if (successCount > 0) {
        setNewSubreddit('');
      }
      
    } catch (error) {
      console.error('🎛️ CONTROLS: Failed to add subreddit(s)', error);
      setSubredditFeedback({ status: 'error', message: (error as Error).message ?? 'Failed to add subreddit(s).' });
    }
  }, [addCustomSubreddit, newSubreddit, parseSubredditInput, profileId, subredditFeedback.status]);

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
    isLive,
    setSelectedSubreddits,
    setIsLive: setLiveFeedLive
  } = useSimpleLiveFeedStore();

  const {
    isActive: isHostActive,
    start: startHostBroadcasting,
    stop: stopHostBroadcasting,
    stats: hostStats,
    processLiveFeedPost
  } = useHostAgentStore();

  const {
    startBroadcastSession,
    endBroadcastSession
  } = useBroadcastSessionStore();

  const {
    isActive: isProducerActive,
    startProducer,
    stopProducer
  } = useProducerStore();

  const {
    useUserApiKey,
    setUseUserApiKey,
    hasValidKey: hasValidApiKey
  } = useApiKeyStore();

  // Enhanced setIsLive that integrates with broadcast session management
  const setIsLive = (live: boolean) => {
    setLiveFeedLive(live);
    
    if (live) {
      // Start broadcast session when going live - this is for live feed broadcasting
      startBroadcastSession('general');
      console.log('🎙️ Starting live feed broadcast session');
    } else {
      // End broadcast session when stopping live
      endBroadcastSession();
      console.log('⏹️ Ending live feed broadcast session');
    }
  };

  // Combined broadcast function that starts/stops the host agent and producer
  const handleBroadcastToggle = async () => {
    try {
      if (isHostActive) {
        // Stop host agent and producer
        console.log('🎙️ CONTROLS: Stopping broadcast - stopping host and producer');
        await stopHostBroadcasting();
        if (isProducerActive) {
          await stopProducer();
        }
      } else {
        // Start host agent and producer
        console.log('🎙️ CONTROLS: Starting broadcast - starting host and producer');
        await startHostBroadcasting();
        if (!isProducerActive) {
          await startProducer();
        }
      }
    } catch (error) {
      console.error('🎙️ CONTROLS: Error toggling broadcast:', error);
    }
  };

  // Auto-feed live feed posts to host agent when both are active
  useEffect(() => {
    if (!isLive || !isHostActive || posts.length === 0) {
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

  }, [posts, isLive, isHostActive, processLiveFeedPost, processedPostIds]);

  // Reset processed posts when host agent state changes
  useEffect(() => {
    if (!isHostActive) {
      setProcessedPostIds(new Set()); // Clear processed posts when agent stops
      console.log('🗑️ HOST FEED: Cleared processed posts cache');
    }
  }, [isHostActive, setProcessedPostIds]);

  useEffect(() => {
    if (!controlsResponse) {
      return;
    }

    const merged = [...enabledDefaults, ...customSubreddits];
    setSelectedSubreddits(merged);
  }, [controlsResponse, customSubreddits, enabledDefaults, setSelectedSubreddits]);

  // Responsive helper functions
  const getCurrentPreset = () => {
    return SIZE_PRESETS[manualSize || viewSize] || SIZE_PRESETS.desktop;
  };

  const preset = getCurrentPreset();

  // Dynamic grid columns with fixed widths for consistency
  const getGridCols = () => {
    const gridCols = {
      3: 'grid-cols-[200px_200px_50px_200px]', // subreddit1 + subreddit2 + presets + search
      4: 'grid-cols-[200px_200px_50px_200px_200px]', // subreddit1 + subreddit2 + presets + search + sessions
      5: 'grid-cols-[200px_200px_50px_200px_200px_210px]' // subreddit1 + subreddit2 + presets + search + sessions + config (wider)
    } as const;
    return gridCols[preset.cols as keyof typeof gridCols] || gridCols[5];
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
              onClick={() => {
                if (isLive && isHostActive) {
                  setIsLive(false);
                  handleBroadcastToggle();
                } else {
                  if (!isLive) setIsLive(true);
                  if (!isHostActive) handleBroadcastToggle();
                }
              }}
              className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                (isLive && isHostActive)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-card text-muted-foreground border border-border hover:bg-card/80'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${(isLive && isHostActive) ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              <span>{(isLive && isHostActive) ? 'LIVE' : 'Live'}</span>
            </button>
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
    <div ref={containerRef} className="bg-card border border-border rounded-t-xs rounded-b-lg shadow-sm">
      {/* Header with responsive controls and Live button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-light text-muted-foreground font-sans">Control Panel</span>
          
          {/* Live Button moved from System column */}
          <button
            onClick={() => {
              if (isLive && isHostActive) {
                // Stop when active
                setIsLive(false);
                handleBroadcastToggle();
              } else {
                // Start when inactive
                if (!isLive) setIsLive(true);
                if (!isHostActive) handleBroadcastToggle();
              }
            }}
            className={`px-3 py-1 text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
              (isLive && isHostActive)
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-card text-muted-foreground border border-border hover:bg-card/80'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${(isLive && isHostActive) ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            <span>{(isLive && isHostActive) ? 'LIVE' : 'Live'}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Size preset buttons */}
          <button
            title="Compact View"
            onClick={() => setManualSize(manualSize === 'compact' ? null : 'compact')}
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors ${
              (manualSize || viewSize) === 'compact' ? 'text-blue-400' : 'text-muted-foreground/70'
            }`}
          >
            <Smartphone className="w-3 h-3" />
          </button>
          <button
            title="Tablet View"
            onClick={() => setManualSize(manualSize === 'tablet' ? null : 'tablet')}
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors ${
              (manualSize || viewSize) === 'tablet' ? 'text-blue-400' : 'text-muted-foreground/70'
            }`}
          >
            <Tablet className="w-3 h-3" />
          </button>
          <button
            title="Desktop View"
            onClick={() => setManualSize(manualSize === 'desktop' ? null : 'desktop')}
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors ${
              (manualSize || viewSize) === 'desktop' ? 'text-blue-400' : 'text-muted-foreground/70'
            }`}
          >
            <Monitor className="w-3 h-3" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
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
          {/* Column 1: Subreddit Manager (double column, 8 rows) */}
          <SubredditManager
            enabledDefaults={enabledDefaults}
            customSubreddits={customSubreddits}
            primarySubreddits={primarySubreddits}
            secondarySubreddits={secondarySubreddits}
            newSubreddit={newSubreddit}
            setNewSubreddit={setNewSubreddit}
            subredditFeedback={subredditFeedback}
            selectionError={selectionError}
            isLoadingControls={isLoadingControls}
            handleAddSubreddit={handleAddSubreddit}
            handleToggleDefaultSubreddit={handleToggleDefaultSubreddit}
            handleRemoveSubreddit={handleRemoveSubreddit}
            showHeaders={false} // Remove column headers
          />

          {/* Column 3: Preset Column - Wider column with flexible button widths */}
          <div className="space-y-1 px-0">
            {defaultGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleToggleFilter(group.id)}
                disabled={isSavingSelection || isLoadingControls}
                className={`w-full py-1 text-xs rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed text-center whitespace-nowrap ${
                  !hasCustomSelection && activeFilter === group.id
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-[#1a1a1a] text-muted-foreground/50 hover:text-muted-foreground/70'
                }`}
              >
                {group.label.split(' ')[0]} {/* Only first word */}
              </button>
            ))}
            {defaultGroups.length === 0 && (
              <div className="w-full px-1 py-1 text-xs text-muted-foreground/40 border border-border/20 rounded-sm text-center">
                None
              </div>
            )}
            {/* Reset button if custom selection */}
            {hasCustomSelection && defaultPreset && (
              <button
                onClick={handleResetPresets}
                disabled={isSavingSelection || isLoadingControls}
                className="w-full px-1 py-1 text-xs text-blue-400 hover:text-blue-300 disabled:text-muted-foreground/40 text-center"
              >
                Reset
              </button>
            )}
          </div>

          {/* Column 4: Search Domain Manager */}
          <SearchDomainManager
            searchDomains={searchDomains}
            newDomain={newDomain}
            setNewDomain={setNewDomain}
            domainFeedback={domainFeedback}
            handleAddDomain={handleAddDomain}
            handleRemoveDomain={handleRemoveDomain}
            showConfigInline={preset.cols === 3}
            showHeaders={false} // Remove headers
            configData={preset.cols === 3 ? {
              enabledDefaultsCount: enabledDefaults.length,
              customSubredditsCount: customSubreddits.length,
              hostStats: { totalNarrations: hostStats.totalNarrations },
              useUserApiKey,
              setUseUserApiKey,
              hasValidApiKey,
              postsCount: posts.length, // Add feed/queue data
              queueLength: hostStats.queueLength
            } : undefined}
          />

          {/* Column 5: Sessions - Only in 4+ column mode */}
          {preset.cols >= 4 && (
            <Sessions
              showHeaders={false} // Remove headers
            />
          )}

          {/* Column 6: Config Panel - Only in 5+ column mode */}
          {preset.cols >= 5 && (
            <ConfigPanel
              enabledDefaultsCount={enabledDefaults.length}
              customSubredditsCount={customSubreddits.length}
              hostStats={{ totalNarrations: hostStats.totalNarrations }}
              mode={mode}
              useUserApiKey={useUserApiKey}
              setUseUserApiKey={setUseUserApiKey}
              hasValidApiKey={hasValidApiKey}
              showHeaders={false} // Remove headers
              postsCount={posts.length} // Add feed/queue data
              queueLength={hostStats.queueLength}
            />
          )}
        </div>
      </div>
    </div>
  );
}