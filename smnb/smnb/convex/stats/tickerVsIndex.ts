import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Compare a ticker's sentiment performance against the weighted index mean
 * Returns how much the ticker is outperforming/underperforming relative to market
 */
export const getTickerVsIndexComparison = query({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      tickerScore: v.number(),
      weightedIndexMean: v.number(),
      differenceFromIndex: v.number(), // Absolute difference
      percentageVsIndex: v.number(), // Percentage above/below index
      multiplier: v.number(), // Ticker's performance multiplier
      indexMultiplierMean: v.number(), // Average multiplier across index
      isOutperforming: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get all sentiment scores from latest batch
    const allScores = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_calculated_at")
      .order("desc")
      .collect();

    if (allScores.length === 0) {
      return null;
    }

    // Get latest batch (within 1 hour)
    const latestTimestamp = allScores[0].calculated_at;
    const oneHourAgo = latestTimestamp - 60 * 60 * 1000;
    const latestScores = allScores.filter(
      (score) => score.calculated_at >= oneHourAgo
    );

    // Find this ticker's score
    const tickerScore = latestScores.find((s) => s.ticker === args.ticker);
    if (!tickerScore) {
      return null;
    }

    // Calculate weighted index mean
    const totalWeight = latestScores.reduce((sum, s) => sum + s.weight, 0);
    const weightedIndexMean = latestScores.reduce(
      (sum, s) => sum + (s.calculated_score * (s.weight / totalWeight)),
      0
    );

    // Calculate index average multiplier
    const indexMultiplierMean =
      latestScores.reduce((sum, s) => sum + s.multiplier, 0) /
      latestScores.length;

    // Calculate differences
    const differenceFromIndex = tickerScore.calculated_score - weightedIndexMean;
    const percentageVsIndex =
      ((tickerScore.calculated_score - weightedIndexMean) / weightedIndexMean) *
      100;

    return {
      tickerScore: tickerScore.calculated_score,
      weightedIndexMean,
      differenceFromIndex,
      percentageVsIndex,
      multiplier: tickerScore.multiplier,
      indexMultiplierMean,
      isOutperforming: differenceFromIndex > 0,
    };
  },
});
