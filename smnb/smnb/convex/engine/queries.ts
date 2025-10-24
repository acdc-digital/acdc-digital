/**
 * ENGINE - Queries
 * 
 * Read-only queries for Engine data.
 * Used by UI and internal processing.
 */

import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the processing watermark for a processor
 * Internal query used by event applier
 */
export const getWatermark = internalQuery({
  args: {
    processor_id: v.string(),
  },
  returns: v.union(
    v.object({
      processor_id: v.string(),
      last_processed_at: v.number(),
      last_event_id: v.optional(v.id("enrichment_events")),
      processed_count: v.number(),
      last_run_at: v.number(),
      status: v.union(v.literal("idle"), v.literal("running"), v.literal("error")),
      error_message: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const watermark = await ctx.db
      .query("processing_watermarks")
      .withIndex("by_processor", q => q.eq("processor_id", args.processor_id))
      .unique();

    if (!watermark) return null;

    return {
      processor_id: watermark.processor_id,
      last_processed_at: watermark.last_processed_at,
      last_event_id: watermark.last_event_id,
      processed_count: watermark.processed_count,
      last_run_at: watermark.last_run_at,
      status: watermark.status,
      error_message: watermark.error_message,
    };
  },
});

/**
 * Get unprocessed events since a timestamp
 * Internal query used by event applier
 */
export const getUnprocessedEvents = internalQuery({
  args: {
    after: v.number(),
    limit: v.number(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("enrichment_events")
      .withIndex("by_processed", q => q.eq("processed", false).gt("at", args.after))
      .order("asc")
      .take(args.limit);

    return events;
  },
});

/**
 * Get current metrics for a dimension and time window
 * PUBLIC - Used by UI to display live stats
 */
export const getMetrics = query({
  args: {
    dim_kind: v.union(
      v.literal("global"),
      v.literal("subreddit"),
      v.literal("session"),
      v.literal("entity"),
      v.literal("thread")
    ),
    dim_value: v.optional(v.string()),
    window: v.union(v.literal("1m"), v.literal("5m"), v.literal("15m"), v.literal("60m")),
    bucket_count: v.optional(v.number()), // How many buckets to return (default 60)
  },
  returns: v.object({
    metrics: v.object({
      rc_percent: v.number(),
      ni_count: v.number(),
      tp_percent: v.number(),
      cm_percent: v.number(),
      story_yield: v.number(),
      avg_sentiment: v.number(),
    }),
    timeseries: v.array(v.object({
      t: v.number(),
      rc_percent: v.number(),
      ni_count: v.number(),
      tp_percent: v.number(),
      cm_percent: v.number(),
      story_yield: v.number(),
      avg_sentiment: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const bucketCount = args.bucket_count || 60;

    // Get current bucket
    const now = Date.now();
    const windowMs = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "60m": 60 * 60 * 1000,
    };
    const nowBucket = Math.floor(now / windowMs[args.window]) * windowMs[args.window];
    const startBucket = nowBucket - (bucketCount * windowMs[args.window]);

    // Fetch buckets using correct index
    const buckets = await ctx.db
      .query("stat_buckets")
      .withIndex("by_session_window", q =>
        q.eq("dim_kind", args.dim_kind)
         .eq("dim_value", args.dim_value || "")
         .eq("window", args.window)
      )
      .filter(q => q.gte(q.field("bucket_start"), startBucket) && q.lte(q.field("bucket_start"), nowBucket))
      .order("asc")
      .collect();

    // Compute current metrics (from most recent bucket)
    const latestBucket = buckets[buckets.length - 1];
    const currentMetrics = latestBucket
      ? {
          rc_percent: latestBucket.rc_percent,
          ni_count: latestBucket.ni_count,
          tp_percent: latestBucket.tp_percent,
          cm_percent: latestBucket.cm_percent || 0,
          story_yield: latestBucket.story_yield,
          avg_sentiment: latestBucket.sum_weights > 0
            ? latestBucket.sum_weighted_sentiment / latestBucket.sum_weights
            : 0,
        }
      : {
          rc_percent: 0,
          ni_count: 0,
          tp_percent: 0,
          cm_percent: 0,
          story_yield: 0,
          avg_sentiment: 0,
        };

    // Build timeseries
    const timeseries = buckets.map(bucket => ({
      t: bucket.bucket_start,
      rc_percent: bucket.rc_percent,
      ni_count: bucket.ni_count,
      tp_percent: bucket.tp_percent,
      cm_percent: bucket.cm_percent || 0,
      story_yield: bucket.story_yield,
      avg_sentiment: bucket.sum_weights > 0
        ? bucket.sum_weighted_sentiment / bucket.sum_weights
        : 0,
    }));

    return {
      metrics: currentMetrics,
      timeseries,
    };
  },
});

/**
 * Get snapshot metrics (when broadcast is OFF)
 * PUBLIC - Used by UI when system is paused
 */
export const getSnapshot = query({
  args: {
    session_id: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      snapshot_id: v.string(),
      created_at: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    let snapshot;

    if (args.session_id) {
      // Get latest snapshot for this session
      snapshot = await ctx.db
        .query("stats_snapshots")
        .withIndex("by_session", q => q.eq("session_id", args.session_id))
        .order("desc")
        .first();
    } else {
      // Get latest active snapshot
      snapshot = await ctx.db
        .query("stats_snapshots")
        .withIndex("by_active", q => q.eq("is_active", true))
        .order("desc")
        .first();
    }

    if (!snapshot) return null;

    return {
      snapshot_id: snapshot.snapshot_id,
      created_at: snapshot.created_at,
      metrics: snapshot.metrics,
      by_dimension: snapshot.by_dimension,
    };
  },
});

/**
 * Get engine health status
 * PUBLIC - Used by system health dashboard
 */
export const getEngineHealth = query({
  args: {},
  returns: v.object({
    status: v.union(v.literal("healthy"), v.literal("degraded"), v.literal("error")),
    lag_ms: v.number(),
    processed_count: v.number(),
    last_run_at: v.number(),
    events_pending: v.number(),
    error_message: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const watermark = await ctx.db
      .query("processing_watermarks")
      .withIndex("by_processor", q => q.eq("processor_id", "event_applier"))
      .unique();

    if (!watermark) {
      return {
        status: "error" as const,
        lag_ms: 0,
        processed_count: 0,
        last_run_at: 0,
        events_pending: 0,
        error_message: "Event applier not initialized",
      };
    }

    // Calculate lag
    const now = Date.now();
    const lag_ms = now - watermark.last_processed_at;

    // Count pending events
    const pendingEvents = await ctx.db
      .query("enrichment_events")
      .withIndex("by_processed", q => q.eq("processed", false))
      .collect();

    // Determine status
    let status: "healthy" | "degraded" | "error" = "healthy";
    if (lag_ms > 60000) {
      status = "error"; // More than 1 minute behind
    } else if (lag_ms > 10000) {
      status = "degraded"; // More than 10 seconds behind
    }

    if (watermark.status === "error") {
      status = "error";
    }

    return {
      status,
      lag_ms,
      processed_count: watermark.processed_count,
      last_run_at: watermark.last_run_at,
      events_pending: pendingEvents.length,
      error_message: watermark.error_message,
    };
  },
});
