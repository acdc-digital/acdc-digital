import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Sentiment Queries for Stock Ticker Analysis
 * Aggregates Reddit discussion data to calculate sentiment scores
 */

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
      (sum, p) => sum + p.score + p.num_comments * 2,
      0
    );

    // Calculate momentum (compare to previous period)
    const midpointTime = (Date.now() - (timeRange / 2) * 60 * 60 * 1000) / 1000;
    const recentPosts = relevantPosts.filter(
      (p) => p.created_utc >= midpointTime
    );
    const olderPosts = relevantPosts.filter((p) => p.created_utc < midpointTime);

    const recentEngagement =
      recentPosts.reduce((sum, p) => sum + p.score, 0) /
        Math.max(recentPosts.length, 1);
    const olderEngagement =
      olderPosts.reduce((sum, p) => sum + p.score, 0) /
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
      (sum, p) => sum + p.score + p.num_comments * 2,
      0
    );

    // Calculate momentum (compare to previous period)
    const midpointTime = (Date.now() - (timeRange / 2) * 60 * 60 * 1000) / 1000;
    const recentPosts = relevantPosts.filter(
      (p) => p.created_utc >= midpointTime
    );
    const olderPosts = relevantPosts.filter((p) => p.created_utc < midpointTime);

    const recentEngagement =
      recentPosts.reduce((sum, p) => sum + p.score, 0) /
        Math.max(recentPosts.length, 1);
    const olderEngagement =
      olderPosts.reduce((sum, p) => sum + p.score, 0) /
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
        (sum, p) => sum + p.score + p.num_comments * 2,
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
        recentPosts.reduce((sum, p) => sum + p.score, 0) /
          Math.max(recentPosts.length, 1);
      const olderEngagement =
        olderPosts.reduce((sum, p) => sum + p.score, 0) /
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
