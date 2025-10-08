# Quick Start Guide - Nasdaq-100 Sentiment System

Get up and running with the finance-aware keyword extraction system in 5 minutes.

## Prerequisites

- Convex project set up and running
- Reddit post data in `live_feed_posts` table
- Post stats in `post_stats` table (optional but recommended)

## Step-by-Step Setup

### 1. Initialize Finance Entities (One-time)

Open your Convex dashboard or use the client:

```typescript
import { api } from "@/convex/_generated/api";

// Initialize finance entities from knowledge base
const result = await convex.mutation(
  api.keywords.financeInit.initializeFinanceEntities,
  { overwrite: false }
);

console.log(`Created ${result.entitiesCreated} finance entities`);
// Expected: Created 25 finance entities
```

Verify initialization:

```typescript
const stats = await convex.mutation(
  api.keywords.financeInit.getFinanceEntityStats,
  {}
);

console.log(stats);
// {
//   totalEntities: 25,
//   activeEntities: 25,
//   bySector: [
//     { sector: 'Technology', count: 15 },
//     { sector: 'Consumer Cyclical', count: 5 },
//     ...
//   ],
//   byType: [
//     { type: 'ticker', count: 25 }
//   ]
// }
```

### 2. Test Finance Extraction

Verify the system can detect tickers and companies:

```typescript
const matches = await convex.mutation(
  api.keywords.financeInit.testFinanceExtraction,
  { 
    text: "Just bought $NVDA at $500! Jensen Huang is a genius. Also watching AAPL and Microsoft closely." 
  }
);

console.log(matches);
// [
//   { ticker: 'NVDA', matchedText: '$NVDA', confidence: 0.95 },
//   { ticker: 'NVDA', matchedText: 'Jensen Huang', confidence: 0.85 },
//   { ticker: 'AAPL', matchedText: 'AAPL', confidence: 0.95 },
//   { ticker: 'MSFT', matchedText: 'Microsoft', confidence: 0.85 }
// ]
```

### 3. Run Enhanced Extraction

Process recent posts with finance awareness:

```typescript
const extractionResult = await convex.mutation(
  api.keywords.keywords.processKeywordsWithFinance,
  {
    timeWindowHours: 24,
    minOccurrences: 2,
    mode: 'hybrid', // 'general' | 'financeFocused' | 'hybrid'
    includeOccurrences: true
  }
);

console.log(extractionResult);
// {
//   runId: 'run_1234567890_abc123',
//   processed: 50,
//   extracted: 423,
//   financeKeywords: 87
// }
```

### 4. Query Finance-Trending Keywords

Get keywords with high finance relevance:

```typescript
const trending = await convex.query(
  api.keywords.financeQueries.getFinanceTrendingKeywords,
  {
    limit: 10,
    minFinanceScore: 0.5,
    minVelocity: 0,
    trendStatus: 'rising' // optional: 'emerging' | 'rising' | 'peak'
  }
);

console.log(trending);
// [
//   {
//     keyword: 'nvidia',
//     tickers: ['NVDA'],
//     financeRelevance: 0.95,
//     sentiment: 0.42,
//     velocity: 1.8,
//     trendStatus: 'rising',
//     engagement: 245.6,
//     mentions: 38
//   },
//   ...
// ]
```

### 5. Aggregate Ticker Sentiment

Create a sentiment slice for a specific ticker:

```typescript
// Round to 15-minute interval
const now = Date.now();
const interval = Math.floor(now / (15 * 60 * 1000)) * (15 * 60 * 1000);

const sliceResult = await convex.mutation(
  api.keywords.aggregation.aggregateTickerSentiment,
  {
    ticker: 'NVDA',
    intervalStart: interval - (15 * 60 * 1000), // Previous 15min
    granularity: '15m'
  }
);

console.log(sliceResult);
// {
//   created: true,
//   slice: {
//     ticker: 'NVDA',
//     sentiment: 0.35,
//     mentions: 12,
//     velocity: 0.8
//   }
// }
```

### 6. Query Ticker Sentiment Time-Series

Get sentiment data over time:

```typescript
const sentimentHistory = await convex.query(
  api.keywords.financeQueries.getTickerSentimentSlices,
  {
    ticker: 'NVDA',
    granularity: '15m',
    lookbackHours: 6
  }
);

console.log(sentimentHistory);
// [
//   {
//     timestamp: 1234567890000,
//     sentiment: 0.35,
//     confidence: 0.72,
//     mentions: 12,
//     engagement: 156.4,
//     velocity: 0.8
//   },
//   ...
// ]
```

### 7. Build Co-occurrence Graph

Detect keyword relationships:

```typescript
const graphResult = await convex.mutation(
  api.keywords.graph.buildCoOccurrenceGraph,
  {
    windowStart: Date.now() - (60 * 60 * 1000), // 1 hour ago
    windowLengthMs: 60 * 60 * 1000, // 1 hour window
    minCoOccurrence: 2,
    maxEdgesPerNode: 50
  }
);

console.log(graphResult);
// {
//   edgesCreated: 127,
//   keywordsProcesed: 89
// }
```

### 8. Query Keyword Relationships

Get related keywords:

```typescript
const relationships = await convex.query(
  api.keywords.financeQueries.getKeywordRelationships,
  {
    keyword: 'nvidia',
    windowMinutes: 60,
    limit: 10,
    financeOnly: true // Only finance-related connections
  }
);

console.log(relationships);
// [
//   {
//     source: 'nvidia',
//     target: 'ai chips',
//     strength: 0.68,
//     coOccurrences: 8,
//     financeRelevance: 0.85,
//     sharedTickers: ['NVDA']
//   },
//   ...
// ]
```

### 9. Aggregate Index Sentiment

Create Nasdaq-100 index snapshot:

```typescript
const indexResult = await convex.mutation(
  api.keywords.aggregation.aggregateIndexSentiment,
  {
    timestamp: interval - (15 * 60 * 1000),
    granularity: '15m',
    tickers: ['AAPL', 'NVDA', 'MSFT'] // Optional: specify tickers
  }
);

console.log(indexResult);
// {
//   created: true,
//   snapshot: {
//     sentiment: 0.28,
//     breadth: 0.72,
//     dispersion: 0.15,
//     regime: 'bullish',
//     activeTickers: 15
//   }
// }
```

### 10. Query Index Sentiment History

Get index-level sentiment over time:

```typescript
const indexHistory = await convex.query(
  api.keywords.financeQueries.getIndexSentiment,
  {
    granularity: '1h',
    lookbackHours: 24
  }
);

console.log(indexHistory);
// [
//   {
//     timestamp: 1234567890000,
//     sentiment: 0.28,
//     breadth: 0.72,
//     dispersion: 0.15,
//     regime: 'bullish',
//     topContributors: [
//       { ticker: 'NVDA', contribution: 0.12, sentiment: 0.45 },
//       { ticker: 'AAPL', contribution: 0.10, sentiment: 0.32 },
//       ...
//     ],
//     mentions: 245,
//     engagement: 3421.5
//   },
//   ...
// ]
```

## Common Patterns

### Pattern 1: Periodic Aggregation

Run every 15 minutes:

```typescript
async function aggregateLatest15Min() {
  const now = Date.now();
  const interval = Math.floor(now / (15 * 60 * 1000)) * (15 * 60 * 1000);
  
  const tickers = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  
  for (const ticker of tickers) {
    await convex.mutation(api.keywords.aggregation.aggregateTickerSentiment, {
      ticker,
      intervalStart: interval,
      granularity: '15m'
    });
  }
  
  await convex.mutation(api.keywords.aggregation.aggregateIndexSentiment, {
    timestamp: interval,
    granularity: '15m',
    tickers
  });
}
```

### Pattern 2: On-Demand Extraction

Trigger when new posts arrive:

```typescript
async function processNewPosts() {
  const result = await convex.mutation(
    api.keywords.keywords.processKeywordsWithFinance,
    {
      timeWindowHours: 1,
      mode: 'hybrid',
      includeOccurrences: true
    }
  );
  
  console.log(`Processed ${result.processed} posts, extracted ${result.financeKeywords} finance keywords`);
}
```

### Pattern 3: Real-Time Dashboard

Subscribe to live updates:

```typescript
// In React component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function FinanceDashboard() {
  const trending = useQuery(api.keywords.financeQueries.getFinanceTrendingKeywords, {
    limit: 20,
    minFinanceScore: 0.6
  });
  
  const indexSentiment = useQuery(api.keywords.financeQueries.getIndexSentiment, {
    granularity: '1h',
    lookbackHours: 24
  });
  
  return (
    <div>
      <h2>Trending Finance Keywords</h2>
      {trending?.map(kw => (
        <div key={kw.keyword}>
          {kw.keyword} ({kw.tickers.join(', ')}) - Sentiment: {kw.sentiment}
        </div>
      ))}
      
      <h2>Index Sentiment</h2>
      {/* Chart component with indexSentiment data */}
    </div>
  );
}
```

## Troubleshooting

### No Finance Keywords Extracted

**Problem**: `financeKeywords: 0` in extraction result

**Solutions**:
1. Check that finance entities are initialized: `await getFinanceEntityStats()`
2. Verify posts contain finance-related content
3. Try `mode: 'financeFocused'` for more aggressive detection
4. Lower `minFinanceScore` in queries

### Empty Sentiment Slices

**Problem**: No data in `getTickerSentimentSlices`

**Solutions**:
1. Ensure extraction has been run: `processKeywordsWithFinance`
2. Check that occurrences exist for the ticker
3. Verify the time interval matches extraction time
4. Run aggregation: `aggregateTickerSentiment`

### No Graph Edges

**Problem**: `edgesCreated: 0` from `buildCoOccurrenceGraph`

**Solutions**:
1. Ensure posts have been extracted first
2. Lower `minCoOccurrence` (try 1)
3. Increase `windowLengthMs` (try 24 hours)
4. Check that keywords actually co-occur in posts

## Next Steps

1. **Set Up Scheduled Jobs**: Use Convex scheduled functions for periodic aggregation
2. **Build UI Components**: Create visualizations for sentiment and relationships
3. **Add More Tickers**: Expand the finance knowledge base
4. **Enable Real-Time**: Connect to websocket subscriptions
5. **Export Data**: Build correlation analysis pipeline

## Getting Help

- See `README.md` for detailed documentation
- Check source code comments for implementation details
- Review test functions in `financeInit.ts` for examples

---

Happy sentiment tracking! 🚀📈
