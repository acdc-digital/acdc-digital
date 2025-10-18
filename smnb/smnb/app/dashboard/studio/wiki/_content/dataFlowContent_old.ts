export const dataFlowContent = `# SMNB Data-Flow Architecture

## Overview

SMNB's data-flow architecture transforms raw social media data into actionable market intelligence through a sophisticated multi-stage enrichment pipeline. This document outlines how data moves through the system from user interaction to trading signals.

---

## Getting Started

### User Entry Points

1. **Initial Access** → \`http://localhost:8888\`
2. **Authentication** → Clerk OAuth (Google/GitHub)
3. **Dashboard Landing** → \`/dashboard\` (main hub)

---

## Live Feed Data Pipeline

### Stage 1: Initiation

**User Action**: Click "Start Live Feed"

**System Response**:
- WebSocket connection established
- Reddit API session initialized
- Subreddit queue loaded (r/news, r/worldnews, r/technology)
- First posts appear: **2-6 seconds**

### Stage 2: Data Enrichment Pipeline

The 7-stage enrichment process transforms raw posts into market intelligence:

| Stage | Process | Data Transformation | Output | Latency |
|-------|---------|-------------------|--------|---------|
| **1. Ingestion** | Reddit API fetch | Raw JSON → Structured data | Post ID, content, metadata, engagement | 100-300ms |
| **2. Sentiment Analysis** | Anthropic Claude 3.5 Sonnet | Text → Sentiment vector | Score (-1 to +1), confidence (0-1) | 800-1200ms |
| **3. Quality Scoring** | Multi-factor algorithm | Metadata → Quality metrics | Score (0-100), credibility tier | 50-100ms |
| **4. Priority Classification** | Velocity & trend detection | Engagement rate → Priority level | Priority (1-5), trending flag | 100-200ms |
| **5. Categorization** | Topic modeling + NLP | Content → Category labels | Tags, entities, sectors | 200-400ms |
| **6. Market Correlation** | MNQ1 index analysis | Sentiment + market data → Impact | Correlation coefficient, predicted Δ | 150-300ms |
| **7. Threading** | Similarity detection | Content fingerprint → Thread ID | Thread ID, related story links | 100-250ms |

**Total Enrichment Time**: ~1.5-2.8 seconds per post

### Stage 3: Continuous Updates

**Update Pattern**:
- New posts stream every **10-20 seconds**
- Smart scheduling prioritizes high-quality sources
- Deduplication prevents story repetition

**Real-time Sync**:
\`\`\`
Reddit API → Enrichment Queue → Convex Database → WebSocket Push → Client UI
     ↓              ↓                   ↓                  ↓             ↓
  10-20s         1.5-2.8s            50ms              20ms         render
\`\`\`

---

## Analytics & Market Correlation

### MNQ1 Integration Architecture

All sentiment metrics correlate with **MNQ1 (E-mini Nasdaq-100 futures)** in real-time:

**Data Sources**:
- Live MNQ1 pricing via Finlight.me API
- Historical tick data (2+ years)
- Market hours detection (9:30 AM - 4:00 PM ET)

**Correlation Pipeline**:
\`\`\`
Sentiment Data + MNQ1 Data → Pearson Correlation → Statistical Validation → Trading Signals
      ↓                ↓              ↓                      ↓                    ↓
  Rolling 1hr      Live ticks    r coefficient          p-value < 0.05      Alert system
\`\`\`

### Trading Analytics Dashboard

Real-time metrics calculated every 30 seconds:

| Metric | Calculation | Data Flow | Purpose |
|--------|------------|-----------|---------|
| **Sentiment Delta** | Current - 24hr average | Aggregate sentiment → Time-series analysis → Delta | Momentum indicator |
| **Volume Spike** | Posts/hr vs baseline | Post frequency → Rolling average → Variance | Volatility predictor |
| **Quality-Weighted Sentiment** | (Σ Sentiment × Quality) / 100 | Individual scores → Weighted sum → Average | Signal confidence |
| **Cross-Asset Correlation** | News sentiment × MNQ1 movement | Sentiment + price data → Regression → r-value | Divergence detection |

---

## Welcome Page Ticker Architecture

### Sentiment Score Calculation

**Aggregation Method**: Weighted average over rolling 1-hour window

**Weight Distribution**:
\`\`\`typescript
final_sentiment = (
  quality_score * 0.40 +
  engagement_metrics * 0.30 +
  source_credibility * 0.30
)
\`\`\`

**Data Flow**:
\`\`\`
Last 60min Posts → Quality Filter (>50) → Weight Application → Aggregate → Display
        ↓                  ↓                      ↓               ↓          ↓
    150 posts          120 pass              Weighted sum     +0.42    Ticker update
\`\`\`

### Percentage Display (vs Index Points)

**Formula**:
\`\`\`
Sentiment Impact % = (Sentiment Score × Historical Correlation) / MNQ1 Daily Range
\`\`\`

**Example Calculation**:
- Current sentiment: **+0.42**
- Historical correlation: **0.68** (strong positive)
- MNQ1 daily range: **150 points**
- Impact: **(0.42 × 0.68) / 150 = 0.19%** (~28.5 index points)

**Interpretation**:
- **Positive %**: Bullish news pressure → Expected upward movement
- **Negative %**: Bearish news pressure → Expected downward movement
- **Magnitude**: Potential index point movement based on historical patterns

---

## News Ranking Algorithm

### Multi-Factor Scoring System

Posts ranked using weighted composite score:

| Factor | Weight | Calculation | Data Sources | Update Frequency |
|--------|--------|-------------|--------------|------------------|
| **Quality Score** | 35% | Source credibility + content depth + accuracy | Reddit karma, account age, fact-check history | Per post |
| **Sentiment Strength** | 25% | \|sentiment_score\| (absolute value) | Anthropic sentiment analysis | Per post |
| **Market Relevance** | 20% | Keyword match score × sector weighting | Entity extraction + market data | Per post |
| **Temporal Decay** | 10% | e^(-λt) where λ = 0.1/hour | Post timestamp | Every minute |
| **Engagement Velocity** | 10% | Δengagement / Δtime | Reddit API real-time | Every 5 minutes |

**Ranking Pipeline**:
\`\`\`
Raw Posts → Factor Calculation → Weight Application → Sort by Score → Top N Selection
     ↓              ↓                    ↓                  ↓              ↓
  All posts    Individual scores    Composite score    Ranked list    Display (20)
\`\`\`

### Versus News Score

**Purpose**: Compare SMNB sentiment against traditional media outlets

**Data Sources**:
- SMNB: Reddit-aggregated sentiment
- Traditional: Reuters, Bloomberg, CNBC RSS feeds
- Update: Every 15 minutes

**Display Format**:
\`\`\`
SMNB: +0.65 vs Reuters: +0.32 (Δ +0.33)
  ↑      ↑         ↑       ↑       ↑
Label  Score   Source   Score  Difference
\`\`\`

**Interpretation**:
- **Δ > +0.25**: SMNB significantly more bullish → Potential early signal
- **Δ < -0.25**: SMNB significantly more bearish → Risk indicator
- **|Δ| < 0.10**: Consensus between social and traditional media

---

## User Action Data Flows

### Action 1: "Start Live Feed"

**Complete Data Flow**:

\`\`\`
┌─────────────┐
│ User Click  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Frontend Event      │
│ - Button disabled   │
│ - Loading spinner   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ API Request         │
│ POST /api/feed/start│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Reddit API Fetch    │
│ - Authenticate      │
│ - Query subreddits  │
│ - Paginate results  │
└──────┬──────────────┘
       │ (2-6 seconds)
       ▼
┌─────────────────────────────┐
│ Raw Data Queue              │
│ {id, title, body, meta...}  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ 7-Stage Enrichment Pipeline     │
│ (parallel processing)           │
│                                 │
│ 1. Ingest ─────┐               │
│ 2. Sentiment ──┤               │
│ 3. Quality ────┼─→ Enriched    │
│ 4. Priority ───┤    Data       │
│ 5. Category ───┤               │
│ 6. Correlation─┤               │
│ 7. Threading ──┘               │
└──────┬──────────────────────────┘
       │ (1.5-2.8s per post)
       ▼
┌─────────────────────┐
│ Convex Database     │
│ - Write to 'posts'  │
│ - Index updates     │
│ - Triggers active   │
└──────┬──────────────┘
       │ (50ms)
       ▼
┌─────────────────────┐
│ Real-time Push      │
│ - WebSocket emit    │
│ - Subscription push │
└──────┬──────────────┘
       │ (20ms)
       ▼
┌─────────────────────┐
│ Client Update       │
│ - React state       │
│ - UI re-render      │
│ - Animation         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Display Enriched    │
│ Post with:          │
│ - Sentiment badge   │
│ - Quality score     │
│ - Category tags     │
│ - Market impact     │
└─────────────────────┘
       │
       ▼ (background)
┌─────────────────────┐
│ Analytics Update    │
│ - MNQ1 correlation  │
│ - Aggregate metrics │
│ - Alert checks      │
└─────────────────────┘
\`\`\`

**Key Metrics**:
- Total latency: **3.7-8.9 seconds** (user click → display)
- Enrichment parallelization: **7 concurrent processes**
- Database write throughput: **~20 posts/second**
- WebSocket latency: **<50ms**

---

### Action 2: "View Sentiment Analysis"

**Complete Data Flow**:

\`\`\`
┌─────────────────┐
│ User Navigates  │
│ /analytics      │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Component Mount      │
│ - 3 parallel queries │
└────────┬─────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │Aggregate │      │  MNQ1    │      │ Session  │
   │Sentiment │      │  Data    │      │  Meta    │
   └────┬─────┘      └────┬─────┘      └────┬─────┘
        │                 │                  │
        │ (100-300ms)     │ (150ms)          │ (50ms)
        │                 │                  │
        └─────────┬───────┴──────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Data Aggregation│
         │ - Time filters  │
         │ - Weighted avg  │
         │ - 15min buckets │
         └────────┬────────┘
                  │ (100-300ms)
                  ▼
         ┌─────────────────────┐
         │ Correlation Calc    │
         │ - Pearson r         │
         │ - Rolling 24hr      │
         │ - p-value test      │
         └────────┬────────────┘
                  │ (200ms)
                  ▼
         ┌─────────────────────┐
         │ Visualization Gen   │
         │ - Chart.js render   │
         │ - Dual-axis graph   │
         │ - Divergence zones  │
         └────────┬────────────┘
                  │ (300ms)
                  ▼
         ┌─────────────────────┐
         │ Display Components  │
         │                     │
         │ • Score: +0.42      │
         │ • Impact: +0.15%    │
         │ • Trend: ↑          │
         │ • Confidence: ±0.08 │
         └────────┬────────────┘
                  │
                  ▼ (continuous)
         ┌─────────────────────┐
         │ Real-time Updates   │
         │ - Every 30 seconds  │
         │ - WebSocket sub     │
         │ - Smooth animation  │
         └─────────────────────┘
\`\`\`

**Calculation Details**:

**Aggregate Sentiment**:
\`\`\`typescript
const weights = {
  quality: 0.40,
  engagement: 0.30,
  credibility: 0.30
};

aggregate = posts
  .filter(p => p.timestamp > now - 1hour)
  .reduce((sum, post) => {
    const weight = 
      post.quality * weights.quality +
      post.engagement * weights.engagement +
      post.credibility * weights.credibility;
    return sum + (post.sentiment * weight);
  }, 0) / totalWeight;
\`\`\`

**Correlation Calculation**:
\`\`\`typescript
// Pearson correlation coefficient
const r = 
  (n * Σ(xy) - Σx * Σy) /
  sqrt((n * Σ(x²) - (Σx)²) * (n * Σ(y²) - (Σy)²));

// Where:
// x = sentiment scores (24hr window)
// y = MNQ1 price changes (aligned timestamps)
// n = number of data points
\`\`\`

---

### Action 3: "Click News Item"

**Complete Data Flow**:

\`\`\`
┌──────────────┐
│ User Clicks  │
│ News Card    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Event Capture    │
│ - Post ID        │
│ - Loading state  │
│ - Skeleton UI    │
└──────┬───────────┘
       │ (10ms)
       ▼
┌──────────────────┐
│ Convex Query     │
│ getPostById()    │
└──────┬───────────┘
       │ (50-150ms)
       ▼
┌────────────────────────────────┐
│ Full Enrichment Data Retrieved │
│                                │
│ • Original Reddit data         │
│ • Sentiment breakdown          │
│ • Quality components           │
│ • Priority reasoning           │
│ • Category & entities          │
│ • MNQ1 correlation             │
│ • Thread relationships         │
└──────┬─────────────────────────┘
       │
       ├─────────────────┬─────────────┬─────────────┐
       ▼                 ▼             ▼             ▼
┌──────────┐    ┌─────────────┐  ┌────────┐  ┌──────────┐
│ Original │    │  Sentiment  │  │Quality │  │  Market  │
│ Content  │    │   Analysis  │  │Metrics │  │  Impact  │
│ Section  │    │    Panel    │  │        │  │          │
└──────────┘    └─────────────┘  └────────┘  └──────────┘
       │                 │             │             │
       └─────────────────┴─────────────┴─────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Render Detail   │
                │ View with Tabs  │
                └────────┬────────┘
                         │
                         ▼ (async, non-blocking)
                ┌─────────────────┐
                │ Log Interaction │
                │ user_interactions│
                │ table           │
                └────────┬────────┘
                         │ (20ms)
                         ▼
                ┌─────────────────┐
                │ Update Metrics  │
                │ - viewCount++   │
                │ - engagement↑   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │ Related Stories     │
                │ Query               │
                │                     │
                │ Query: by_thread_id │
                │ Filter: !current    │
                │ Order: relevance    │
                │ Limit: 5            │
                └────────┬────────────┘
                         │ (100-200ms)
                         ▼
                ┌─────────────────────┐
                │ Thread Display      │
                │ - Related posts     │
                │ - Sentiment compare │
                │ - Timeline view     │
                └────────┬────────────┘
                         │
                         ▼ (background prefetch)
                ┌─────────────────────┐
                │ Predictive Cache    │
                │ - Top 2 related     │
                │ - Browser cache     │
                └─────────────────────┘
\`\`\`

**Enrichment Layer Display Structure**:

**1. Original Content Section**:
\`\`\`
┌─────────────────────────────────────────┐
│ [Subreddit Badge] r/wallstreetbets      │
│ Posted 2 hours ago by u/DeepValue       │
│                                         │
│ Title: "NVDA earnings beat expected"   │
│                                         │
│ Body: [Full Reddit post content...]    │
│                                         │
│ ↑ 1.2k upvotes  💬 234 comments        │
└─────────────────────────────────────────┘
\`\`\`

**2. Sentiment Analysis Panel**:
\`\`\`
┌─────────────────────────────────────────┐
│ Overall Sentiment: +0.78 (Positive)     │
│ Confidence: 94%                         │
│                                         │
│ Breakdown by Paragraph:                 │
│ • Para 1: +0.85 "Strong bullish tone"   │
│ • Para 2: +0.72 "Revenue optimism"      │
│ • Para 3: +0.77 "Growth expectations"   │
│                                         │
│ Key Phrases:                            │
│ • "beat expectations" (+0.9)            │
│ • "strong guidance" (+0.85)             │
│ • "AI growth" (+0.8)                    │
│                                         │
│ Emotion Indices:                        │
│ • Greed: 82/100                         │
│ • Fear: 18/100                          │
│ • Uncertainty: 25/100                   │
└─────────────────────────────────────────┘
\`\`\`

**3. Quality Metrics**:
\`\`\`
┌─────────────────────────────────────────┐
│ Overall Quality: 87/100  [HIGH]         │
│                                         │
│ Component Breakdown:                    │
│ ████████████████░░░░ 85  Credibility    │
│ ██████████████░░░░░░ 72  Content Depth  │
│ ██████████████████░░ 91  Engagement     │
│                                         │
│ vs Category Average: +12 points         │
│ (Above 78% of similar posts)            │
└─────────────────────────────────────────┘
\`\`\`

**4. Market Impact**:
\`\`\`
┌─────────────────────────────────────────┐
│ Predicted MNQ1 Correlation: +0.68       │
│                                         │
│ Historical Similar Events:              │
│ • Q3 2024 NVDA earnings: +1.2% (MNQ1)   │
│ • Q2 2024 AMD earnings: +0.8% (MNQ1)    │
│                                         │
│ Sector Exposure:                        │
│ • Technology: 80%                       │
│ • Semiconductors: 95%                   │
│ • AI/ML: 70%                            │
│                                         │
│ Time Decay: 98% relevant (2hr old)      │
└─────────────────────────────────────────┘
\`\`\`

**Related Stories Threading Algorithm**:
\`\`\`typescript
// Similarity score calculation
const similarity = 
  (entityOverlap * 0.40) +        // People, companies, places
  (categoryAlignment * 0.30) +     // Same category tags
  (temporalProximity * 0.20) +     // Within 48 hours
  (sentimentAlignment * 0.10);     // Similar sentiment direction

// Related posts ranked by similarity score
const related = await ctx.db
  .query("posts")
  .withIndex("by_thread_id", q => q.eq("threadId", post.threadId))
  .filter(q => q.neq(q.field("_id"), postId))
  .collect()
  .sort((a, b) => calculateSimilarity(b, post) - calculateSimilarity(a, post))
  .slice(0, 5);
\`\`\`

---

## Technical Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TailwindCSS | UI framework & styling |
| **Backend** | Convex | Real-time database + serverless functions |
| **AI Processing** | Anthropic Claude 3.5 Sonnet | Sentiment analysis & NLP |
| **Market Data** | Finlight.me API | Real-time MNQ1 futures data |
| **Authentication** | Clerk | OAuth + session management |
| **WebSocket** | Convex Subscriptions | Real-time data push |

### Data Storage Schema

**Posts Table**:
\`\`\`typescript
{
  _id: Id<"posts">,
  redditId: string,
  title: string,
  body: string,
  subreddit: string,
  author: string,
  timestamp: number,
  
  // Enrichment data
  sentiment: number,           // -1 to +1
  sentimentConfidence: number, // 0 to 1
  quality: number,             // 0 to 100
  priority: number,            // 1 to 5
  categories: string[],
  entities: string[],
  mnq1Correlation: number,     // -1 to +1
  threadId: string,
  
  // Engagement
  upvotes: number,
  comments: number,
  viewCount: number,
  clickThroughCount: number
}
\`\`\`

**Indexes**:
- \`by_timestamp\`: Fast chronological queries
- \`by_thread_id\`: Related story lookups
- \`by_quality\`: Top-quality filtering
- \`by_sentiment\`: Sentiment-based queries
- \`by_subreddit_and_timestamp\`: Source-specific feeds

### Scalability Architecture

**Horizontal Scaling**:
- Convex automatic sharding across posts
- Read replicas for analytics queries
- Write throughput: ~1000 posts/minute

**Rate Limiting**:
- Reddit API: 60 requests/minute (per OAuth token)
- Anthropic API: 50 requests/minute (batch processing)
- Client WebSocket: 100 messages/second per connection

**Cost Optimization**:
- AI API batching: Process 10 posts per request
- Caching: 5-minute TTL on aggregate metrics
- CDN: Static assets and historical data

---

## Key Performance Indicators

### Real-time Monitoring

| KPI | Target | Measurement | Alert Threshold |
|-----|--------|-------------|-----------------|
| **Enrichment Latency** | <3s p95 | Timestamp diff: ingest → DB write | >5s for 5min |
| **Correlation Accuracy** | r >0.65 | Pearson on 24hr rolling window | <0.50 for 1hr |
| **WebSocket Latency** | <100ms | Server push → client receive | >500ms |
| **Query Performance** | <200ms p95 | Database query execution time | >1s |
| **AI API Success Rate** | >99% | Successful / Total requests | <95% |
| **Update Freshness** | <45s p90 | Reddit post time → SMNB display | >2min |
| **Thread Accuracy** | >90% | Correct groupings / Total threads | <80% |

### System Health Dashboard

Location: \`/dashboard/system-health\`

**Live Metrics**:
- Enrichment pipeline throughput (posts/minute)
- AI API latency histogram
- Database query performance
- WebSocket connection count
- Error rate by component
- Cost per enriched post

**Historical Analytics**:
- 7-day correlation trend
- Quality score distribution
- Source performance comparison
- User engagement patterns
- Cost optimization tracking

---

## Data Retention & Archival

| Data Type | Hot Storage | Warm Storage | Cold Archive | Total Retention |
|-----------|-------------|--------------|--------------|-----------------|
| **Active Posts** | 30 days | - | - | 30 days |
| **Historical Posts** | - | 1 year | 5 years | 6 years |
| **Analytics Aggregates** | 90 days | 2 years | 10 years | 12+ years |
| **MNQ1 Data** | 30 days | 2 years | Indefinite | Indefinite |
| **User Interactions** | 90 days | - | - | 90 days |

**Archival Strategy**:
- Daily: Aggregate to 1-hour buckets
- Weekly: Migrate >30 day posts to warm storage
- Monthly: Generate summary statistics
- Quarterly: Archive to S3 Glacier for compliance

---

This data-flow architecture ensures SMNB delivers real-time, high-quality market intelligence by transforming raw social media data through sophisticated enrichment pipelines while maintaining sub-second response times and cost efficiency.
`;
