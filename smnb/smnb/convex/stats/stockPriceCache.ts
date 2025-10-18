import { mutation, query, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Store a stock price in the database cache (internal use only)
 */
export const storePrice = internalMutation({
  args: {
    ticker: v.string(),
    currentPrice: v.number(),
    previousClose: v.number(),
    change: v.number(),
    changePercent: v.number(),
    dayHigh: v.optional(v.number()),
    dayLow: v.optional(v.number()),
    volume: v.optional(v.number()),
    marketCap: v.optional(v.number()),
    fetchedAt: v.number(),
    expiresAt: v.number(),
  },
  returns: v.id("stock_prices"),
  handler: async (ctx, args): Promise<Id<"stock_prices">> => {
    // Check if we already have a price for this ticker
    const existing = await ctx.db
      .query("stock_prices")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .order("desc")
      .first();

    // If exists and not expired, update it
    if (existing && existing.expires_at > Date.now()) {
      await ctx.db.patch(existing._id, {
        current_price: args.currentPrice,
        previous_close: args.previousClose,
        change: args.change,
        change_percent: args.changePercent,
        day_high: args.dayHigh,
        day_low: args.dayLow,
        volume: args.volume,
        market_cap: args.marketCap,
        fetched_at: args.fetchedAt,
        expires_at: args.expiresAt,
      });
      return existing._id;
    }

    // Otherwise create new entry
    return await ctx.db.insert("stock_prices", {
      ticker: args.ticker,
      current_price: args.currentPrice,
      previous_close: args.previousClose,
      change: args.change,
      change_percent: args.changePercent,
      day_high: args.dayHigh,
      day_low: args.dayLow,
      volume: args.volume,
      market_cap: args.marketCap,
      fetched_at: args.fetchedAt,
      expires_at: args.expiresAt,
    });
  },
});

/**
 * Get cached stock price for a ticker, or null if expired/not found
 */
export const getPrice = query({
  args: {
    ticker: v.string(),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: v.union(
    v.object({
      _id: v.id("stock_prices"),
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
      expires_at: v.number(),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const price = await ctx.db
      .query("stock_prices")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .order("desc")
      .first();

    // Return null if not found or expired (unless forceRefresh is explicitly false)
    if (!price || (price.expires_at < now && args.forceRefresh !== false)) {
      return null;
    }

    return price;
  },
});

/**
 * Clean up expired stock prices (run periodically via cron)
 */
export const cleanupExpiredPrices = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    const now = Date.now();
    
    const expired = await ctx.db
      .query("stock_prices")
      .withIndex("by_expires_at")
      .filter((q) => q.lt(q.field("expires_at"), now))
      .collect();

    for (const price of expired) {
      await ctx.db.delete(price._id);
    }

    console.log(`🗑️ Cleaned up ${expired.length} expired stock prices`);
    return expired.length;
  },
});
