// DELETE RATE LIMITS
// Removes rate limit records to unblock login attempts

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteAllRateLimits = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    deletedCount: v.number(),
  }),
  handler: async (ctx) => {
    const rateLimits = await ctx.db
      .query("authRateLimits")
      .collect();

    let deletedCount = 0;
    for (const record of rateLimits) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount,
    };
  },
});
