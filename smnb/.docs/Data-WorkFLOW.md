# SMNB Data-Flow

## Getting Started

1. **User Opens SMNB** → Navigate to `http://localhost:8888`
2. **Authentication** → Sign in via Clerk (Google/GitHub OAuth)
3. **Land on Dashboard** → Main hub at `/dashboard`

## Live Feed Workflow

### Starting the Feed

1. **Click "Start Live Feed" button**
   - System fetches posts from Reddit (r/news, r/worldnews, etc.)
   - First posts appear in 2-6 seconds

### Data Enrichment Pipeline

The enrichment process transforms raw Reddit posts into actionable market intelligence:

| Stage | Process | Data Added | Purpose |
|-------|---------|------------|---------|
| **1. Ingestion** | Reddit API fetch | Raw post data, timestamps, engagement metrics | Baseline content acquisition |
| **2. Sentiment Analysis** | NLP processing via Anthropic | Sentiment score (-1 to +1), confidence level | Market impact assessment |
| **3. Quality Scoring** | Multi-factor algorithm | Quality score (0-100) based on: source credibility, engagement ratio, content depth | Filter noise from signals |
| **4. Priority Classification** | Trend detection & velocity analysis | Priority level (1-5), trending indicators | Surface breaking news |
| **5. Categorization** | Topic modeling & keyword extraction | Category labels, entity recognition | Sector-specific routing |
| **6. Market Correlation** | MNQ1 index comparison | Correlation coefficient, predicted impact | Trading signal generation |
| **7. Threading** | Similarity detection | Thread ID, related story links | Prevent duplicate narratives |

### Continuous Updates

- **Update Frequency**: New posts stream every 10-20 seconds 
- **Smart Scheduling**: Ensures diverse, high-quality content mix
- **Deduplication**: Intelligent threading prevents story repetition

## Analytics & Market Correlation

### MNQ1 Integration

All sentiment metrics are correlated with the **MNQ1 (E-mini Nasdaq-100 futures)**:

### Trading Analytics Display

| Metric | Calculation | Trading Signal |
|--------|------------|----------------|
| **Sentiment Delta** | Current vs 24hr average | Momentum indicator |
| **Volume Spike** | Post frequency vs baseline | Volatility predictor |
| **Quality-Weighted Sentiment** | (Sentiment × Quality Score) / 100 | Signal confidence |
| **Cross-Asset Correlation** | News sentiment vs MNQ1 movement | Divergence opportunities |

### Sentiment Score Determination

The sentiment scores displayed in the ticker are calculated through:

1. **Aggregate Sentiment** = Weighted average of all posts in last hour
2. **Weight Factors**:
   - Quality score (40% weight)
   - Engagement metrics (30% weight)  
   - Source credibility (30% weight)

### Percentage Display (vs Index Points)

The percentage shown represents:

```
Sentiment Impact % = (Sentiment Score × Historical Correlation) / MNQ1 Daily Range
```

- **Positive %**: Bullish news pressure on index
- **Negative %**: Bearish news pressure on index
- **Magnitude**: Potential index point movement based on historical patterns

## Latest News Ranking Algorithm

News items are ranked using the same multi-factor scoring:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Quality Score** | 35% | Content depth and source reliability |
| **Sentiment Strength** | 25% | Absolute value of sentiment (-1 to +1) |
| **Market Relevance** | 20% | Keywords matching market sectors |
| **Temporal Decay** | 10% | Freshness factor (exponential decay) |
| **Engagement Velocity** | 10% | Rate of engagement growth |

### Versus News Score

The "versus" score compares:

- **SMNB Sentiment** vs **Traditional Media Sentiment**
- Displayed as: `SMNB: +0.65 vs Reuters: +0.32 (Δ +0.33)`
- Indicates potential arbitrage opportunities when divergence is significant

## Data Flow Through User Actions

### User Action: "Start Live Feed"

```
User Click → API Request → Reddit Fetch → Raw Data Queue
    ↓
Enrichment Pipeline (7 stages)
    ↓
Database Write (Convex)
    ↓
Real-time Push → Client Update → UI Render
    ↓
Background: MNQ1 Correlation Job → Analytics Update
```

### User Action: "View Sentiment Analysis"

```
Page Load → Query Aggregated Sentiment → Fetch MNQ1 Data
    ↓
Calculate Correlation → Generate Visualization
    ↓
Display: Sentiment Score | vs Index % | Trend Arrow
```

### User Action: "Click News Item"

```
Item Selection → Fetch Full Enrichment Data
    ↓
Display: Original Content + All Enrichment Layers
    ↓
Log Interaction → Update Engagement Metrics
    ↓
Trigger: Related Stories Query → Thread Display
```

## Technical Architecture Notes

### Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Convex (real-time database + serverless functions)
- **AI Services**: Claude 3.5 Sonnet (primary), OpenAI GPT-4 (backup)
- **Market Data**: Real-time MNQ1 data via Finlight.me data provider API
- **Authentication**: Clerk (OAuth + session management)

### Scalability Considerations

- Horizontal scaling via Convex's automatic sharding
- Rate limiting on Reddit API (60 requests/minute)
- AI API request batching for cost optimization
- CDN caching for static assets and historical data