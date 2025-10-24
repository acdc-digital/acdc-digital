/**
 * ENGINE - Event Applier / Combiner
 * 
 * Core incremental computation engine.
 * Reads unprocessed events and applies them to stat_buckets.
 * Runs continuously as a scheduled action.
 */

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

/**
 * Helper: Round timestamp to window start
 */
function roundToWindow(timestamp: number, window: "1m" | "5m" | "15m" | "60m"): number {
  const windowMs = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "60m": 60 * 60 * 1000,
  };
  const ms = windowMs[window];
  return Math.floor(timestamp / ms) * ms;
}

/**
 * Helper: Hash dimension key for fast lookups
 */
function hashDimension(dim_kind: string, dim_value?: string): string {
  return `${dim_kind}:${dim_value || ""}`;
}

/**
 * Helper: Normalize quality score (0-100 to 0-1)
 */
function normalizeQuality(quality?: number): number {
  if (!quality) return 0.5; // Default neutral
  return Math.max(0, Math.min(1, quality / 100));
}

/**
 * Helper: Normalize engagement (log scale)
 */
function normalizeEngagement(engagement?: { upvotes?: number; comments?: number; shares?: number }): number {
  if (!engagement) return 0;
  const total = (engagement.upvotes || 0) + (engagement.comments || 0) * 2 + (engagement.shares || 0) * 3;
  // Log scale: engagement 0-100 maps to 0-1
  return Math.min(1, Math.log10(total + 1) / 2);
}

/**
 * Type for grouped events ready to process
 */
type EventGroup = {
  window: "1m" | "5m" | "15m" | "60m";
  bucket_start: number;
  dim_kind: "global" | "subreddit" | "session" | "entity" | "thread";
  dim_value?: string;
  dim_hash: string;
  events: Doc<"enrichment_events">[];
};

/**
 * Group events by time window and dimension
 */
function groupEventsByBuckets(
  events: Doc<"enrichment_events">[]
): EventGroup[] {
  const windows: Array<"1m" | "5m" | "15m" | "60m"> = ["1m", "5m", "15m", "60m"];
  const groups = new Map<string, EventGroup>();

  for (const event of events) {
    // Create dimensions for this event
    const dimensions: Array<{ kind: "global" | "subreddit" | "session" | "entity" | "thread"; value?: string }> = [
      { kind: "global" }, // Always include global
      { kind: "session", value: event.session_id },
    ];

    if (event.subreddit) {
      dimensions.push({ kind: "subreddit", value: event.subreddit });
    }

    if (event.entities) {
      for (const entity of event.entities) {
        dimensions.push({ kind: "entity", value: entity });
      }
    }

    if (event.thread_id) {
      dimensions.push({ kind: "thread", value: event.thread_id });
    }

    // For each dimension and window, create a group
    for (const window of windows) {
      const bucket_start = roundToWindow(event.at, window);

      for (const dim of dimensions) {
        const dim_hash = hashDimension(dim.kind, dim.value);
        const groupKey = `${window}:${bucket_start}:${dim_hash}`;

        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            window,
            bucket_start,
            dim_kind: dim.kind,
            dim_value: dim.value,
            dim_hash,
            events: [],
          });
        }

        groups.get(groupKey)!.events.push(event);
      }
    }
  }

  return Array.from(groups.values());
}

/**
 * Compute deltas from a group of events
 */
function computeDeltas(events: Doc<"enrichment_events">[]) {
  let stories_total = 0;
  let stories_aligned = 0;
  const unique_concepts = new Set<string>();
  let stories_cross_post = 0;
  let posts_total = 0;

  let sum_sentiment = 0;
  let sum_weighted_sentiment = 0;
  let sum_weights = 0;
  let sum_engagement = 0;

  // Variance helpers
  let sum_x = 0;
  let sum_x2 = 0;
  let n = 0;

  for (const event of events) {
    // Count posts
    if (event.kind === "post_enriched") {
      posts_total++;
    }

    // Count stories and compute metrics
    if (event.kind === "story_created") {
      stories_total++;

      // RC: Stories aligned with themes
      if (event.story_themes && event.story_themes.length > 0) {
        stories_aligned++;
      }

      // NI: Unique concepts
      if (event.story_concepts) {
        for (const concept of event.story_concepts) {
          unique_concepts.add(concept.toLowerCase().trim());
        }
      }

      // TP: Cross-post stories
      if (event.is_cross_post) {
        stories_cross_post++;
      }
    }

    // Sentiment aggregation
    if (event.sentiment !== undefined) {
      const quality = normalizeQuality(event.quality);
      const engagement = normalizeEngagement(event.engagement);
      
      // Weight: 40% quality + 30% engagement + 30% credibility (assume 0.5 for now)
      const weight = quality * 0.4 + engagement * 0.3 + 0.5 * 0.3;

      sum_sentiment += event.sentiment;
      sum_weighted_sentiment += event.sentiment * weight;
      sum_weights += weight;
      n++;
      sum_x += event.sentiment;
      sum_x2 += event.sentiment * event.sentiment;
    }

    // Engagement aggregation
    if (event.engagement) {
      sum_engagement += (event.engagement.upvotes || 0) + (event.engagement.comments || 0);
    }
  }

  return {
    stories_total,
    stories_aligned,
    unique_concepts: Array.from(unique_concepts),
    stories_cross_post,
    posts_total,
    sum_sentiment,
    sum_weighted_sentiment,
    sum_weights,
    sum_engagement,
    variance_helper: { sum_x, sum_x2, n },
  };
}

/**
 * Main event applier - scheduled action
 * Processes batches of unprocessed events into stat_buckets
 */
export const applyEvents = action({
  args: {},
  returns: v.object({
    processed: v.number(),
    buckets_updated: v.number(),
    last_event_at: v.number(),
    duration_ms: v.number(),
  }),
  handler: async (ctx): Promise<{
    processed: number;
    buckets_updated: number;
    last_event_at: number;
    duration_ms: number;
  }> => {
    const startTime = Date.now();
    const BATCH_SIZE = 2000; // Process 2000 events per run

    // Get watermark
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const watermark: any = await ctx.runQuery((internal.engine as any).queries.getWatermark, {
      processor_id: "event_applier",
    });

    const lastProcessedAt: number = watermark?.last_processed_at || 0;

    // Fetch unprocessed events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: any = await ctx.runQuery((internal.engine as any).queries.getUnprocessedEvents, {
      after: lastProcessedAt,
      limit: BATCH_SIZE,
    });

    if (events.length === 0) {
      return {
        processed: 0,
        buckets_updated: 0,
        last_event_at: lastProcessedAt,
        duration_ms: Date.now() - startTime,
      };
    }

    // Group events by buckets
    const groups = groupEventsByBuckets(events);

    // Apply each group to its bucket
    let bucketsUpdated = 0;
    for (const group of groups) {
      const deltas = computeDeltas(group.events);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.runMutation((internal.engine as any).mutations.upsertBucket, {
        window: group.window,
        bucket_start: group.bucket_start,
        dim_kind: group.dim_kind,
        dim_value: group.dim_value,
        dim_hash: group.dim_hash,
        deltas,
        last_event_id: group.events[group.events.length - 1]._id,
      });
      
      bucketsUpdated++;
    }

    // Mark events as processed
    const lastEvent = events[events.length - 1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.runMutation((internal.engine as any).mutations.markEventsProcessed, {
      event_ids: events.map((e: Doc<"enrichment_events">) => e._id),
    });

    // Update watermark
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.runMutation((internal.engine as any).mutations.updateWatermark, {
      processor_id: "event_applier",
      last_processed_at: lastEvent.at,
      last_event_id: lastEvent._id,
      processed_count: events.length,
    });

    return {
      processed: events.length,
      buckets_updated: bucketsUpdated,
      last_event_at: lastEvent.at,
      duration_ms: Date.now() - startTime,
    };
  },
});

/**
 * Schedule the event applier to run every 10 seconds
 */
export const scheduleEventApplier = action({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    // Run applyEvents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await ctx.runAction((internal.engine as any).applyEvents.applyEvents);
    
    console.log(`[Engine] Processed ${result.processed} events, updated ${result.buckets_updated} buckets in ${result.duration_ms}ms`);

    // If we processed a full batch, schedule immediately
    // Otherwise wait 10 seconds
    if (result.processed >= 2000) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.scheduler.runAfter(0, (internal.engine as any).applyEvents.scheduleEventApplier);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.scheduler.runAfter(10000, (internal.engine as any).applyEvents.scheduleEventApplier);
    }

    return null;
  },
});
