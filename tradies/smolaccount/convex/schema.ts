import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stockPrices: defineTable({
    symbol: v.string(),
    price: v.number(),
    change: v.number(),
    changePercent: v.number(),
    lastUpdated: v.number(),
  }).index("by_symbol", ["symbol"]),
});
