import { query } from "./_generated/server";
import { v } from "convex/values";

// Example query - demonstrates proper Convex function syntax
export const getItems = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
    return items;
  },
});

export const getItemById = query({
  args: { id: v.id("items") },
  returns: v.union(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
