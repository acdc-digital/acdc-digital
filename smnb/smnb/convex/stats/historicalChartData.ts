"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Fetch historical hourly stock price data from Yahoo Finance API
 * For the specific date range: Oct 8, 2025 9:41 PM AST to Oct 10, 2025 12:01 AM
 * AST (Atlantic Standard Time) is UTC-4
 */
export const fetchHistoricalHourlyData = action({
  args: {
    ticker: v.string(),
    startDate: v.number(), // Unix timestamp (Oct 8, 2025 9:41 PM AST)
    endDate: v.number(), // Unix timestamp (Oct 10, 2025 12:01 AM AST)
  },
  returns: v.union(
    v.array(v.object({
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
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      const { ticker, startDate, endDate } = args;
      
      // Convert milliseconds to seconds for Yahoo Finance API
      const period1 = Math.floor(startDate / 1000);
      const period2 = Math.floor(endDate / 1000);
      
      // Yahoo Finance API endpoint with hourly interval
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1h`;
      
      console.log(`📊 Fetching hourly historical data for ${ticker}...`);
      console.log(`📅 Period: ${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        console.error(`❌ Yahoo Finance API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      console.log(`📊 Yahoo Finance Response Status: ${response.status}`);
      console.log(`📊 Response Data:`, JSON.stringify(data, null, 2));
      
      if (!data.chart?.result?.[0]) {
        console.log(`ℹ️ No historical data found for ticker ${ticker}`);
        console.log(`ℹ️ Chart data:`, data.chart);
        if (data.chart?.error) {
          console.error(`❌ Yahoo Finance Error:`, data.chart.error);
        }
        return null;
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const indicators = result.indicators?.quote?.[0];
      
      if (!timestamps || !indicators) {
        console.log(`ℹ️ No price data available for ${ticker}`);
        return null;
      }

      // Process the data
      const chartData = [];
      let previousClose = null;
      
      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i] * 1000; // Convert to milliseconds
        const open = indicators.open[i];
        const high = indicators.high[i];
        const low = indicators.low[i];
        const close = indicators.close[i];
        const volume = indicators.volume[i];
        
        // Skip null values
        if (open === null || close === null) continue;
        
        // Calculate price change from previous period
        const priceChange = previousClose !== null ? close - previousClose : 0;
        const priceChangePercent = previousClose !== null ? (priceChange / previousClose) * 100 : 0;
        
        chartData.push({
          timestamp,
          datetime: new Date(timestamp).toISOString(),
          open,
          high,
          low,
          close,
          volume: volume || 0,
          price_change: priceChange,
          price_change_percent: priceChangePercent,
        });
        
        previousClose = close;
      }

      console.log(`✅ Fetched ${chartData.length} hourly data points for ${ticker}`);

      // Store in database
      const now = Date.now();
      for (const dataPoint of chartData) {
        await ctx.runMutation(internal.stats.historicalChartDataCache.storeDataPoint, {
          ticker,
          timestamp: dataPoint.timestamp,
          datetime: dataPoint.datetime,
          open: dataPoint.open,
          high: dataPoint.high,
          low: dataPoint.low,
          close: dataPoint.close,
          volume: dataPoint.volume,
          priceChange: dataPoint.price_change,
          priceChangePercent: dataPoint.price_change_percent,
          periodType: "1h",
          dataSource: "yahoo_finance",
          referenceStart: startDate,
          referenceEnd: endDate,
          fetchedAt: now,
        });
      }

      return chartData;
    } catch (error) {
      console.error(`Error fetching historical data for ${args.ticker}:`, error);
      return null;
    }
  },
});


