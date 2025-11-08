"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useViewOrchestrator, ViewType } from "@/store/viewOrchestrator";

interface ViewContextValue {
  currentView: ViewType;
  transitionTo: (view: ViewType) => Promise<boolean>;
  canTransitionTo: (view: ViewType) => boolean;
  isTransitioning: boolean;
  lastError: string | null;
  clearError: () => void;
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

interface ViewProviderProps {
  children: ReactNode;
  initialView?: ViewType;
}

/**
 * ViewProvider - Context provider for view orchestration
 * Wraps the view orchestrator and provides easy access to view state and actions
 */
export function ViewProvider({ children, initialView = "dashboard" }: ViewProviderProps) {
  const orchestrator = useViewOrchestrator();

  // Initialize view on mount
  useEffect(() => {
    if (orchestrator.currentView !== initialView) {
      orchestrator.transitionTo(initialView);
    }
  }, [initialView]); // Only run on initial mount

  // Log transitions in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ViewProvider] View state:', {
        currentView: orchestrator.currentView,
        transitionState: orchestrator.transitionState,
        previousView: orchestrator.previousView,
      });
    }
  }, [orchestrator.currentView, orchestrator.transitionState, orchestrator.previousView]);

  const value: ViewContextValue = {
    currentView: orchestrator.currentView,
    transitionTo: orchestrator.transitionTo,
    canTransitionTo: orchestrator.canTransitionTo,
    isTransitioning: orchestrator.transitionState === "transitioning",
    lastError: orchestrator.lastError,
    clearError: orchestrator.clearError,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

/**
 * Hook to access view context
 * Must be used within a ViewProvider
 */
export function useView() {
  const context = useContext(ViewContext);
  
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  
  return context;
}

/**
 * Hook to safely access view context (returns null if not in provider)
 * Use this for optional view features
 */
export function useViewSafe() {
  return useContext(ViewContext);
}
