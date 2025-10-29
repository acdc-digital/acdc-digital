/**
 * Demo Convex User Hook
 * Replaces Convex authentication hooks with demo data
 */

import { DEMO_USER, useDemoAuth } from "../stores/demoUserStore";

export function useConvexUser() {
  const { isAuthenticated, isLoading } = useDemoAuth();
  
  return {
    isAuthenticated,
    isLoading,
    userId: DEMO_USER._id,
  };
}
