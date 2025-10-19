// Convex mutations for Reddit source management
// This file is separate from subredditSources.ts because mutations cannot use Node.js

import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";

// Validator for Reddit source data
export const sourceValidator = v.object({
  name: v.string(),
  type: v.union(v.literal("subreddit"), v.literal("user")),
  reason: v.string(),
  relevance_score: v.number(),
  segment: v.string(),
  metadata: v.optional(v.object({
    subscribers: v.optional(v.number()),
    active_users: v.optional(v.number()),
    description: v.optional(v.string()),
    is_nsfw: v.optional(v.boolean()),
    is_quarantined: v.optional(v.boolean()),
    created_utc: v.optional(v.number()),
  })),
  last_validated_at: v.optional(v.number()),
  enabled: v.optional(v.boolean()),
});

// Query all Reddit sources
export const getSubredditSources = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("redditSources"),
    _creationTime: v.number(),
    name: v.string(),
    type: v.union(v.literal("subreddit"), v.literal("user")),
    reason: v.string(),
    relevance_score: v.number(),
    segment: v.string(),
    metadata: v.optional(v.object({
      subscribers: v.optional(v.number()),
      active_users: v.optional(v.number()),
      description: v.optional(v.string()),
      is_nsfw: v.optional(v.boolean()),
      is_quarantined: v.optional(v.boolean()),
      created_utc: v.optional(v.number()),
    })),
    last_validated_at: v.optional(v.number()),
    enabled: v.optional(v.boolean()),
  })),
  handler: async (ctx) => {
    const sources = await ctx.db.query("redditSources").collect();
    return sources.map(source => ({
      _id: source._id,
      _creationTime: source._creationTime,
      name: source.name,
      type: source.type,
      reason: source.reason,
      relevance_score: source.relevance_score,
      segment: source.segment,
      metadata: source.metadata,
      last_validated_at: source.last_validated_at,
      enabled: source.enabled,
    }));
  },
});

// Query enabled subreddits for use in the studio controls
export const getEnabledSubreddits = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const sources = await ctx.db
      .query("redditSources")
      .withIndex("by_type_and_enabled", (q) => 
        q.eq("type", "subreddit").eq("enabled", true)
      )
      .collect();
    
    return sources.map(source => source.name);
  },
});

// Internal mutation to update regeneration progress
export const updateRegenerationProgress = internalMutation({
  args: {
    progress: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Store progress in systemState table for real-time UI updates
    const existing = await ctx.db
      .query("systemState")
      .withIndex("by_key", (q) => q.eq("key", "regeneration_progress"))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.progress,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("systemState", {
        key: "regeneration_progress",
        value: args.progress,
        updatedAt: Date.now(),
      });
    }
  },
});

// Query to get current regeneration progress
export const getRegenerationProgress = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const progress = await ctx.db
      .query("systemState")
      .withIndex("by_key", (q) => q.eq("key", "regeneration_progress"))
      .unique();
    
    return progress?.value ?? null;
  },
});

// Query to check if regeneration is currently running
export const isRegenerationRunning = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const running = await ctx.db
      .query("systemState")
      .withIndex("by_key", (q) => q.eq("key", "regeneration_running"))
      .unique();
    
    return running?.value === "true";
  },
});

// Internal mutation to clear regeneration progress

// Internal mutation to set regeneration running state
export const setRegenerationRunning = internalMutation({
  args: {
    isRunning: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("systemState")
      .withIndex("by_key", (q) => q.eq("key", "regeneration_running"))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.isRunning.toString(),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("systemState", {
        key: "regeneration_running",
        value: args.isRunning.toString(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal mutation to clear regeneration progress
export const clearRegenerationProgress = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const progress = await ctx.db
      .query("systemState")
      .withIndex("by_key", (q) => q.eq("key", "regeneration_progress"))
      .unique();
    
    if (progress) {
      await ctx.db.delete(progress._id);
    }
    
    // Also clear running state
    const running = await ctx.db
      .query("systemState")
      .withIndex("by_key", (q) => q.eq("key", "regeneration_running"))
      .unique();
    
    if (running) {
      await ctx.db.delete(running._id);
    }
  },
});

// Internal mutation to bulk upsert Reddit sources
export const bulkUpsertSources = internalMutation({
  args: {
    sources: v.array(sourceValidator),
  },
  returns: v.object({
    inserted: v.number(),
    updated: v.number(),
  }),
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const source of args.sources) {
      // Check if source already exists
      const existing = await ctx.db
        .query("redditSources")
        .withIndex("by_name", (q) => q.eq("name", source.name))
        .unique();

      if (existing) {
        // Update existing source
        await ctx.db.patch(existing._id, {
          ...source,
          last_validated_at: Date.now(),
        });
        updated++;
      } else {
        // Insert new source
        await ctx.db.insert("redditSources", {
          ...source,
          last_validated_at: Date.now(),
          enabled: source.enabled ?? true,
        });
        inserted++;
      }
    }

    return { inserted, updated };
  },
});
