# Trading Analysis Database Schema

> **NASDAQ-100 Sentiment Tracking & Trading Signal Generation**

This document describes the database schema and API for the SMNB Trading Analysis system, which tracks Reddit sentiment for NASDAQ-100 companies and generates automated trading signals based on a 30-day rolling window analysis.

---

## 📊 Overview

The Trading Analysis system consists of three core tables that work together to provide comprehensive market sentiment analysis:

1. **`trading_time_series`** - Daily time series data per ticker (30-day rolling window)
2. **`trading_signals`** - Calculated buy/sell/hold signals with confidence scores
3. **`company_mentions`** - Individual company mentions extracted from Reddit posts

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REDDIT POSTS                                  │
│                    (Technology, Finance, AI)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  TRADING ENRICHMENT AGENT                            │
│  • Detects NASDAQ-100 company mentions (87 companies)               │
│  • Analyzes bullish/bearish/neutral sentiment                       │
│  • Calculates impact scores and confidence levels                   │
│  • Identifies direct/indirect/sector mentions                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   TRADING AGGREGATOR                                 │
│  • Maintains 30-day rolling window per ticker                       │
│  • Calculates volume-weighted sentiment                             │
│  • Computes momentum scores (recent vs older sentiment)             │
│  • Generates trading signals (strong_buy → strong_sell)             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CONVEX DATABASE                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │ company_mentions    │  │ trading_time_series │                  │
│  │ (Individual posts)  │  │ (Daily aggregates)  │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│              ┌─────────────────────┐                                │
│              │  trading_signals    │                                │
│              │  (Buy/Sell/Hold)    │                                │
│              └─────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Table: `trading_time_series`

**Purpose:** Store daily aggregated metrics for each ticker over a 30-day rolling window.

**Schema:**
```typescript
{
  ticker: string;            // NASDAQ-100 ticker symbol (e.g., "AAPL", "NVDA")
  date: string;              // ISO date string (YYYY-MM-DD)
  mentions: number;          // Number of times mentioned this day
  total_engagement: number;  // Sum of upvotes + comments
  avg_virality: number;      // Average virality score (0-100)
  sentiment: number;         // Daily average sentiment (-1 to 1)
  post_ids: string[];        // Array of Reddit post IDs
  created_at: number;        // Unix timestamp
  updated_at: number;        // Unix timestamp
}
```

**Indexes:**
- `by_ticker_and_date` - Primary lookup for ticker + specific date
- `by_ticker` - All data for a ticker
- `by_date` - All tickers for a specific date
- `by_mentions` - Sort by mention volume
- `by_sentiment` - Sort by sentiment score

**Example Data:**
```json
{
  "ticker": "NVDA",
  "date": "2025-10-08",
  "mentions": 47,
  "total_engagement": 12453,
  "avg_virality": 78.4,
  "sentiment": 0.72,
  "post_ids": ["abc123", "def456", "ghi789"],
  "created_at": 1728345600000,
  "updated_at": 1728345600000
}
```

---

### Table: `trading_signals`

**Purpose:** Store calculated trading signals and 30-day aggregate metrics per ticker.

**Schema:**
```typescript
{
  ticker: string;               // NASDAQ-100 ticker symbol
  
  // 30-Day Aggregate Metrics
  total_mentions: number;       // Total mentions in 30-day window
  avg_sentiment: number;        // Simple average sentiment
  weighted_sentiment: number;   // Volume-weighted sentiment
  momentum_score: number;       // Recent vs older sentiment trend
  volatility_index: number;     // Sentiment variance/stability
  last_7day_sentiment: number;  // Short-term sentiment
  last_24hour_sentiment: number;// Very recent sentiment
  
  // Trading Signal
  signal_action: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  signal_confidence: number;    // 0-1 confidence score
  signal_reasons: string[];     // Array of reasons for signal
  price_target_trend: "bullish" | "bearish" | "neutral";
  
  // Context
  sector: string;               // Technology, Healthcare, etc.
  data_points_count: number;    // Number of daily data points used
  window_start_date: string;    // ISO date (e.g., "2025-09-08")
  window_end_date: string;      // ISO date (e.g., "2025-10-08")
  
  // Metadata
  calculated_at: number;        // When signal was last calculated
  created_at: number;
  updated_at: number;
}
```

**Indexes:**
- `by_ticker` - Primary lookup by ticker
- `by_signal` - Filter by signal action + confidence
- `by_sector` - Group by sector
- `by_confidence` - Sort by confidence
- `by_calculated` - Most recently calculated

**Example Data:**
```json
{
  "ticker": "NVDA",
  "total_mentions": 342,
  "avg_sentiment": 0.64,
  "weighted_sentiment": 0.71,
  "momentum_score": 0.38,
  "volatility_index": 0.24,
  "last_7day_sentiment": 0.82,
  "last_24hour_sentiment": 0.91,
  "signal_action": "strong_buy",
  "signal_confidence": 0.87,
  "signal_reasons": [
    "Strong positive sentiment",
    "Accelerating positive momentum",
    "High mention volume"
  ],
  "price_target_trend": "bullish",
  "sector": "Technology",
  "data_points_count": 28,
  "window_start_date": "2025-09-08",
  "window_end_date": "2025-10-08",
  "calculated_at": 1728345600000,
  "created_at": 1728259200000,
  "updated_at": 1728345600000
}
```

---

### Table: `company_mentions`

**Purpose:** Store individual company mentions detected in Reddit posts.

**Schema:**
```typescript
{
  post_id: string;              // Reddit post ID (references live_feed_posts)
  ticker: string;               // NASDAQ-100 ticker symbol
  
  // Mention Details
  confidence: number;           // 0-1 detection confidence
  mention_type: "direct" | "indirect" | "sector" | "competitor";
  sentiment: "bullish" | "bearish" | "neutral";
  context: string;              // Text snippet with mention
  impact_score: number;         // 0-100 potential market impact
  
  // Denormalized Post Data (for performance)
  post_title: string;
  post_subreddit: string;
  post_score: number;
  post_created_at: number;
  
  created_at: number;
}
```

**Indexes:**
- `by_post` - All mentions in a specific post
- `by_ticker` - All mentions for a ticker (ordered by date)
- `by_ticker_and_type` - Filter mentions by type
- `by_confidence` - High-confidence mentions
- `by_impact` - High-impact mentions
- `by_sentiment` - Bullish/bearish breakdown per ticker

**Mention Types Explained:**
- **`direct`** - Ticker symbol or company name explicitly mentioned (e.g., "$NVDA", "NVIDIA")
- **`indirect`** - Related news that affects company (e.g., "chip shortage" → semiconductor companies)
- **`sector`** - Industry-wide impact (e.g., "AI boom" → GOOGL, MSFT, NVDA, META)
- **`competitor`** - Competitor mentioned affecting this company

**Example Data:**
```json
{
  "post_id": "abc123",
  "ticker": "NVDA",
  "confidence": 0.92,
  "mention_type": "direct",
  "sentiment": "bullish",
  "context": "...NVIDIA just announced their new H200 GPUs with 2x performance...",
  "impact_score": 87,
  "post_title": "NVIDIA's H200 Tensor Core GPUs Available Now",
  "post_subreddit": "technology",
  "post_score": 8453,
  "post_created_at": 1728345000000,
  "created_at": 1728345100000
}
```

---

## 🔌 API Reference

### Mutations

#### `upsertTimeSeriesData`
Store or update daily time series data for a ticker.

```typescript
await convex.mutation(api.trading.upsertTimeSeriesData, {
  ticker: "AAPL",
  date: "2025-10-08",
  mentions: 23,
  total_engagement: 5421,
  avg_virality: 62.3,
  sentiment: 0.45,
  post_ids: ["post1", "post2", "post3"]
});
```

**Returns:** `Id<"trading_time_series">`

---

#### `upsertTradingSignal`
Store or update trading signal for a ticker.

```typescript
await convex.mutation(api.trading.upsertTradingSignal, {
  ticker: "TSLA",
  total_mentions: 156,
  avg_sentiment: -0.23,
  weighted_sentiment: -0.31,
  momentum_score: -0.42,
  volatility_index: 0.58,
  last_7day_sentiment: -0.45,
  last_24hour_sentiment: -0.52,
  signal_action: "sell",
  signal_confidence: 0.73,
  signal_reasons: ["Strong negative sentiment", "Accelerating negative momentum"],
  price_target_trend: "bearish",
  sector: "Automotive",
  data_points_count: 27,
  window_start_date: "2025-09-08",
  window_end_date: "2025-10-08"
});
```

**Returns:** `Id<"trading_signals">`

---

#### `storeCompanyMention`
Store a single company mention from a post.

```typescript
await convex.mutation(api.trading.storeCompanyMention, {
  post_id: "reddit_post_123",
  ticker: "MSFT",
  confidence: 0.89,
  mention_type: "direct",
  sentiment: "bullish",
  context: "Microsoft's Azure AI services are crushing it",
  impact_score: 74,
  post_title: "Azure AI Revenue Up 200% YoY",
  post_subreddit: "CloudComputing",
  post_score: 1234,
  post_created_at: 1728345000000
});
```

**Returns:** `Id<"company_mentions">`

---

#### `storeBatchCompanyMentions`
Efficiently store multiple company mentions at once (preferred for batch operations).

```typescript
await convex.mutation(api.trading.storeBatchCompanyMentions, {
  mentions: [
    {
      post_id: "post123",
      ticker: "GOOGL",
      confidence: 0.95,
      mention_type: "direct",
      sentiment: "bullish",
      context: "Google Gemini beating GPT-4",
      impact_score: 82,
      post_title: "Gemini AI Benchmark Results",
      post_subreddit: "MachineLearning",
      post_score: 3421,
      post_created_at: 1728345000000
    },
    // ... more mentions
  ]
});
```

**Returns:** `Array<Id<"company_mentions">>`

---

#### `pruneOldTimeSeriesData`
Delete time series data older than the cutoff date (for 30-day window maintenance).

```typescript
await convex.mutation(api.trading.pruneOldTimeSeriesData, {
  cutoff_date: "2025-09-08" // Delete anything before this date
});
```

**Returns:** `number` (count of deleted records)

---

### Queries

#### `getTickerTimeSeries`
Get time series data for a specific ticker.

```typescript
const timeSeries = useQuery(api.trading.getTickerTimeSeries, {
  ticker: "NVDA",
  limit: 30 // Optional: limit results
});

// Returns array of daily data points, ordered newest first
```

**Returns:** `Array<TimeSeriesRecord>`

---

#### `getTickerSignal`
Get the current trading signal for a ticker.

```typescript
const signal = useQuery(api.trading.getTickerSignal, {
  ticker: "AAPL"
});

// Returns signal object or null if no signal exists
console.log(signal.signal_action); // "buy"
console.log(signal.signal_confidence); // 0.76
console.log(signal.signal_reasons); // ["Moderate positive sentiment", ...]
```

**Returns:** `TradingSignal | null`

---

#### `getAllTradingSignals`
Get all trading signals with optional filtering.

```typescript
const signals = useQuery(api.trading.getAllTradingSignals, {
  min_confidence: 0.6,           // Optional: minimum confidence threshold
  signal_filter: "buy",          // Optional: filter by action type
  limit: 20                      // Optional: limit results
});

// Returns array sorted by confidence (highest first)
```

**Returns:** `Array<TradingSignal>`

---

#### `getTopBuySignals`
Get top buy/strong_buy signals sorted by confidence.

```typescript
const topBuys = useQuery(api.trading.getTopBuySignals, {
  limit: 10 // Optional, defaults to 10
});

// Returns top buy opportunities
topBuys.forEach(signal => {
  console.log(`${signal.ticker}: ${signal.signal_action} (${signal.signal_confidence})`);
  console.log(`Reasons: ${signal.signal_reasons.join(", ")}`);
});
```

**Returns:** `Array<TradingSignalSummary>`

---

#### `getTopSellSignals`
Get top sell/strong_sell signals sorted by confidence.

```typescript
const topSells = useQuery(api.trading.getTopSellSignals, {
  limit: 10
});

// Returns top sell recommendations
```

**Returns:** `Array<TradingSignalSummary>`

---

#### `getPostCompanyMentions`
Get all company mentions detected in a specific post.

```typescript
const mentions = useQuery(api.trading.getPostCompanyMentions, {
  post_id: "reddit_post_123"
});

// Returns all companies mentioned in this post
mentions.forEach(mention => {
  console.log(`${mention.ticker}: ${mention.sentiment} (confidence: ${mention.confidence})`);
});
```

**Returns:** `Array<CompanyMention>`

---

#### `getTickerMentions`
Get all mentions for a specific ticker.

```typescript
const mentions = useQuery(api.trading.getTickerMentions, {
  ticker: "TSLA",
  limit: 50 // Optional
});

// Returns recent mentions of TSLA, ordered newest first
```

**Returns:** `Array<CompanyMention>`

---

#### `getSectorAnalysis`
Get aggregated analysis by sector.

```typescript
const sectorData = useQuery(api.trading.getSectorAnalysis, {});

// Returns sector-level aggregates
sectorData.forEach(sector => {
  console.log(`${sector.sector}:`);
  console.log(`  Avg Sentiment: ${sector.avg_sentiment}`);
  console.log(`  Total Mentions: ${sector.total_mentions}`);
  console.log(`  Bullish: ${sector.bullish_count}, Bearish: ${sector.bearish_count}`);
});
```

**Returns:** `Array<SectorAnalysis>`

**Example Return:**
```typescript
[
  {
    sector: "Technology",
    ticker_count: 34,
    avg_sentiment: 0.52,
    total_mentions: 1247,
    bullish_count: 21,
    bearish_count: 5,
    neutral_count: 8
  },
  // ... more sectors
]
```

---

## 📈 Trading Signal Generation Logic

### Signal Calculation Algorithm

Trading signals are generated using a multi-factor scoring system:

```typescript
Score Calculation:
  1. Current Sentiment (40% weight)
     - weighted_sentiment > 0.5  → +2 points
     - weighted_sentiment > 0.2  → +1 point
     - weighted_sentiment < -0.5 → -2 points
     - weighted_sentiment < -0.2 → -1 point

  2. Momentum (30% weight)
     - momentum_score > 0.3  → +1.5 points
     - momentum_score > 0.1  → +0.5 points
     - momentum_score < -0.3 → -1.5 points
     - momentum_score < -0.1 → -0.5 points

  3. Volume (20% weight)
     - total_mentions > 50 → +0.2 confidence
     - total_mentions > 20 → +0.1 confidence
     - total_mentions < 5  → -0.1 confidence

  4. Volatility (10% weight - reduces confidence)
     - volatility_index > 0.5 → -0.1 confidence

Signal Mapping:
  score >= 3.0  → strong_buy
  score >= 1.5  → buy
  score <= -3.0 → strong_sell
  score <= -1.5 → sell
  otherwise     → hold
```

### Confidence Score

Confidence is calculated as:
```
confidence = sentiment_weight + momentum_weight + volume_weight - volatility_penalty
             (clamped to 0-1 range)
```

High confidence (>0.7) means:
- Strong sentiment alignment
- Clear momentum trend
- High mention volume
- Low volatility

---

## 🎯 Use Cases

### 1. Display Top Trading Opportunities

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function TradingDashboard() {
  const topBuys = useQuery(api.trading.getTopBuySignals, { limit: 5 });
  const topSells = useQuery(api.trading.getTopSellSignals, { limit: 5 });
  
  return (
    <div>
      <h2>Top Buy Signals</h2>
      {topBuys?.map(signal => (
        <div key={signal.ticker}>
          <strong>{signal.ticker}</strong>: {signal.signal_action}
          <span>Confidence: {(signal.signal_confidence * 100).toFixed(0)}%</span>
          <ul>
            {signal.signal_reasons.map(reason => <li>{reason}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### 2. Show Company Mentions on Posts

```typescript
function PostWithMentions({ postId }) {
  const mentions = useQuery(api.trading.getPostCompanyMentions, { post_id: postId });
  
  return (
    <div>
      {mentions?.map(mention => (
        <Badge 
          key={mention.ticker}
          sentiment={mention.sentiment}
          confidence={mention.confidence}
        >
          {mention.ticker}
        </Badge>
      ))}
    </div>
  );
}
```

### 3. Ticker Detail Page

```typescript
function TickerDetailPage({ ticker }) {
  const signal = useQuery(api.trading.getTickerSignal, { ticker });
  const timeSeries = useQuery(api.trading.getTickerTimeSeries, { ticker, limit: 30 });
  const mentions = useQuery(api.trading.getTickerMentions, { ticker, limit: 20 });
  
  return (
    <div>
      <h1>{ticker}</h1>
      
      <TradingSignal signal={signal} />
      <SentimentChart data={timeSeries} />
      <MentionsList mentions={mentions} />
    </div>
  );
}
```

### 4. Sector Heatmap

```typescript
function SectorHeatmap() {
  const sectors = useQuery(api.trading.getSectorAnalysis, {});
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {sectors?.map(sector => (
        <div 
          key={sector.sector}
          className={getSentimentColor(sector.avg_sentiment)}
        >
          <h3>{sector.sector}</h3>
          <p>Sentiment: {sector.avg_sentiment.toFixed(2)}</p>
          <p>Mentions: {sector.total_mentions}</p>
          <p>Bullish: {sector.bullish_count} | Bearish: {sector.bearish_count}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Data Lifecycle

### Automated Maintenance

The system automatically maintains data quality:

1. **Real-time Updates**
   - New posts trigger company detection
   - Mentions saved immediately to `company_mentions`
   - Daily aggregates updated in `trading_time_series`

2. **30-Day Rolling Window**
   - `pruneOldData()` runs after each batch
   - Deletes records older than 30 days
   - Keeps memory footprint constant

3. **Signal Recalculation**
   - Signals recalculated after each batch
   - Updates all aggregate metrics
   - Persists to `trading_signals` table

4. **Database Sync**
   - `persistToDatabase()` called after aggregation
   - Upserts time series data (updates if exists)
   - Upserts trading signals (latest calculation)

---

## 📊 Data Volumes

Expected data volumes for reference:

| Metric | Per Day | Per 30 Days |
|--------|---------|-------------|
| Reddit Posts Processed | ~1,000 | ~30,000 |
| Company Mentions | ~500 | ~15,000 |
| Time Series Records | ~87 (one per ticker) | ~2,610 |
| Trading Signals | ~87 (one per ticker) | ~87 |

**Storage Requirements:**
- `company_mentions`: ~15K records/month (~5MB)
- `trading_time_series`: ~2.6K records/month (~1MB)
- `trading_signals`: ~87 records total (~50KB)

**Total:** ~6MB per month (lightweight!)

---

## 🚀 Performance Considerations

### Indexes
All critical lookup patterns are indexed:
- Ticker lookups: O(log n)
- Date range queries: O(log n)
- Confidence filtering: O(log n)

### Batch Operations
Use `storeBatchCompanyMentions` instead of individual `storeCompanyMention` calls for better performance.

### Caching
Convex automatically caches query results. Trading signals are recalculated only when new data arrives.

### Reactivity
All queries are reactive - UI updates automatically when database changes.

---

## 🛠️ Maintenance

### Pruning Old Data

Run manually if needed:
```typescript
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 30);
const dateStr = cutoffDate.toISOString().split('T')[0];

await convex.mutation(api.trading.pruneOldTimeSeriesData, {
  cutoff_date: dateStr
});
```

### Monitoring

Key metrics to monitor:
- `getSummary()` - Total tickers tracked, data point count
- Signal confidence distribution
- Mention volume trends
- Sector sentiment shifts

---

## 📚 Related Documentation

- [NASDAQ-100 Company Data](/lib/services/livefeed/nasdaq100.ts)
- [Trading Enrichment Agent](/lib/services/livefeed/tradingEnrichmentAgent.ts)
- [Trading Aggregator](/lib/services/livefeed/tradingAggregator.ts)
- [Convex Schema](/convex/schema.ts)
- [Convex Functions Reference](/.docs/api/convex-functions.md)

---

## 🎓 Quick Start Example

```typescript
// 1. In your pipeline (automatic)
const enrichedPosts = await tradingEnrichmentAgent.processRawPosts(rawPosts);
await tradingAggregator.addPosts(enrichedPosts); // Auto-saves to DB

// 2. In your React component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  // Get top buy signals
  const buys = useQuery(api.trading.getTopBuySignals, { limit: 10 });
  
  // Get specific ticker
  const nvdaSignal = useQuery(api.trading.getTickerSignal, { ticker: "NVDA" });
  
  // Get sector overview
  const sectors = useQuery(api.trading.getSectorAnalysis, {});
  
  return <div>/* Your UI */</div>;
}
```

---

**Built with:** Convex Database + TypeScript + Reddit Sentiment Analysis

**Version:** 1.0.0  
**Last Updated:** October 8, 2025
