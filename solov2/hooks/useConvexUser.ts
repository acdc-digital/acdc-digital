import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Simplified version without Clerk authentication
// In a real app, you'd use Clerk or another auth provider
export function useConvexUser() {
  // Try to get demo user
  const demoUser = useQuery(api.users.getByClerkId, { clerkId: "demo-user-clerk-id" });

  const isAuthenticated = true;
  const isLoading = demoUser === undefined;
  const userId = demoUser?._id;

  return {
    isAuthenticated,
    isLoading,
    userId,
    clerkUser: null,
    convexUser: demoUser,
  };
}