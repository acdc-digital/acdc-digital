import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Store a generated Finlight news summary in the database
 */
export const storeSummary = mutation({
  args: {
    ticker: v.string(),
    summary: v.string(),
    newsSentimentScore: v.optional(v.number()),
    generatedAt: v.number(),
    expiresAt: v.number(),
    articlesCount: v.number(),
    sources: v.array(v.string()),
    weight: v.number(),
  },
  returns: v.id("finlight_news_summaries"),
  handler: async (ctx, args): Promise<Id<"finlight_news_summaries">> => {
    // Delete any existing summaries for this ticker (including expired ones)
    const existing = await ctx.db
      .query("finlight_news_summaries")
      .withIndex("by_ticker_and_generated_at", (q) => q.eq("ticker", args.ticker))
      .collect();
    
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }

    // Insert the new summary
    return await ctx.db.insert("finlight_news_summaries", {
      ticker: args.ticker,
      summary: args.summary,
      news_sentiment_score: args.newsSentimentScore,
      generated_at: args.generatedAt,
      expires_at: args.expiresAt,
      articles_count: args.articlesCount,
      sources: args.sources,
      weight: args.weight,
    });
  },
});

/**
 * Get cached Finlight news summary for a ticker
 */
export const getCachedSummary = query({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      summary: v.string(),
      news_sentiment_score: v.union(v.number(), v.null()),
      generated_at: v.number(),
      articles_count: v.number(),
      sources: v.array(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find most recent non-expired summary
    const cached = await ctx.db
      .query("finlight_news_summaries")
      .withIndex("by_ticker_and_generated_at", (q) => q.eq("ticker", args.ticker))
      .filter((q) => q.gt(q.field("expires_at"), now))
      .order("desc")
      .first();

    if (cached) {
      return {
        summary: cached.summary,
        news_sentiment_score: cached.news_sentiment_score ?? null,
        generated_at: cached.generated_at,
        articles_count: cached.articles_count,
        sources: cached.sources,
      };
    }

    return null;
  },
});

/**
 * Clean up expired Finlight news summaries (run periodically)
 */
export const cleanupExpiredSummaries = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    const now = Date.now();
    const expired = await ctx.db
      .query("finlight_news_summaries")
      .withIndex("by_expires_at")
      .filter((q) => q.lt(q.field("expires_at"), now))
      .collect();

    for (const doc of expired) {
      await ctx.db.delete(doc._id);
    }

    console.log(`🗑️ Cleaned up ${expired.length} expired Finlight news summaries`);
    return expired.length;
  },
});
