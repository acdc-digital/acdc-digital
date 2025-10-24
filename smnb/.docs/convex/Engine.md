# Engine - Real-time Incremental Stats Computation

## Overview
The **Engine** is a real-time, incremental computation system that tracks 4 core metrics as data flows through the SMNB pipeline. Instead of re-scanning tables, it processes events in an append-only log and maintains pre-aggregated buckets for instant queries.

## Core Architecture

### 1. Event Log (Append-Only)
**Table:** `enrichment_events`

All enrichments flow through this table:
- `post_enriched` - When a post gets enriched with NLP/sentiment
- `story_created` - When Host generates a narrative
- `sentiment_updated` - When sentiment scores change
- `engagement_updated` - When engagement metrics change

### 2. Stat Buckets (Pre-Aggregated)
**Table:** `stat_buckets`

Time-windowed aggregates (1m, 5m, 15m, 60m) organized by:
- **Global** - All data
- **Session** - Per broadcast session
- **Subreddit** - Per subreddit
- **Entity** - Per company/entity
- **Thread** - Per conversation

### 3. Processing Watermarks
**Table:** `processing_watermarks`

Tracks what events have been processed (idempotent processing).

### 4. Snapshots
**Table:** `stats_snapshots`

Frozen metrics when broadcast is OFF - UI reads from here instead of live buckets.

## The 4 Core Metrics

### RC - Relevance Consistency
**Formula:** `(stories_aligned / stories_total) * 100`

**What it measures:** Percentage of stories that align with enrichment pipeline themes

**Why it matters:** Shows how well Host narratives match the categorized content. High RC = stories are on-topic.

### NI - Novelty Index
**Formula:** `unique_concepts.length`

**What it measures:** Number of unique concepts identified across all stories

**Why it matters:** Tracks topic diversity and content freshness. High NI = broad coverage.

### TP - Trend Propagation
**Formula:** `(stories_cross_post / stories_total) * 100`

**What it measures:** Percentage of stories that reference multiple posts

**Why it matters:** Identifies narrative patterns and cross-pollination. High TP = connecting dots.

### CM - Conversion Momentum
**Formula:** `(story_yield_delta / previous_story_yield) * 100`

**What it measures:** Change in story yield (stories/posts ratio) over time

**Why it matters:** Tracks narrative efficiency. Positive CM = generating more stories per post.

## How It Works

### Event Flow
```
1. Post Enriched → emitPostEnriched()
2. Story Created → emitStoryCreated()
3. Events land in enrichment_events table
4. scheduleEventApplier runs every 10s
5. Reads unprocessed events (batch of 2000)
6. Groups by (window, bucket_start, dimension)
7. Computes deltas for each group
8. UPSERTs into stat_buckets (idempotent)
9. Marks events as processed
10. Updates watermark
```

### Query Flow
```
1. UI calls getMetrics(dim_kind, dim_value, window, bucket_count)
2. Engine queries stat_buckets for time range
3. Returns pre-computed metrics + timeseries
4. O(bucket_count) - NOT O(num_posts)
```

## Key Files

### `/convex/engine/`
- **emitEvent.ts** - Emit events from enrichment pipeline
- **applyEvents.ts** - Core processor (combiner/applier)
- **queries.ts** - Read metrics (public + internal)
- **mutations.ts** - Update buckets (internal only)
- **control.ts** - Initialize, trigger, snapshot
- **utils.ts** - Helper functions

### `/convex/schema.ts`
- Engine tables at bottom (marked with 🔥 ENGINE comment)

## Usage

### 1. Initialize Engine (once)
```typescript
import { api } from "@/convex/_generated/api";
await client.action(api.engine.control.initializeEngine, {});
```

### 2. Emit Events (in enrichment pipeline)
```typescript
import { api } from "@/convex/_generated/api";

// When post is enriched
await ctx.runMutation(api.engine.emitEvent.emitPostEnriched, {
  post_id: post.id,
  session_id: currentSession,
  sentiment: 0.75,
  quality: 85,
  categories: ["technology", "ai"],
  // ...
});

// When story is created
await ctx.runMutation(api.engine.emitEvent.emitStoryCreated, {
  post_id: post.id,
  story_id: story._id,
  session_id: currentSession,
  story_themes: ["semiconductors", "market-analysis"],
  story_concepts: ["chip shortage", "supply chain", "TSMC"],
  is_cross_post: true,
  // ...
});
```

### 3. Query Metrics (in UI)
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Get global metrics for last hour (15m window, 4 buckets = 60 min)
const metrics = useQuery(api.engine.queries.getMetrics, {
  dim_kind: "global",
  window: "15m",
  bucket_count: 4,
});

// Access current metrics
const { rc_percent, ni_count, tp_percent, cm_percent } = metrics.metrics;

// Access timeseries for charts
const timeseriesData = metrics.timeseries.map(t => ({
  time: new Date(t.t),
  rc: t.rc_percent,
  ni: t.ni_count,
  tp: t.tp_percent,
  cm: t.cm_percent,
}));
```

### 4. Create Snapshot (when stopping broadcast)
```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createSnapshot = useMutation(api.engine.control.createBroadcastSnapshot);

// When user clicks "Stop Broadcast"
await createSnapshot({ session_id: currentSessionId });
```

## Performance Characteristics

### Write Performance
- **Event emission:** O(1) - simple insert
- **Event processing:** O(batch_size * dimensions * windows)
- **Batch size:** 2000 events per run
- **Processing frequency:** Every 10 seconds (adaptive)

### Read Performance
- **Single metric query:** O(bucket_count) - typically 60 buckets max
- **No table scans:** Never reads posts or stories tables
- **Instant response:** <200ms p95 (target)

### Storage
- **Events:** Append-only, can be archived after processing
- **Buckets:** ~100-500 active buckets per dimension
- **Retention:** Configurable compaction (1m → 5m → 15m → 60m)

## Advantages Over Old Stats System

| Old System | Engine |
|------------|--------|
| Re-scan 200 posts | Read ~60 buckets |
| O(N posts) | O(bucket_count) |
| CPU-intensive | Pre-computed |
| Timeout at scale | Constant time |
| No real-time | 10s latency |
| Missing metrics | 4 core metrics |
| Fake CM data | Real momentum |

## Next Steps

1. **Integration:** Wire up `emitPostEnriched` and `emitStoryCreated` calls
2. **UI Components:** Build metric widgets using `getMetrics` query
3. **Testing:** Initialize Engine and emit test events
4. **Monitoring:** Watch `getEngineHealth` for lag/errors
5. **Optimization:** Tune batch size and processing frequency
6. **Expansion:** Add more metrics as needed

## Troubleshooting

### Check Engine Health
```typescript
const health = useQuery(api.engine.queries.getEngineHealth, {});
// Returns: { status, lag_ms, processed_count, events_pending }
```

### Manually Trigger Processing
```typescript
const trigger = useAction(api.engine.control.triggerProcessing);
await trigger({});
```

### View Watermark
Query `processing_watermarks` table with `processor_id: "event_applier"`

## Golden Rules

1. **Never re-scan source tables for stats**
2. **All enrichments must emit events**
3. **Buckets are idempotent - safe to reprocess**
4. **UI reads from buckets (live) or snapshots (paused)**
5. **Keep batch size tuned to avoid timeout**
