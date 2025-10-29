/**
 * Demo Convex Hooks
 * Provides mock implementations of Convex React hooks
 */

// Mock useQuery - returns demo data or null
export function useQuery(functionReference: any, args?: any) {
  // Always return null for subscription checks and other queries in demo mode
  // Components should handle null gracefully
  return null;
}

// Mock useMutation - returns a no-op function
export function useMutation(functionReference: any) {
  return async (...args: any[]) => {
    console.log("[Demo] Mutation called (no-op):", functionReference);
    return null;
  };
}

// Mock useAction - returns a no-op function
export function useAction(functionReference: any) {
  return async (...args: any[]) => {
    console.log("[Demo] Action called (no-op):", functionReference);
    return null;
  };
}

// Mock usePaginatedQuery - returns empty paginated result
export function usePaginatedQuery(
  functionReference: any,
  args: any,
  options?: any
) {
  return {
    results: [],
    status: "Exhausted" as const,
    isLoading: false,
    loadMore: () => {},
  };
}
