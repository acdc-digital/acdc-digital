import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store Reddit posts in Convex
export const storeLiveFeedPosts = mutation({
  args: {
    posts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      author: v.optional(v.string()),
      subreddit: v.optional(v.string()),
      url: v.string(),
      permalink: v.string(),
      score: v.optional(v.number()),
      num_comments: v.optional(v.number()),
      created_utc: v.number(),
      thumbnail: v.string(),
      selftext: v.string(),
      is_video: v.boolean(),
      domain: v.string(),
      upvote_ratio: v.number(),
      over_18: v.boolean(),
      source: v.string(),
      batchId: v.string(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    for (const post of args.posts) {
      // Check if post already exists
      const existing = await ctx.db
        .query("live_feed_posts")
        .filter((q) => q.eq(q.field("id"), post.id))
        .first();
      
      if (!existing) {
        await ctx.db.insert("live_feed_posts", {
          ...post,
          addedAt: now,
        });
      }
    }
  },
});

// Get recent posts
export const getRecentPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const posts = await ctx.db
      .query("live_feed_posts")
      .order("desc")
      .take(limit);
    
    return posts;
  },
});
