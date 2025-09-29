"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface AuthUser {
  id: Id<"users">;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: number;
  lastActiveAt: number;
}

export interface UseAuthReturn {
  // Authentication state
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // User data
  user: AuthUser | null;
  clerkUser: ReturnType<typeof useUser>["user"];
  
  // Authentication methods
  signOut: () => Promise<void>;
  
  // Convenience checks
  hasUser: boolean;
}

/**
 * Custom authentication hook that integrates Clerk with Convex user system
 * 
 * This hook provides:
 * - Unified authentication state
 * - Convex user data (from users table)
 * - Clerk user data (for UI/profile info)
 * - Loading states
 * - Authentication methods
 * 
 * Usage:
 * ```tsx
 * const { isAuthenticated, user, isLoading } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <LoginPrompt />;
 * 
 * return <div>Hello, {user?.name}!</div>;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerkAuth();
  
  // Get the corresponding Convex user
  const convexUser = useQuery(
    api.users.users.getCurrentUser,
    clerkUser ? {} : "skip"
  );
  
  // Determine loading state
  const isLoading = !clerkLoaded || (!!clerkUser && convexUser === undefined);
  
  // Determine authentication state
  const isAuthenticated = !!(clerkUser && convexUser);
  
  // Create unified user object
  const user: AuthUser | null = convexUser ? {
    id: convexUser._id,
    name: convexUser.name,
    email: convexUser.email,
    avatarUrl: convexUser.avatarUrl,
    createdAt: convexUser.createdAt,
    lastActiveAt: convexUser.lastActiveAt,
  } : null;
  
  return {
    isLoading,
    isAuthenticated,
    user,
    clerkUser,
    signOut,
    hasUser: !!user,
  };
}

/**
 * Hook for components that require authentication
 * Throws an error if user is not authenticated (for use in protected components)
 */
export function useRequireAuth(): AuthUser {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    throw new Error("Authentication still loading");
  }
  
  if (!isAuthenticated || !user) {
    throw new Error("User must be authenticated to access this resource");
  }
  
  return user;
}

/**
 * Higher-order hook for session-scoped operations
 * Returns the user ID for use in other hooks/queries that need user scoping
 */
export function useUserId(): Id<"users"> | null {
  const { user } = useAuth();
  return user?.id ?? null;
}