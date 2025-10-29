/**
 * Demo User Hook
 * Replaces Convex useUser hook with demo user data
 */

import { DEMO_USER } from "../stores/demoUserStore";

export function useUser() {
  return {
    user: DEMO_USER,
    isSignedIn: true,
    isLoaded: true,
    userId: DEMO_USER._id,
    ensureUserDocument: async () => DEMO_USER,
  };
}

export function useUpsertUser() {
  // No-op in demo mode
  return { 
    ensureUserDocument: async () => DEMO_USER 
  };
}