import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the latest sentiment score for a ticker with change data
 */
export const getLatestSentimentScore = query({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      ticker: v.string(),
      calculated_score: v.number(),
      multiplier: v.number(),
      score_change_percent: v.union(v.number(), v.null()),
      calculated_at: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const latestScore = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_ticker_and_calculated_at", (q) => q.eq("ticker", args.ticker))
      .order("desc")
      .first();

    if (!latestScore) {
      return null;
    }

    return {
      ticker: latestScore.ticker,
      calculated_score: latestScore.calculated_score,
      multiplier: latestScore.multiplier,
      score_change_percent: latestScore.score_change_percent ?? null,
      calculated_at: latestScore.calculated_at,
    };
  },
});

/**
 * Get latest sentiment scores for multiple tickers
 */
export const getLatestSentimentScores = query({
  args: {
    tickers: v.array(v.string()),
  },
  returns: v.array(
    v.object({
      ticker: v.string(),
      calculated_score: v.number(),
      score_change_percent: v.union(v.number(), v.null()),
      calculated_at: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const results = [];

    for (const ticker of args.tickers) {
      const latestScore = await ctx.db
        .query("sentiment_scores")
        .withIndex("by_ticker_and_calculated_at", (q) => q.eq("ticker", ticker))
        .order("desc")
        .first();

      if (latestScore) {
        results.push({
          ticker: latestScore.ticker,
          calculated_score: latestScore.calculated_score,
          score_change_percent: latestScore.score_change_percent ?? null,
          calculated_at: latestScore.calculated_at,
        });
      }
    }

    return results;
  },
});
