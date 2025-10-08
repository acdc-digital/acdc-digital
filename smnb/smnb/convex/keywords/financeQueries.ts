// FINANCE QUERIES
// Queries for Nasdaq-100 sentiment correlation data

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get finance-trending keywords (keywords with high finance relevance)
 */
export const getFinanceTrendingKeywords = query({
  args: {
    limit: v.optional(v.number()),
    minFinanceScore: v.optional(v.number()),
    minVelocity: v.optional(v.number()),
    trendStatus: v.optional(v.union(
      v.literal("emerging"),
      v.literal("rising"),
      v.literal("peak"),
      v.literal("declining"),
      v.literal("stable"),
      v.literal("dormant")
    ))
  },
  returns: v.array(v.object({
    keyword: v.string(),
    tickers: v.array(v.string()),
    financeRelevance: v.number(),
    sentiment: v.number(),
    velocity: v.number(),
    trendStatus: v.string(),
    engagement: v.number(),
    mentions: v.number()
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    const minFinanceScore = args.minFinanceScore || 0.5;
    const minVelocity = args.minVelocity || 0;
    
    // Query keywords with finance relevance
    let query = ctx.db
      .query("keyword_trends")
      .withIndex("by_finance_relevance")
      .filter(q => q.gte(q.field("finance_relevance_score"), minFinanceScore));
    
    const keywords = await query
      .order("desc")
      .take(limit * 3); // Get more for filtering
    
    // Filter by velocity and trend status
    let filtered = keywords.filter(k => k.trend_velocity >= minVelocity);
    
    if (args.trendStatus) {
      filtered = filtered.filter(k => k.trend_status === args.trendStatus);
    }
    
    // Sort by combination of finance relevance and engagement
    filtered.sort((a, b) => {
      const scoreA = (a.finance_relevance_score || 0) * a.total_engagement_score;
      const scoreB = (b.finance_relevance_score || 0) * b.total_engagement_score;
      return scoreB - scoreA;
    });
    
    // Transform to response format
    return filtered.slice(0, limit).map(k => ({
      keyword: k.keyword,
      tickers: k.mapped_tickers || [],
      financeRelevance: k.finance_relevance_score || 0,
      sentiment: k.sentiment_scores.positive - k.sentiment_scores.negative,
      velocity: k.trend_velocity,
      trendStatus: k.trend_status,
      engagement: k.total_engagement_score,
      mentions: k.total_occurrences
    }));
  }
});

/**
 * Get keyword relationships (co-occurrence graph)
 */
export const getKeywordRelationships = query({
  args: {
    keyword: v.string(),
    windowMinutes: v.optional(v.number()),
    limit: v.optional(v.number()),
    financeOnly: v.optional(v.boolean())
  },
  returns: v.array(v.object({
    source: v.string(),
    target: v.string(),
    strength: v.number(),
    coOccurrences: v.number(),
    financeRelevance: v.optional(v.number()),
    sharedTickers: v.optional(v.array(v.string()))
  })),
  handler: async (ctx, args) => {
    const normalized = args.keyword.toLowerCase().trim();
    const limit = args.limit || 20;
    const windowMs = (args.windowMinutes || 60) * 60 * 1000;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get edges where this keyword is source or target
    const sourceEdges = await ctx.db
      .query("keyword_graph_edges")
      .withIndex("by_source")
      .filter(q => 
        q.and(
          q.eq(q.field("source_keyword"), normalized),
          q.gte(q.field("window_start"), windowStart)
        )
      )
      .take(limit * 2);
    
    const targetEdges = await ctx.db
      .query("keyword_graph_edges")
      .withIndex("by_target")
      .filter(q => 
        q.and(
          q.eq(q.field("target_keyword"), normalized),
          q.gte(q.field("window_start"), windowStart)
        )
      )
      .take(limit * 2);
    
    // Combine and filter
    const allEdges = [...sourceEdges, ...targetEdges];
    
    let filtered = allEdges;
    if (args.financeOnly) {
      filtered = allEdges.filter(e => 
        (e.finance_relevance_score || 0) > 0.3
      );
    }
    
    // Sort by strength
    filtered.sort((a, b) => b.strength - a.strength);
    
    // Transform and deduplicate
    const seen = new Set<string>();
    const results = [];
    
    for (const edge of filtered.slice(0, limit)) {
      const key = `${edge.source_keyword}-${edge.target_keyword}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      results.push({
        source: edge.source_keyword,
        target: edge.target_keyword,
        strength: edge.strength,
        coOccurrences: edge.co_occurrence_count,
        financeRelevance: edge.finance_relevance_score,
        sharedTickers: edge.shared_tickers
      });
    }
    
    return results;
  }
});

/**
 * Get ticker sentiment slices
 */
export const getTickerSentimentSlices = query({
  args: {
    ticker: v.string(),
    granularity: v.union(
      v.literal("5m"),
      v.literal("15m"),
      v.literal("1h"),
      v.literal("4h"),
      v.literal("1d")
    ),
    lookbackHours: v.optional(v.number())
  },
  returns: v.array(v.object({
    timestamp: v.number(),
    sentiment: v.number(),
    confidence: v.number(),
    mentions: v.number(),
    engagement: v.number(),
    velocity: v.number()
  })),
  handler: async (ctx, args) => {
    const ticker = args.ticker.toUpperCase();
    const lookbackMs = (args.lookbackHours || 24) * 60 * 60 * 1000;
    const now = Date.now();
    const since = now - lookbackMs;
    
    const slices = await ctx.db
      .query("ticker_sentiment_slices")
      .withIndex("by_ticker_granularity")
      .filter(q => 
        q.and(
          q.eq(q.field("ticker"), ticker),
          q.eq(q.field("interval_granularity"), args.granularity),
          q.gte(q.field("interval_start"), since)
        )
      )
      .order("asc")
      .collect();
    
    return slices.map(s => ({
      timestamp: s.interval_start,
      sentiment: s.weighted_sentiment,
      confidence: s.sentiment_confidence,
      mentions: s.total_mentions,
      engagement: s.engagement_sum,
      velocity: s.velocity
    }));
  }
});

/**
 * Get index sentiment (Nasdaq-100 aggregate)
 */
export const getIndexSentiment = query({
  args: {
    granularity: v.union(
      v.literal("5m"),
      v.literal("15m"),
      v.literal("1h"),
      v.literal("4h"),
      v.literal("1d")
    ),
    lookbackHours: v.optional(v.number())
  },
  returns: v.array(v.object({
    timestamp: v.number(),
    sentiment: v.number(),
    breadth: v.number(),
    dispersion: v.number(),
    regime: v.string(),
    topContributors: v.array(v.object({
      ticker: v.string(),
      contribution: v.number(),
      sentiment: v.number()
    })),
    mentions: v.number(),
    engagement: v.number()
  })),
  handler: async (ctx, args) => {
    const lookbackMs = (args.lookbackHours || 24) * 60 * 60 * 1000;
    const now = Date.now();
    const since = now - lookbackMs;
    
    const snapshots = await ctx.db
      .query("nasdaq_sentiment_index")
      .withIndex("by_granularity_time")
      .filter(q => 
        q.and(
          q.eq(q.field("interval_granularity"), args.granularity),
          q.gte(q.field("timestamp"), since)
        )
      )
      .order("asc")
      .collect();
    
    return snapshots.map(s => ({
      timestamp: s.timestamp,
      sentiment: s.index_weighted_sentiment,
      breadth: s.breadth,
      dispersion: s.dispersion,
      regime: s.regime_tag,
      topContributors: s.top_contributors,
      mentions: s.total_mentions,
      engagement: s.total_engagement
    }));
  }
});

/**
 * Get ticker mentions over time
 */
export const getTickerMentions = query({
  args: {
    ticker: v.string(),
    hoursBack: v.optional(v.number())
  },
  returns: v.object({
    ticker: v.string(),
    totalMentions: v.number(),
    uniquePosts: v.number(),
    avgSentiment: v.number(),
    topSubreddits: v.array(v.object({
      subreddit: v.string(),
      mentions: v.number()
    })),
    recentOccurrences: v.array(v.object({
      postId: v.string(),
      subreddit: v.string(),
      time: v.number(),
      sentiment: v.number()
    }))
  }),
  handler: async (ctx, args) => {
    const ticker = args.ticker.toUpperCase();
    const hoursBack = args.hoursBack || 24;
    const since = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    // Get all occurrences for this ticker in the time window
    const occurrences = await ctx.db
      .query("keyword_occurrences")
      .withIndex("by_ticker_time")
      .filter(q => 
        q.and(
          q.eq(q.field("mapped_tickers"), [ticker]), // Note: This is simplified
          q.gte(q.field("occurrence_time"), since)
        )
      )
      .collect();
    
    // Aggregate by subreddit
    const subredditCounts = new Map<string, number>();
    const posts = new Set<string>();
    let totalSentiment = 0;
    
    for (const occ of occurrences) {
      posts.add(occ.post_id);
      
      const count = subredditCounts.get(occ.subreddit) || 0;
      subredditCounts.set(occ.subreddit, count + 1);
      
      const sentiment = occ.sentiment_snapshot.positive - occ.sentiment_snapshot.negative;
      totalSentiment += sentiment;
    }
    
    // Sort subreddits by mention count
    const topSubreddits = Array.from(subredditCounts.entries())
      .map(([subreddit, mentions]) => ({ subreddit, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
    
    // Get recent occurrences
    const recentOccurrences = occurrences
      .slice(-10)
      .reverse()
      .map(occ => ({
        postId: occ.post_id,
        subreddit: occ.subreddit,
        time: occ.occurrence_time,
        sentiment: occ.sentiment_snapshot.positive - occ.sentiment_snapshot.negative
      }));
    
    return {
      ticker,
      totalMentions: occurrences.length,
      uniquePosts: posts.size,
      avgSentiment: occurrences.length > 0 ? totalSentiment / occurrences.length : 0,
      topSubreddits,
      recentOccurrences
    };
  }
});

/**
 * Get all active finance entities
 */
export const getFinanceEntities = query({
  args: {
    entityType: v.optional(v.union(
      v.literal("ticker"),
      v.literal("company"),
      v.literal("executive"),
      v.literal("product"),
      v.literal("sector")
    )),
    activeOnly: v.optional(v.boolean())
  },
  returns: v.array(v.object({
    entityId: v.string(),
    type: v.string(),
    symbol: v.string(),
    name: v.string(),
    sector: v.optional(v.string()),
    active: v.boolean()
  })),
  handler: async (ctx, args) => {
    let entities;
    
    if (args.entityType) {
      entities = await ctx.db
        .query("finance_entities")
        .withIndex("by_type")
        .filter(q => q.eq(q.field("entity_type"), args.entityType))
        .collect();
    } else {
      entities = await ctx.db.query("finance_entities").collect();
    }
    
    let filtered = entities;
    if (args.activeOnly) {
      filtered = entities.filter(e => e.active);
    }
    
    return filtered.map(e => ({
      entityId: e.entity_id,
      type: e.entity_type,
      symbol: e.canonical_symbol,
      name: e.name,
      sector: e.sector,
      active: e.active
    }));
  }
});
