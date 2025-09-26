import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  dailyLogs: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    score: v.optional(v.number()), // 0-100 mood/wellbeing score
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_date", ["userId", "date"])
    .index("by_date", ["date"]),
});