/**
 * Demo User Store
 * Provides a static demo user to replace useConvexAuth/useConvexUser
 */

export const DEMO_USER = {
  _id: 'demo-user',
  name: 'Demo User',
  email: 'demo@soloist.app',
  image: undefined,
  emailVerified: true,
  isAnonymous: false,
} as const;

// Hook to replace useConvexUser
export const useDemoUser = () => {
  return DEMO_USER;
};

// Hook to replace useConvexAuth  
export const useDemoAuth = () => {
  return {
    isLoading: false,
    isAuthenticated: true,
  };
};

// Helper to check if user is demo user
export const isDemoUser = () => true;
