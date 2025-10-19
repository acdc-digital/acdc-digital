/**
 * Populate historical chart data for the last 24 hours
 * 
 * To run this action:
 * npx convex run stats/populateLast24Hours:populateLast24Hours
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const populateLast24Hours = action({
  args: {
    ticker: v.optional(v.string()), // Optional ticker override (default: MNQ=F)
  },
  returns: v.object({
    success: v.boolean(),
    dataPoints: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    dataPoints: number;
    message: string;
  }> => {
    const ticker = args.ticker || "MNQ=F"; // Micro E-mini Nasdaq-100 Index Futures
    
    // Calculate last 24 hours
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    console.log(`🚀 Fetching last 24 hours of data for ${ticker}...`);
    console.log(`📅 Start: ${new Date(twentyFourHoursAgo).toISOString()}`);
    console.log(`📅 End: ${new Date(now).toISOString()}`);
    
    try {
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
      }> | null = await ctx.runAction(api.stats.historicalChartData.fetchHistoricalHourlyData, {
        ticker,
        startDate: twentyFourHoursAgo,
        endDate: now,
      });
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully fetched and stored ${data.length} data points for ${ticker}`);
        console.log("\n📊 Sample data (first 3 points):");
        console.log(data.slice(0, 3).map((d: {
          datetime: string;
          close: number;
          price_change_percent: number;
        }) => ({
          time: d.datetime,
          price: d.close,
          change: `${d.price_change_percent.toFixed(2)}%`,
        })));
        
        return {
          success: true,
          dataPoints: data.length,
          message: `Successfully populated ${data.length} hourly data points for ${ticker}`,
        };
      } else {
        console.log("❌ No data returned from Yahoo Finance");
        return {
          success: false,
          dataPoints: 0,
          message: "No data available from Yahoo Finance for this time period",
        };
      }
    } catch (error) {
      console.error("❌ Error populating data:", error);
      return {
        success: false,
        dataPoints: 0,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
