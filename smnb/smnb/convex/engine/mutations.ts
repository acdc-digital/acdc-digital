/**
 * ENGINE - Mutations
 * 
 * Internal mutations for updating stat_buckets and watermarks.
 * Called by the event applier.
 */

import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Upsert a stat bucket with deltas
 * Idempotent - can be called multiple times with same data
 */
export const upsertBucket = internalMutation({
  args: {
    window: v.union(v.literal("1m"), v.literal("5m"), v.literal("15m"), v.literal("60m")),
    bucket_start: v.number(),
    dim_kind: v.union(
      v.literal("global"),
      v.literal("subreddit"),
      v.literal("session"),
      v.literal("entity"),
      v.literal("thread")
    ),
    dim_value: v.optional(v.string()),
    dim_hash: v.string(),
    deltas: v.object({
      stories_total: v.number(),
      stories_aligned: v.number(),
      unique_concepts: v.array(v.string()),
      stories_cross_post: v.number(),
      posts_total: v.number(),
      sum_sentiment: v.number(),
      sum_weighted_sentiment: v.number(),
      sum_weights: v.number(),
      sum_engagement: v.number(),
      variance_helper: v.object({
        sum_x: v.number(),
        sum_x2: v.number(),
        n: v.number(),
      }),
    }),
    last_event_id: v.optional(v.id("enrichment_events")),
  },
  returns: v.id("stat_buckets"),
  handler: async (ctx, args) => {
    // Try to find existing bucket
    const existing = await ctx.db
      .query("stat_buckets")
      .withIndex("by_window_and_bucket", q =>
        q.eq("window", args.window)
         .eq("bucket_start", args.bucket_start)
         .eq("dim_hash", args.dim_hash)
      )
      .unique();

    if (existing) {
      // Update existing bucket with deltas
      const newStoriesTotal = existing.stories_total + args.deltas.stories_total;
      const newStoriesAligned = existing.stories_aligned + args.deltas.stories_aligned;
      const newStoriesCrossPost = existing.stories_cross_post + args.deltas.stories_cross_post;
      const newPostsTotal = existing.posts_total + args.deltas.posts_total;

      // Merge unique concepts
      const mergedConcepts = new Set([...existing.unique_concepts, ...args.deltas.unique_concepts]);

      // Calculate metrics
      const rc_percent = newStoriesTotal > 0 ? (newStoriesAligned / newStoriesTotal) * 100 : 0;
      const ni_count = mergedConcepts.size;
      const tp_percent = newStoriesTotal > 0 ? (newStoriesCrossPost / newStoriesTotal) * 100 : 0;
      const story_yield = newPostsTotal > 0 ? newStoriesTotal / newPostsTotal : 0;
      
      // Calculate CM (Conversion Momentum) - change from previous bucket
      const story_yield_delta = story_yield - existing.story_yield;
      const cm_percent = existing.story_yield > 0 ? (story_yield_delta / existing.story_yield) * 100 : 0;

      await ctx.db.patch(existing._id, {
        stories_total: newStoriesTotal,
        stories_aligned: newStoriesAligned,
        rc_percent,
        unique_concepts: Array.from(mergedConcepts),
        ni_count,
        stories_cross_post: newStoriesCrossPost,
        tp_percent,
        posts_total: newPostsTotal,
        story_yield,
        story_yield_delta,
        cm_percent,
        sum_sentiment: existing.sum_sentiment + args.deltas.sum_sentiment,
        sum_weighted_sentiment: existing.sum_weighted_sentiment + args.deltas.sum_weighted_sentiment,
        sum_weights: existing.sum_weights + args.deltas.sum_weights,
        sum_engagement: existing.sum_engagement + args.deltas.sum_engagement,
        variance_helper: {
          sum_x: existing.variance_helper.sum_x + args.deltas.variance_helper.sum_x,
          sum_x2: existing.variance_helper.sum_x2 + args.deltas.variance_helper.sum_x2,
          n: existing.variance_helper.n + args.deltas.variance_helper.n,
        },
        last_updated_at: Date.now(),
        event_count: existing.event_count + 1,
        last_event_id: args.last_event_id,
      });

      return existing._id;
    } else {
      // Create new bucket
      const rc_percent = args.deltas.stories_total > 0 
        ? (args.deltas.stories_aligned / args.deltas.stories_total) * 100 
        : 0;
      const ni_count = args.deltas.unique_concepts.length;
      const tp_percent = args.deltas.stories_total > 0
        ? (args.deltas.stories_cross_post / args.deltas.stories_total) * 100
        : 0;
      const story_yield = args.deltas.posts_total > 0
        ? args.deltas.stories_total / args.deltas.posts_total
        : 0;

      const bucketId = await ctx.db.insert("stat_buckets", {
        window: args.window,
        bucket_start: args.bucket_start,
        dim_kind: args.dim_kind,
        dim_value: args.dim_value,
        dim_hash: args.dim_hash,
        stories_total: args.deltas.stories_total,
        stories_aligned: args.deltas.stories_aligned,
        rc_percent,
        unique_concepts: args.deltas.unique_concepts,
        ni_count,
        stories_cross_post: args.deltas.stories_cross_post,
        tp_percent,
        posts_total: args.deltas.posts_total,
        story_yield,
        story_yield_delta: 0,
        cm_percent: 0,
        sum_sentiment: args.deltas.sum_sentiment,
        sum_weighted_sentiment: args.deltas.sum_weighted_sentiment,
        sum_weights: args.deltas.sum_weights,
        sum_engagement: args.deltas.sum_engagement,
        variance_helper: args.deltas.variance_helper,
        last_updated_at: Date.now(),
        event_count: 1,
        last_event_id: args.last_event_id,
      });

      return bucketId;
    }
  },
});

/**
 * Mark events as processed
 */
export const markEventsProcessed = internalMutation({
  args: {
    event_ids: v.array(v.id("enrichment_events")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await Promise.all(
      args.event_ids.map(id =>
        ctx.db.patch(id, {
          processed: true,
          applied_at: now,
        })
      )
    );

    return null;
  },
});

/**
 * Mark events as unprocessed (for resetting)
 */
export const markEventsUnprocessed = internalMutation({
  args: {
    event_ids: v.array(v.id("enrichment_events")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.event_ids.map(id =>
        ctx.db.patch(id, {
          processed: false,
          applied_at: undefined,
        })
      )
    );

    return null;
  },
});

/**
 * Update processing watermark
 */
export const updateWatermark = internalMutation({
  args: {
    processor_id: v.string(),
    last_processed_at: v.number(),
    last_event_id: v.optional(v.id("enrichment_events")),
    processed_count: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("processing_watermarks")
      .withIndex("by_processor", q => q.eq("processor_id", args.processor_id))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        last_processed_at: args.last_processed_at,
        last_event_id: args.last_event_id,
        processed_count: existing.processed_count + args.processed_count,
        last_run_at: now,
        status: "idle",
        error_message: undefined,
      });
    } else {
      await ctx.db.insert("processing_watermarks", {
        processor_id: args.processor_id,
        last_processed_at: args.last_processed_at,
        last_event_id: args.last_event_id,
        processed_count: args.processed_count,
        last_run_at: now,
        status: "idle",
      });
    }

    return null;
  },
});

/**
 * Create a snapshot of current stats (when broadcast turns OFF)
 */
export const createSnapshot = internalMutation({
  args: {
    session_id: v.optional(v.string()),
    metrics: v.object({
      rc_percent: v.number(),
      ni_count: v.number(),
      tp_percent: v.number(),
      cm_percent: v.number(),
      story_yield: v.number(),
    }),
    by_dimension: v.array(v.object({
      dim_kind: v.string(),
      dim_value: v.optional(v.string()),
      metrics: v.object({
        rc_percent: v.number(),
        ni_count: v.number(),
        tp_percent: v.number(),
        cm_percent: v.number(),
        story_yield: v.number(),
      }),
    })),
  },
  returns: v.id("stats_snapshots"),
  handler: async (ctx, args) => {
    // Deactivate previous snapshots for this session
    if (args.session_id) {
      const previous = await ctx.db
        .query("stats_snapshots")
        .withIndex("by_session", q => q.eq("session_id", args.session_id))
        .collect();

      await Promise.all(
        previous.map(snap => ctx.db.patch(snap._id, { is_active: false }))
      );
    } else {
      // Deactivate all active snapshots if global
      const previous = await ctx.db
        .query("stats_snapshots")
        .withIndex("by_active", q => q.eq("is_active", true))
        .collect();

      await Promise.all(
        previous.map(snap => ctx.db.patch(snap._id, { is_active: false }))
      );
    }

    // Create new snapshot
    const snapshotId = await ctx.db.insert("stats_snapshots", {
      snapshot_id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: args.session_id,
      created_at: Date.now(),
      metrics: args.metrics,
      by_dimension: args.by_dimension,
      is_active: true,
    });

    return snapshotId;
  },
});
