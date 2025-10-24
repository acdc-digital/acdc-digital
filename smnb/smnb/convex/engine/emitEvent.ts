/**
 * ENGINE - Event Emission
 * 
 * Emit enrichment events to the append-only log.
 * Called from enrichment pipeline, story creation, etc.
 */

import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Emit a post enrichment event
 * Called when a post is enriched with NLP/sentiment/categories
 */
export const emitPostEnriched = mutation({
  args: {
    post_id: v.string(),
    session_id: v.string(),
    subreddit: v.optional(v.string()),
    entities: v.optional(v.array(v.string())),
    thread_id: v.optional(v.string()),
    sentiment: v.optional(v.number()),
    quality: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
    engagement: v.optional(v.object({
      upvotes: v.optional(v.number()),
      comments: v.optional(v.number()),
      shares: v.optional(v.number()),
    })),
  },
  returns: v.id("enrichment_events"),
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("enrichment_events", {
      at: Date.now(),
      kind: "post_enriched",
      post_id: args.post_id,
      session_id: args.session_id,
      subreddit: args.subreddit,
      entities: args.entities,
      thread_id: args.thread_id,
      sentiment: args.sentiment,
      quality: args.quality,
      categories: args.categories,
      engagement: args.engagement,
      processed: false,
    });
    
    return eventId;
  },
});

/**
 * Emit a story creation event
 * Called when Host generates a story narrative
 */
export const emitStoryCreated = mutation({
  args: {
    post_id: v.string(),
    story_id: v.string(),
    session_id: v.string(),
    subreddit: v.optional(v.string()),
    entities: v.optional(v.array(v.string())),
    thread_id: v.optional(v.string()),
    sentiment: v.optional(v.number()),
    quality: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
    story_themes: v.optional(v.array(v.string())),
    story_concepts: v.optional(v.array(v.string())),
    is_cross_post: v.optional(v.boolean()),
  },
  returns: v.id("enrichment_events"),
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("enrichment_events", {
      at: Date.now(),
      kind: "story_created",
      post_id: args.post_id,
      story_id: args.story_id,
      session_id: args.session_id,
      subreddit: args.subreddit,
      entities: args.entities,
      thread_id: args.thread_id,
      sentiment: args.sentiment,
      quality: args.quality,
      categories: args.categories,
      story_themes: args.story_themes,
      story_concepts: args.story_concepts,
      is_cross_post: args.is_cross_post,
      processed: false,
    });
    
    return eventId;
  },
});

/**
 * Emit a sentiment update event
 * Called when sentiment scores are recalculated
 */
export const emitSentimentUpdated = mutation({
  args: {
    post_id: v.string(),
    session_id: v.string(),
    sentiment: v.number(),
    quality: v.optional(v.number()),
  },
  returns: v.id("enrichment_events"),
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("enrichment_events", {
      at: Date.now(),
      kind: "sentiment_updated",
      post_id: args.post_id,
      session_id: args.session_id,
      sentiment: args.sentiment,
      quality: args.quality,
      processed: false,
    });
    
    return eventId;
  },
});

/**
 * Emit an engagement update event
 * Called when post engagement metrics change (debounced)
 */
export const emitEngagementUpdated = mutation({
  args: {
    post_id: v.string(),
    session_id: v.string(),
    engagement: v.object({
      upvotes: v.optional(v.number()),
      comments: v.optional(v.number()),
      shares: v.optional(v.number()),
    }),
  },
  returns: v.id("enrichment_events"),
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("enrichment_events", {
      at: Date.now(),
      kind: "engagement_updated",
      post_id: args.post_id,
      session_id: args.session_id,
      engagement: args.engagement,
      processed: false,
    });
    
    return eventId;
  },
});

/**
 * Batch emit multiple events (internal, for efficiency)
 * Used by the combiner or migration scripts
 */
export const batchEmitEvents = internalMutation({
  args: {
    events: v.array(v.object({
      kind: v.union(
        v.literal("post_enriched"),
        v.literal("story_created"),
        v.literal("sentiment_updated"),
        v.literal("engagement_updated")
      ),
      post_id: v.string(),
      story_id: v.optional(v.string()),
      session_id: v.string(),
      subreddit: v.optional(v.string()),
      entities: v.optional(v.array(v.string())),
      thread_id: v.optional(v.string()),
      sentiment: v.optional(v.number()),
      quality: v.optional(v.number()),
      categories: v.optional(v.array(v.string())),
      engagement: v.optional(v.object({
        upvotes: v.optional(v.number()),
        comments: v.optional(v.number()),
        shares: v.optional(v.number()),
      })),
      story_themes: v.optional(v.array(v.string())),
      story_concepts: v.optional(v.array(v.string())),
      is_cross_post: v.optional(v.boolean()),
      at: v.optional(v.number()), // Override timestamp if provided
    })),
  },
  returns: v.array(v.id("enrichment_events")),
  handler: async (ctx, args) => {
    const eventIds = await Promise.all(
      args.events.map(event => 
        ctx.db.insert("enrichment_events", {
          at: event.at ?? Date.now(),
          kind: event.kind,
          post_id: event.post_id,
          story_id: event.story_id,
          session_id: event.session_id,
          subreddit: event.subreddit,
          entities: event.entities,
          thread_id: event.thread_id,
          sentiment: event.sentiment,
          quality: event.quality,
          categories: event.categories,
          engagement: event.engagement,
          story_themes: event.story_themes,
          story_concepts: event.story_concepts,
          is_cross_post: event.is_cross_post,
          processed: false,
        })
      )
    );
    
    return eventIds;
  },
});
