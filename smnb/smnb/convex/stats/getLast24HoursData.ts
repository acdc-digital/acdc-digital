import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the last 24 hours of hourly ticker data
 * Returns one data point per hour, with hour 1 being 24 hours ago
 * and hour 24 being the most recent hour
 */
export const getLast24HoursTickerData = query({
  args: {
    ticker: v.string(),
  },
  returns: v.array(v.object({
    hour: v.number(), // 1-24, where 24 is most recent
    timestamp: v.number(),
    datetime: v.string(),
    close: v.number(), // Closing price for that hour
  })),
  handler: async (ctx, args) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

    // Get all hourly data points for the last 24 hours
    const dataPoints = await ctx.db
      .query("historical_chart_data")
      .withIndex("by_ticker_and_timestamp", (q) =>
        q
          .eq("ticker", args.ticker)
          .gte("timestamp", twentyFourHoursAgo)
      )
      .filter((q) => q.eq(q.field("period_type"), "1h"))
      .collect();

    // Sort by timestamp (oldest first)
    dataPoints.sort((a, b) => a.timestamp - b.timestamp);

    // If no data, return empty array
    if (dataPoints.length === 0) {
      return [];
    }

    // Create 24 hourly buckets
    const result: Array<{
      hour: number;
      timestamp: number;
      datetime: string;
      close: number;
    }> = [];

    let lastKnownPrice = dataPoints[0].close;
    let dataIndex = 0;

    // Generate 24 hours of data, filling gaps with last known price
    for (let i = 0; i < 24; i++) {
      const hourTimestamp = twentyFourHoursAgo + (i * 60 * 60 * 1000);
      
      // Check if we have actual data for this hour (within 30 minutes)
      let actualDataPoint = null;
      while (dataIndex < dataPoints.length) {
        const point = dataPoints[dataIndex];
        const timeDiff = Math.abs(point.timestamp - hourTimestamp);
        
        // If within 30 minutes of the hour, use this data point
        if (timeDiff < 30 * 60 * 1000) {
          actualDataPoint = point;
          lastKnownPrice = point.close;
          dataIndex++;
          break;
        } else if (point.timestamp > hourTimestamp + 30 * 60 * 1000) {
          // This point is for a future hour, stop checking
          break;
        } else {
          // This point is too old, skip it
          dataIndex++;
        }
      }

      result.push({
        hour: i + 1,
        timestamp: hourTimestamp,
        datetime: new Date(hourTimestamp).toISOString(),
        close: actualDataPoint ? actualDataPoint.close : lastKnownPrice,
      });
    }

    return result;
  },
});
