import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add marketing insight
export const addInsight = mutation({
  args: {
    insight_id: v.string(),
    narrative: v.string(),
    title: v.optional(v.string()),
    insight_type: v.union(
      v.literal("pain_point"),
      v.literal("competitor_mention"),
      v.literal("feature_request"),
      v.literal("sentiment")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    )),
    topics: v.optional(v.array(v.string())),
    summary: v.optional(v.string()),
    created_at: v.number(),
    completed_at: v.number(),
    original_item: v.optional(v.object({
      title: v.string(),
      author: v.optional(v.string()),
      subreddit: v.optional(v.string()),
      url: v.optional(v.string()),
      score: v.optional(v.number()),
      num_comments: v.optional(v.number()),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("marketing_insights", args);
  },
});

// Get all insights (no session filtering)
export const getAllInsights = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const insights = await ctx.db
      .query("marketing_insights")
      .order("desc")
      .collect();
    
    return insights;
  },
});

// Get insights by type
export const getInsightsByType = query({
  args: {
    insight_type: v.union(
      v.literal("pain_point"),
      v.literal("competitor_mention"),
      v.literal("feature_request"),
      v.literal("sentiment")
    ),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const insights = await ctx.db
      .query("marketing_insights")
      .withIndex("by_insight_type", (q) => 
        q.eq("insight_type", args.insight_type)
      )
      .order("desc")
      .collect();
    
    return insights;
  },
});
