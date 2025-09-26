import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const cleanupDuplicateUsers = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Find all users with the demo clerk ID
    const demoUsers = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "demo-user-clerk-id"))
      .collect();

    if (demoUsers.length <= 1) {
      return `No duplicates found. Users: ${demoUsers.length}`;
    }

    // Keep the first user, delete the rest
    const userToKeep = demoUsers[0];
    const usersToDelete = demoUsers.slice(1);

    for (const user of usersToDelete) {
      // First, delete any daily logs for this duplicate user
      const logsToDelete = await ctx.db
        .query("dailyLogs")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();

      for (const log of logsToDelete) {
        await ctx.db.delete(log._id);
      }

      // Then delete the duplicate user
      await ctx.db.delete(user._id);
    }

    return `Cleaned up ${usersToDelete.length} duplicate users. Kept user: ${userToKeep._id}`;
  },
});