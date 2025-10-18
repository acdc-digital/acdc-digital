import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Store a historical chart data point in the database
 */
export const storeDataPoint = internalMutation({
  args: {
    ticker: v.string(),
    timestamp: v.number(),
    datetime: v.string(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
    priceChange: v.number(),
    priceChangePercent: v.number(),
    periodType: v.string(),
    dataSource: v.string(),
    referenceStart: v.number(),
    referenceEnd: v.number(),
    fetchedAt: v.number(),
  },
  returns: v.id("historical_chart_data"),
  handler: async (ctx, args) => {
    // Check if data point already exists
    const existing = await ctx.db
      .query("historical_chart_data")
      .withIndex("by_ticker_and_timestamp", (q) => 
        q.eq("ticker", args.ticker).eq("timestamp", args.timestamp)
      )
      .first();

    if (existing) {
      console.log(`ℹ️ Data point already exists for ${args.ticker} at ${args.datetime}`);
      return existing._id;
    }

    // Insert new data point
    return await ctx.db.insert("historical_chart_data", {
      ticker: args.ticker,
      timestamp: args.timestamp,
      datetime: args.datetime,
      open: args.open,
      high: args.high,
      low: args.low,
      close: args.close,
      volume: args.volume,
      price_change: args.priceChange,
      price_change_percent: args.priceChangePercent,
      period_type: args.periodType,
      data_source: args.dataSource,
      reference_start: args.referenceStart,
      reference_end: args.referenceEnd,
      fetched_at: args.fetchedAt,
    });
  },
});

/**
 * Get cached historical chart data points for a ticker and reference period
 */
export const getDataPoints = internalQuery({
  args: {
    ticker: v.string(),
    referenceStart: v.number(),
    referenceEnd: v.number(),
  },
  returns: v.array(v.object({
    timestamp: v.number(),
    datetime: v.string(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
    price_change: v.number(),
    price_change_percent: v.number(),
  })),
  handler: async (ctx, args) => {
    const dataPoints = await ctx.db
      .query("historical_chart_data")
      .withIndex("by_reference_period", (q) =>
        q
          .eq("ticker", args.ticker)
          .eq("reference_start", args.referenceStart)
          .eq("reference_end", args.referenceEnd)
      )
      .collect();

    // Sort by timestamp
    dataPoints.sort((a, b) => a.timestamp - b.timestamp);

    return dataPoints.map(d => ({
      timestamp: d.timestamp,
      datetime: d.datetime,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
      price_change: d.price_change,
      price_change_percent: d.price_change_percent,
    }));
  },
});
