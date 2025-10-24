# Engine Integration Guide

## ✅ What's Been Done

### 1. Core Engine Implementation
- ✅ Schema tables added to `/convex/schema.ts`
- ✅ Event emission functions in `/convex/engine/emitEvent.ts`
- ✅ Event processor in `/convex/engine/applyEvents.ts`
- ✅ Queries in `/convex/engine/queries.ts`
- ✅ Mutations in `/convex/engine/mutations.ts`
- ✅ Control functions in `/convex/engine/control.ts`
- ✅ Setup & test functions in `/convex/engine/setup.ts`
- ✅ Utility functions in `/convex/engine/utils.ts`

### 2. Event Emissions Integrated
- ✅ **Story Creation**: `/convex/host/storyHistory.ts` line 54
  - Emits `story_created` event whenever Host creates a story
  - Extracts concepts from narrative
  - Links to session

- ✅ **Post Ingestion**: `/convex/reddit/feed.ts` line 66
  - Emits `post_enriched` event when posts are stored
  - Captures engagement metrics
  - Ready for enrichment pipeline enhancement

## 🚀 Next Steps

### Step 1: Initialize the Engine (REQUIRED)

Run this **once** to start the Engine processing loop:

```typescript
// In browser console or create a setup button
import { api } from "@/convex/_generated/api";

const result = await convexClient.action(api.engine.setup.setupEngine, {});
console.log(result);
// Expected: { initialized: true, health: {...}, message: "..." }
```

### Step 2: Test It

```typescript
// Test the Engine with sample data
const test = await convexClient.action(api.engine.setup.testEngine, {});
console.log(test);
// Expected: { events_created: 2, processing_triggered: true, metrics_available: true }
```

### Step 3: Build UI Components

Create a metrics dashboard in your app:

```typescript
// app/dashboard/engine/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EngineMetrics() {
  const health = useQuery(api.engine.queries.getEngineHealth, {});
  const metrics = useQuery(api.engine.queries.getMetrics, {
    dim_kind: "global",
    window: "15m",
    bucket_count: 4, // Last hour
  });

  if (!metrics || !health) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Engine Metrics</h1>
      
      {/* Health Status */}
      <div className={`p-4 rounded mb-6 ${
        health.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'
      }`}>
        <div className="font-semibold">Status: {health.status}</div>
        <div className="text-sm">Lag: {health.lag_ms}ms</div>
        <div className="text-sm">Pending: {health.events_pending} events</div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Relevance Consistency"
          value={`${metrics.metrics.rc_percent.toFixed(1)}%`}
          description="Stories aligned with themes"
          color="blue"
        />
        <MetricCard
          title="Novelty Index"
          value={metrics.metrics.ni_count}
          description="Unique concepts"
          color="purple"
        />
        <MetricCard
          title="Trend Propagation"
          value={`${metrics.metrics.tp_percent.toFixed(1)}%`}
          description="Cross-post stories"
          color="green"
        />
        <MetricCard
          title="Conversion Momentum"
          value={`${metrics.metrics.cm_percent.toFixed(1)}%`}
          description="Story yield change"
          color={metrics.metrics.cm_percent > 0 ? 'green' : 'red'}
        />
      </div>

      {/* Timeseries Chart */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Trend Over Time</h2>
        {/* Add your chart component here using metrics.timeseries */}
      </div>
    </div>
  );
}

function MetricCard({ title, value, description, color }: any) {
  return (
    <div className={`p-4 rounded-lg border-2 border-${color}-200 bg-${color}-50`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}
```

## 🔧 Enhancement Opportunities

### 1. Better Session Tracking
Currently posts use a generic `"live_feed_session"`. Update to use actual session IDs:

```typescript
// In storeLiveFeedPosts, extract session from context or metadata
const sessionId = args.sessionId || "live_feed_session";
```

### 2. Richer Post Enrichment
When you add NLP/sentiment analysis, emit updated events:

```typescript
// After enrichment
await ctx.runMutation(api.engine.emitEvent.emitSentimentUpdated, {
  post_id: post.id,
  session_id: sessionId,
  sentiment: enrichedSentiment, // -1 to 1
  quality: enrichedQuality, // 0 to 100
});
```

### 3. Cross-Post Detection
In story creation, detect if a story references multiple posts:

```typescript
is_cross_post: sourcePostIds.length > 1,
```

### 4. Concept Extraction
Use LLM to extract better concepts from narratives:

```typescript
const concepts = await extractConceptsWithLLM(args.narrative);
```

## 📊 Monitoring

### Check Engine Health
```typescript
const health = useQuery(api.engine.queries.getEngineHealth, {});
// health.status: "healthy" | "degraded" | "error"
// health.lag_ms: How far behind processing is
// health.events_pending: Events waiting to be processed
```

### Manual Trigger (Debug)
```typescript
const result = await convexClient.action(api.engine.control.triggerProcessing, {});
console.log(`Processed ${result.processed} events in ${result.duration_ms}ms`);
```

### View Metrics by Dimension
```typescript
// Global metrics
const global = useQuery(api.engine.queries.getMetrics, {
  dim_kind: "global",
  window: "15m",
  bucket_count: 4,
});

// Per-session metrics
const sessionMetrics = useQuery(api.engine.queries.getMetrics, {
  dim_kind: "session",
  dim_value: currentSessionId,
  window: "5m",
  bucket_count: 12, // Last hour
});

// Per-subreddit metrics
const subredditMetrics = useQuery(api.engine.queries.getMetrics, {
  dim_kind: "subreddit",
  dim_value: "technology",
  window: "15m",
  bucket_count: 4,
});
```

## 🎯 Success Criteria

✅ Engine initialized and running (health.status === "healthy")
✅ Events being created (check enrichment_events table)
✅ Buckets being updated (check stat_buckets table)
✅ Lag under 10 seconds (health.lag_ms < 10000)
✅ Metrics returning data (metrics.metrics.stories_total > 0)

## 📝 Notes

- The Engine runs **automatically** every 10 seconds once initialized
- Events are processed in batches of 2000
- If a batch is full, it schedules immediately for the next batch
- All operations are idempotent - safe to retry
- Failed event emissions don't block story/post creation
- Metrics are **real-time** with ~10s latency

## 🐛 Troubleshooting

### No metrics showing
1. Check if Engine is initialized: `api.engine.queries.getEngineHealth`
2. Check if events are being created: Query `enrichment_events` table
3. Manually trigger processing: `api.engine.control.triggerProcessing`

### High lag (>30s)
1. Check events_pending count
2. May need to increase batch size or processing frequency
3. Check for errors in processing_watermarks table

### No events being emitted
1. Verify stories are being created (check story_history table)
2. Check console for Engine warning messages
3. Verify session IDs are valid strings

---

Ready to go! Initialize the Engine and start tracking real metrics! 🔥
