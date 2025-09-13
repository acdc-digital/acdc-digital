import { v } from "convex/values";
import { query } from "./_generated/server";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
      lastSeen: v.number(),
    }),
  ),

  // Query implementation.
  handler: async (ctx) => {
    // Get current user if authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Look for existing user in our database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      lastSeen: user.lastSeen,
    };
  },
});
