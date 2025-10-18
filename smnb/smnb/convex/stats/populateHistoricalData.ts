/**
 * Populate historical chart data for MQN ticker
 * Date range: Oct 8, 2025 9:41:59 PM AST to Oct 10, 2025 12:01:01 AM AST
 * 
 * AST (Atlantic Standard Time) = UTC-4
 * 
 * To run this script:
 * npx convex run stats/populateHistoricalData:populateMQNData
 */

import { action, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const populateMQNData = action({
  args: {
    ticker: v.optional(v.string()), // Optional ticker override (default: MNQ=F)
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ticker = args.ticker || "MNQ=F"; // Micro E-mini Nasdaq-100 Index Futures
    
    // Convert AST times to UTC timestamps
    // Oct 8, 2025 9:41:59 PM AST = Oct 9, 2025 1:41:59 AM UTC
    // NOTE: Using actual dates you specified
    const startDate = new Date("2025-10-09T01:41:59Z").getTime();
    const endDate = new Date("2025-10-10T04:01:01Z").getTime();
    
    console.log(`🚀 Starting historical data fetch for ${ticker}...`);
    console.log(`📅 Start: ${new Date(startDate).toISOString()} (Oct 8, 2025 9:41:59 PM AST)`);
    console.log(`📅 End: ${new Date(endDate).toISOString()} (Oct 10, 2025 12:01:01 AM AST)`);
    console.log(`⏱️  Duration: ~${Math.round((endDate - startDate) / (1000 * 60 * 60))} hours`);
    
    try {
      const data = await ctx.runAction(api.stats.historicalChartData.fetchHistoricalHourlyData, {
        ticker,
        startDate,
        endDate,
      });
      
      if (data) {
        console.log(`✅ Successfully fetched and stored ${data.length} data points for ${ticker}`);
        console.log("\n📊 Sample data:");
        console.log(data.slice(0, 3).map((d: {
          datetime: string;
          close: number;
          price_change_percent: number;
        }) => ({
          time: d.datetime,
          price: d.close,
          change: `${d.price_change_percent.toFixed(2)}%`,
        })));
      } else {
        console.log("❌ Failed to fetch data");
      }
    } catch (error) {
      console.error("❌ Error populating data:", error);
    }
    
    return null;
  },
});

/**
 * Get the populated MNQ=F data (Micro E-mini Nasdaq-100 Index Futures)
 */
export const getMQNData = query({
  args: {},
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
  handler: async (ctx): Promise<Array<{
    timestamp: number;
    datetime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    price_change: number;
    price_change_percent: number;
  }>> => {
    const ticker = "MNQ=F";
    const startDate = new Date("2025-10-09T01:41:59Z").getTime();
    const endDate = new Date("2025-10-10T04:01:01Z").getTime();
    
    const data: Array<{
      timestamp: number;
      datetime: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      price_change: number;
      price_change_percent: number;
    }> = await ctx.runQuery(api.stats.historicalChartDataQuery.getHistoricalData, {
      ticker,
      referenceStart: startDate,
      referenceEnd: endDate,
    });
    
    return data;
  },
});
