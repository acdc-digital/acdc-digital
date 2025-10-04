// BROADCAST ORCHESTRATOR - CENTRAL STATE MANAGER
// /Users/matthewsimon/Projects/SMNB/smnb/lib/stores/orchestrator/broadcastOrchestrator.ts

/**
 * Broadcast Orchestrator
 * 
 * Central state management system that coordinates all broadcast-related stores
 * using a Finite State Machine (FSM) pattern with strict transition guards.
 * 
 * Architecture:
 * - FSM-based state transitions (idle → initializing → ready → starting → live → stopping)
 * - Single source of truth for broadcast lifecycle
 * - Automatic rollback on errors
 * - State validation and guards
 * - Backend synchronization
 * - Cross-store coordination
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { useHostAgentStore } from '../host/hostAgentStore';
import { useProducerStore } from '../producer/producerStore';
import { useSimpleLiveFeedStore } from '../livefeed/simpleLiveFeedStore';
import { useBroadcastSessionStore } from '../session/broadcastSessionStore';
import { Id } from '@/convex/_generated/dataModel';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Broadcast State Machine States
 * 
 * State transitions:
 * idle → initializing → ready → starting → live → stopping → idle
 *                                    ↓         ↓
 *                                  error → idle
 */
export type BroadcastState = 
  | 'idle'           // Nothing active, system at rest
  | 'initializing'   // Services starting up (host agent, producer)
  | 'ready'          // Services initialized and ready to broadcast
  | 'starting'       // Broadcast starting (sequential startup)
  | 'live'           // Actively broadcasting
  | 'stopping'       // Broadcast stopping (sequential shutdown)
  | 'error';         // Error state (recoverable)

/**
 * Transition reasons for logging and debugging
 */
export type TransitionReason =
  | 'user_action'           // User clicked button
  | 'system_init'           // System initialization
  | 'dependency_ready'      // Dependency became available
  | 'dependency_failed'     // Dependency failed
  | 'error_rollback'        // Rolling back due to error
  | 'manual_stop'           // Manual stop requested
  | 'auto_cleanup';         // Automatic cleanup

/**
 * State snapshot for inspection and debugging
 */
export interface BroadcastSnapshot {
  // Orchestrator state
  orchestrator: {
    state: BroadcastState;
    previousState: BroadcastState | null;
    error: string | null;
    lastTransition: {
      from: BroadcastState;
      to: BroadcastState;
      reason: TransitionReason;
      timestamp: number;
    } | null;
  };
  
  // Child store states
  host: {
    isActive: boolean;
    isInitialized: boolean;
    queueLength: number;
    isStreaming: boolean;
    hasError: boolean;
  };
  
  producer: {
    isActive: boolean;
    isProcessing: boolean;
  };
  
  liveFeed: {
    isLive: boolean;
    postsCount: number;
    hasContent: boolean;
  };
  
  session: {
    isActive: boolean;
    duration: number;
    sessionId: string | null;
  };
  
  // Convex state
  convex: {
    sessionId: Id<"sessions"> | null;
    isSynced: boolean;
  };
  
  // Computed flags
  computed: {
    canStart: boolean;
    canStop: boolean;
    isTransitioning: boolean;
    requiresUserAction: boolean;
  };
}

/**
 * State transition validation result
 */
interface TransitionValidation {
  valid: boolean;
  reason?: string;
  missingDependencies?: string[];
}

/**
 * Orchestrator configuration
 */
interface OrchestratorConfig {
  // Timeouts
  initializationTimeout: number;  // Max time for initialization
  startupTimeout: number;          // Max time for startup sequence
  shutdownTimeout: number;         // Max time for shutdown sequence
  
  // Retry configuration
  maxRetries: number;              // Max retry attempts for failed operations
  retryDelay: number;              // Delay between retries (ms)
  
  // Feature flags
  enableAutoRecovery: boolean;     // Automatically recover from errors
  enableConvexSync: boolean;       // Sync state to Convex backend
  enableStateValidation: boolean;  // Run state validation checks
  
  // Debug
  verboseLogging: boolean;         // Enable detailed logging
}

// Default configuration
const DEFAULT_CONFIG: OrchestratorConfig = {
  initializationTimeout: 10000,    // 10 seconds
  startupTimeout: 15000,            // 15 seconds
  shutdownTimeout: 10000,           // 10 seconds
  maxRetries: 3,
  retryDelay: 1000,                 // 1 second
  enableAutoRecovery: true,
  enableConvexSync: true,
  enableStateValidation: true,
  verboseLogging: process.env.NODE_ENV === 'development',
};

// ============================================================================
// ORCHESTRATOR STORE
// ============================================================================

interface BroadcastOrchestratorStore {
  // Core state
  state: BroadcastState;
  previousState: BroadcastState | null;
  error: string | null;
  
  // Transition tracking
  lastTransition: {
    from: BroadcastState;
    to: BroadcastState;
    reason: TransitionReason;
    timestamp: number;
  } | null;
  
  // Session tracking
  currentConvexSessionId: Id<"sessions"> | null;
  
  // Configuration
  config: OrchestratorConfig;
  
  // Internal tracking
  _retryCount: number;
  _isRecovering: boolean;
  
  // ========================================================================
  // CORE ACTIONS
  // ========================================================================
  
  /**
   * Initialize the broadcast system
   * Ensures all services are ready before allowing broadcast
   */
  initialize: () => Promise<void>;
  
  /**
   * Start the broadcast
   * Orchestrates the full startup sequence
   */
  startBroadcast: (sessionId?: Id<"sessions">) => Promise<void>;
  
  /**
   * Stop the broadcast
   * Orchestrates the full shutdown sequence
   */
  stopBroadcast: () => Promise<void>;
  
  /**
   * Emergency stop - immediate shutdown without cleanup
   */
  emergencyStop: () => Promise<void>;
  
  /**
   * Recover from error state
   */
  recover: () => Promise<void>;
  
  // ========================================================================
  // STATE INSPECTION
  // ========================================================================
  
  /**
   * Get full state snapshot for debugging
   */
  getSnapshot: () => BroadcastSnapshot;
  
  /**
   * Get sync data for Convex backend
   * Returns null if no session ID is set
   */
  getSyncData: () => {
    id: Id<"sessions">;
    broadcastState: BroadcastState;
    isLive: boolean;
    hostActive: boolean;
    producerActive: boolean;
    liveFeedActive: boolean;
    broadcastError?: string;
  } | null;
  
  /**
   * Check if broadcast can start
   */
  canStartBroadcast: () => boolean;
  
  /**
   * Check if broadcast can stop
   */
  canStopBroadcast: () => boolean;
  
  /**
   * Validate a state transition
   */
  validateTransition: (to: BroadcastState) => TransitionValidation;
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /**
   * Update orchestrator configuration
   */
  updateConfig: (config: Partial<OrchestratorConfig>) => void;
  
  /**
   * Reset to default configuration
   */
  resetConfig: () => void;
  
  // ========================================================================
  // INTERNAL ACTIONS (State Machine)
  // ========================================================================
  
  _setState: (state: BroadcastState, reason: TransitionReason) => void;
  _setError: (error: string) => void;
  _clearError: () => void;
  _log: (message: string, data?: unknown) => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useBroadcastOrchestrator = create<BroadcastOrchestratorStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      state: 'idle',
      previousState: null,
      error: null,
      lastTransition: null,
      currentConvexSessionId: null,
      config: DEFAULT_CONFIG,
      _retryCount: 0,
      _isRecovering: false,
      
      // ======================================================================
      // INTERNAL STATE MACHINE
      // ======================================================================
      
      _setState: (newState: BroadcastState, reason: TransitionReason) => {
        const currentState = get().state;
        
        // Validate transition
        const validation = get().validateTransition(newState);
        if (!validation.valid) {
          console.error(`❌ Invalid state transition: ${currentState} → ${newState}`, validation.reason);
          return;
        }
        
        // Record transition
        set({
          state: newState,
          previousState: currentState,
          lastTransition: {
            from: currentState,
            to: newState,
            reason,
            timestamp: Date.now(),
          }
        });
        
        get()._log(`State transition: ${currentState} → ${newState}`, { reason });
      },
      
      _setError: (error: string) => {
        set({ 
          error,
          state: 'error',
          previousState: get().state
        });
        get()._log(`Error occurred: ${error}`, { state: get().state });
      },
      
      _clearError: () => {
        set({ error: null });
      },
      
      _log: (message: string, data?: unknown) => {
        if (get().config.verboseLogging) {
          console.log(`🎛️ [ORCHESTRATOR] ${message}`, data || '');
        }
      },
      
      // ======================================================================
      // STATE VALIDATION
      // ======================================================================
      
      validateTransition: (to: BroadcastState): TransitionValidation => {
        const from = get().state;
        
        // Define valid transitions (FSM)
        const validTransitions: Record<BroadcastState, BroadcastState[]> = {
          'idle': ['initializing', 'error'],
          'initializing': ['ready', 'error'],
          'ready': ['starting', 'idle', 'error'],
          'starting': ['live', 'error'],
          'live': ['stopping', 'error'],
          'stopping': ['idle', 'error'],
          'error': ['idle', 'initializing'], // Can recover to idle or retry init
        };
        
        const allowedTransitions = validTransitions[from] || [];
        
        if (!allowedTransitions.includes(to)) {
          return {
            valid: false,
            reason: `Invalid transition from '${from}' to '${to}'. Allowed: ${allowedTransitions.join(', ')}`,
          };
        }
        
        return { valid: true };
      },
      
      canStartBroadcast: () => {
        const state = get().state;
        const hostStore = useHostAgentStore.getState();
        
        // Must be in ready state
        if (state !== 'ready') {
          return false;
        }
        
        // Host agent must be initialized
        if (!hostStore.hostAgent) {
          return false;
        }
        
        // Note: We don't check for content availability because
        // the broadcast's job is to FETCH and aggregate content.
        // The live feed will populate as the broadcast runs.
        
        return true;
      },
      
      canStopBroadcast: () => {
        const state = get().state;
        return state === 'live';
      },
      
      // ======================================================================
      // INITIALIZATION
      // ======================================================================
      
      initialize: async () => {
        const { state, _setState, _setError, _log, config } = get();
        
        if (state !== 'idle') {
          _log('Already initialized or in progress', { state });
          return;
        }
        
        _setState('initializing', 'system_init');
        
        try {
          _log('Starting initialization...');
          
          // Step 1: Initialize host agent
          const hostStore = useHostAgentStore.getState();
          _log('Host agent status before init:', { exists: !!hostStore.hostAgent, isActive: hostStore.isActive });
          
          if (!hostStore.hostAgent) {
            _log('Initializing host agent...');
            hostStore.initializeHostAgent();
            
            _log('initializeHostAgent() returned, checking if agent was created...');
            const immediateCheck = useHostAgentStore.getState();
            _log('Immediate check after init:', { exists: !!immediateCheck.hostAgent });
            
            // Wait for initialization with timeout
            const startTime = Date.now();
            let attempts = 0;
            while (!useHostAgentStore.getState().hostAgent && Date.now() - startTime < config.initializationTimeout) {
              attempts++;
              if (attempts % 10 === 0) {
                const currentState = useHostAgentStore.getState();
                _log(`Still waiting for host agent... (${attempts * 100}ms, exists=${!!currentState.hostAgent})`);
              }
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const finalState = useHostAgentStore.getState();
            _log('Wait loop ended:', { 
              exists: !!finalState.hostAgent, 
              elapsed: Date.now() - startTime,
              attempts 
            });
            
            if (!finalState.hostAgent) {
              throw new Error(`Host agent initialization timeout after ${Date.now() - startTime}ms`);
            }
          } else {
            _log('Host agent already initialized');
          }
          
          // Step 2: Initialize producer
          const producerStore = useProducerStore.getState();
          if (!producerStore.isActive) {
            _log('Producer ready for activation');
          }
          
          // Step 3: Check live feed
          const liveFeedStore = useSimpleLiveFeedStore.getState();
          _log(`Live feed status: ${liveFeedStore.posts.length} posts available`);
          
          // All systems ready
          _setState('ready', 'dependency_ready');
          _log('✅ Initialization complete - system ready for broadcast');
          
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          _setError(`Initialization failed: ${message}`);
          
          // Auto-recovery if enabled
          if (config.enableAutoRecovery && get()._retryCount < config.maxRetries) {
            set({ _retryCount: get()._retryCount + 1 });
            _log(`Retry attempt ${get()._retryCount}/${config.maxRetries}`);
            
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            await get().initialize();
          }
        }
      },
      
      // ======================================================================
      // START BROADCAST
      // ======================================================================
      
      startBroadcast: async (sessionId?: Id<"sessions">) => {
        const { state, canStartBroadcast, _setState, _setError, _log, config } = get();
        
        // Validate session ID is provided
        if (!sessionId) {
          _setError('Cannot start broadcast: No session ID provided. Please select a session first.');
          _log('❌ Start broadcast failed: Missing session ID');
          return;
        }
        
        _log('🔍 Validating session before broadcast...', `Session ID: ${sessionId}`);
        
        // Validate prerequisites
        if (!canStartBroadcast()) {
          const snapshot = get().getSnapshot();
          const reasons: string[] = [];
          
          if (state !== 'ready') reasons.push(`state is '${state}', not 'ready'`);
          if (!snapshot.host.isInitialized) reasons.push('host agent not initialized');
          
          _setError(`Cannot start broadcast: ${reasons.join(', ')}`);
          return;
        }
        
        _setState('starting', 'user_action');
        
        try {
          _log('🚀 Starting broadcast sequence...');
          
          // Get all stores
          const liveFeedStore = useSimpleLiveFeedStore.getState();
          const hostStore = useHostAgentStore.getState();
          const producerStore = useProducerStore.getState();
          const sessionStore = useBroadcastSessionStore.getState();
          
          // STARTUP SEQUENCE (order matters!)
          
          // Step 1: Start live feed with session ID
          _log('Step 1: Starting live feed with session...', sessionId);
          liveFeedStore.setCurrentSessionId(sessionId); // Sync session ID
          liveFeedStore.setIsLive(true);
          
          // Step 2: Start broadcast session timer
          _log('Step 2: Starting broadcast session timer...');
          sessionStore.startBroadcastSession('general');
          
          // Step 3: Start host agent
          _log('Step 3: Starting host agent...', sessionId ? `with session: ${sessionId}` : 'without session');
          _log('Host state before start:', { isActive: hostStore.isActive, isStreaming: hostStore.isStreaming });
          
          try {
            // Pass the session ID to link host narrations to this session
            await hostStore.start(sessionId ?? undefined);
            _log('Host start() call completed');
          } catch (hostError) {
            _log('Host start() threw error:', hostError);
            throw new Error(`Host agent start failed: ${hostError instanceof Error ? hostError.message : 'Unknown error'}`);
          }
          
          // Wait for host to be active
          const hostStartTime = Date.now();
          let attempts = 0;
          while (!useHostAgentStore.getState().isActive && Date.now() - hostStartTime < 10000) {
            attempts++;
            if (attempts % 10 === 0) {
              const currentHostState = useHostAgentStore.getState();
              _log(`Waiting for host agent... (${attempts * 100}ms elapsed, isActive=${currentHostState.isActive})`);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const finalHostState = useHostAgentStore.getState();
          _log('Host state after wait:', { 
            isActive: finalHostState.isActive, 
            isStreaming: finalHostState.isStreaming,
            elapsed: Date.now() - hostStartTime 
          });
          
          if (!finalHostState.isActive) {
            throw new Error(`Host agent failed to become active after ${Date.now() - hostStartTime}ms`);
          }
          
          // Verify host stored the session ID correctly
          const storedSessionId = finalHostState.getCurrentSessionId();
          if (storedSessionId !== sessionId) {
            _log('⚠️ Session ID mismatch detected!', { 
              expected: sessionId, 
              actual: storedSessionId 
            });
            throw new Error(`Host agent session mismatch: expected ${sessionId}, got ${storedSessionId}`);
          }
          _log('✅ Host session verification passed:', storedSessionId);
          
          // Step 4: Start producer
          _log('Step 4: Starting producer...');
          if (!producerStore.isActive) {
            await producerStore.startProducer();
          }
          
          // Step 5: Sync to Convex (if enabled)
          if (config.enableConvexSync && sessionId) {
            _log('Step 5: Syncing state to Convex...');
            set({ currentConvexSessionId: sessionId });
            
            // Note: Convex sync should be triggered by calling component:
            // const updateBroadcast = useMutation(api.users.sessions.updateBroadcastState);
            // await updateBroadcast({
            //   id: sessionId,
            //   broadcastState: 'live',
            //   isLive: true,
            //   hostActive: true,
            //   producerActive: true,
            //   liveFeedActive: true,
            // });
            // Use getSyncData() to get current state for syncing
          }
          
          // All steps complete
          _setState('live', 'user_action');
          _log('✅ Broadcast started successfully');
          
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          _setError(`Broadcast startup failed: ${message}`);
          
          // Rollback on error
          _log('⚠️ Rolling back due to error...');
          await get().stopBroadcast();
          
          throw error;
        }
      },
      
      // ======================================================================
      // STOP BROADCAST
      // ======================================================================
      
      stopBroadcast: async () => {
        const { state, _setState, _setError, _log, config } = get();
        
        if (state !== 'live' && state !== 'error') {
          _log('Not in live/error state, nothing to stop', { state });
          return;
        }
        
        // Only transition to stopping if we're in live state
        // If in error state, we'll clean up and go to idle directly
        const isErrorState = state === 'error';
        if (!isErrorState) {
          _setState('stopping', 'manual_stop');
        }
        
        try {
          _log('⏹️ Stopping broadcast sequence...');
          
          // Get all stores
          const producerStore = useProducerStore.getState();
          const hostStore = useHostAgentStore.getState();
          const sessionStore = useBroadcastSessionStore.getState();
          const liveFeedStore = useSimpleLiveFeedStore.getState();
          
          // SHUTDOWN SEQUENCE (reverse order of startup!)
          
          // Step 1: Stop producer
          _log('Step 1: Stopping producer...');
          if (producerStore.isActive) {
            await producerStore.stopProducer();
          }
          
          // Step 2: Stop host agent
          _log('Step 2: Stopping host agent...');
          if (hostStore.isActive) {
            await hostStore.stop();
          }
          
          // Step 3: End broadcast session
          _log('Step 3: Ending broadcast session...');
          sessionStore.endBroadcastSession();
          
          // Step 4: Stop live feed
          _log('Step 4: Stopping live feed...');
          liveFeedStore.setIsLive(false);
          
          // Step 5: Sync to Convex (if enabled)
          if (config.enableConvexSync && get().currentConvexSessionId) {
            _log('Step 5: Syncing state to Convex...');
            
            // Note: Convex sync should be triggered by calling component:
            // const updateBroadcast = useMutation(api.users.sessions.updateBroadcastState);
            // await updateBroadcast(get().getSyncData());
            
            set({ currentConvexSessionId: null });
          }
          
          // All steps complete
          // From 'stopping' state, we can ONLY transition to 'idle' or 'error' (per FSM rules)
          // Clear error if we were recovering from one
          if (isErrorState) {
            get()._clearError();
          }
          
          // Always go to idle after stopping (stopping → ready is invalid)
          _setState('idle', 'manual_stop');
          _log('✅ Broadcast stopped successfully');
          
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          _setError(`Broadcast shutdown failed: ${message}`);
          throw error;
        }
      },
      
      // ======================================================================
      // EMERGENCY STOP
      // ======================================================================
      
      emergencyStop: async () => {
        const { _log } = get();
        
        _log('🚨 EMERGENCY STOP - Immediate shutdown initiated');
        
        try {
          // Force stop all services immediately (no graceful shutdown)
          const hostStore = useHostAgentStore.getState();
          const producerStore = useProducerStore.getState();
          const sessionStore = useBroadcastSessionStore.getState();
          const liveFeedStore = useSimpleLiveFeedStore.getState();
          
          // Stop everything in parallel
          await Promise.allSettled([
            hostStore.isActive ? hostStore.stop() : Promise.resolve(),
            producerStore.isActive ? producerStore.stopProducer() : Promise.resolve(),
          ]);
          
          sessionStore.endBroadcastSession();
          liveFeedStore.setIsLive(false);
          
          set({ 
            state: 'idle',
            error: null,
            currentConvexSessionId: null,
          });
          
          _log('✅ Emergency stop complete');
          
        } catch (error) {
          _log('❌ Emergency stop failed', error);
        }
      },
      
      // ======================================================================
      // ERROR RECOVERY
      // ======================================================================
      
      recover: async () => {
        const { state, _log, config } = get();
        
        // If already in idle, just re-initialize
        if (state === 'idle') {
          _log('Already in idle state, re-initializing...');
          await get().initialize();
          return;
        }
        
        // If not in error state, nothing to recover
        if (state !== 'error') {
          _log('Not in error state, no recovery needed');
          return;
        }
        
        set({ _isRecovering: true });
        _log('🔄 Attempting recovery from error state...');
        
        try {
          // Clean up any partial state
          await get().emergencyStop();
          
          // Clear error
          get()._clearError();
          set({ _retryCount: 0 });
          
          // emergencyStop already sets state to 'idle', so no need to transition again
          _log('Cleanup complete, state reset to idle');
          
          // Re-initialize if auto-recovery enabled
          if (config.enableAutoRecovery) {
            _log('Auto-recovery enabled, re-initializing...');
            await get().initialize();
          }
          
          _log('✅ Recovery complete');
          
        } catch (error) {
          _log('❌ Recovery failed', error);
        } finally {
          set({ _isRecovering: false });
        }
      },
      
      // ======================================================================
      // STATE INSPECTION
      // ======================================================================
      
      getSyncData: () => {
        const orchestrator = get();
        const hostStore = useHostAgentStore.getState();
        const producerStore = useProducerStore.getState();
        const liveFeedStore = useSimpleLiveFeedStore.getState();
        
        if (!orchestrator.currentConvexSessionId) {
          return null;
        }
        
        return {
          id: orchestrator.currentConvexSessionId,
          broadcastState: orchestrator.state,
          isLive: orchestrator.state === 'live',
          hostActive: hostStore.isActive,
          producerActive: producerStore.isActive,
          liveFeedActive: liveFeedStore.isLive,
          broadcastError: orchestrator.error ?? undefined,
        };
      },
      
      getSnapshot: (): BroadcastSnapshot => {
        const orchestrator = get();
        const hostStore = useHostAgentStore.getState();
        const producerStore = useProducerStore.getState();
        const liveFeedStore = useSimpleLiveFeedStore.getState();
        const sessionStore = useBroadcastSessionStore.getState();
        
        return {
          orchestrator: {
            state: orchestrator.state,
            previousState: orchestrator.previousState,
            error: orchestrator.error,
            lastTransition: orchestrator.lastTransition,
          },
          host: {
            isActive: hostStore.isActive,
            isInitialized: hostStore.hostAgent !== null,
            queueLength: hostStore.stats.queueLength,
            isStreaming: hostStore.isStreaming,
            hasError: false, // TODO: Add error tracking to host store
          },
          producer: {
            isActive: producerStore.isActive,
            isProcessing: false, // TODO: Add to producer store
          },
          liveFeed: {
            isLive: liveFeedStore.isLive,
            postsCount: liveFeedStore.posts.length,
            hasContent: liveFeedStore.posts.length > 0,
          },
          session: {
            isActive: sessionStore.currentSession?.isActive ?? false,
            duration: sessionStore.getCurrentSessionDuration(),
            sessionId: sessionStore.currentSession?.id ?? null,
          },
          convex: {
            sessionId: orchestrator.currentConvexSessionId,
            isSynced: orchestrator.currentConvexSessionId !== null,
          },
          computed: {
            canStart: orchestrator.canStartBroadcast(),
            canStop: orchestrator.canStopBroadcast(),
            isTransitioning: ['initializing', 'starting', 'stopping'].includes(orchestrator.state),
            requiresUserAction: orchestrator.state === 'error' || orchestrator.state === 'idle',
          },
        };
      },
      
      // ======================================================================
      // CONFIGURATION
      // ======================================================================
      
      updateConfig: (newConfig: Partial<OrchestratorConfig>) => {
        set({ 
          config: { ...get().config, ...newConfig } 
        });
        get()._log('Configuration updated', newConfig);
      },
      
      resetConfig: () => {
        set({ config: DEFAULT_CONFIG });
        get()._log('Configuration reset to defaults');
      },
    })),
    { name: 'BroadcastOrchestrator' }
  )
);

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check if system is currently broadcasting
 */
export const useIsBroadcasting = () => {
  return useBroadcastOrchestrator(state => state.state === 'live');
};

/**
 * Hook to check if system can start broadcast
 */
export const useCanStartBroadcast = () => {
  return useBroadcastOrchestrator(state => state.canStartBroadcast());
};

/**
 * Hook to check if system can stop broadcast
 */
export const useCanStopBroadcast = () => {
  return useBroadcastOrchestrator(state => state.canStopBroadcast());
};

/**
 * Hook to get current broadcast state
 */
export const useBroadcastState = () => {
  return useBroadcastOrchestrator(state => state.state);
};

/**
 * Hook to check if system is in error state
 */
export const useHasError = () => {
  return useBroadcastOrchestrator(state => state.error !== null);
};

/**
 * Hook to get broadcast error message
 */
export const useBroadcastError = () => {
  return useBroadcastOrchestrator(state => state.error);
};

/**
 * Hook to check if system is transitioning
 */
export const useIsTransitioning = () => {
  return useBroadcastOrchestrator(state => 
    ['initializing', 'starting', 'stopping'].includes(state.state)
  );
};

/**
 * Hook to get the active broadcast session ID
 * Returns the session ID that is currently broadcasting (if any)
 */
export const useActiveBroadcastSessionId = () => {
  return useBroadcastOrchestrator(state => state.currentConvexSessionId);
};

/**
 * Hook to get full state snapshot (for debugging)
 * Note: Returns individual state values to prevent infinite loops
 * Components should destructure only the values they need
 */
export const useBroadcastSnapshot = (): BroadcastSnapshot => {
  const state = useBroadcastOrchestrator(s => s.state);
  const previousState = useBroadcastOrchestrator(s => s.previousState);
  const error = useBroadcastOrchestrator(s => s.error);
  const lastTransition = useBroadcastOrchestrator(s => s.lastTransition);
  
  // Get child store states directly (these are already memoized by Zustand)
  const hostStore = useHostAgentStore();
  const producerStore = useProducerStore();
  const liveFeedStore = useSimpleLiveFeedStore();
  const sessionStore = useBroadcastSessionStore();
  
  return {
    orchestrator: {
      state,
      previousState,
      error,
      lastTransition,
    },
    host: {
      isActive: hostStore.isActive,
      isInitialized: hostStore.hostAgent !== null,
      queueLength: hostStore.stats.queueLength,
      isStreaming: hostStore.isStreaming,
      hasError: false, // Host store doesn't have error field currently
    },
    producer: {
      isActive: producerStore.isActive,
      isProcessing: false, // Producer store doesn't have isProcessing field currently
    },
    liveFeed: {
      isLive: liveFeedStore.isLive,
      postsCount: liveFeedStore.posts.length,
      hasContent: liveFeedStore.posts.length > 0,
    },
    session: {
      isActive: sessionStore.currentSession?.isActive ?? false,
      duration: sessionStore.getCurrentSessionDuration(),
      sessionId: sessionStore.currentSession?.id ?? null,
    },
    convex: {
      isSynced: useBroadcastOrchestrator(s => s.currentConvexSessionId !== null),
      sessionId: useBroadcastOrchestrator(s => s.currentConvexSessionId),
    },
    computed: {
      canStart: useBroadcastOrchestrator(s => s.canStartBroadcast()),
      canStop: useBroadcastOrchestrator(s => s.canStopBroadcast()),
      isTransitioning: ['initializing', 'starting', 'stopping'].includes(state),
      requiresUserAction: error !== null || state === 'error',
    },
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { 
  OrchestratorConfig, 
  TransitionValidation 
};
