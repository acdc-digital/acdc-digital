// CONVEX TRADING FUNCTIONS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/trading.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==================== MUTATIONS ====================

/**
 * Store time series data points for a ticker on a specific date
 */
export const upsertTimeSeriesData = mutation({
  args: {
    ticker: v.string(),
    date: v.string(), // YYYY-MM-DD format
    mentions: v.number(),
    total_engagement: v.number(),
    avg_virality: v.number(),
    sentiment: v.number(),
    post_ids: v.array(v.string()),
  },
  returns: v.id("trading_time_series"),
  handler: async (ctx, args) => {
    // Use .first() instead of .unique() to avoid contention issues
    // Multiple concurrent writes can safely check and proceed
    const existing = await ctx.db
      .query("trading_time_series")
      .withIndex("by_ticker_and_date", (q) =>
        q.eq("ticker", args.ticker).eq("date", args.date)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing record - merge post_ids to avoid losing data
      const mergedPostIds = Array.from(
        new Set([...existing.post_ids, ...args.post_ids])
      );
      
      await ctx.db.patch(existing._id, {
        mentions: args.mentions,
        total_engagement: args.total_engagement,
        avg_virality: args.avg_virality,
        sentiment: args.sentiment,
        post_ids: mergedPostIds, // Merge instead of replace
        updated_at: now,
      });
      return existing._id;
    } else {
      // Insert new record
      return await ctx.db.insert("trading_time_series", {
        ticker: args.ticker,
        date: args.date,
        mentions: args.mentions,
        total_engagement: args.total_engagement,
        avg_virality: args.avg_virality,
        sentiment: args.sentiment,
        post_ids: args.post_ids,
        created_at: now,
        updated_at: now,
      });
    }
  },
});

/**
 * Store or update trading signal for a ticker
 */
export const upsertTradingSignal = mutation({
  args: {
    ticker: v.string(),
    total_mentions: v.number(),
    avg_sentiment: v.number(),
    weighted_sentiment: v.number(),
    momentum_score: v.number(),
    volatility_index: v.number(),
    last_7day_sentiment: v.number(),
    last_24hour_sentiment: v.number(),
    signal_action: v.union(
      v.literal("strong_buy"),
      v.literal("buy"),
      v.literal("hold"),
      v.literal("sell"),
      v.literal("strong_sell")
    ),
    signal_confidence: v.number(),
    signal_reasons: v.array(v.string()),
    price_target_trend: v.union(
      v.literal("bullish"),
      v.literal("bearish"),
      v.literal("neutral")
    ),
    sector: v.string(),
    data_points_count: v.number(),
    window_start_date: v.string(),
    window_end_date: v.string(),
  },
  returns: v.id("trading_signals"),
  handler: async (ctx, args) => {
    // Use .first() instead of .unique() to avoid contention issues
    const existing = await ctx.db
      .query("trading_signals")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing signal
      await ctx.db.patch(existing._id, {
        total_mentions: args.total_mentions,
        avg_sentiment: args.avg_sentiment,
        weighted_sentiment: args.weighted_sentiment,
        momentum_score: args.momentum_score,
        volatility_index: args.volatility_index,
        last_7day_sentiment: args.last_7day_sentiment,
        last_24hour_sentiment: args.last_24hour_sentiment,
        signal_action: args.signal_action,
        signal_confidence: args.signal_confidence,
        signal_reasons: args.signal_reasons,
        price_target_trend: args.price_target_trend,
        sector: args.sector,
        data_points_count: args.data_points_count,
        window_start_date: args.window_start_date,
        window_end_date: args.window_end_date,
        calculated_at: now,
        updated_at: now,
      });
      return existing._id;
    } else {
      // Insert new signal
      return await ctx.db.insert("trading_signals", {
        ticker: args.ticker,
        total_mentions: args.total_mentions,
        avg_sentiment: args.avg_sentiment,
        weighted_sentiment: args.weighted_sentiment,
        momentum_score: args.momentum_score,
        volatility_index: args.volatility_index,
        last_7day_sentiment: args.last_7day_sentiment,
        last_24hour_sentiment: args.last_24hour_sentiment,
        signal_action: args.signal_action,
        signal_confidence: args.signal_confidence,
        signal_reasons: args.signal_reasons,
        price_target_trend: args.price_target_trend,
        sector: args.sector,
        data_points_count: args.data_points_count,
        window_start_date: args.window_start_date,
        window_end_date: args.window_end_date,
        calculated_at: now,
        created_at: now,
        updated_at: now,
      });
    }
  },
});

/**
 * Store a company mention from a post
 */
export const storeCompanyMention = mutation({
  args: {
    post_id: v.string(),
    ticker: v.string(),
    confidence: v.number(),
    mention_type: v.union(
      v.literal("direct"),
      v.literal("indirect"),
      v.literal("sector"),
      v.literal("competitor")
    ),
    sentiment: v.union(
      v.literal("bullish"),
      v.literal("bearish"),
      v.literal("neutral")
    ),
    context: v.string(),
    impact_score: v.number(),
    post_title: v.string(),
    post_subreddit: v.string(),
    post_score: v.number(),
    post_created_at: v.number(),
  },
  returns: v.id("company_mentions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("company_mentions", {
      post_id: args.post_id,
      ticker: args.ticker,
      confidence: args.confidence,
      mention_type: args.mention_type,
      sentiment: args.sentiment,
      context: args.context,
      impact_score: args.impact_score,
      post_title: args.post_title,
      post_subreddit: args.post_subreddit,
      post_score: args.post_score,
      post_created_at: args.post_created_at,
      created_at: Date.now(),
    });
  },
});

/**
 * Batch store multiple company mentions (more efficient)
 */
export const storeBatchCompanyMentions = mutation({
  args: {
    mentions: v.array(
      v.object({
        post_id: v.string(),
        ticker: v.string(),
        confidence: v.number(),
        mention_type: v.union(
          v.literal("direct"),
          v.literal("indirect"),
          v.literal("sector"),
          v.literal("competitor")
        ),
        sentiment: v.union(
          v.literal("bullish"),
          v.literal("bearish"),
          v.literal("neutral")
        ),
        context: v.string(),
        impact_score: v.number(),
        post_title: v.string(),
        post_subreddit: v.string(),
        post_score: v.number(),
        post_created_at: v.number(),
      })
    ),
  },
  returns: v.array(v.id("company_mentions")),
  handler: async (ctx, args) => {
    const ids = [];
    const now = Date.now();

    for (const mention of args.mentions) {
      const id = await ctx.db.insert("company_mentions", {
        ...mention,
        created_at: now,
      });
      ids.push(id);
    }

    return ids;
  },
});

/**
 * Prune old time series data (older than 30 days)
 */
export const pruneOldTimeSeriesData = mutation({
  args: {
    cutoff_date: v.string(), // YYYY-MM-DD format
  },
  returns: v.number(), // Count of deleted records
  handler: async (ctx, args) => {
    const oldRecords = await ctx.db
      .query("trading_time_series")
      .withIndex("by_date")
      .filter((q) => q.lt(q.field("date"), args.cutoff_date))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }

    return oldRecords.length;
  },
});

// ==================== QUERIES ====================

/**
 * Get time series data for a specific ticker
 */
export const getTickerTimeSeries = query({
  args: {
    ticker: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("trading_time_series"),
      _creationTime: v.number(),
      ticker: v.string(),
      date: v.string(),
      mentions: v.number(),
      total_engagement: v.number(),
      avg_virality: v.number(),
      sentiment: v.number(),
      post_ids: v.array(v.string()),
      created_at: v.number(),
      updated_at: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("trading_time_series")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

/**
 * Get trading signal for a specific ticker
 */
export const getTickerSignal = query({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("trading_signals"),
      _creationTime: v.number(),
      ticker: v.string(),
      total_mentions: v.number(),
      avg_sentiment: v.number(),
      weighted_sentiment: v.number(),
      momentum_score: v.number(),
      volatility_index: v.number(),
      last_7day_sentiment: v.number(),
      last_24hour_sentiment: v.number(),
      signal_action: v.union(
        v.literal("strong_buy"),
        v.literal("buy"),
        v.literal("hold"),
        v.literal("sell"),
        v.literal("strong_sell")
      ),
      signal_confidence: v.number(),
      signal_reasons: v.array(v.string()),
      price_target_trend: v.union(
        v.literal("bullish"),
        v.literal("bearish"),
        v.literal("neutral")
      ),
      sector: v.string(),
      data_points_count: v.number(),
      window_start_date: v.string(),
      window_end_date: v.string(),
      calculated_at: v.number(),
      created_at: v.number(),
      updated_at: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trading_signals")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .unique();
  },
});

/**
 * Get all trading signals sorted by confidence
 */
export const getAllTradingSignals = query({
  args: {
    min_confidence: v.optional(v.number()),
    signal_filter: v.optional(
      v.union(
        v.literal("strong_buy"),
        v.literal("buy"),
        v.literal("hold"),
        v.literal("sell"),
        v.literal("strong_sell")
      )
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("trading_signals"),
      _creationTime: v.number(),
      ticker: v.string(),
      total_mentions: v.number(),
      avg_sentiment: v.number(),
      weighted_sentiment: v.number(),
      momentum_score: v.number(),
      volatility_index: v.number(),
      last_7day_sentiment: v.number(),
      last_24hour_sentiment: v.number(),
      signal_action: v.union(
        v.literal("strong_buy"),
        v.literal("buy"),
        v.literal("hold"),
        v.literal("sell"),
        v.literal("strong_sell")
      ),
      signal_confidence: v.number(),
      signal_reasons: v.array(v.string()),
      price_target_trend: v.union(
        v.literal("bullish"),
        v.literal("bearish"),
        v.literal("neutral")
      ),
      sector: v.string(),
      data_points_count: v.number(),
      window_start_date: v.string(),
      window_end_date: v.string(),
      calculated_at: v.number(),
      created_at: v.number(),
      updated_at: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const query = ctx.db.query("trading_signals").order("desc");

    const results = await query.collect();

    // Apply filters
    let filtered = results;

    if (args.min_confidence !== undefined) {
      filtered = filtered.filter((s) => s.signal_confidence >= args.min_confidence!);
    }

    if (args.signal_filter) {
      filtered = filtered.filter((s) => s.signal_action === args.signal_filter);
    }

    // Sort by confidence
    filtered.sort((a, b) => b.signal_confidence - a.signal_confidence);

    // Apply limit
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

/**
 * Get top buy signals
 */
export const getTopBuySignals = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("trading_signals"),
      _creationTime: v.number(),
      ticker: v.string(),
      signal_action: v.union(
        v.literal("strong_buy"),
        v.literal("buy"),
        v.literal("hold"),
        v.literal("sell"),
        v.literal("strong_sell")
      ),
      signal_confidence: v.number(),
      signal_reasons: v.array(v.string()),
      weighted_sentiment: v.number(),
      momentum_score: v.number(),
      total_mentions: v.number(),
      sector: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const signals = await ctx.db.query("trading_signals").collect();

    const buySignals = signals
      .filter(
        (s) => s.signal_action === "buy" || s.signal_action === "strong_buy"
      )
      .sort((a, b) => b.signal_confidence - a.signal_confidence)
      .slice(0, args.limit || 10);

    return buySignals.map((s) => ({
      _id: s._id,
      _creationTime: s._creationTime,
      ticker: s.ticker,
      signal_action: s.signal_action,
      signal_confidence: s.signal_confidence,
      signal_reasons: s.signal_reasons,
      weighted_sentiment: s.weighted_sentiment,
      momentum_score: s.momentum_score,
      total_mentions: s.total_mentions,
      sector: s.sector,
    }));
  },
});

/**
 * Get top sell signals
 */
export const getTopSellSignals = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("trading_signals"),
      _creationTime: v.number(),
      ticker: v.string(),
      signal_action: v.union(
        v.literal("strong_buy"),
        v.literal("buy"),
        v.literal("hold"),
        v.literal("sell"),
        v.literal("strong_sell")
      ),
      signal_confidence: v.number(),
      signal_reasons: v.array(v.string()),
      weighted_sentiment: v.number(),
      momentum_score: v.number(),
      total_mentions: v.number(),
      sector: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const signals = await ctx.db.query("trading_signals").collect();

    const sellSignals = signals
      .filter(
        (s) => s.signal_action === "sell" || s.signal_action === "strong_sell"
      )
      .sort((a, b) => b.signal_confidence - a.signal_confidence)
      .slice(0, args.limit || 10);

    return sellSignals.map((s) => ({
      _id: s._id,
      _creationTime: s._creationTime,
      ticker: s.ticker,
      signal_action: s.signal_action,
      signal_confidence: s.signal_confidence,
      signal_reasons: s.signal_reasons,
      weighted_sentiment: s.weighted_sentiment,
      momentum_score: s.momentum_score,
      total_mentions: s.total_mentions,
      sector: s.sector,
    }));
  },
});

/**
 * Get company mentions for a specific post
 */
export const getPostCompanyMentions = query({
  args: {
    post_id: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("company_mentions"),
      _creationTime: v.number(),
      post_id: v.string(),
      ticker: v.string(),
      confidence: v.number(),
      mention_type: v.union(
        v.literal("direct"),
        v.literal("indirect"),
        v.literal("sector"),
        v.literal("competitor")
      ),
      sentiment: v.union(
        v.literal("bullish"),
        v.literal("bearish"),
        v.literal("neutral")
      ),
      context: v.string(),
      impact_score: v.number(),
      post_title: v.string(),
      post_subreddit: v.string(),
      post_score: v.number(),
      post_created_at: v.number(),
      created_at: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("company_mentions")
      .withIndex("by_post", (q) => q.eq("post_id", args.post_id))
      .collect();
  },
});

/**
 * Get all mentions for a specific ticker
 */
export const getTickerMentions = query({
  args: {
    ticker: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("company_mentions"),
      _creationTime: v.number(),
      post_id: v.string(),
      ticker: v.string(),
      confidence: v.number(),
      mention_type: v.union(
        v.literal("direct"),
        v.literal("indirect"),
        v.literal("sector"),
        v.literal("competitor")
      ),
      sentiment: v.union(
        v.literal("bullish"),
        v.literal("bearish"),
        v.literal("neutral")
      ),
      context: v.string(),
      impact_score: v.number(),
      post_title: v.string(),
      post_subreddit: v.string(),
      post_score: v.number(),
      post_created_at: v.number(),
      created_at: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("company_mentions")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

/**
 * Get sector analysis - aggregated signals by sector
 */
export const getSectorAnalysis = query({
  args: {},
  returns: v.array(
    v.object({
      sector: v.string(),
      ticker_count: v.number(),
      avg_sentiment: v.number(),
      total_mentions: v.number(),
      bullish_count: v.number(),
      bearish_count: v.number(),
      neutral_count: v.number(),
    })
  ),
  handler: async (ctx) => {
    const signals = await ctx.db.query("trading_signals").collect();

    // Group by sector
    const sectorMap = new Map<
      string,
      {
        tickers: string[];
        sentiments: number[];
        mentions: number[];
        actions: string[];
      }
    >();

    for (const signal of signals) {
      if (!sectorMap.has(signal.sector)) {
        sectorMap.set(signal.sector, {
          tickers: [],
          sentiments: [],
          mentions: [],
          actions: [],
        });
      }

      const data = sectorMap.get(signal.sector)!;
      data.tickers.push(signal.ticker);
      data.sentiments.push(signal.weighted_sentiment);
      data.mentions.push(signal.total_mentions);
      data.actions.push(signal.signal_action);
    }

    // Calculate aggregates
    const results = [];
    for (const [sector, data] of sectorMap.entries()) {
      const avg_sentiment =
        data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length;
      const total_mentions = data.mentions.reduce((sum, m) => sum + m, 0);

      const bullish_count = data.actions.filter(
        (a) => a === "buy" || a === "strong_buy"
      ).length;
      const bearish_count = data.actions.filter(
        (a) => a === "sell" || a === "strong_sell"
      ).length;
      const neutral_count = data.actions.filter((a) => a === "hold").length;

      results.push({
        sector,
        ticker_count: data.tickers.length,
        avg_sentiment,
        total_mentions,
        bullish_count,
        bearish_count,
        neutral_count,
      });
    }

    // Sort by total mentions
    results.sort((a, b) => b.total_mentions - a.total_mentions);

    return results;
  },
});
