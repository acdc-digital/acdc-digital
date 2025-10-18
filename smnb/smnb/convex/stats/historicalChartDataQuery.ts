import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Query to get cached historical chart data from database
 */
export const getHistoricalData = query({
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
