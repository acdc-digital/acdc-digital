"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * UserInitializer component ensures that user records are created/updated
 * in Convex when they sign in through Clerk authentication
 */
export function UserInitializer() {
  const { user, isLoaded } = useUser();
  const upsertCurrentUser = useMutation(api.users.users.upsertCurrentUser);

  useEffect(() => {
    if (isLoaded && user) {
      // Create or update user in Convex database
      upsertCurrentUser({
        name: user.fullName || user.firstName || "Unknown User",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatarUrl: user.imageUrl,
      }).catch((error) => {
        console.error("Failed to initialize user:", error);
      });
    }
  }, [user, isLoaded, upsertCurrentUser]);

  // This component doesn't render anything
  return null;
}