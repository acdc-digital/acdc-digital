## Engine Metrics Storage

Primary Storage: metric_buckets Table
All real-time Engine metrics are stored here:

```
metric_buckets: {
  // Time bucketing
  window: "1m" | "5m" | "15m" | "1h" | "1d"  // Time window size
  bucket_start: number,                       // Timestamp of bucket start
  
  // Dimension tracking (what this bucket measures)
  dim_kind: "global" | "subreddit" | "session" | "entity" | "thread"
  dim_value?: string,                         // e.g., "r/technology", session_id
  dim_hash: string,                           // Unique hash for this dimension
  
  // 🎯 YOUR METRICS:
  rc_percent: number,        // Relevance Consistency (0-100%)
  ni_count: number,          // Novelty Index (unique concepts count)
  tp_percent: number,        // Trend Propagation (0-100%)
  cm_percent?: number,       // Conversion Momentum (% change)
  
  // Supporting data:
  stories_total: number,
  stories_aligned: number,
  stories_cross_post: number,
  unique_concepts: string[], // Array of unique concept names
  posts_total: number,
  story_yield: number,
  story_yield_delta?: number,
}
```

Indexes for Fast Queries:
by_window_and_bucket: [window, bucket_start, dim_hash]

Used to query metrics for specific time windows
by_dim: [dim_kind, dim_value, bucket_start]

Used to query metrics by dimension (e.g., all subreddit metrics)
by_session_window: [dim_kind, dim_value, window, bucket_start]

Used to query session-specific metrics
Snapshot Storage: stats_snapshots Table
When broadcast is OFF, metrics are frozen here:
```
stats_snapshots: {
  snapshot_id: string,
  session_id?: string,
  created_at: number,
  
  // Global metrics snapshot
  metrics: {
    rc_percent: number,
    ni_count: number,
    tp_percent: number,
    cm_percent: number,
    story_yield: number,
  },
  
  // Per-dimension breakdowns
  by_dimension: [{
    dim_kind: string,
    dim_value?: string,
    metrics: { /* same as above */ }
  }],
  
  is_active: boolean,
}
```

How Metrics Are Calculated
The metrics are computed in mutations.ts:
```
// RC = (stories_aligned / stories_total) * 100
rc_percent = (newStoriesAligned / newStoriesTotal) * 100

// NI = unique_concepts.size
ni_count = mergedConcepts.size

// TP = (stories_cross_post / stories_total) * 100
tp_percent = (newStoriesCrossPost / newStoriesTotal) * 100

// CM = (story_yield_delta / previous_yield) * 100
cm_percent = (story_yield_delta / existing.story_yield) * 100
```

Current Storage Location Summary
Real-time metrics: metric_buckets table
Frozen snapshots: stats_snapshots table
Time windows: 1m, 5m, 15m, 1h, 1d buckets
Dimensions: global, subreddit, session, entity, thread