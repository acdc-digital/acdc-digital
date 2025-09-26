import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listScores = query({
  args: { 
    userId: v.id("users") 
  },
  returns: v.array(v.object({
    date: v.string(),
    score: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return logs.map(log => ({
      date: log.date,
      score: log.score,
    }));
  },
});

export const createOrUpdateLog = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    score: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.id("dailyLogs"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if log already exists
    const existingLog = await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .unique();

    if (existingLog) {
      // Update existing log
      await ctx.db.patch(existingLog._id, {
        score: args.score,
        notes: args.notes,
        updatedAt: now,
      });
      return existingLog._id;
    } else {
      // Create new log
      return await ctx.db.insert("dailyLogs", {
        userId: args.userId,
        date: args.date,
        score: args.score,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const getLogByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("dailyLogs"),
      userId: v.id("users"),
      date: v.string(),
      score: v.optional(v.number()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .unique();
  },
});