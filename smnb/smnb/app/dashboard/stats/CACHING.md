# Stats Page Caching Implementation

## Overview
Implemented intelligent caching for the Stats page to dramatically improve performance when switching between tabs.

## How It Works

### 1. **StatsCacheProvider** (`/lib/hooks/useStatsCache.tsx`)
- Wraps the entire Stats page
- Stores query results in both:
  - **In-memory cache** (React state) - instant access
  - **localStorage** - survives page refreshes
- **Cache duration**: 5 minutes
- Automatically clears expired cache entries

### 2. **useCachedQuery Hook**
Replaces `useQuery` from Convex with a smarter version:

```tsx
// Before
const data = useQuery(api.stats.something.getData, { args });

// After
const data = useCachedQuery(
  api.stats.something.getData,
  { args },
  "unique-cache-key"
);
```

### 3. **Benefits**
- **Instant loading** when returning to Stats tab (uses cached data)
- **Background updates** - fresh data fetched in background
- **Persistent** - cache survives page refresh
- **Smart expiration** - auto-clears after 5 minutes
- **No duplicate requests** - multiple widgets can share cached data

## Updated Widgets
All 12 widgets now use cached queries:

### Content Analytics
- ✅ SubredditStatsWidget
- ✅ StoryHistoryStatsWidget
- ✅ CombinedContentStatsWidget
- ✅ SubredditMemberStatsWidget
- ✅ ContentCorrelationWidget
- ✅ PostRankingsWidget
- ✅ MetricScoringWidget
- ✅ TopPostsBySubredditWidget

### Trading Metrics
- ✅ MarketSentimentWidget
- ✅ MomentumWidget
- ✅ VolatilityWidget
- ✅ TradingSignalsWidget

## Cache Keys
Each widget has a unique cache key:
- `"subreddit-stats-7d"`
- `"story-history-stats"`
- `"combined-content-stats"`
- `"subreddit-member-stats"`
- `"market-sentiment-metrics"`
- `"momentum-indicators"`
- `"volatility-metrics"`
- `"trading-signals-summary"`
- `"content-correlation"`
- `"post-rankings"`
- `"metric-scoring-matrix"`
- `"top-posts-by-subreddit"`

## User Experience

### Before
- Switch to Stats tab → Wait 2-3 seconds → Data loads
- Switch away → Data cleared
- Switch back → Wait 2-3 seconds again

### After
- Switch to Stats tab → **Instant** (cached data)
- Fresh data loads in background
- Switch away → Cache preserved
- Switch back → **Instant** (still cached)

## Cache Management

### Manual Clear
If needed, you can add a cache clear button:
```tsx
const { clearCache } = useStatsCacheContext();
<Button onClick={clearCache}>Clear Cache</Button>
```

### Automatic Expiration
Cache automatically expires after 5 minutes to ensure data freshness.

## Configuration
To adjust cache duration, modify `CACHE_DURATION` in `/lib/hooks/useStatsCache.tsx`:
```tsx
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

## Notes
- Cache is per-user (stored in browser's localStorage)
- Cache survives page refreshes but not browser clear data
- Fresh data always fetched in background for accuracy
- No network overhead when using cached data
