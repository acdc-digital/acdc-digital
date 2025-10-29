/**
 * Demo Convex Client Hook
 * Provides mock Convex client for demo mode
 */

export function useConvex() {
  return {
    // Mock client methods that components might use
    query: async () => null,
    mutation: async () => null,
    action: async () => null,
  };
}
