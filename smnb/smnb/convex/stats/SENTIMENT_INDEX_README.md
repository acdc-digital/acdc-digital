# Sentiment Index System

## Overview

The Sentiment Index calculates an aggregate sentiment score across all NASDAQ-100 companies using Reddit data, providing a single numeric differential that shows deviation from expected baseline sentiment.

## Formula

```
Δ = ((P + M) / 2) - B
```

Where:
- **Δ (Delta)**: Sentiment Index Differential
- **P (Performance)**: Weighted average sentiment × engagement
- **M (Momentum)**: Rate of change in sentiment (normalized)
- **B (Baseline)**: Expected neutral sentiment across all companies

**Interpretation:**
- **Positive Δ**: Sentiment stronger than expected
- **Negative Δ**: Sentiment weaker than expected
- **Zero Δ**: Sentiment at baseline expectations

## Files Created

### Backend (Convex)
1. `/convex/stats/sentimentIndex.ts` - Core calculation and data management functions
2. `/convex/schema.ts` - Added `sentiment_index_history` table

### Frontend (React)
1. `/components/charts/spline/sentiment-index.tsx` - Chart component
2. `/app/dashboard/studio/spline/_components/RightChart.tsx` - Updated to display sentiment index

## Database Schema

### `sentiment_index_history` Table
```typescript
{
  sentiment_index: number,        // Final Δ score
  performance_score: number,      // P component
  momentum_score: number,         // M component
  baseline: number,               // B component
  companies_analyzed: number,     // Number of companies with data
  total_mentions: number,         // Total mentions across all companies
  avg_sentiment: number,          // Average sentiment (0-1)
  avg_momentum: number,           // Average momentum (-100 to +100)
  timestamp: number,              // Unix timestamp
  period_type: string            // "hour", "day", "week"
}
```

## Usage

### 1. Backfill Historical Data (One-time setup)

Run this in your Convex dashboard or via the CLI to populate the last 24 hours of sentiment index data:

```typescript
// In Convex dashboard, run:
await internal.stats.sentimentIndex.backfillHistoricalSentimentIndex({ hoursBack: 24 })
```

This will:
- Process the last 24 hours of sentiment score data
- Calculate hourly sentiment index scores
- Store them in the `sentiment_index_history` table

### 2. Schedule Hourly Updates

To keep the sentiment index updated in real-time, schedule the hourly generation function to run every hour:

```typescript
// Add to your Convex cron jobs (convex/crons.ts):
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "generate hourly sentiment index",
  { hourUTC: "*" }, // Run every hour
  internal.stats.sentimentIndex.generateHourlySentimentIndex
);

export default crons;
```

### 3. Query Sentiment Index Data

**Get Last 24 Hours** (for charting):
```typescript
const sentimentData = useQuery(api.stats.sentimentIndex.getLast24HoursSentimentIndex);
```

Returns an array of hourly data points with:
- `hour`: Hour number (1-24)
- `sentimentIndex`: The Δ score
- `performanceScore`: P component
- `momentumScore`: M component
- `baseline`: B component
- `timestamp`: ISO timestamp string

## How It Works

### 1. Data Collection
The system pulls from existing `sentiment_scores` table which tracks:
- Individual company sentiment scores
- Reddit mention counts
- Engagement metrics
- Momentum (rate of change)

### 2. Aggregation
For each hour:
1. Fetch all company sentiment scores from that time period
2. Calculate weighted performance score (P) based on:
   - Index weight of each company
   - Sentiment score (0-1 scale)
   - Engagement weight (mention count)
3. Calculate momentum score (M) by averaging momentum across all companies
4. Set baseline (B) = expected neutral sentiment * (companies with data / 100)

### 3. Index Calculation
```typescript
const performanceScore = totalWeightedSentiment / totalWeight;
const momentumScore = (avgMomentum + 100) / 200; // Normalize -100/+100 to 0-1
const baseline = 0.5 * (companiesAnalyzed / 100);
const sentimentIndex = ((performanceScore + momentumScore) / 2) - baseline;
```

### 4. Visualization
The right-side chart displays:
- 24-hour rolling window
- Hourly sentiment index values
- Interactive tooltips with timestamps
- Green line indicating positive/negative deviations from baseline

## API Reference

### Queries

**`getLast24HoursSentimentIndex`** (Public Query)
- Returns last 24 hours of sentiment index data
- Used by the chart component
- Auto-updates when new data available

### Actions

**`generateHourlySentimentIndex`** (Internal Action)
- Calculates sentiment index for the past hour
- Stores result in database
- Should be run every hour via cron

**`backfillHistoricalSentimentIndex`** (Internal Action)
- Backfills historical sentiment index data
- Args: `{ hoursBack?: number }` (default: 24)
- Run once during initial setup

### Mutations

**`storeSentimentIndexScore`** (Internal Mutation)
- Stores a calculated sentiment index score
- Called automatically by actions
- Do not call directly

## Troubleshooting

### No data showing in chart?
1. Run the backfill action to populate historical data
2. Ensure `sentiment_scores` table has data for NASDAQ-100 companies
3. Check that the hourly cron is scheduled and running

### Sentiment index seems off?
- Verify that sentiment scores are being calculated correctly
- Check that all 100 companies have sentiment data
- Review the baseline calculation (should be ~0.5 for full coverage)

### Performance issues?
- The calculation processes all 100 companies each hour
- Consider caching if needed
- Monitor Convex function execution time

## Future Enhancements

Potential improvements:
1. **Daily/Weekly aggregates** - Add longer time periods
2. **Sector breakdowns** - Calculate index per sector
3. **Alerts** - Notify when index crosses thresholds
4. **Comparisons** - Compare against actual market performance
5. **Forecasting** - Predict future sentiment trends
6. **API endpoint** - Expose via HTTP for external access
