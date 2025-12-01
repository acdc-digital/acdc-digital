// CHECK AUTH RATE LIMITS
// Lists all rate limit records (internal only)

import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listRateLimits = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const rateLimits = await ctx.db
      .query("authRateLimits")
      .collect();

    return rateLimits;
  },
});

export const clearAllRateLimits = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const rateLimits = await ctx.db
      .query("authRateLimits")
      .collect();

    return {
      count: rateLimits.length,
      limits: rateLimits,
    };
  },
});
