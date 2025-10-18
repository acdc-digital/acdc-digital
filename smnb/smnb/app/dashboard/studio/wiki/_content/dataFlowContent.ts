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

**Real-time Sync Flow**:

| Stage | Component | Latency |
|-------|-----------|----------|
| 1 | Reddit API | 10-20s |
| 2 | Enrichment Queue | 1.5-2.8s |
| 3 | Convex Database | 50ms |
| 4 | WebSocket Push | 20ms |
| 5 | Client UI Render | instant |

---

## Analytics & Market Correlation

### MNQ1 Integration Architecture

All sentiment metrics correlate with **MNQ1 (E-mini Nasdaq-100 futures)** in real-time:

**Data Sources**:
- Live MNQ1 pricing via Finlight.me API
- Historical tick data (2+ years)
- Market hours detection (9:30 AM - 4:00 PM ET)

**Correlation Pipeline**:

| Stage | Process | Output |
|-------|---------|--------|
| 1 | Sentiment Data (Rolling 1hr) | Aggregated sentiment scores |
| 2 | MNQ1 Data (Live ticks) | Current index prices |
| 3 | Pearson Correlation | r coefficient |
| 4 | Statistical Validation | p-value < 0.05 |
| 5 | Trading Signals | Alert system notifications |

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

- Quality score: **40%**
- Engagement metrics: **30%**
- Source credibility: **30%**

\`\`\`typescript
final_sentiment = (
  quality_score * 0.40 +
  engagement_metrics * 0.30 +
  source_credibility * 0.30
)
\`\`\`

**Data Flow**:

| Stage | Process | Result |
|-------|---------|--------|
| 1 | Last 60min Posts | 150 posts collected |
| 2 | Quality Filter (>50) | 120 posts pass |
| 3 | Weight Application | Weighted sum calculated |
| 4 | Aggregate | Final score: +0.42 |
| 5 | Display | Ticker update |

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

| Stage | Process | Output |
|-------|---------|--------|
| 1 | Raw Posts | All posts collected |
| 2 | Factor Calculation | Individual scores per factor |
| 3 | Weight Application | Composite score per post |
| 4 | Sort by Score | Ranked list (highest first) |
| 5 | Top N Selection | Display top 20 posts |

### Versus News Score

**Purpose**: Compare SMNB sentiment against traditional media outlets

**Data Sources**:
- SMNB: Reddit-aggregated sentiment
- Traditional: Reuters, Bloomberg, CNBC RSS feeds
- Update: Every 15 minutes

**Display Format**:

| Element | Value | Description |
|---------|-------|-------------|
| Label | SMNB | Platform identifier |
| Score | +0.65 | SMNB sentiment score |
| Source | Reuters | Comparison source |
| Score | +0.32 | Traditional media sentiment |
| Difference | Δ +0.33 | Divergence magnitude |

**Example Display**: SMNB: +0.65 vs Reuters: +0.32 (Δ +0.33)

**Interpretation**:
- **Δ > +0.25**: SMNB significantly more bullish → Potential early signal
- **Δ < -0.25**: SMNB significantly more bearish → Risk indicator
- **|Δ| < 0.10**: Consensus between social and traditional media

---

## User Action Data Flows

### Action 1: "Start Live Feed"

\`\`\`mermaid
flowchart TD
    A(["User Click: Start Live Feed"]) --> B["Frontend Event<br/>- Button disabled<br/>- Loading spinner"]
    B --> C["API Request<br/>POST /api/feed/start"]
    C --> D["Reddit API Fetch<br/>- Authenticate<br/>- Query subreddits<br/>- Paginate results"]
    D -->|"2-6 seconds"| E["Raw Data Queue<br/>{id, title, body, meta...}"]
    E --> F["7-Stage Enrichment Pipeline<br/>(parallel processing)"]
    
    F --> G["1. Ingestion"]
    F --> H["2. Sentiment Analysis"]
    F --> I["3. Quality Scoring"]
    F --> J["4. Priority Classification"]
    F --> K["5. Categorization"]
    F --> L["6. Market Correlation"]
    F --> M["7. Threading"]
    
    G --> N["Enriched Data"]
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    
    N -->|"1.5-2.8s per post"| O[("Convex Database<br/>- Write to 'posts'<br/>- Index updates<br/>- Triggers active")]
    O -->|"50ms"| P["Real-time Push<br/>- WebSocket emit<br/>- Subscription push"]
    P -->|"20ms"| Q["Client Update<br/>- React state<br/>- UI re-render<br/>- Animation"]
    Q --> R["Display Enriched Post<br/>- Sentiment badge<br/>- Quality score<br/>- Category tags<br/>- Market impact"]
    R -.->|"background"| S["Analytics Update<br/>- MNQ1 correlation<br/>- Aggregate metrics<br/>- Alert checks"]
    
    style A fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style R fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style F fill:#FF9800,stroke:#E65100,stroke-width:2px
    style O fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style S fill:#607D8B,stroke:#37474F,stroke-width:2px,color:#fff
\`\`\`

**Key Metrics**:
- Total latency: **3.7-8.9 seconds** (user click → display)
- Enrichment parallelization: **7 concurrent processes**
- Database write throughput: **~20 posts/second**
- WebSocket latency: **<50ms**

---

### Action 2: "View Sentiment Analysis"

\`\`\`mermaid
flowchart TD
    A(["User Navigates to /analytics"]) --> B["Component Mount<br/>3 parallel queries"]
    
    B --> C["Query 1:<br/>Aggregate Sentiment"]
    B --> D["Query 2:<br/>MNQ1 Data"]
    B --> E["Query 3:<br/>Session Metadata"]
    
    C -->|"100-300ms"| F[/"Data Aggregation"/]
    D -->|"150ms"| F
    E -->|"50ms"| F
    
    F --> G["Aggregation Process<br/>- Time filters<br/>- Weighted average<br/>- 15min buckets"]
    G -->|"100-300ms"| H["Correlation Calculation<br/>- Pearson r coefficient<br/>- Rolling 24hr window<br/>- p-value test"]
    H -->|"200ms"| I["Visualization Generation<br/>- Chart.js render<br/>- Dual-axis graph<br/>- Divergence zones"]
    I -->|"300ms"| J["Display Components<br/>• Score: +0.42<br/>• Impact: +0.15%<br/>• Trend: ↑<br/>• Confidence: ±0.08"]
    J -.->|"continuous"| K["Real-time Updates<br/>- Every 30 seconds<br/>- WebSocket subscription<br/>- Smooth animation"]
    K -.-> H
    
    style A fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style B fill:#FF9800,stroke:#E65100,stroke-width:2px
    style F fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style J fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style K fill:#607D8B,stroke:#37474F,stroke-width:2px,color:#fff
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

\`\`\`mermaid
flowchart TD
    A(["User Clicks News Card"]) --> B["Event Capture<br/>- Post ID<br/>- Loading state<br/>- Skeleton UI"]
    B -->|"10ms"| C["Convex Query<br/>getPostById()"]
    C -->|"50-150ms"| D{{"Full Enrichment<br/>Data Retrieved"}}
    
    D --> E["Original Reddit data"]
    D --> F["Sentiment breakdown"]
    D --> G["Quality components"]
    D --> H["Priority reasoning"]
    D --> I["Category & entities"]
    D --> J["MNQ1 correlation"]
    D --> K["Thread relationships"]
    
    E & F & G & J --> L["Render Detail View"]
    
    L --> M["Original Content Section"]
    L --> N["Sentiment Analysis Panel"]
    L --> O["Quality Metrics Display"]
    L --> P["Market Impact Panel"]
    
    L -.->|"async, non-blocking"| Q["Log Interaction<br/>user_interactions table"]
    Q -->|"20ms"| R["Update Metrics<br/>- viewCount++<br/>- engagement↑"]
    
    L --> S["Related Stories Query<br/>by_thread_id<br/>Filter: !current<br/>Order: relevance<br/>Limit: 5"]
    S -->|"100-200ms"| T["Thread Display<br/>- Related posts<br/>- Sentiment compare<br/>- Timeline view"]
    
    T -.->|"background prefetch"| U["Predictive Cache<br/>- Top 2 related<br/>- Browser cache"]
    
    style A fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style D fill:#FF9800,stroke:#E65100,stroke-width:2px
    style L fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style T fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style U fill:#607D8B,stroke:#37474F,stroke-width:2px,color:#fff
\`\`\`

**Enrichment Layer Display Structure**:

### 1. Original Content Section

**Display Components:**
- **Subreddit Badge**: r/wallstreetbets
- **Post Metadata**: Posted 2 hours ago by u/DeepValue
- **Title**: "NVDA earnings beat expected"
- **Body**: [Full Reddit post content...]
- **Engagement**: ↑ 1.2k upvotes | 💬 234 comments

---

### 2. Sentiment Analysis Panel

**Overall Sentiment**: +0.78 (Positive) | **Confidence**: 94%

**Breakdown by Paragraph:**
| Paragraph | Score | Analysis |
|-----------|-------|----------|
| Para 1 | +0.85 | "Strong bullish tone" |
| Para 2 | +0.72 | "Revenue optimism" |
| Para 3 | +0.77 | "Growth expectations" |

**Key Phrases:**
- "beat expectations" (+0.9)
- "strong guidance" (+0.85)
- "AI growth" (+0.8)

**Emotion Indices:**
- Greed: 82/100
- Fear: 18/100
- Uncertainty: 25/100

---

### 3. Quality Metrics

**Overall Quality**: 87/100 [HIGH]

**Component Breakdown:**

| Component | Score | Visual |
|-----------|-------|--------|
| Credibility | 85/100 | ████████████████░░░░ |
| Content Depth | 72/100 | ██████████████░░░░░░ |
| Engagement | 91/100 | ██████████████████░░ |

**Performance**: +12 points vs category average (Above 78% of similar posts)

---

### 4. Market Impact

**Predicted MNQ1 Correlation**: +0.68

**Historical Similar Events:**
- Q3 2024 NVDA earnings: +1.2% (MNQ1)
- Q2 2024 AMD earnings: +0.8% (MNQ1)

**Sector Exposure:**
- Technology: 80%
- Semiconductors: 95%
- AI/ML: 70%

**Time Decay**: 98% relevant (2hr old)

### Related Stories Threading Algorithm

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
