import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all stock prices
export const getAllStocks = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("stockPrices"),
      _creationTime: v.number(),
      symbol: v.string(),
      price: v.number(),
      change: v.number(),
      changePercent: v.number(),
      lastUpdated: v.number(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("stockPrices").collect();
  },
});

// Query to get a specific stock by symbol
export const getStockBySymbol = query({
  args: { symbol: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("stockPrices"),
      _creationTime: v.number(),
      symbol: v.string(),
      price: v.number(),
      change: v.number(),
      changePercent: v.number(),
      lastUpdated: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stockPrices")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();
  },
});

// Mutation to update or create stock price
export const upsertStockPrice = mutation({
  args: {
    symbol: v.string(),
    price: v.number(),
    change: v.number(),
    changePercent: v.number(),
  },
  returns: v.id("stockPrices"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stockPrices")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        price: args.price,
        change: args.change,
        changePercent: args.changePercent,
        lastUpdated: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("stockPrices", {
        symbol: args.symbol,
        price: args.price,
        change: args.change,
        changePercent: args.changePercent,
        lastUpdated: now,
      });
    }
  },
});

// Mutation to batch update multiple stocks
export const batchUpsertStocks = mutation({
  args: {
    stocks: v.array(
      v.object({
        symbol: v.string(),
        price: v.number(),
        change: v.number(),
        changePercent: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const stock of args.stocks) {
      const existing = await ctx.db
        .query("stockPrices")
        .withIndex("by_symbol", (q) => q.eq("symbol", stock.symbol))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          lastUpdated: now,
        });
      } else {
        await ctx.db.insert("stockPrices", {
          symbol: stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          lastUpdated: now,
        });
      }
    }

    return null;
  },
});
