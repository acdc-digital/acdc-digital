import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a completed story to history
export const addStory = mutation({
  args: {
    story_id: v.string(),
    narrative: v.string(),
    title: v.optional(v.string()),
    tone: v.union(
      v.literal("breaking"),
      v.literal("developing"), 
      v.literal("analysis"),
      v.literal("opinion"),
      v.literal("human-interest")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    agent_type: v.literal("host"),
    duration: v.number(),
    word_count: v.number(),
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
      author: v.string(),
      subreddit: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const storyId = await ctx.db.insert("story_history", args);
    return storyId;
  },
});

// Get all stories
export const getStories = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_completed_at")
      .order("desc")
      .take(args.limit || 100);
    return stories;
  },
});

// Get recent stories within a time window
export const getRecentStories = query({
  args: {
    hours: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursAgo = args.hours || 24;
    const cutoffTime = Date.now() - (hoursAgo * 60 * 60 * 1000);
    
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_completed_at")
      .filter((q) => q.gte(q.field("completed_at"), cutoffTime))
      .order("desc")
      .take(args.limit || 100);
    
    return stories;
  },
});
