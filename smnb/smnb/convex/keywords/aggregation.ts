// SENTIMENT AGGREGATION
// Time-bucketed sentiment aggregation for tickers and index

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { aggregateSentiment, calculateVelocity, calculateAcceleration } from "./utils";
import { getMarketCapWeight } from "./financeKnowledgeBase";

/**
 * Aggregate ticker sentiment for a time slice
 */
export const aggregateTickerSentiment = mutation({
  args: {
    ticker: v.string(),
    intervalStart: v.number(),
    granularity: v.union(
      v.literal("5m"),
      v.literal("15m"),
      v.literal("1h"),
      v.literal("4h"),
      v.literal("1d")
    )
  },
  returns: v.object({
    created: v.boolean(),
    slice: v.object({
      ticker: v.string(),
      sentiment: v.number(),
      mentions: v.number(),
      velocity: v.number()
    })
  }),
  handler: async (ctx, args) => {
    const { ticker, intervalStart, granularity } = args;
    const now = Date.now();
    
    // Calculate interval end based on granularity
    const granularityMs: Record<typeof granularity, number> = {
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "4h": 4 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000
    };
    const intervalEnd = intervalStart + granularityMs[granularity];
    
    // Check if slice already exists
    const existing = await ctx.db
      .query("ticker_sentiment_slices")
      .withIndex("by_ticker_granularity")
      .filter(q => 
        q.and(
          q.eq(q.field("ticker"), ticker),
          q.eq(q.field("interval_granularity"), granularity),
          q.eq(q.field("interval_start"), intervalStart)
        )
      )
      .first();
    
    if (existing) {
      return {
        created: false,
        slice: {
          ticker: existing.ticker,
          sentiment: existing.weighted_sentiment,
          mentions: existing.total_mentions,
          velocity: existing.velocity
        }
      };
    }
    
    // Get all occurrences for this ticker in the interval
    const occurrences = await ctx.db
      .query("keyword_occurrences")
      .withIndex("by_time")
      .filter(q => 
        q.and(
          q.gte(q.field("occurrence_time"), intervalStart),
          q.lt(q.field("occurrence_time"), intervalEnd)
        )
      )
      .collect();
    
    // Filter to only this ticker
    const tickerOccurrences = occurrences.filter(occ => 
      occ.mapped_tickers.includes(ticker)
    );
    
    if (tickerOccurrences.length === 0) {
      // No data for this slice
      return {
        created: false,
        slice: {
          ticker,
          sentiment: 0,
          mentions: 0,
          velocity: 0
        }
      };
    }
    
    // Aggregate sentiment
    const sentiments = tickerOccurrences.map(occ => ({
      ...occ.sentiment_snapshot,
      weight: occ.engagement_weight
    }));
    
    const aggregated = aggregateSentiment(sentiments);
    
    // Calculate metrics
    const totalMentions = tickerOccurrences.length;
    const uniquePosts = new Set(tickerOccurrences.map(o => o.post_id)).size;
    const uniqueSubreddits = new Set(tickerOccurrences.map(o => o.subreddit)).size;
    const engagementSum = tickerOccurrences.reduce((sum, o) => sum + o.engagement_weight, 0);
    
    // Get previous slice for velocity calculation
    const previousSliceStart = intervalStart - granularityMs[granularity];
    const previousSlice = await ctx.db
      .query("ticker_sentiment_slices")
      .withIndex("by_ticker_granularity")
      .filter(q => 
        q.and(
          q.eq(q.field("ticker"), ticker),
          q.eq(q.field("interval_granularity"), granularity),
          q.eq(q.field("interval_start"), previousSliceStart)
        )
      )
      .first();
    
    const velocity = calculateVelocity(totalMentions, previousSlice?.total_mentions || 0);
    const acceleration = calculateAcceleration(velocity, previousSlice?.velocity || 0);
    
    // Create new slice
    const newSlice = await ctx.db.insert("ticker_sentiment_slices", {
      ticker,
      interval_start: intervalStart,
      interval_granularity: granularity,
      
      weighted_sentiment: aggregated.weightedScore,
      sentiment_confidence: aggregated.avgConfidence,
      raw_counts: {
        positive: Math.round(aggregated.positive * totalMentions),
        negative: Math.round(aggregated.negative * totalMentions),
        neutral: Math.round(aggregated.neutral * totalMentions),
        mixed: Math.round(aggregated.mixed * totalMentions)
      },
      
      total_mentions: totalMentions,
      engagement_sum: engagementSum,
      unique_posts: uniquePosts,
      unique_subreddits: uniqueSubreddits,
      
      velocity,
      acceleration,
      
      computed_at: now,
      created_at: now
    });
    
    return {
      created: true,
      slice: {
        ticker,
        sentiment: aggregated.weightedScore,
        mentions: totalMentions,
        velocity
      }
    };
  }
});

/**
 * Aggregate index-level sentiment (Nasdaq-100)
 */
export const aggregateIndexSentiment = mutation({
  args: {
    timestamp: v.number(),
    granularity: v.union(
      v.literal("5m"),
      v.literal("15m"),
      v.literal("1h"),
      v.literal("4h"),
      v.literal("1d")
    ),
    tickers: v.optional(v.array(v.string())) // If not provided, use all available
  },
  returns: v.object({
    created: v.boolean(),
    snapshot: v.object({
      sentiment: v.number(),
      breadth: v.number(),
      dispersion: v.number(),
      regime: v.string(),
      activeTickers: v.number()
    })
  }),
  handler: async (ctx, args) => {
    const { timestamp, granularity } = args;
    const now = Date.now();
    
    // Check if snapshot already exists
    const existing = await ctx.db
      .query("nasdaq_sentiment_index")
      .withIndex("by_granularity_time")
      .filter(q => 
        q.and(
          q.eq(q.field("interval_granularity"), granularity),
          q.eq(q.field("timestamp"), timestamp)
        )
      )
      .first();
    
    if (existing) {
      return {
        created: false,
        snapshot: {
          sentiment: existing.index_weighted_sentiment,
          breadth: existing.breadth,
          dispersion: existing.dispersion,
          regime: existing.regime_tag,
          activeTickers: existing.active_tickers_count
        }
      };
    }
    
    // Get ticker slices for this timestamp
    const tickerSlices = await ctx.db
      .query("ticker_sentiment_slices")
      .withIndex("by_time_granularity")
      .filter(q => 
        q.and(
          q.eq(q.field("interval_start"), timestamp),
          q.eq(q.field("interval_granularity"), granularity)
        )
      )
      .collect();
    
    if (tickerSlices.length === 0) {
      return {
        created: false,
        snapshot: {
          sentiment: 0,
          breadth: 0,
          dispersion: 0,
          regime: "low-signal",
          activeTickers: 0
        }
      };
    }
    
    // Calculate market-cap weighted sentiment
    let weightedSentimentSum = 0;
    let totalWeight = 0;
    const sentiments: number[] = [];
    let positiveTickers = 0;
    
    for (const slice of tickerSlices) {
      const weight = getMarketCapWeight(slice.ticker);
      weightedSentimentSum += slice.weighted_sentiment * weight;
      totalWeight += weight;
      sentiments.push(slice.weighted_sentiment);
      
      if (slice.weighted_sentiment > 0) {
        positiveTickers++;
      }
    }
    
    const indexWeightedSentiment = totalWeight > 0 ? weightedSentimentSum / totalWeight : 0;
    
    // Calculate breadth (% of tickers with positive sentiment)
    const breadth = tickerSlices.length > 0 ? positiveTickers / tickerSlices.length : 0;
    
    // Calculate dispersion (standard deviation)
    const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
    const dispersion = Math.sqrt(variance);
    
    // Determine regime
    let regimeTag: "bullish" | "bearish" | "uncertain" | "low-signal";
    if (tickerSlices.length < 5) {
      regimeTag = "low-signal";
    } else if (indexWeightedSentiment > 0.2 && breadth > 0.6) {
      regimeTag = "bullish";
    } else if (indexWeightedSentiment < -0.2 && breadth < 0.4) {
      regimeTag = "bearish";
    } else {
      regimeTag = "uncertain";
    }
    
    // Get top contributors (top 5 by absolute contribution)
    const contributors = tickerSlices.map(slice => ({
      ticker: slice.ticker,
      contribution: Math.abs(slice.weighted_sentiment * getMarketCapWeight(slice.ticker)),
      sentiment: slice.weighted_sentiment
    }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);
    
    // Calculate aggregate metrics
    const totalMentions = tickerSlices.reduce((sum, s) => sum + s.total_mentions, 0);
    const totalEngagement = tickerSlices.reduce((sum, s) => sum + s.engagement_sum, 0);
    
    // Create snapshot
    await ctx.db.insert("nasdaq_sentiment_index", {
      timestamp,
      interval_granularity: granularity,
      
      index_weighted_sentiment: indexWeightedSentiment,
      breadth,
      dispersion,
      
      top_contributors: contributors,
      regime_tag: regimeTag,
      
      total_mentions: totalMentions,
      total_engagement: totalEngagement,
      active_tickers_count: tickerSlices.length,
      
      created_at: now
    });
    
    return {
      created: true,
      snapshot: {
        sentiment: indexWeightedSentiment,
        breadth,
        dispersion,
        regime: regimeTag,
        activeTickers: tickerSlices.length
      }
    };
  }
});

/**
 * Batch aggregate sentiment for multiple tickers and time windows
 */
export const batchAggregateSentiment = mutation({
  args: {
    tickers: v.array(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    granularity: v.union(
      v.literal("5m"),
      v.literal("15m"),
      v.literal("1h"),
      v.literal("4h"),
      v.literal("1d")
    )
  },
  returns: v.object({
    intervalsProcessed: v.number(),
    message: v.string()
  }),
  handler: async (ctx, args) => {
    const { tickers, startTime, endTime, granularity } = args;
    
    const granularityMs: Record<typeof granularity, number> = {
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "4h": 4 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000
    };
    
    // Generate all time intervals
    const intervals: number[] = [];
    for (let time = startTime; time < endTime; time += granularityMs[granularity]) {
      intervals.push(time);
    }
    
    // Note: In a production system, this would schedule individual jobs
    // for each interval/ticker combination rather than processing them all at once
    // For now, we return the intervals that need processing
    
    return {
      intervalsProcessed: intervals.length,
      message: `Identified ${intervals.length} intervals to process for ${tickers.length} tickers. ` +
               `Run aggregateTickerSentiment and aggregateIndexSentiment for each interval.`
    };
  }
});
