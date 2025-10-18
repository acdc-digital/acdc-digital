import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get stock price with automatic refresh if cache is stale
 * This is a query that triggers an action if needed
 */
export const getStockPriceWithRefresh = query({
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
      fetched_at: v.number(),
      needs_refresh: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get cached price
    const cached = await ctx.db
      .query("stock_prices")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .order("desc")
      .first();

    // If no cache or expired, return null to trigger client-side action
    if (!cached || cached.expires_at < now) {
      console.log(`📈 Stock price cache ${!cached ? 'not found' : 'expired'} for ${args.ticker}`);
      return null;
    }

    // Return cached data
    return {
      ticker: cached.ticker,
      current_price: cached.current_price,
      previous_close: cached.previous_close,
      change: cached.change,
      change_percent: cached.change_percent,
      day_high: cached.day_high,
      day_low: cached.day_low,
      volume: cached.volume,
      market_cap: cached.market_cap,
      fetched_at: cached.fetched_at,
      needs_refresh: cached.expires_at < (now + 60 * 60 * 1000), // Flag if expires in <1 hour
    };
  },
});
