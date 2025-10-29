/**
 * Demo User ID Hook
 * Replaces Convex userId hook with demo user
 */

import { DEMO_USER } from "../stores/demoUserStore";

export function useUserId() {
  return {
    userId: DEMO_USER._id,
    isAuthenticated: true,
  };
}
