"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Fetch real-time stock price from Yahoo Finance API
 * Updates cache every 24 hours
 */
export const fetchStockPrice = action({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      ticker: v.string(),
      current_price: v.number(),
      previous_close: v.number(),
      change: v.number(),
      change_percent: v.number(),
      day_high: v.optional(v.number()),
      day_low: v.optional(v.number()),
      volume: v.optional(v.number()),
      market_cap: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      // Yahoo Finance v8 API endpoint
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${args.ticker}`;
      
      console.log(`📈 Fetching stock price for ${args.ticker} from Yahoo Finance...`);
      
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
      
      if (!data.chart?.result?.[0]) {
        console.log(`ℹ️ No data found for ticker ${args.ticker}`);
        return null;
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      
      // Extract price data
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.chartPreviousClose || meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      // Additional data
      const dayHigh = quote?.high?.[quote.high.length - 1] || meta.regularMarketDayHigh;
      const dayLow = quote?.low?.[quote.low.length - 1] || meta.regularMarketDayLow;
      const volume = quote?.volume?.[quote.volume.length - 1] || meta.regularMarketVolume;
      
      const priceData = {
        ticker: args.ticker,
        current_price: currentPrice,
        previous_close: previousClose,
        change,
        change_percent: changePercent,
        day_high: dayHigh,
        day_low: dayLow,
        volume,
        market_cap: undefined, // Yahoo Finance v8 doesn't provide market cap in this endpoint
      };

      console.log(`📈 Stock price fetched for ${args.ticker}:`, {
        current_price: currentPrice,
        change,
        change_percent: changePercent.toFixed(2) + '%',
      });

      // Cache the result
      const now = Date.now();
      await ctx.runMutation(internal.stats.stockPriceCache.storePrice, {
        ticker: args.ticker,
        currentPrice,
        previousClose,
        change,
        changePercent,
        dayHigh,
        dayLow,
        volume,
        marketCap: undefined,
        fetchedAt: now,
        expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
      });

      return priceData;
    } catch (error) {
      console.error(`Error fetching stock price for ${args.ticker}:`, error);
      return null;
    }
  },
});
