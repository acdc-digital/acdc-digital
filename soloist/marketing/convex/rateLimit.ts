import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update rate limit tracking
export const updateRateLimit = mutation({
  args: {
    service: v.string(),
    calls_made: v.number(),
    calls_remaining: v.number(),
    reset_at: v.number(),
    is_throttled: v.boolean(),
    throttle_until: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_service", (q) => 
        q.eq("service", args.service)
      )
      .first();
    
    const now = Date.now();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        calls_made: args.calls_made,
        calls_remaining: args.calls_remaining,
        reset_at: args.reset_at,
        is_throttled: args.is_throttled,
        throttle_until: args.throttle_until,
        timestamp: now,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("rate_limits", {
        service: args.service,
        calls_made: args.calls_made,
        calls_remaining: args.calls_remaining,
        reset_at: args.reset_at,
        total_calls_today: 0,
        total_calls_this_hour: 0,
        is_throttled: args.is_throttled,
        throttle_until: args.throttle_until,
        timestamp: now,
        updated_at: now,
      });
    }
  },
});

// Get rate limit status
export const getRateLimitStatus = query({
  args: {
    service: v.string(),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const rateLimit = await ctx.db
      .query("rate_limits")
      .withIndex("by_service", (q) => 
        q.eq("service", args.service)
      )
      .first();
    
    return rateLimit;
  },
});
