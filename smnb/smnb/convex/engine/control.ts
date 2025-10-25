/**
 * ENGINE - Initialization & Control
 * 
 * Start, stop, and control the Engine processing loop.
 */

import { action, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Initialize the Engine
 * Sets up watermarks and starts the event applier
 */
export const initializeEngine = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx): Promise<{ success: boolean; message: string }> => {
    // Check if already initialized
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const watermark: any = await ctx.runQuery((internal.engine as any).queries.getWatermark, {
      processor_id: "event_applier",
    });

    if (watermark && watermark.status === "running") {
      return {
        success: false,
        message: "Engine is already running",
      };
    }

    // Initialize watermark - cast to bypass type check for initial setup
    // Start from timestamp 0 to process ALL existing events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.runMutation((internal.engine as any).mutations.updateWatermark, {
      processor_id: "event_applier",
      last_processed_at: 0, // Process from the beginning
      processed_count: 0,
      // last_event_id is optional and will be set on first event processing
    });

    // Start the scheduler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.scheduler.runAfter(0, (internal.engine as any).applyEvents.scheduleEventApplier);

    return {
      success: true,
      message: "Engine initialized and started successfully",
    };
  },
});

/**
 * Manually trigger event processing (for testing/debugging)
 */
export const triggerProcessing = action({
  args: {},
  returns: v.object({
    processed: v.number(),
    buckets_updated: v.number(),
    duration_ms: v.number(),
    last_event_at: v.optional(v.number()),
  }),
  handler: async (ctx): Promise<{ processed: number; buckets_updated: number; duration_ms: number; last_event_at?: number }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await ctx.runAction((internal.engine as any).applyEvents.applyEvents);
    return result;
  },
});

/**
 * Reset the Engine watermark to reprocess all events
 * USE WITH CAUTION: This will mark all events as unprocessed
 */
export const resetEngine = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    events_reset: v.number(),
  }),
  handler: async (ctx) => {
    // Reset watermark to timestamp 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.runMutation((internal.engine as any).mutations.updateWatermark, {
      processor_id: "event_applier",
      last_processed_at: 0,
      processed_count: 0,
    });

    // Mark all events as unprocessed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allEvents: any[] = await ctx.runQuery((internal.engine as any).queries.getAllEvents, {});
    
    if (allEvents.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.runMutation((internal.engine as any).mutations.markEventsUnprocessed, {
        event_ids: allEvents.map((e: any) => e._id),
      });
    }

    return {
      success: true,
      message: `Engine reset. ${allEvents.length} events marked for reprocessing.`,
      events_reset: allEvents.length,
    };
  },
});

/**
 * Create a snapshot when broadcast stops
 * PUBLIC - Called when user stops broadcast
 */
export const createBroadcastSnapshot = mutation({
  args: {
    session_id: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    snapshot_id: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get current metrics for this session
    // We'll query the latest bucket for each dimension
    
    // Global metrics
    const globalBuckets = await ctx.db
      .query("stat_buckets")
      .withIndex("by_session_window", q =>
        q.eq("dim_kind", "session")
         .eq("dim_value", args.session_id)
         .eq("window", "15m")
      )
      .order("desc")
      .take(1);

    const globalMetrics = globalBuckets[0] || {
      rc_percent: 0,
      ni_count: 0,
      tp_percent: 0,
      cm_percent: 0,
      story_yield: 0,
    };

    // Get top dimensions (subreddits, entities)
    const subredditBuckets = await ctx.db
      .query("stat_buckets")
      .withIndex("by_dim", q => q.eq("dim_kind", "subreddit"))
      .filter(q => q.eq(q.field("window"), "15m"))
      .order("desc")
      .take(10);

    const entityBuckets = await ctx.db
      .query("stat_buckets")
      .withIndex("by_dim", q => q.eq("dim_kind", "entity"))
      .filter(q => q.eq(q.field("window"), "15m"))
      .order("desc")
      .take(10);

    const by_dimension = [
      ...subredditBuckets.map(b => ({
        dim_kind: "subreddit",
        dim_value: b.dim_value,
        metrics: {
          rc_percent: b.rc_percent,
          ni_count: b.ni_count,
          tp_percent: b.tp_percent,
          cm_percent: b.cm_percent || 0,
          story_yield: b.story_yield,
        },
      })),
      ...entityBuckets.map(b => ({
        dim_kind: "entity",
        dim_value: b.dim_value,
        metrics: {
          rc_percent: b.rc_percent,
          ni_count: b.ni_count,
          tp_percent: b.tp_percent,
          cm_percent: b.cm_percent || 0,
          story_yield: b.story_yield,
        },
      })),
    ];

    // Create snapshot using internal mutation
    await ctx.db.insert("stats_snapshots", {
      snapshot_id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: args.session_id,
      created_at: Date.now(),
      metrics: {
        rc_percent: globalMetrics.rc_percent,
        ni_count: globalMetrics.ni_count,
        tp_percent: globalMetrics.tp_percent,
        cm_percent: globalMetrics.cm_percent || 0,
        story_yield: globalMetrics.story_yield,
      },
      by_dimension,
      is_active: true,
    });

    return {
      success: true,
      snapshot_id: `snapshot_${Date.now()}`,
    };
  },
});
