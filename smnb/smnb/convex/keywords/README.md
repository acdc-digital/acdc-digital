# Nasdaq-100 Sentiment Correlation Engine

This system provides enhanced keyword extraction with finance awareness, designed to correlate Reddit sentiment data with Nasdaq-100 (mNQ front contract) market movements.

## Overview

The system extracts keywords from Reddit posts, identifies financial entities (tickers, companies, executives), tracks sentiment over time, and aggregates data into time-bucketed slices for correlation analysis with market data.

## Architecture

```
Reddit Posts → Enhanced Extraction → Keyword Trends + Occurrences
                                    ↓
                     Ticker Sentiment Slices (5m/15m/1h/4h/1d)
                                    ↓
                        Nasdaq-100 Index Sentiment
                                    ↓
                     Co-occurrence Relationship Graph
```

## Getting Started

### 1. Initialize Finance Entities

Before using the system, populate the finance entities database:

```typescript
// From Convex dashboard or client
await initializeFinanceEntities({ overwrite: false });
```

This loads ~25 major Nasdaq-100 tickers with their aliases, sectors, and industries.

### 2. Run Enhanced Keyword Extraction

Process posts with finance awareness:

```typescript
await processKeywordsWithFinance({
  timeWindowHours: 24,
  minOccurrences: 2,
  mode: 'hybrid', // 'general' | 'financeFocused' | 'hybrid'
  includeOccurrences: true // Track detailed occurrences
});
```

### 3. Aggregate Sentiment Data

Create time-bucketed sentiment slices for a ticker:

```typescript
await aggregateTickerSentiment({
  ticker: 'NVDA',
  intervalStart: Date.now() - 3600000, // 1 hour ago
  granularity: '15m' // '5m' | '15m' | '1h' | '4h' | '1d'
});
```

Create Nasdaq-100 index-level sentiment:

```typescript
await aggregateIndexSentiment({
  timestamp: Date.now() - 3600000,
  granularity: '15m',
  tickers: ['AAPL', 'NVDA', 'MSFT'] // Optional: specify tickers
});
```

### 4. Build Relationship Graph

Detect keyword co-occurrences:

```typescript
await buildCoOccurrenceGraph({
  windowStart: Date.now() - 3600000,
  windowLengthMs: 3600000, // 1 hour
  minCoOccurrence: 2,
  maxEdgesPerNode: 50
});
```

## Query Examples

### Get Finance-Trending Keywords

```typescript
const trending = await getFinanceTrendingKeywords({
  limit: 30,
  minFinanceScore: 0.5,
  minVelocity: 0.1,
  trendStatus: 'rising'
});
```

### Get Ticker Sentiment Over Time

```typescript
const sentiment = await getTickerSentimentSlices({
  ticker: 'NVDA',
  granularity: '15m',
  lookbackHours: 24
});
```

### Get Index Sentiment

```typescript
const indexSentiment = await getIndexSentiment({
  granularity: '1h',
  lookbackHours: 24
});
```

### Get Keyword Relationships

```typescript
const relationships = await getKeywordRelationships({
  keyword: 'nvidia',
  windowMinutes: 60,
  limit: 20,
  financeOnly: true
});
```

## Data Model

### Tables

- **finance_entities**: Knowledge base of Nasdaq-100 tickers, companies, aliases
- **keyword_occurrences**: Detailed tracking of each keyword mention
- **keyword_trends**: Aggregated keyword metrics with finance relevance
- **ticker_sentiment_slices**: Time-bucketed ticker sentiment data
- **nasdaq_sentiment_index**: Index-level sentiment aggregation
- **keyword_graph_edges**: Co-occurrence relationships between keywords

### Key Metrics

#### Ticker Sentiment Slice
- `weighted_sentiment`: -1 (very negative) to +1 (very positive)
- `sentiment_confidence`: 0 to 1
- `velocity`: Rate of change in mentions
- `acceleration`: Rate of change of velocity
- `engagement_sum`: Total engagement weight

#### Index Sentiment
- `index_weighted_sentiment`: Market-cap weighted sentiment
- `breadth`: % of tickers with positive sentiment
- `dispersion`: Standard deviation of ticker sentiments
- `regime_tag`: bullish | bearish | uncertain | low-signal

#### Keyword Metrics
- `finance_relevance_score`: 0 to 1 (how finance-related)
- `trend_velocity`: Rate of change in occurrences
- `performance_tier`: elite | excel | veryGood | ... | critical
- `mapped_tickers`: Associated ticker symbols

## Configuration

### Extraction Options

```typescript
interface KeywordExtractionOptions {
  mode?: 'general' | 'financeFocused' | 'hybrid';
  includeFinanceEntities?: boolean;
  linkToTickers?: boolean;
  financeBoostFactor?: number; // Default: 1.5
  minSentimentConfidence?: number; // Default: 0.3
  maxKeywordsPerPost?: number; // Default: 25
  subredditWeightingStrategy?: 'flat' | 'domainAuthority' | 'custom';
  engagementWeighting?: {
    scoreWeight?: number; // Default: 0.4
    commentWeight?: number; // Default: 0.4
    upvoteRatioWeight?: number; // Default: 0.2
  };
}
```

### Subreddit Weights

Finance-related subreddits have higher authority for finance topics:

- wallstreetbets: 1.5x
- stocks, investing: 1.4x
- technology: 1.3x
- default: 1.0x

## Finance Knowledge Base

Currently includes ~25 major Nasdaq-100 components:

- **Tech Giants**: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA
- **Semiconductors**: AMD, INTC, QCOM, AVGO
- **Software**: ORCL, ADBE, CRM
- **And more**: NFLX, COST, PEP, TMUS, CMCSA, etc.

Each ticker includes:
- Company name
- Aliases (product names, executive names)
- Sector and industry classification
- Active status

## Formulas

### Engagement Weight
```
engagement_weight = (log10(score) / 5 * 0.4) + 
                    (log10(comments) / 4 * 0.4) + 
                    (upvote_ratio * 0.2) * 
                    subreddit_multiplier
```

### Velocity
```
velocity = (current_count - previous_count) / max(previous_count, 1)
```

### Acceleration
```
acceleration = current_velocity - previous_velocity
```

### PMI (Pointwise Mutual Information)
```
PMI = log2(P(x,y) / (P(x) * P(y)))
```

### Jaccard Similarity
```
Jaccard = |X ∩ Y| / |X ∪ Y|
```

### Market-Cap Weighted Sentiment
```
index_sentiment = Σ(ticker_sentiment * market_cap_weight) / Σ(market_cap_weight)
```

## Performance Considerations

- **Batch Processing**: Use batch functions for multiple tickers/windows
- **Indexing**: All tables have appropriate indexes for efficient queries
- **Pruning**: Regularly prune weak graph edges to control growth
- **Time Windows**: Larger granularities (1h, 4h, 1d) are more efficient

## Testing

Test finance extraction on sample text:

```typescript
const matches = await testFinanceExtraction({
  text: "NVDA is crushing it! Jensen Huang announced new AI chips. $AAPL and Microsoft also looking strong."
});
// Returns: [
//   { ticker: 'NVDA', matchedText: 'NVDA', confidence: 0.95 },
//   { ticker: 'NVDA', matchedText: 'Jensen Huang', confidence: 0.85 },
//   { ticker: 'AAPL', matchedText: '$AAPL', confidence: 0.95 },
//   { ticker: 'MSFT', matchedText: 'Microsoft', confidence: 0.85 }
// ]
```

## Monitoring

Get entity statistics:

```typescript
const stats = await getFinanceEntityStats();
// Returns counts by sector, type, and active status
```

## Integration Points

### Event-Driven Extraction
Trigger extraction when posts are ingested:
```typescript
// In post ingestion mutation
await processKeywordsWithFinance({ 
  mode: 'hybrid',
  includeOccurrences: true 
});
```

### Scheduled Aggregation
Run periodic jobs for sentiment slices:
```typescript
// Every 15 minutes
await aggregateTickerSentiment({
  ticker: 'NVDA',
  intervalStart: roundToInterval(Date.now(), '15m'),
  granularity: '15m'
});
```

### Real-Time Updates
Subscribe to live changes:
```typescript
// Frontend
const trending = useQuery(api.keywords.financeQueries.getFinanceTrendingKeywords, {
  limit: 20,
  minFinanceScore: 0.6
});
```

## Correlation Analysis Workflow

1. **Extract Keywords**: Run `processKeywordsWithFinance` on historical data
2. **Aggregate Sentiment**: Create ticker slices for all tickers and time windows
3. **Build Index**: Aggregate index-level sentiment
4. **Export Data**: Query slices and export to CSV/Parquet
5. **Align with Market Data**: Match timestamps with mNQ futures bars
6. **Analyze**: Run correlation, Granger causality, regime analysis

## Limitations & Future Enhancements

### Current Limitations
- ~25 tickers (expandable to full Nasdaq-100)
- Simple market-cap weighting (should use real-time data)
- No volatility adjustment yet
- Manual triggering of aggregation jobs

### Planned Enhancements
- Full Nasdaq-100 coverage (100+ tickers)
- Real-time market data integration
- Automated scheduled jobs
- Volatility-adjusted sentiment scores
- Hidden Markov Model for regime detection
- Advanced phrase detection (collocation PMI, NLP)
- Multi-lingual support

## License

Part of the ACDC Digital project.
