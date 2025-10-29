/**
 * Demo Auth Actions Hook
 * Provides mock auth actions for demo mode
 */

export function useAuthActions() {
  return {
    signOut: async () => {
      console.log("[Demo] Sign out called (no-op)");
    },
    signIn: async () => {
      console.log("[Demo] Sign in called (no-op)");
    },
  };
}
