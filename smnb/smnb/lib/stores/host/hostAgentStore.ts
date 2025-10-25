// HOST AGENT STORE
// /Users/matthewsimon/Projects/SMNB/smnb/lib/stores/host/hostAgentStore.ts

/**
 * Host Agent Store
 * 
 * Zustand store for managing the host agent service state
 * and providing shared access across components
 */

import { create } from 'zustand';
import { HostAgentService } from '@/lib/services/host/hostAgentService';
import { TradingHostService } from '@/lib/services/host/tradingHostService';
import { HostNarration, HostAgentConfig, DEFAULT_HOST_CONFIG, NewsItem } from '@/lib/types/hostAgent';
import { EnhancedRedditPost } from '@/lib/types/enhancedRedditPost';
import { EnhancedTradingPost } from '@/lib/services/livefeed/tradingEnrichmentAgent';

// Helper function to convert EnhancedRedditPost to NewsItem
const convertRedditPostToNewsItem = (post: EnhancedRedditPost): NewsItem => {
  return {
    id: post.id,
    content: post.selftext || post.title,
    title: post.title,
    author: post.author,
    timestamp: new Date(post.created_utc * 1000),
    platform: 'reddit' as const,
    engagement: {
      likes: post.score,
      comments: post.num_comments,
      shares: 0 // Reddit doesn't have shares
    },
    subreddit: post.subreddit,
    url: post.url
  };
};

// Helper function to generate a title from narrative content
const generateStoryTitle = (narrative: string, tone: string): string => {
  // Extract the first sentence or key phrase
  const sentences = narrative.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim();
  
  if (!firstSentence) return 'Breaking News Update';
  
  // Remove common conversation starters and make it more title-like
  let title = firstSentence
    .replace(/^(Hey there,?\s*|Well,?\s*|So,?\s*|Breaking:?\s*|Update:?\s*)/i, '')
    .replace(/^(news watchers!?\s*|folks!?\s*)/i, '')
    .replace(/🇨🇦|🇺🇸|🌍|📈|📉|🔥|⚡|💰|🏢|🏛️|🎯/g, '') // Remove emojis
    .trim();
  
  // Truncate to approximately 3 lines (around 120-140 characters for typical fonts)
  const maxLength = 120;
  if (title.length > maxLength) {
    // Find a good breaking point (word boundary) near the limit
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    title = lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated;
    title += '...';
  }
  
  // Ensure it starts with a capital letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Add some context based on tone if title is very short
  if (title.length < 20) {
    switch (tone) {
      case 'breaking':
        return `Breaking: ${title}`;
      case 'developing':
        return `Developing: ${title}`;
      case 'analysis':
        return title.includes('Analysis') ? title : `${title}`;
      default:
        return title;
    }
  }
  
  return title;
};

interface HostAgentState {
  // Service instances
  hostAgent: HostAgentService | null;
  tradingHostService: TradingHostService | null;
  
  // Trading mode state
  tradingMode: boolean;
  
  // State
  isActive: boolean;
  currentNarration: HostNarration | null;
  currentSessionId: string | null; // Current broadcast session ID
  
  // UI State
  showSettings: boolean;
  
  // Streaming state
  isStreaming: boolean;
  streamingText: string;
  streamingNarrationId: string | null;
  
  // Countdown state
  nextStoryCountdown: number; // seconds until next story (0 when narrating)
  countdownInterval: NodeJS.Timeout | null; // timer reference
  isGenerating: boolean; // true when generating narration (before streaming starts)
  
  // Narration queue for streaming
  narrationQueue: HostNarration[];
  
  // Persistent narration history
  narrationHistory: HostNarration[];
  maxHistorySize: number;
  
  // Statistics
  stats: {
    itemsProcessed: number;
    totalNarrations: number;
    queueLength: number;
    uptime: number;
  };
  
  // Configuration
  config: HostAgentConfig;
  
    // Actions
  initializeHostAgent: () => void;
  start: (sessionId?: string) => Promise<void>;
  stop: () => void;
  getCurrentSessionId: () => string | null;
  processRedditPost: (post: EnhancedRedditPost) => Promise<void>;
  processLiveFeedPost: (post: EnhancedRedditPost) => void;
  getSessionQueueLength: (sessionId: string | null) => number;
  
  // Trading mode actions
  enableTradingMode: () => void;
  disableTradingMode: () => void;
  processTradingPost: (post: EnhancedTradingPost) => Promise<void>;
  getTradingStats: () => {
    activeTickers: number;
    topMentionedTickers: Array<{ ticker: string; count: number }>;
    sectorMomentum: Array<{ sector: string; momentum: number }>;
  } | null;
  
  // UI Actions
  toggleSettings: () => void;
  setShowSettings: (show: boolean) => void;
  
  // Configuration Actions
  updateConfig: (newConfig: Partial<HostAgentConfig>) => void;
  setGenerationMode: (mode: 'immediate' | 'deferred') => void;
  getGenerationMode: () => 'immediate' | 'deferred' | null;
  
  // Streaming actions
  addToQueue: () => void;
  processNextInQueue: () => void;
  updateStreamingText: (text: string) => void;
  completeStreaming: () => void;
  
  // History actions
  addNarrationToHistory: (narration: HostNarration) => void;
  clearNarrationHistory: () => void;
  cleanup: () => void;
  
  // State management
  clearAllState: () => void;
  
  // Countdown actions
  startCountdown: (seconds: number) => void;
  stopCountdown: () => void;
}

export const useHostAgentStore = create<HostAgentState>((set, get) => ({
  // Initial state
  hostAgent: null,
  tradingHostService: null,
  tradingMode: true, // Bloomberg mode enabled by default
  isActive: false,
  currentNarration: null,
  currentSessionId: null,
  
  // UI State
  showSettings: false,
  
  // Streaming state
  isStreaming: false,
  streamingText: '',
  streamingNarrationId: null,
  
  // Countdown state
  nextStoryCountdown: 0,
  countdownInterval: null,
  isGenerating: false,
  
  // Narration queue
  narrationQueue: [],
  
  // History
  narrationHistory: [],
  maxHistorySize: 20, // Keep last 20 narrations
  stats: {
    itemsProcessed: 0,
    totalNarrations: 0,
    queueLength: 0,
    uptime: 0
  },
  config: DEFAULT_HOST_CONFIG,
  
  // Initialize the host agent service
  initializeHostAgent: () => {
    const { hostAgent, tradingMode } = get();
    
    console.log('🤖 [HOST STORE] initializeHostAgent called, current hostAgent:', hostAgent ? 'EXISTS' : 'NULL');
    
    // Don't re-initialize if already exists
    if (hostAgent) {
      console.log('🤖 [HOST STORE] Host agent already exists, skipping initialization');
      return;
    }
    
    console.log(`🤖 [HOST STORE] Creating new ${tradingMode ? 'TradingHostService (Bloomberg mode)' : 'HostAgentService (Standard mode)'}...`);
    
    const agent = tradingMode ? new TradingHostService() : new HostAgentService(get().config);
    
    // Store trading service reference if in trading mode
    if (tradingMode) {
      set({ tradingHostService: agent as TradingHostService });
    }
    
    console.log('🤖 [HOST STORE] HostAgentService created, setting up event listeners...');
    
    // Set up event listeners for streaming
    agent.on('narration:started', (narration: HostNarration) => {
      // Don't stop countdown yet - let it continue until streaming actually starts
      
      set({ 
        currentNarration: narration,
        isStreaming: false, // Don't set to true until text actually appears
        streamingText: '',
        streamingNarrationId: narration.id,
        isGenerating: false
      });
      console.log('🎙️ HOST: Narration started:', narration.narrative.substring(0, 50) + '...');
    });
    
    agent.on('narration:streaming', (data: { narrationId: string; currentText: string }) => {
      const { streamingNarrationId, isStreaming } = get();
      // Only log every 50 characters to reduce console spam
      if (data.currentText.length % 50 === 0) {
        console.log(`📡 HOST STORE: Streaming ${data.narrationId} - ${data.currentText.length} chars`);
      }
      if (streamingNarrationId === data.narrationId) {
        // Set isStreaming to true and stop countdown only when text actually starts appearing
        if (!isStreaming && data.currentText.length > 0) {
          get().stopCountdown(); // Stop countdown when streaming actually begins
          set({ isStreaming: true, streamingText: data.currentText });
        } else {
          set({ streamingText: data.currentText });
        }
      }
    });
    
    agent.on('narration:completed', (narrationId: string, fullText: string) => {
      const { currentNarration } = get();
      if (currentNarration?.id === narrationId) {
        // Create completed narration with full text
        const completedNarration: HostNarration = {
          ...currentNarration,
          narrative: fullText
        };
        
        // Add completed narration to history
        get().addNarrationToHistory(completedNarration);
        console.log('✅ HOST: Narration completed and added to history');
        
        // Reset streaming state
        set({
          isStreaming: false,
          streamingText: '',
          streamingNarrationId: null,
          currentNarration: null
        });
        
        // Start countdown for next story (get actual cooldown from service + 2s warm-up)
        const hostAgent = get().hostAgent;
        const cooldownSeconds = hostAgent 
          ? Math.ceil(hostAgent.getTimingConfig().NARRATION_COOLDOWN_MS / 1000) + 2
          : 6; // fallback to 6 seconds (4 + 2 warm-up)
        get().startCountdown(cooldownSeconds);
        
        console.log(`✅ HOST: Narration completed, ${get().narrationQueue.length} items remaining in queue`);
      }
    });
    
    agent.on('narration:error', (narrationId: string, error: Error) => {
      console.error(`❌ HOST: Narration error for ${narrationId}:`, error);
      const { streamingNarrationId } = get();
      if (streamingNarrationId === narrationId) {
        set({
          isStreaming: false,
          streamingText: '',
          streamingNarrationId: null
        });
      }
    });
    
    agent.on('host:started', () => {
      console.log('� HOST STORE: Host started event received');
      const sessionId = agent.getCurrentSessionId();
      set({ isActive: true, currentSessionId: sessionId });
      get().startCountdown(5); // Initial countdown before first story
    });
    
    agent.on('host:stopped', () => {
      console.log('⚫ HOST STORE: Host stopped event received');
      set({ isActive: false, currentSessionId: null });
      // PRESERVE QUEUE - don't clear narrationQueue so we can resume
      get().stopCountdown();
    });
    
    agent.on('queue:updated', (queue: HostNarration[]) => {
      set(state => ({
        narrationQueue: queue,
        stats: {
          ...state.stats,
          queueLength: queue.length
        }
      }));
    });
    
    agent.on('narration:generated', () => {
      set(state => ({
        stats: {
          ...state.stats,
          totalNarrations: state.stats.totalNarrations + 1
        }
      }));
    });
    
    console.log('🤖 [HOST STORE] Event listeners set up, storing agent in state...');
    set({ hostAgent: agent });
    console.log('✅ [HOST STORE] Host agent service initialized and stored, hostAgent is now:', get().hostAgent ? 'SET' : 'NULL');
  },
  
  // Start broadcasting
  startBroadcasting: (sessionId?: string) => {
    const { hostAgent } = get();
    if (!hostAgent) {
      console.error('❌ Host agent not initialized');
      return;
    }
    
    console.log('📡 Starting host broadcast...', sessionId ? `with session: ${sessionId}` : '');
    hostAgent.start(sessionId);
  },
  
  // Stop broadcasting
  stopBroadcasting: () => {
    const { hostAgent } = get();
    if (!hostAgent) {
      console.error('❌ Host agent not initialized');
      return;
    }
    
    console.log('📴 Stopping host broadcast...');
    hostAgent.stop();
  },
  
  // Update configuration
  updateConfig: (newConfig: Partial<HostAgentConfig>) => {
    const { hostAgent, config } = get();
    const updatedConfig = { ...config, ...newConfig };
    
    set({ config: updatedConfig });
    
    if (hostAgent) {
      // Update the agent's configuration
      hostAgent.updateConfig(updatedConfig);
    }
    
    console.log('⚙️ Host configuration updated:', newConfig);
  },
  
  // Set generation mode (deferred = save to DB first, immediate = stream right away)
  setGenerationMode: (mode: 'immediate' | 'deferred') => {
    const { hostAgent } = get();
    
    if (!hostAgent) {
      console.warn('⚠️ Host agent not initialized, cannot set generation mode');
      return;
    }
    
    hostAgent.setGenerationMode(mode);
    console.log(`🎯 Generation mode set to: ${mode}`);
  },
  
  // Get current generation mode
  getGenerationMode: () => {
    const { hostAgent } = get();
    
    if (!hostAgent) {
      console.warn('⚠️ Host agent not initialized');
      return null;
    }
    
    return hostAgent.getGenerationMode();
  },
  
  // Process a live feed post through the host agent
  processLiveFeedPost: (post: EnhancedRedditPost) => {
    const { hostAgent, isActive } = get();
    
    if (!hostAgent) {
      console.warn('⚠️ Host agent not initialized, cannot process post');
      return;
    }
    
    if (!isActive) {
      console.log('📴 Host not broadcasting, skipping post:', post.title.substring(0, 30) + '...');
      return;
    }
    
    try {
      const newsItem = convertRedditPostToNewsItem(post);
      console.log(`📰 HOST STORE: Processing post for narration: ${post.title.substring(0, 50)}...`);
      hostAgent.processNewsItem(newsItem);
    } catch (error) {
      console.error('❌ HOST STORE: Failed to process live feed post:', error);
    }
  },
  
  // Start the host agent
  start: async (sessionId?: string) => {
    const { hostAgent } = get();
    if (!hostAgent) {
      console.error('❌ Cannot start: Host agent not initialized');
      return;
    }
    
    // ✅ VALIDATE SESSION ID IS PROVIDED
    if (!sessionId) {
      console.error('❌ Cannot start: No session ID provided - stories will not be linked to a session');
      throw new Error('Session ID is required to start host agent');
    }
    
    console.log('🎙️ HOST STORE: Calling hostAgent.start() with session:', sessionId);
    
    // Call the service start (which is synchronous but emits 'host:started' event)
    hostAgent.start(sessionId);
    
    console.log('🎙️ HOST STORE: hostAgent.start() returned, waiting for isActive...');
    console.log('🎙️ HOST STORE: Current store isActive state:', get().isActive);
    
    // Wait for isActive to become true (the event listener sets this)
    const startTime = Date.now();
    let checkCount = 0;
    while (!get().isActive && Date.now() - startTime < 5000) {
      checkCount++;
      if (checkCount % 10 === 0) {
        console.log(`🎙️ HOST STORE: Still waiting... (${checkCount * 50}ms, isActive=${get().isActive})`);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('🎙️ HOST STORE: Wait loop ended. isActive:', get().isActive);
    
    // Fallback: If event didn't fire, manually check and set state
    // The service sets its internal state.isActive, so if that's true but ours isn't,
    // the event listener failed and we need to manually sync
    if (!get().isActive) {
      console.warn('⚠️ HOST STORE: Event listener did not fire, manually setting isActive');
      set({ isActive: true });
    }
    
    if (!get().isActive) {
      throw new Error('Host agent failed to activate within 5 seconds');
    }
    
    // ✅ VERIFY SESSION ID WAS STORED CORRECTLY
    const storedSessionId = get().getCurrentSessionId();
    if (storedSessionId !== sessionId) {
      console.error(`❌ Session ID mismatch: expected=${sessionId}, stored=${storedSessionId}`);
      throw new Error(`Host Agent failed to store session ID correctly`);
    }
    
    console.log(`✅ Host agent start completed - Session validated: ${storedSessionId}`);
  },
  
  // Stop the host agent  
  stop: () => {
    const { hostAgent } = get();
    if (hostAgent) {
      hostAgent.stop();
    }
  },

  // Get current session ID
  getCurrentSessionId: () => {
    const { hostAgent } = get();
    return hostAgent?.getCurrentSessionId() ?? null;
  },
  
  // ✅ NEW: Validate session is active and properly set
  isSessionActive: () => {
    const { isActive } = get();
    const sessionId = get().getCurrentSessionId();
    return isActive && sessionId !== null;
  },
  
  // Process a Reddit post
  processRedditPost: async (post: EnhancedRedditPost) => {
    get().processLiveFeedPost(post);
  },
  
  // Legacy streaming actions (kept for interface compatibility)
  addToQueue: () => {
    // This is now handled by the streaming events from the service
    console.log('📝 HOST: Add to queue called (handled by streaming events)');
  },
  
  processNextInQueue: () => {
    // This is now handled by the service internally
    console.log('📝 HOST: Process next in queue called (handled by service)');
  },
  
  updateStreamingText: (text: string) => {
    set({ streamingText: text });
  },
  
  completeStreaming: () => {
    // This is now handled by streaming events
    console.log('📝 HOST: Complete streaming called (handled by streaming events)');
  },
  
  // Add narration to persistent history
  addNarrationToHistory: (narration: HostNarration) => {
    set((state) => {
      const newHistory = [
        { ...narration, timestamp: new Date() }, // Ensure fresh timestamp
        ...state.narrationHistory
      ].slice(0, state.maxHistorySize); // Keep only the most recent
      
      console.log(`📚 HOST: Added narration to history. Total: ${newHistory.length}`);
      
      // Also add completed story to live feed history
      import('@/lib/stores/livefeed/simpleLiveFeedStore').then(module => {
        const generatedTitle = generateStoryTitle(narration.narrative, narration.tone);
        const completedStory = {
          id: `host-${narration.id}`, // Prefix with 'host' for agent type identification
          narrative: narration.narrative,
          title: generatedTitle, // Use generated title instead of original Reddit title
          tone: narration.tone,
          priority: narration.priority,
          timestamp: new Date(),
          duration: narration.duration,
          session_id: narration.metadata?.session_id ?? undefined, // Link story to session (convert null to undefined)
          originalItem: narration.metadata?.originalItem ? {
            title: narration.metadata.originalItem.title || '',
            author: narration.metadata.originalItem.author,
            subreddit: narration.metadata.originalItem.subreddit,
            url: narration.metadata.originalItem.url,
          } : undefined,
          sentiment: narration.metadata?.sentiment,
          topics: narration.metadata?.topics,
          summary: narration.metadata?.summary,
        };
        
        const { addCompletedStory } = module.useSimpleLiveFeedStore.getState();
        addCompletedStory(completedStory);
        console.log(`📋 HOST: Added completed story to live feed history: "${narration.narrative.substring(0, 50)}..." [Session: ${narration.metadata?.session_id || 'none'}]`);
      });
      
      return { narrationHistory: newHistory };
    });
  },
  
  // Clear narration history
  clearNarrationHistory: () => {
    set({ narrationHistory: [] });
    console.log('🗑️ HOST: Narration history cleared');
  },
  
  // Cleanup when component unmounts
  cleanup: () => {
    const { hostAgent, countdownInterval } = get();
    if (hostAgent) {
      console.log('🧹 Cleaning up host agent service...');
      hostAgent.stop();
      hostAgent.removeAllListeners();
      set({ 
        hostAgent: null, 
        isActive: false, 
        currentNarration: null 
      });
    }
    // Clear countdown timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
      set({ countdownInterval: null, nextStoryCountdown: 0 });
    }
  },
  
  // Start countdown timer
  startCountdown: (seconds: number) => {
    const { countdownInterval } = get();
    
    // Clear existing timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    set({ nextStoryCountdown: seconds, isGenerating: false });
    
    const timer = setInterval(() => {
      const { nextStoryCountdown } = get();
      if (nextStoryCountdown > 0) {
        const newCount = nextStoryCountdown - 1;
        set({ nextStoryCountdown: newCount });
        
        // Start generating when countdown reaches 2 (warm-up period)
        if (newCount === 2) {
          set({ isGenerating: true });
        }
      } else {
        // Countdown finished
        clearInterval(timer);
        set({ countdownInterval: null, nextStoryCountdown: 0 });
      }
    }, 1000);
    
    set({ countdownInterval: timer });
  },
  
  // Stop countdown timer
  stopCountdown: () => {
    const { countdownInterval } = get();
    if (countdownInterval) {
      clearInterval(countdownInterval);
      set({ countdownInterval: null, nextStoryCountdown: 0, isGenerating: false });
    }
  },
  
  // Clear all state (for database reset scenarios)
  clearAllState: () => {
    const { hostAgent, countdownInterval } = get();
    
    console.log('🗑️ COMPLETE HOST STATE RESET: Clearing all host agent state');
    
    // Stop countdown if running
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    // Clear the host agent's internal queue and state if available
    if (hostAgent) {
      hostAgent.clearQueue();
      // Don't stop the service - just clear its queue
    }
    
    set(() => ({
      // Reset streaming state
      currentNarration: null,
      isStreaming: false,
      streamingText: '',
      streamingNarrationId: null,
      
      // Reset countdown state
      nextStoryCountdown: 0,
      countdownInterval: null,
      isGenerating: false,
      
      // Reset queue and history
      narrationQueue: [],
      narrationHistory: [],
      
      // Reset statistics
      stats: {
        itemsProcessed: 0,
        totalNarrations: 0,
        queueLength: 0,
        uptime: 0
      },
      
      // Keep service state and config intact
      // isActive, hostAgent, config stay as they are
    }));
    
    console.log('✅ Complete host agent state reset completed');
  },
  
  // Get queue length for specific session
  getSessionQueueLength: (sessionId) => {
    if (!sessionId) return 0;
    
    const { hostAgent } = get();
    if (!hostAgent) return 0;
    
    // Get the session-specific queue from the service
    const sessionQueue = hostAgent.getSessionQueue(sessionId);
    return sessionQueue.length;
  },
  
  // UI Actions
  toggleSettings: () => {
    set(state => ({ showSettings: !state.showSettings }));
  },
  
  setShowSettings: (show: boolean) => {
    set({ showSettings: show });
  },
  
  // Trading Mode Actions
  enableTradingMode: () => {
    const { hostAgent, tradingHostService, isActive } = get();
    
    console.log('📊 [HOST STORE] Enabling Bloomberg trading mode...');
    
    // Create trading host service if it doesn't exist
    if (!tradingHostService) {
      console.log('📊 [HOST STORE] Creating TradingHostService...');
      const tradingService = new TradingHostService();
      
      // Set up event listeners (same as regular host)
      tradingService.on('narration:started', (narration: HostNarration) => {
        set({
          currentNarration: narration,
          isStreaming: false,
          streamingText: '',
          streamingNarrationId: narration.id,
          isGenerating: false
        });
        console.log('📊 TRADING HOST: Narration started:', narration.narrative.substring(0, 50) + '...');
      });
      
      tradingService.on('narration:streaming', (data: { narrationId: string; currentText: string }) => {
        const { streamingNarrationId, isStreaming } = get();
        if (streamingNarrationId === data.narrationId) {
          if (!isStreaming && data.currentText.length > 0) {
            get().stopCountdown();
            set({ isStreaming: true, streamingText: data.currentText });
          } else {
            set({ streamingText: data.currentText });
          }
        }
      });
      
      tradingService.on('narration:completed', (narrationId: string, fullText: string) => {
        const { currentNarration } = get();
        if (currentNarration?.id === narrationId) {
          const completedNarration: HostNarration = {
            ...currentNarration,
            narrative: fullText
          };
          
          get().addNarrationToHistory(completedNarration);
          console.log('✅ TRADING HOST: Narration completed');
          
          set({
            isStreaming: false,
            streamingText: '',
            streamingNarrationId: null,
            currentNarration: null
          });
          
          const cooldownSeconds = Math.ceil(tradingService.getTimingConfig().NARRATION_COOLDOWN_MS / 1000) + 2;
          get().startCountdown(cooldownSeconds);
        }
      });
      
      tradingService.on('narration:error', (narrationId: string, error: Error) => {
        console.error(`❌ TRADING HOST: Narration error for ${narrationId}:`, error);
        const { streamingNarrationId } = get();
        if (streamingNarrationId === narrationId) {
          set({
            isStreaming: false,
            streamingText: '',
            streamingNarrationId: null
          });
        }
      });
      
      set({ tradingHostService: tradingService });
      console.log('✅ [HOST STORE] TradingHostService created');
    }
    
    // Switch active agent if currently running
    if (isActive && hostAgent) {
      console.log('📊 [HOST STORE] Switching to trading host (preserving session)...');
      const sessionId = hostAgent.getCurrentSessionId();
      hostAgent.stop();
      
      const tradingService = get().tradingHostService!;
      tradingService.start(sessionId!);
      
      set({ hostAgent: tradingService, tradingMode: true });
      console.log('✅ [HOST STORE] Trading mode enabled and active');
    } else {
      // Just switch the agent for next start
      const tradingService = get().tradingHostService!;
      set({ hostAgent: tradingService, tradingMode: true });
      console.log('✅ [HOST STORE] Trading mode enabled (will activate on next start)');
    }
  },
  
  disableTradingMode: () => {
    const { hostAgent, isActive } = get();

    console.log('📴 [HOST STORE] Disabling Bloomberg trading mode...');

    // Switch back to standard host
    if (isActive && hostAgent) {
      console.log('📴 [HOST STORE] Switching to standard host (preserving session)...');
      const sessionId = hostAgent.getCurrentSessionId();
      hostAgent.stop();

      // Create new standard host agent
      const standardAgent = new HostAgentService(get().config);

      // Set up minimal event listeners
      standardAgent.on('narration:started', (narration: HostNarration) => {
        set({
          currentNarration: narration,
          isStreaming: false,
          streamingText: '',
          streamingNarrationId: narration.id,
          isGenerating: false
        });
      });

      standardAgent.on('narration:streaming', (data: { narrationId: string; currentText: string }) => {
        const { streamingNarrationId, isStreaming } = get();
        if (streamingNarrationId === data.narrationId) {
          if (!isStreaming && data.currentText.length > 0) {
            get().stopCountdown();
            set({ isStreaming: true, streamingText: data.currentText });
          } else {
            set({ streamingText: data.currentText });
          }
        }
      });

      standardAgent.on('narration:completed', (narrationId: string, fullText: string) => {
        const { currentNarration } = get();
        if (currentNarration?.id === narrationId) {
          const completedNarration: HostNarration = {
            ...currentNarration,
            narrative: fullText
          };

          get().addNarrationToHistory(completedNarration);

          set({
            isStreaming: false,
            streamingText: '',
            streamingNarrationId: null,
            currentNarration: null
          });

          const cooldownSeconds = Math.ceil(standardAgent.getTimingConfig().NARRATION_COOLDOWN_MS / 1000) + 2;
          get().startCountdown(cooldownSeconds);
        }
      });

      standardAgent.start(sessionId!);
      set({ hostAgent: standardAgent, tradingMode: false });
      console.log('✅ [HOST STORE] Standard mode enabled and active');
    } else {
      // Create new standard agent for next start
      const standardAgent = new HostAgentService(get().config);
      set({ hostAgent: standardAgent, tradingMode: false });
      console.log('✅ [HOST STORE] Standard mode enabled (will activate on next start)');
    }
  },
  
  processTradingPost: async (post: EnhancedTradingPost) => {
    const { tradingHostService, tradingMode } = get();
    
    if (!tradingMode) {
      console.warn('⚠️ [HOST STORE] Trading mode not enabled, cannot process trading post');
      return;
    }
    
    if (!tradingHostService) {
      console.warn('⚠️ [HOST STORE] Trading host service not initialized');
      return;
    }
    
    console.log(`📊 [HOST STORE] Processing trading post: ${post.title.substring(0, 50)}...`);
    await tradingHostService.processTradingPost(post);
  },
  
  getTradingStats: () => {
    const { tradingHostService } = get();
    
    if (!tradingHostService) {
      return null;
    }
    
    return tradingHostService.getTradingStats();
  }
}));
