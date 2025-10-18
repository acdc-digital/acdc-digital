import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Debug query to see all sentiment score records for a ticker
 */
export const getAllScoresForTicker = query({
  args: {
    ticker: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      ticker: v.string(),
      calculated_score: v.number(),
      previous_score: v.union(v.number(), v.null()),
      score_change_percent: v.union(v.number(), v.null()),
      calculated_at: v.number(),
      _id: v.id("sentiment_scores"),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const scores = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_ticker_and_calculated_at", (q) => q.eq("ticker", args.ticker))
      .order("desc")
      .take(limit);

    return scores.map(score => ({
      ticker: score.ticker,
      calculated_score: score.calculated_score,
      previous_score: score.previous_score ?? null,
      score_change_percent: score.score_change_percent ?? null,
      calculated_at: score.calculated_at,
      _id: score._id,
    }));
  },
});

/**
 * Get count of all sentiment score records
 */
export const getTotalRecordCount = query({
  args: {},
  returns: v.object({
    totalRecords: v.number(),
    uniqueTickers: v.number(),
  }),
  handler: async (ctx) => {
    const allScores = await ctx.db.query("sentiment_scores").collect();
    const uniqueTickers = new Set(allScores.map(s => s.ticker)).size;
    
    return {
      totalRecords: allScores.length,
      uniqueTickers,
    };
  },
});
