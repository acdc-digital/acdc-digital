"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SessionList } from "./_components/SessionList";
import { SessionDetails } from "./_components/SessionDetails";
import { SessionChat } from "./_components/SessionChat";
import { DocumentUploadModal } from "@/app/components/session/DocumentUploadModal";
import { Button } from "@/app/components/ui/button";
import { Plus, Settings2, FileText, LogIn, Sparkles, Radio } from "lucide-react";
import { useSimpleLiveFeedStore } from "@/lib/stores/livefeed/simpleLiveFeedStore";
import {
  useBroadcastOrchestrator,
  useIsBroadcasting,
  useIsTransitioning,
  useBroadcastError,
  useBroadcastState,
  useActiveBroadcastSessionId
} from "@/lib/stores/orchestrator/broadcastOrchestrator";
import { useHostAgentStore } from "@/lib/stores/host/hostAgentStore";
import { useBroadcastSync } from "@/lib/hooks/useBroadcastSync";
import { convertLiveFeedPostToEnhanced } from "../controls/_components/types";
import { useCachedQuery } from "@/lib/context/CacheContext";

interface SessionsProps {
  isActive?: boolean;
}

export function Sessions({ isActive = true }: SessionsProps) {
  const { user, isLoaded } = useUser(); // Clerk user - fast, client-side only
  const isAuthenticated = isLoaded && !!user; // Simple check
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"sessions"> | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0); // Local duration in milliseconds
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastSyncRef = useRef<number>(0);
  const baselineDurationRef = useRef<number>(0); // Store baseline when timer starts

  // Show loading state while Clerk is initializing to prevent hydration errors
  const [isClientReady, setIsClientReady] = useState(false);
  
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Use cached query for instant tab switching - only when panel is active
  const sessions = useCachedQuery<typeof api.users.sessions.list._returnType>(
    'sessions-list',
    api.users.sessions.list,
    isActive && isAuthenticated ? {} : "skip"
  );
  const createSession = useMutation(api.users.sessions.create);
  const selectedSession = useQuery(
    api.users.sessions.get,
    isActive && selectedSessionId && isAuthenticated ? { id: selectedSessionId } : "skip"
  );
  const sessionStats = useQuery(
    api.users.sessions.getSessionStats,
    isActive && selectedSessionId && isAuthenticated ? { id: selectedSessionId } : "skip"
  );
  const startSessionTimer = useMutation(api.users.sessions.startSessionTimer);
  const updateSessionDuration = useMutation(api.users.sessions.updateSessionDuration);
  const pauseSessionTimer = useMutation(api.users.sessions.pauseSessionTimer);
  
  // ========================================================================
  // BROADCAST ORCHESTRATOR (Replaces individual store management)
  // ========================================================================
  const { startBroadcast, stopBroadcast, recover, initialize } = useBroadcastOrchestrator();
  const isLive = useIsBroadcasting();
  const isTransitioning = useIsTransitioning();
  const broadcastError = useBroadcastError();
  const broadcastState = useBroadcastState();
  const activeBroadcastSessionId = useActiveBroadcastSessionId(); // Track which session is broadcasting
  
  // Session Manager should only consider itself "broadcasting" if its selected session is active
  // This allows Studio host broadcasts to run independently
  const isThisSessionBroadcasting = isLive && activeBroadcastSessionId === selectedSessionId;
  
  // Sync broadcast state with Convex backend
  useBroadcastSync({
    sessionId: selectedSessionId,
    enabled: isAuthenticated && selectedSessionId !== null,
    syncInterval: 5000, // Sync every 5 seconds
    syncOnStateChange: true, // Immediate sync on state changes
  });
  
  // Still need access to live feed posts for auto-processing
  const { posts } = useSimpleLiveFeedStore();
  const { processLiveFeedPost, getSessionQueueLength } = useHostAgentStore();
  
  // Filter posts by current session
  const sessionPosts = posts.filter(post => post.sessionId === selectedSessionId);
  
  // Get session-specific queue length
  const sessionQueueLength = getSessionQueueLength(selectedSessionId);
  
  // Note: processedPostIds should be moved to global store in future
  // For now, keeping it local but this causes state loss on tab switch
  const [processedPostIds, setProcessedPostIds] = useState<Set<string>>(new Set());
  
  // Button shows red when THIS session is actually broadcasting
  const isBroadcasting = isThisSessionBroadcasting;

  // ========================================================================
  // SESSION PERSISTENCE - Restore from localStorage on mount
  // ========================================================================
  useEffect(() => {
    // Only restore if authenticated and no session selected yet
    if (!isAuthenticated || selectedSessionId) return;
    
    try {
      const persistedSessionId = localStorage.getItem('smnb_last_session_id');
      if (persistedSessionId) {
        console.log(`💾 SESSIONS: Restoring persisted session: ${persistedSessionId}`);
        setSelectedSessionId(persistedSessionId as Id<"sessions">);
      }
    } catch (error) {
      console.error('❌ Failed to restore session from localStorage:', error);
    }
  }, [isAuthenticated, selectedSessionId]);

  // ========================================================================
  // BROADCAST TOGGLE (Using Orchestrator)
  // ========================================================================
  const handleToggleLive = async () => {
    try {
      if (isThisSessionBroadcasting) {
        // Currently broadcasting THIS session - stop
        console.log('📺 SESSIONS: Stopping broadcast via orchestrator');
        await stopBroadcast();
      } else {
        // Not broadcasting - need to start
        // Handle different initial states appropriately
        if (broadcastState === 'idle') {
          // From idle, we need to initialize
          console.log('📺 SESSIONS: Idle state detected, initializing orchestrator...');
          await initialize();
        } else if (broadcastState === 'error') {
          // From error, we need to recover (which will transition to idle, then initialize)
          console.log('📺 SESSIONS: Error state detected, attempting recovery...');
          await recover();
        } else if (broadcastState === 'ready') {
          // Already ready, can start directly
          console.log('📺 SESSIONS: System ready, starting broadcast...');
        } else {
          // For any other state (initializing, starting, stopping), log and wait
          console.warn(`📺 SESSIONS: Unexpected state '${broadcastState}' when trying to start`);
          return;
        }
        
        // Start the broadcast (will only work if state is 'ready')
        console.log('📺 SESSIONS: Starting broadcast via orchestrator');
        await startBroadcast(selectedSessionId ?? undefined);
      }
    } catch (error) {
      console.error('📺 SESSIONS: Error toggling broadcast:', error);
      // Error is already captured in orchestrator state
    }
  };

  // ========================================================================
  // SYNC SELECTED SESSION - Save to localStorage and orchestrator
  // ========================================================================
  useEffect(() => {
    if (!selectedSessionId) return;
    
    try {
      // Persist to localStorage for browser refresh
      localStorage.setItem('smnb_last_session_id', selectedSessionId);
      
      // Sync to orchestrator's lastSessionId so LiveFeed can load stories
      const orchestrator = useBroadcastOrchestrator.getState();
      if (orchestrator.lastSessionId !== selectedSessionId) {
        console.log(`🔄 SESSIONS: Syncing session to orchestrator: ${selectedSessionId}`);
        useBroadcastOrchestrator.setState({ lastSessionId: selectedSessionId });
      }
    } catch (error) {
      console.error('❌ Failed to persist session:', error);
    }
  }, [selectedSessionId]);

  // Auto-select session logic:
  // 1. If THIS session is broadcasting, keep it selected
  // 2. If no session selected and sessions exist, select the first one
  // 3. If selected session was deleted, select the first available
  useEffect(() => {
    // Priority 1: If THIS session is broadcasting, don't allow switching
    // (Note: We don't force-select other broadcasting sessions - they can run independently)
    if (isThisSessionBroadcasting) {
      return; // Keep current selection locked while broadcasting
    }
    
    // Priority 2: Auto-select first session if none selected
    if (sessions && sessions.length > 0 && !selectedSessionId) {
      console.log(`📺 SESSIONS: Auto-selecting first session: ${sessions[0]._id}`);
      setSelectedSessionId(sessions[0]._id);
    }
  }, [sessions, selectedSessionId, isThisSessionBroadcasting]);

  // If the selected session no longer exists, select the first available session
  useEffect(() => {
    // Don't change selection if THIS session is broadcasting
    if (isThisSessionBroadcasting) return;
    
    if (sessions && selectedSessionId) {
      const sessionExists = sessions.some(session => session._id === selectedSessionId);
      if (!sessionExists) {
        console.log(`📺 SESSIONS: Selected session deleted or no longer exists`);
        
        // Clear from localStorage since it's invalid
        try {
          localStorage.removeItem('smnb_last_session_id');
        } catch (error) {
          console.error('❌ Failed to clear invalid session from localStorage:', error);
        }
        
        // Switch to first available session if any exist
        if (sessions.length > 0) {
          console.log(`📺 SESSIONS: Switching to first available session: ${sessions[0]._id}`);
          setSelectedSessionId(sessions[0]._id);
        } else {
          // No sessions available, clear selection
          setSelectedSessionId(null);
        }
      }
    }
  }, [sessions, selectedSessionId, isThisSessionBroadcasting]);

  // Initialize session duration from database when session changes
  useEffect(() => {
    if (!selectedSessionId || !selectedSession) return;
    
    // Set initial duration from database
    const dbDuration = selectedSession.totalDuration ?? 0;
    setSessionDuration(dbDuration);
    // Also update the baseline ref so it's in sync
    baselineDurationRef.current = dbDuration;
    
    console.log(`📊 SESSIONS: Initialized duration for session: ${formatDuration(dbDuration)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId, selectedSession?.totalDuration]);

  // Session timer management: start/pause/update duration - ONLY runs when THIS session broadcasts
  useEffect(() => {
    if (!selectedSessionId) return;
    
    // Only start timer when THIS session is broadcasting
    if (!isThisSessionBroadcasting) {
      console.log('⏸️ SESSIONS: Timer paused - session not broadcasting');
      return;
    }

    console.log('▶️ SESSIONS: Timer started - session broadcasting');
    
    // Use the current baseline from ref (already set by initialization effect)
    // If timer was already running, this will continue from where it left off
    
    // Start timer for this session
    startTimeRef.current = Date.now();
    lastSyncRef.current = Date.now();
    
    // Start the session timer in database if not already started
    startSessionTimer({ id: selectedSessionId }).catch(console.error);

    // Update local duration every second - smooth counting
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setSessionDuration(baselineDurationRef.current + elapsed);

      // Sync to database every 10 seconds
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      if (timeSinceLastSync >= 10000) {
        const totalElapsed = Date.now() - startTimeRef.current;
        updateSessionDuration({
          id: selectedSessionId,
          additionalMilliseconds: totalElapsed,
        }).catch(console.error);
        
        // Reset tracking for next sync period
        lastSyncRef.current = Date.now();
        startTimeRef.current = Date.now();
        // Update baseline ref for next interval
        baselineDurationRef.current = baselineDurationRef.current + totalElapsed;
      }
    }, 1000);

    // Cleanup: pause timer when stopping Live or switching sessions
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Save final duration to database when stopping
      const finalElapsed = Date.now() - startTimeRef.current;
      const finalDuration = baselineDurationRef.current + finalElapsed;
      
      pauseSessionTimer({
        id: selectedSessionId,
        finalDuration,
      }).catch(console.error);
      
      // Update baseline ref for when component remounts
      baselineDurationRef.current = finalDuration;
      
      console.log('⏹️ SESSIONS: Timer stopped and saved:', formatDuration(finalDuration));
    };
  }, [selectedSessionId, isThisSessionBroadcasting, startSessionTimer, updateSessionDuration, pauseSessionTimer]);

  // Format duration for display (HH:MM:SS)
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-process live feed posts for THIS session when broadcasting
  useEffect(() => {
    // Orchestrator ensures host is active when THIS session is broadcasting
    if (!isThisSessionBroadcasting || sessionPosts.length === 0) {
      return;
    }

    console.log(`📮 SESSIONS: Auto-feed check - ${sessionPosts.length} session posts available`);

    // Filter out posts we've already processed
    const newPosts = sessionPosts.filter(post => !processedPostIds.has(post.id));
    
    if (newPosts.length === 0) {
      console.log('📮 SESSIONS: No new posts to process');
      return;
    }

    console.log(`📮 SESSIONS: Found ${newPosts.length} new posts to feed to host`);

    // Process up to 3 posts at a time with delays
    const postsToProcess = newPosts.slice(0, 3);
    
    postsToProcess.forEach((post, index) => {
      setTimeout(() => {
        console.log(`📮 SESSIONS: Feeding post ${index + 1}/${postsToProcess.length} to host:`, post.title);
        
        // Convert to enhanced format
        const enhancedPost = convertLiveFeedPostToEnhanced(post);
        
        // Feed to host agent
        processLiveFeedPost(enhancedPost);
        
        // Mark as processed
        setProcessedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.add(post.id);
          return newSet;
        });
      }, index * 3000); // 3 second delay between posts
    });

  }, [isThisSessionBroadcasting, sessionPosts, processedPostIds, processLiveFeedPost]);

  // Safeguard: Prevent manual session switching while THIS session is broadcasting
  const handleSessionSelect = (id: Id<"sessions">) => {
    if (isThisSessionBroadcasting && id !== selectedSessionId) {
      console.warn(`⚠️ SESSIONS: Cannot switch away from broadcasting session ${selectedSessionId}`);
      // Could show a toast notification here
      return;
    }
    setSelectedSessionId(id);
  };

  const handleCreateSession = async () => {
    // Prevent creating sessions if THIS session is broadcasting (but allow if other sessions broadcast)
    if (isThisSessionBroadcasting) {
      console.warn(`⚠️ SESSIONS: Cannot create new session while current session is broadcasting`);
      return;
    }
    
    const id = await createSession({
      name: `Session ${new Date().toLocaleString()}`,
      settings: {
        model: "claude-3-sonnet",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0,
        controlMode: "balanced"
      }
    });
    
    // Auto-select the new session
    setSelectedSessionId(id);
  };

  // Render immediately - handle auth/loading states inline
  return (
    <div className="flex h-full w-full bg-black">
      {/* Prevent hydration mismatch - wait for client to be ready */}
      {!isClientReady || !isLoaded ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-neutral-400">Loading...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center max-w-md">
            <LogIn className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to continue</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Access your AI sessions and manage your conversations securely
            </p>
            <SignInButton mode="modal">
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
                Sign in with Clerk
              </Button>
            </SignInButton>
          </div>
        </div>
      ) : (
        <>
          {/* Left Sidebar - Narrow Session Selector */}
          <div className="w-64 bg-[#191919] border-r border-neutral-800 flex flex-col">
            {/* Header */}
            <div className="p-2.5 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-0">
                <div className="flex items-center gap-2">
                  <span className="pl-1 text-sm font-light text-muted-foreground font-sans">SESSIONS</span>
                </div>
                <Button
                  onClick={handleCreateSession}
                  size="sm"
                  className="h-6 w-6 p-0 bg-[#191919] hover:bg-[#3d3d3d] transition-colors border border-muted-foreground/70 text-muted-foreground/70 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Session List - Compact */}
            <div className="flex-1 overflow-y-auto">
              <SessionList
                sessions={sessions || []}
                selectedId={selectedSessionId}
                onSelect={handleSessionSelect}
              />
            </div>
          </div>

          {/* Main Content Area - Uses Full Remaining Space */}
          <div className="flex-1 flex">{selectedSession ? (
          <>
            {/* Center Panel - Chat/Primary Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Session Header Bar */}
              <div className="h-11 bg-[#191919] border-b border-neutral-800 flex items-center px-4">
                <div className="flex-1 flex items-center gap-4">
                  <SessionDetails session={selectedSession} />
                </div>
              </div>

              {/* Main Content Area - Always Chat */}
              <div className="flex-1 bg-[#191919] overflow-hidden">
                <SessionChat sessionId={selectedSessionId!} />
              </div>
            </div>

            {/* Right Sidebar - Unified Design */}
            <div className="w-84 bg-[#191919] border-l border-neutral-800 flex flex-col">
              {/* Unified Content Panel */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Header with Live Button */}
                  <div className="px-4 py-[7.5px] border-b border-neutral-800">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleToggleLive}
                          size="sm"
                          variant={isBroadcasting ? "default" : "outline"}
                          disabled={isTransitioning}
                          className={`h-7 gap-1.5 ${
                            isBroadcasting
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : broadcastState === 'error'
                                ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500"
                                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                          }`}
                        >
                          {isTransitioning ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin" />
                              <span className="text-xs font-medium">
                                {isBroadcasting ? "Stopping..." : "Starting..."}
                              </span>
                            </>
                          ) : broadcastState === 'error' ? (
                            <>
                              <span className="text-xs font-medium">⚠️ Recover & Start</span>
                            </>
                          ) : (
                            <>
                              <Radio className={`w-3 h-3 ${isBroadcasting ? "animate-pulse" : ""}`} />
                              <span className="text-xs font-medium">
                                {isBroadcasting ? "LIVE" : "Go Live"}
                              </span>
                            </>
                          )}
                        </Button>

                        {/* State Badge */}
                        {process.env.NODE_ENV === 'development' && (
                          <span className="text-xs text-neutral-500 font-mono">
                            {broadcastState}
                          </span>
                        )}
                      </div>

                      {/* Error Display */}
                      {broadcastError && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                          {broadcastError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Session Overview Section */}
                  <div className="px-4 pt-0">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Session Overview
                    </h3>
                    <div className="space-y-0.75">
                      {/* Session ID/Name */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Session</span>
                        <span className="text-xs text-neutral-200 font-mono truncate max-w-[180px]">
                          {selectedSession.name}
                        </span>
                      </div>
                      
                      {/* Tokens */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Tokens</span>
                        <span className="text-xs text-cyan-400 font-mono">
                          {sessionStats?.totalTokens.toLocaleString() ?? "0"}
                        </span>
                      </div>
                      
                      {/* Stories */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Stories</span>
                        <span className="text-xs text-cyan-400 font-mono">
                          {sessionStats?.storyCount ?? 0}
                        </span>
                      </div>
                      
                      {/* Feed Posts */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Feed</span>
                        <span className="text-xs text-purple-400 font-mono">
                          {sessionPosts.length}
                        </span>
                      </div>
                      
                      {/* Host Queue */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Queue</span>
                        <span className="text-xs text-amber-400 font-mono">
                          {sessionQueueLength}
                        </span>
                      </div>
                      
                      {/* Cost */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Cost</span>
                        <span className="text-xs text-emerald-400 font-mono">
                          ${(sessionStats?.totalCost ?? 0).toFixed(4)}
                        </span>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Duration</span>
                        <span className="text-xs text-neutral-200 font-mono">
                          {formatDuration(sessionDuration)}
                        </span>
                      </div>
                      
                      {/* Messages */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-xs text-neutral-500">Messages</span>
                        <span className="text-xs text-cyan-400 font-mono">
                          0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="px-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                        <p className="text-xs text-neutral-500 mb-1">Stories</p>
                        <p className="text-lg font-mono text-neutral-200">{sessionStats?.storyCount ?? 0}</p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                        <p className="text-xs text-neutral-500 mb-1">Tokens</p>
                        <p className="text-lg font-mono text-neutral-200">{sessionStats?.totalTokens.toLocaleString() ?? "0"}</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Total Cost</p>
                      <p className="text-sm font-mono text-emerald-400">${(sessionStats?.totalCost ?? 0).toFixed(4)}</p>
                    </div>
                  </div>

                  {/* Model Parameters - Collapsible */}
                  <div className="px-4">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 hover:text-neutral-300 transition-colors">
                        <span>Parameters</span>
                        <Settings2 className="w-3 h-3 group-open:rotate-45 transition-transform" />
                      </summary>
                      <div className="space-y-3 mt-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-neutral-500">Temperature</label>
                            <span className="text-xs font-mono text-cyan-400">
                              {selectedSession.settings.temperature}
                            </span>
                          </div>
                          <div className="h-1 bg-neutral-800 rounded-full">
                            <div className="h-1 bg-cyan-400/50 rounded-full w-3/4" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-neutral-500">Max Tokens</label>
                            <span className="text-xs font-mono text-cyan-400">
                              {selectedSession.settings.maxTokens}
                            </span>
                          </div>
                          <div className="h-1 bg-neutral-800 rounded-full">
                            <div className="h-1 bg-cyan-400/50 rounded-full w-1/2" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-neutral-500">Top P</label>
                            <span className="text-xs font-mono text-cyan-400">
                              {selectedSession.settings.topP}
                            </span>
                          </div>
                          <div className="h-1 bg-neutral-800 rounded-full">
                            <div className="h-1 bg-cyan-400/50 rounded-full w-full" />
                          </div>
                        </div>

                        <button className="w-full mt-3 text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30">
                          Advanced Settings →
                        </button>
                      </div>
                    </details>
                  </div>

                  {/* Context Management */}
                  <div className="px-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Context
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800 border-dashed">
                        <div className="flex items-center justify-center">
                          <FileText className="w-4 h-4 text-neutral-600 mr-2" />
                          <p className="text-xs text-neutral-500">No context files</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add Context
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions - Full Width Separator */}
                <div className="border-t border-neutral-800 px-4 py-4 mt-6">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30">
                      Export
                    </button>
                    <button className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30">
                      Clone
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Loading State - Should be very brief since we auto-select first session */
          <div className="flex-1 flex items-center justify-center bg-black">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-neutral-400">Loading session...</p>
            </div>
          </div>
        )}
          </div>
        </>
      )}
      
      {/* Document Upload Modal */}
      {selectedSessionId && (
        <DocumentUploadModal
          sessionId={selectedSessionId}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
