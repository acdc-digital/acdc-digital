// Convex Admin Authorization Helper
// /soloist/convex/lib/requireAdmin.ts

import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../../_generated/server";
import { Id, Doc } from "../../_generated/dataModel";

type AuthContext = QueryCtx | MutationCtx;

/**
 * Require authenticated user - throws if not authenticated
 * @param ctx - Query or Mutation context
 * @returns The authenticated user's ID and document
 */
export async function requireAuth(ctx: AuthContext): Promise<{
  userId: Id<"users">;
  user: Doc<"users">;
}> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("User not found");
  }

  return { userId, user };
}

/**
 * Require admin role - throws if not authenticated or not an admin
 * @param ctx - Query or Mutation context
 * @returns The authenticated admin user's ID and document
 */
export async function requireAdmin(ctx: AuthContext): Promise<{
  userId: Id<"users">;
  user: Doc<"users">;
}> {
  const { userId, user } = await requireAuth(ctx);

  if (user.role !== "admin") {
    throw new ConvexError("Unauthorized: admin access required");
  }

  return { userId, user };
}

/**
 * Check if current user is admin (non-throwing version)
 * @param ctx - Query or Mutation context
 * @returns true if user is authenticated and has admin role
 */
export async function isAdmin(ctx: AuthContext): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return false;
  }

  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

/**
 * Get current user if authenticated (non-throwing version)
 * @param ctx - Query or Mutation context
 * @returns The user document or null if not authenticated
 */
export async function getCurrentUser(ctx: AuthContext): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return null;
  }

  return await ctx.db.get(userId);
}
