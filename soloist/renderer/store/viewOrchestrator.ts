import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ViewType = "dashboard" | "soloist" | "soloistNew" | "testing" | "waypoints" | "superpowers" | "canvas";

export type TransitionState = "idle" | "transitioning" | "active" | "error";

export interface ViewTransition {
  from: ViewType | null;
  to: ViewType;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface ViewOrchestratorState {
  // Current state
  currentView: ViewType;
  transitionState: TransitionState;
  previousView: ViewType | null;
  
  // Transition history (last 10 transitions)
  transitionHistory: ViewTransition[];
  
  // Error handling
  lastError: string | null;
  
  // Actions
  transitionTo: (view: ViewType) => Promise<boolean>;
  setTransitionState: (state: TransitionState) => void;
  recordTransition: (transition: ViewTransition) => void;
  canTransitionTo: (view: ViewType) => boolean;
  clearError: () => void;
  reset: () => void;
}

/**
 * View Orchestrator - FSM for managing view transitions
 * Based on SMNB's broadcastOrchestrator.ts pattern
 * 
 * States:
 * - idle: No transition in progress
 * - transitioning: View change in progress
 * - active: View is active and stable
 * - error: Transition failed
 */
export const useViewOrchestrator = create<ViewOrchestratorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentView: "dashboard",
      transitionState: "active",
      previousView: null,
      transitionHistory: [],
      lastError: null,

      // Transition to a new view with validation
      transitionTo: async (view: ViewType): Promise<boolean> => {
        const state = get();
        
        // Validation: Check if transition is allowed
        if (!state.canTransitionTo(view)) {
          const error = `Cannot transition to ${view} from ${state.transitionState} state`;
          console.error(error);
          set({
            lastError: error,
            transitionState: "error",
          });
          return false;
        }

        // Already at target view
        if (state.currentView === view && state.transitionState === "active") {
          console.log(`Already at ${view} view`);
          return true;
        }

        console.log(`Transitioning from ${state.currentView} to ${view}`);
        
        // Set transitioning state
        set({
          transitionState: "transitioning",
          lastError: null,
        });

        try {
          // Pre-transition cleanup (if needed)
          await preTransitionCleanup(state.currentView);

          // Perform the transition
          const previousView = state.currentView;
          set({
            previousView,
            currentView: view,
            transitionState: "active",
          });

          // Record successful transition
          state.recordTransition({
            from: previousView,
            to: view,
            timestamp: Date.now(),
            success: true,
          });

          console.log(`Successfully transitioned to ${view}`);
          return true;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Transition to ${view} failed:`, errorMessage);
          
          set({
            transitionState: "error",
            lastError: errorMessage,
          });

          // Record failed transition
          state.recordTransition({
            from: state.currentView,
            to: view,
            timestamp: Date.now(),
            success: false,
            error: errorMessage,
          });

          return false;
        }
      },

      // Set transition state manually (use sparingly)
      setTransitionState: (state: TransitionState) => {
        set({ transitionState: state });
      },

      // Record a transition in history (max 10)
      recordTransition: (transition: ViewTransition) => {
        set((state) => ({
          transitionHistory: [
            transition,
            ...state.transitionHistory.slice(0, 9), // Keep last 10
          ],
        }));
      },

      // Check if transition to target view is allowed
      canTransitionTo: (view: ViewType): boolean => {
        const state = get();
        
        // Can't transition if already transitioning
        if (state.transitionState === "transitioning") {
          return false;
        }

        // Can't transition if in error state (must clear error first)
        if (state.transitionState === "error") {
          return false;
        }

        return true;
      },

      // Clear error state
      clearError: () => {
        set({
          lastError: null,
          transitionState: get().currentView ? "active" : "idle",
        });
      },

      // Reset orchestrator to initial state
      reset: () => {
        set({
          currentView: "dashboard",
          transitionState: "active",
          previousView: null,
          transitionHistory: [],
          lastError: null,
        });
      },
    }),
    {
      name: 'viewOrchestrator',
    }
  )
);

/**
 * Pre-transition cleanup hook
 * Override this function to add custom cleanup logic before view transitions
 */
async function preTransitionCleanup(fromView: ViewType): Promise<void> {
  console.log(`Cleanup for ${fromView} view`);
  
  // Add any view-specific cleanup here
  switch (fromView) {
    case "dashboard":
      // Example: Save any unsaved dashboard state
      break;
    case "soloist":
      // Example: Pause any running processes
      break;
    case "testing":
      // Example: Stop any active tests
      break;
    case "waypoints":
      // Example: Save waypoint progress
      break;
    case "superpowers":
      // Example: Clear any superpowers state
      break;
    case "soloistNew":
      // Example: Clear any soloistNew state
      break;
    case "canvas":
      // Example: Clear any canvas state
      break;
  }
  
  // Simulate async cleanup (remove in production if not needed)
  await new Promise(resolve => setTimeout(resolve, 10));
}

// Selector hooks for optimized re-renders
export const useCurrentView = () => useViewOrchestrator((state) => state.currentView);
export const useTransitionState = () => useViewOrchestrator((state) => state.transitionState);
export const usePreviousView = () => useViewOrchestrator((state) => state.previousView);
export const useTransitionHistory = () => useViewOrchestrator((state) => state.transitionHistory);
export const useLastError = () => useViewOrchestrator((state) => state.lastError);

// Action hooks
export const useViewActions = () => useViewOrchestrator((state) => ({
  transitionTo: state.transitionTo,
  canTransitionTo: state.canTransitionTo,
  clearError: state.clearError,
  reset: state.reset,
}));
