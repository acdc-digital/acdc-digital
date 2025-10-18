import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Store a generated sentiment excerpt in the database
 */
export const storeExcerpt = mutation({
  args: {
    ticker: v.string(),
    excerpt: v.string(),
    generatedAt: v.number(),
    expiresAt: v.number(),
    tokenUsageId: v.optional(v.id("token_usage")),
    sentimentScore: v.number(),
    multiplier: v.number(),
    changePercent: v.number(),
    weight: v.number(),
  },
  returns: v.id("sentiment_excerpts"),
  handler: async (ctx, args): Promise<Id<"sentiment_excerpts">> => {
    // Delete any existing excerpts for this ticker (including expired ones)
    const existing = await ctx.db
      .query("sentiment_excerpts")
      .withIndex("by_ticker_and_generated_at", (q) => q.eq("ticker", args.ticker))
      .collect();
    
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }

    // Insert the new excerpt
    return await ctx.db.insert("sentiment_excerpts", {
      ticker: args.ticker,
      excerpt: args.excerpt,
      generated_at: args.generatedAt,
      expires_at: args.expiresAt,
      token_usage_id: args.tokenUsageId,
      sentiment_score: args.sentimentScore,
      multiplier: args.multiplier,
      change_percent: args.changePercent,
      weight: args.weight,
    });
  },
});

/**
 * Get cached sentiment excerpt for a ticker
 */
export const getCachedExcerpt = query({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      excerpt: v.string(),
      generated_at: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find most recent non-expired excerpt
    const cached = await ctx.db
      .query("sentiment_excerpts")
      .withIndex("by_ticker_and_generated_at", (q) => q.eq("ticker", args.ticker))
      .filter((q) => q.gt(q.field("expires_at"), now))
      .order("desc")
      .first();

    if (cached) {
      return {
        excerpt: cached.excerpt,
        generated_at: cached.generated_at,
      };
    }

    return null;
  },
});

/**
 * Clean up expired sentiment excerpts (run periodically)
 */
export const cleanupExpiredExcerpts = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    const now = Date.now();
    const expired = await ctx.db
      .query("sentiment_excerpts")
      .withIndex("by_expires_at")
      .filter((q) => q.lt(q.field("expires_at"), now))
      .collect();

    for (const doc of expired) {
      await ctx.db.delete(doc._id);
    }

    console.log(`🗑️ Cleaned up ${expired.length} expired sentiment excerpts`);
    return expired.length;
  },
});
