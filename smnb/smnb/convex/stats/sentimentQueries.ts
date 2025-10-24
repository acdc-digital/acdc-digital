import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Sentiment Queries for Stock Ticker Analysis
 * Aggregates Reddit discussion data to calculate sentiment scores
 */

/**
 * Get the timestamp of the last processed sentiment update
 * Used for incremental updates to only process new posts
 */
export const getLastProcessedTimestamp = internalQuery({
  args: {},
  returns: v.union(v.number(), v.null()),
  handler: async (ctx) => {
    // Get the most recent sentiment score across all tickers
    const latestScore = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_calculated_at")
      .order("desc")
      .first();

    return latestScore?.calculated_at ?? null;
  },
});

// Public query for React components
export const getPostStatsByTicker = query({
  args: {
    ticker: v.string(),
    timeRange: v.optional(v.number()), // Hours to look back, default 24
  },
  returns: v.object({
    ticker: v.string(),
    mentionCount: v.number(),
    averageSentiment: v.number(), // 0-1 scale based on upvote_ratio
    totalEngagement: v.number(), // sum of scores
    momentum: v.number(), // % change from previous period
    lastUpdated: v.number(),
  }),
  handler: async (ctx, args) => {
    const { ticker, timeRange = 24 } = args;
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;

    // Query live feed posts
    const posts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_created_utc")
      .filter((q) => q.gte(q.field("created_utc"), cutoffTime / 1000)) // Reddit uses seconds
      .collect();

    // Filter posts that mention the ticker
    const relevantPosts = posts.filter((post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      return (
        text.includes(`$${ticker.toLowerCase()}`) ||
        text.includes(ticker.toLowerCase())
      );
    });

    if (relevantPosts.length === 0) {
      return {
        ticker,
        mentionCount: 0,
        averageSentiment: 0.5,
        totalEngagement: 0,
        momentum: 0,
        lastUpdated: Date.now(),
      };
    }

    // Calculate metrics
    const mentionCount = relevantPosts.length;
    const totalUpvoteRatio = relevantPosts.reduce(
      (sum, p) => sum + p.upvote_ratio,
      0
    );
    const averageSentiment = totalUpvoteRatio / mentionCount;
    const totalEngagement = relevantPosts.reduce(
      (sum, p) => sum + (p.score ?? 0) + (p.num_comments ?? 0) * 2,
      0
    );

    // Calculate momentum (compare to previous period)
    const midpointTime = (Date.now() - (timeRange / 2) * 60 * 60 * 1000) / 1000;
    const recentPosts = relevantPosts.filter(
      (p) => p.created_utc >= midpointTime
    );
    const olderPosts = relevantPosts.filter((p) => p.created_utc < midpointTime);

    const recentEngagement =
      recentPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) /
        Math.max(recentPosts.length, 1);
    const olderEngagement =
      olderPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) /
        Math.max(olderPosts.length, 1);

    const momentum =
      olderEngagement > 0
        ? ((recentEngagement - olderEngagement) / olderEngagement) * 100
        : 0;

    return {
      ticker,
      mentionCount,
      averageSentiment,
      totalEngagement,
      momentum,
      lastUpdated: Date.now(),
    };
  },
});

// Internal version for scheduled actions
export const getPostStatsByTickerInternal = internalQuery({
  args: {
    ticker: v.string(),
    timeRange: v.optional(v.number()), // Hours to look back, default 24
  },
  returns: v.object({
    ticker: v.string(),
    mentionCount: v.number(),
    averageSentiment: v.number(), // 0-1 scale based on upvote_ratio
    totalEngagement: v.number(), // sum of scores
    momentum: v.number(), // % change from previous period
    lastUpdated: v.number(),
  }),
  handler: async (ctx, args) => {
    const { ticker, timeRange = 24 } = args;
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;

    // Query live feed posts
    const posts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_created_utc")
      .filter((q) => q.gte(q.field("created_utc"), cutoffTime / 1000)) // Reddit uses seconds
      .collect();

    // Filter posts that mention the ticker
    const relevantPosts = posts.filter((post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      return (
        text.includes(`$${ticker.toLowerCase()}`) ||
        text.includes(ticker.toLowerCase())
      );
    });

    if (relevantPosts.length === 0) {
      return {
        ticker,
        mentionCount: 0,
        averageSentiment: 0.5,
        totalEngagement: 0,
        momentum: 0,
        lastUpdated: Date.now(),
      };
    }

    // Calculate metrics
    const mentionCount = relevantPosts.length;
    const totalUpvoteRatio = relevantPosts.reduce(
      (sum, p) => sum + p.upvote_ratio,
      0
    );
    const averageSentiment = totalUpvoteRatio / mentionCount;
    const totalEngagement = relevantPosts.reduce(
      (sum, p) => sum + (p.score ?? 0) + (p.num_comments ?? 0) * 2,
      0
    );

    // Calculate momentum (compare to previous period)
    const midpointTime = (Date.now() - (timeRange / 2) * 60 * 60 * 1000) / 1000;
    const recentPosts = relevantPosts.filter(
      (p) => p.created_utc >= midpointTime
    );
    const olderPosts = relevantPosts.filter((p) => p.created_utc < midpointTime);

    const recentEngagement =
      recentPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) /
        Math.max(recentPosts.length, 1);
    const olderEngagement =
      olderPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) /
        Math.max(olderPosts.length, 1);

    const momentum =
      olderEngagement > 0
        ? ((recentEngagement - olderEngagement) / olderEngagement) * 100
        : 0;

    return {
      ticker,
      mentionCount,
      averageSentiment,
      totalEngagement,
      momentum,
      lastUpdated: Date.now(),
    };
  },
});

// Public query for React components
export const getAllTickerStats = query({
  args: {
    tickers: v.array(v.string()),
    timeRange: v.optional(v.number()), // Hours to look back, default 24
  },
  returns: v.array(
    v.object({
      ticker: v.string(),
      mentionCount: v.number(),
      averageSentiment: v.number(),
      totalEngagement: v.number(),
      momentum: v.number(),
      lastUpdated: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const { tickers, timeRange = 24 } = args;
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;

    // Query all posts once
    const allPosts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_created_utc")
      .filter((q) => q.gte(q.field("created_utc"), cutoffTime / 1000)) // Reddit uses seconds
      .collect();

    // Process each ticker
    const results = tickers.map((ticker) => {
      // Filter posts for this ticker
      const relevantPosts = allPosts.filter((post) => {
        const text = `${post.title} ${post.selftext}`.toLowerCase();
        return (
          text.includes(`$${ticker.toLowerCase()}`) ||
          text.includes(ticker.toLowerCase())
        );
      });

      if (relevantPosts.length === 0) {
        return {
          ticker,
          mentionCount: 0,
          averageSentiment: 0.5,
          totalEngagement: 0,
          momentum: 0,
          lastUpdated: Date.now(),
        };
      }

      // Calculate metrics
      const mentionCount = relevantPosts.length;
      const totalUpvoteRatio = relevantPosts.reduce(
        (sum, p) => sum + p.upvote_ratio,
        0
      );
      const averageSentiment = totalUpvoteRatio / mentionCount;
      const totalEngagement = relevantPosts.reduce(
        (sum, p) => sum + (p.score ?? 0) + (p.num_comments ?? 0) * 2,
        0
      );

      // Calculate momentum
      const midpointTime = (Date.now() - (timeRange / 2) * 60 * 60 * 1000) / 1000;
      const recentPosts = relevantPosts.filter(
        (p) => p.created_utc >= midpointTime
      );
      const olderPosts = relevantPosts.filter(
        (p) => p.created_utc < midpointTime
      );

      const recentEngagement =
        recentPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) /
          Math.max(recentPosts.length, 1);
      const olderEngagement =
        olderPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) /
          Math.max(olderPosts.length, 1);

      const momentum =
        olderEngagement > 0
          ? ((recentEngagement - olderEngagement) / olderEngagement) * 100
          : 0;

      return {
        ticker,
        mentionCount,
        averageSentiment,
        totalEngagement,
        momentum,
        lastUpdated: Date.now(),
      };
    });

    return results;
  },
});

/**
 * BULK QUERY: Get all pre-calculated sentiment scores in ONE query
 * This is the efficient way to get scores for the sidebar - no per-ticker queries!
 * Scores are updated every 30 minutes by the cron job (see /convex/crons.ts)
 */
export const getAllSentimentScores = query({
  args: {},
  returns: v.array(
    v.object({
      ticker: v.string(),
      sentiment_score: v.number(),
      multiplier: v.number(),
      change_percent: v.number(),
      mention_count: v.number(),
      calculated_at: v.number(),
    })
  ),
  handler: async (ctx) => {
    console.log('[Sentiment Query] Fetching all sentiment scores...');
    
    // Get ALL sentiment scores in a SINGLE query
    // These are pre-calculated by the incremental update system
    const allScores = await ctx.db
      .query("sentiment_scores")
      .collect();

    console.log(`[Sentiment Query] Found ${allScores.length} total score records`);

    // For each ticker, get the most recent score
    const tickerMap = new Map<string, typeof allScores[0]>();
    
    for (const score of allScores) {
      const existing = tickerMap.get(score.ticker);
      if (!existing || score.calculated_at > existing.calculated_at) {
        tickerMap.set(score.ticker, score);
      }
    }

    console.log(`[Sentiment Query] Returning scores for ${tickerMap.size} unique tickers`);

    // Convert to array and format for frontend
    const result = Array.from(tickerMap.values()).map((score) => ({
      ticker: score.ticker,
      sentiment_score: score.calculated_score,
      multiplier: score.multiplier,
      change_percent: score.score_change_percent ?? 0,
      mention_count: score.mention_count,
      calculated_at: score.calculated_at,
    }));

    if (result.length > 0) {
      console.log('[Sentiment Query] Sample result:', result[0]);
    }

    return result;
  },
});
