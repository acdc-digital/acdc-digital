import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Compare a ticker's social sentiment against its news sentiment
 * Returns how much social sentiment differs from news sentiment
 */
export const getTickerVsNewsComparison = query({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      socialScore: v.number(),
      newsScore: v.number(),
      differenceFromNews: v.number(), // Absolute difference
      percentageVsNews: v.number(), // Percentage above/below news sentiment
      isSocialHigher: v.boolean(),
      hasNewsData: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get latest social sentiment score
    const socialScore = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_ticker_and_calculated_at", (q) =>
        q.eq("ticker", args.ticker)
      )
      .order("desc")
      .first();

    if (!socialScore) {
      return null;
    }

    // Get latest news sentiment from cached summaries
    const now = Date.now();
    const newsSummary = await ctx.db
      .query("finlight_news_summaries")
      .withIndex("by_ticker_and_generated_at", (q) => q.eq("ticker", args.ticker))
      .filter((q) => q.gt(q.field("expires_at"), now))
      .order("desc")
      .first();

    // If no news data or no sentiment score, return null
    if (!newsSummary || !newsSummary.news_sentiment_score) {
      return null;
    }

    const newsScore = newsSummary.news_sentiment_score;

    // Normalize social sentiment to 0-100 scale using multiplier
    // Multiplier typically ranges from ~0.5 to ~2.5
    // We'll map: 0.5 = 0, 1.0 = 50 (baseline), 2.5 = 100
    // Formula: (multiplier - 0.5) / 2.0 * 100
    const normalizedSocialScore = Math.max(0, Math.min(100, ((socialScore.multiplier - 0.5) / 2.0) * 100));

    // Calculate differences using normalized scores
    const differenceFromNews = normalizedSocialScore - newsScore;
    const percentageVsNews = ((normalizedSocialScore - newsScore) / newsScore) * 100;

    return {
      socialScore: normalizedSocialScore,
      newsScore,
      differenceFromNews,
      percentageVsNews,
      isSocialHigher: differenceFromNews > 0,
      hasNewsData: true,
    };
  },
});
