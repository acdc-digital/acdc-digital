export const unifiedScoringContent = `# SMNB Unified Scoring System

## Executive Summary

The Unified Scoring System combines two powerful intelligence engines that drive SMNB's content generation and stock analysis:

1. **Metric Scoring Matrix**: Evaluates Reddit sources across 9 key metrics to optimize keyword extraction and content quality
2. **Sentiment Scoring System**: Analyzes Reddit discussions about Nasdaq-100 stocks to calculate dynamic sentiment scores

Together, these systems provide comprehensive data-driven insights for content generation, source prioritization, and market sentiment tracking.

---

# Part 1: Metric Scoring Matrix

## Overview

The Metric Scoring Matrix is the core intelligence system that drives SMNB's content generation pipeline. It evaluates Reddit sources across 9 key metrics to optimize keyword extraction and post generation quality.

## Quick Reference - Metric Categories

| Category | Metrics | Purpose | Weight in Generation |
|----------|---------|---------|---------------------|
| **Efficiency** | Story Yield (SY), Signal Density (SD), Volume Reliability (VR) | Resource optimization | 45% |
| **Quality** | Engagement Potential (EP), Relevance Consistency (RC), Novelty Index (NI) | Content quality | 40% |
| **Growth** | Trend Propagation (TP), Conversion Momentum (CM), Feed Contribution (FC) | Strategic insights | 15% |

---

## Complete Metrics Breakdown

### Core Metrics Table

| Symbol | Metric | Score | Formula | Threshold | Impact on Generation |
|--------|--------|-------|---------|-----------|-------------------|
| **SY** | Story Yield | 78/100 | Stories ÷ Posts | >60% = High Priority | Source ranking & resource allocation |
| **FC** | Feed Contribution | 7/100 | Source Items ÷ Total Items | >7% = Major Source | Content diversification |
| **EP** | Engagement Potential | 95/100 | Avg(Engagement Scores) | >80% = Viral Potential | Tone & style selection |
| **RC** | Relevance Consistency | 57/100 | Relevant Stories ÷ Total | >70% = Highly Aligned | Topic filtering & brand alignment |
| **NI** | Novelty Index | 42/100 | Unique Concepts ÷ Total | >60% = Innovation Driver | Fresh angle prioritization |
| **TP** | Trend Propagation | 16/100 | Cross-posted ÷ Source Total | >25% = High Viral | Cross-platform strategy |
| **VR** | Volume Reliability | 71/100 | Posts ÷ Time Period | >5/day = Reliable | Processing consistency |
| **SD** | Signal Density | 59/100 | Stories ÷ (Tokens/1000) | >0.7 = Efficient | Cost optimization |
| **CM** | Conversion Momentum | 57/100 | (SY_now - SY_prev) ÷ Δt | >0.1 = Growing | Dynamic prioritization |

---

## Detailed Metric Explanations

### 1. Story Yield (SY) - Core Efficiency Metric
**Definition**: Percentage of collected posts that become usable content stories  
**Current Score**: 78/100 ⭐ (High Performance)

**Real Examples**:
- r/MentalHealth: 11 posts → 9 stories = 81.8% SY
- r/Notion: 4 posts → 0 stories = 0% SY

**Generation Impact**:
- Sources with SY >60% get priority processing
- SY <20% sources reduced to minimal processing
- Directly influences resource allocation algorithms

---

### 2. Engagement Potential (EP) - Quality Predictor
**Definition**: Average engagement score of posts that successfully become stories  
**Current Score**: 95/100 🔥 (Exceptional)

**Performance Tiers**:
- EP 80-100: Viral potential content
- EP 40-79: Steady engagement expected  
- EP <40: Needs optimization

**Generation Influence**:
- High EP (>80): Emphasizes engaging hooks, emotional connections
- Medium EP (40-80): Balanced approach with proven elements
- Low EP (<40): Focus on improving content style

---

### 3. Relevance Consistency (RC) - Brand Alignment
**Definition**: Percentage of extracted stories aligned with core themes  
**Current Score**: 57/100 ⚡ (Moderate Alignment)

**Theme Categories**:
- Productivity & Habits
- Mental Health & Therapy  
- Personal Development
- Technology & Tools

**Examples**:
- r/Zettelkasten: 4/5 stories relevant = 80% RC
- r/AppHookup: 1/6 stories relevant = 16.7% RC

**Quality Control**: RC <40% sources flagged for review or exclusion

---

### 4. Signal Density (SD) - Cost Efficiency
**Definition**: Useful stories generated per 1,000 API tokens consumed  
**Current Score**: 59/100 💰 (Acceptable Efficiency)

**Real Data**:
- r/Zettelkasten: 5 stories ÷ 6k tokens = 0.83 SD (Excellent)
- r/Notion: 0 stories ÷ 4k tokens = 0.00 SD (Poor)

**Cost Tiers**:
- SD >0.7: Highly cost-effective
- SD 0.3-0.7: Acceptable range
- SD <0.3: Consider reducing frequency

---

### 5. Volume Reliability (VR) - Consistency Metrics
**Definition**: Posts collected per time period  
**Current Score**: 71/100

**Reliability Tiers**:
- r/Evernote: 8 posts/day (stable)
- r/Productivity: 5 posts/day (good)
- r/ZenHabits: 1 post/week (low)

**Impact**: Reliable sources get consistent processing schedules

---

### 6. Novelty Index (NI) - Innovation Tracking
**Definition**: Unique concepts identified per total stories  
**Current Score**: 42/100

**Innovation Sources**:
- r/Therapy: High novelty concepts
- r/Zettelkasten: Unique methodologies
- r/Productivity: Mixed novelty levels

**Impact**: High novelty content gets fresh angle prioritization

---

### 7. Trend Propagation (TP) - Viral Analysis
**Definition**: Cross-posted stories divided by total stories from source  
**Current Score**: 16/100

**Cross-Platform Opportunities**:
- Identify viral content patterns
- Optimize for multi-community reach
- Track propagation pathways

**Impact**: High TP content gets cross-platform amplification

---

### 8. Feed Contribution (FC) - Source Impact
**Definition**: Feed items from source divided by total feed items  
**Current Score**: 7/100

**Top Contributors**:
- r/GetDisciplined: ~7% of total feed
- r/Productivity: ~5% of total feed
- r/MentalHealth: ~4% of total feed

**Impact**: Major sources influence content diversification

---

### 9. Conversion Momentum (CM) - Trend Analysis
**Definition**: Change in Story Yield over time  
**Current Score**: 57/100

**Momentum Tracking**:
- Positive trends: r/Therapy (+15% SY growth)
- Stable sources: r/Productivity (±2% variance)
- Declining sources: r/Notion (-8% SY decline)

**Impact**: Growing sources get increased priority

---

## Generation Pipeline Integration

### Priority Scoring Algorithm

The system uses weighted scoring to prioritize sources:

**Formula**: 
\`\`\`
priority_score = (story_yield × 0.30) 
               + (engagement_potential × 0.25) 
               + (relevance_consistency × 0.20) 
               + (novelty_index × 0.15) 
               + (signal_density × 0.10)
\`\`\`

### Content Generation Flow

| Stage | Metric Influence | Process |
|-------|------------------|---------|
| **Source Selection** | SY, VR, SD | Filter by efficiency thresholds |
| **Keyword Extraction** | EP, RC, NI | Weight keywords by engagement & relevance |
| **Content Creation** | All metrics | Metric-weighted prompt engineering |
| **Quality Validation** | EP, RC | Validate against expected performance |

---

### Real-Time Optimization

The system continuously adapts based on metric performance:

**Daily Adjustments**:
- Sources with declining CM (Conversion Momentum) get reduced priority
- High TP (Trend Propagation) content gets cross-platform amplification  
- VR (Volume Reliability) changes trigger processing schedule updates

**Weekly Reviews**:
- Metric thresholds adjusted based on performance data
- New source discovery based on emerging CM patterns
- Cost optimization using SD efficiency data

---

## Performance Monitoring Dashboard

### Key Performance Indicators

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| Average Story Yield | >65% | 78% | ✅ Above Target |
| Cost per Story (SD) | <$0.10 | $0.08 | ✅ Under Budget |
| Content Relevance | >70% | 57% | ⚠️ Needs Improvement |
| Processing Reliability | >90% | 95% | ✅ Excellent |

### Alerts & Thresholds

**Immediate Action Required**:
- SY drops below 30% for major sources
- SD exceeds $0.15 per story
- RC falls below 40% for 3+ days

**Weekly Review Triggers**:
- CM shows negative trend for 7+ days
- TP patterns indicate missed viral opportunities
- VR inconsistency affects >20% of sources

---

# Part 2: Reddit Sentiment Scoring System

## Overview

The Sentiment Scoring System analyzes Reddit discussions about Nasdaq-100 stocks over the past year to calculate dynamic sentiment scores. These scores reflect real-time community interest and perception, updating automatically every 3 hours.

---

## How Sentiment Scoring Works

### The Basics

Every stock starts with a **baseline allocation** based on its weight in the Nasdaq-100 index. This represents the "expected" sentiment score if nothing special is happening.

**Example**: Apple (AAPL) represents 10.63% of the Nasdaq-100, so its baseline is:
- 10.63% of 288,878 total points = **30,705 baseline points**

The system then adjusts this baseline up or down based on 4 key factors from Reddit data.

---

## The 4 Sentiment Factors

### 1. Mention Frequency (20% influence)

**What it measures**: How often people are talking about this stock  
**Why it matters**: More mentions = more mindshare and relevance

**Example**:
- 150 Reddit posts mention AAPL in the past year = High frequency
- 5 posts mention SIRI = Low frequency

**Impact**: Stocks mentioned more often get higher scores

---

### 2. Average Sentiment (40% influence)

**What it measures**: Whether people are saying positive or negative things  
**Why it matters**: This is the biggest factor - what people actually think about the stock

**Sentiment Scale**:
- **0.0** = Very negative (bearish, concerns, problems)
- **0.5** = Neutral (informational, mixed feelings)
- **1.0** = Very positive (bullish, excited, recommending)

**Examples**:
- "I love NVDA's new GPU release!" = Positive (0.85)
- "META's ad revenue is concerning" = Negative (0.35)
- "MSFT released quarterly earnings" = Neutral (0.50)

---

### 3. Engagement Level (20% influence)

**What it measures**: Total upvotes and comments on posts mentioning the stock  
**Why it matters**: High engagement means the community cares about this topic

**Example**:
- Post about TSLA gets 500 upvotes + 120 comments = High engagement
- Post about WBA gets 15 upvotes + 2 comments = Low engagement

**Impact**: Stocks generating more discussion get boosted

---

### 4. Momentum (20% influence)

**What it measures**: Are mentions increasing or decreasing over time?  
**Why it matters**: Shows whether interest is growing or fading

**Calculation**:
- Compare recent 3 months vs. previous 3 months
- Positive momentum = mentions are growing
- Negative momentum = mentions are declining

**Examples**:
- NVDA: 50 mentions → 120 mentions = +140% momentum 📈
- INTC: 80 mentions → 40 mentions = -50% momentum 📉

---

## Sentiment Score Calculation

### Performance Multiplier

The 4 factors combine to create a **multiplier** between 0.5x and 1.5x:

- **1.5x** = Maximum boost (amazing sentiment, high activity)
- **1.0x** = Neutral (meets baseline expectations)
- **0.5x** = Maximum penalty (poor sentiment, low activity)

### Final Score Formula

\`\`\`
Final Score = Baseline × Multiplier
\`\`\`

**Real Examples**:

| Stock | Baseline | Multiplier | Final Score | Reason |
|-------|----------|------------|-------------|--------|
| AAPL | 30,705 | 1.12x | 34,390 | Solid mentions + positive sentiment |
| NVDA | 24,414 | 1.28x | 31,250 | High engagement + growing momentum |
| INTC | 3,005 | 0.75x | 2,254 | Declining mentions + negative sentiment |
| WBA | 895 | 0.62x | 555 | Low engagement + poor sentiment |

---

## Color-Coded Performance Indicators

The sidebar shows color-coded sentiment scores to quickly identify performance:

| Color | Multiplier | Performance | Meaning |
|-------|------------|-------------|---------|
| 🟢 **Green** | ≥1.2x | Strong Positive | 20%+ above baseline |
| 🟢 **Light Green** | 1.05-1.2x | Positive | 5-20% above baseline |
| ⚪ **Gray** | 0.95-1.05x | Neutral | Within 5% of baseline |
| 🟠 **Orange** | 0.8-0.95x | Negative | 5-20% below baseline |
| 🔴 **Red** | <0.8x | Strong Negative | 20%+ below baseline |

**Interpretation**:
- **Green stocks**: Reddit community is bullish, high interest
- **Gray stocks**: On par with expected sentiment
- **Red/Orange stocks**: Community concerns, declining interest

---

## Score Updates & Change Tracking

### Automatic Updates

Sentiment scores recalculate **every 3 hours** to stay current with Reddit discussions.

### Percentage Change Indicators

The percentage next to each score shows how sentiment changed since the last calculation:

- **+2.34%** 🟢 = Sentiment improving
- **0.00%** ⚪ = No change
- **-1.87%** 🔴 = Sentiment declining

**Example Display**:
\`\`\`
AAPL 10.6%
34,390.23    ← Current sentiment score
+2.34%       ← Up 2.34% from 3 hours ago (sentiment improving!)
\`\`\`

---

## What Affects Sentiment Scores?

### Positive Drivers ⬆️

- Product launches generating excitement
- Strong earnings reports sparking discussion
- Positive news coverage shared on Reddit
- Growing community recommendations
- High engagement on stock-related posts

### Negative Drivers ⬇️

- Controversies or bad news
- Declining product interest
- Competitive threats discussed
- Bearish analysis gaining traction
- Reduced overall mentions

---

## Integration with Content Generation

### Combined Intelligence

The Metric Scoring Matrix and Sentiment Scoring System work together:

| Use Case | Metric System | Sentiment System | Combined Output |
|----------|---------------|------------------|-----------------|
| **Source Prioritization** | Story Yield, Signal Density | Mention Frequency, Engagement | High-value sources with trending topics |
| **Content Quality** | Engagement Potential, Relevance | Average Sentiment | Content aligned with community mood |
| **Trend Detection** | Trend Propagation, Conversion Momentum | Momentum, Engagement | Early identification of viral opportunities |
| **Cost Optimization** | Signal Density, Volume Reliability | Mention Frequency | Efficient resource allocation |

### Real-World Example

**Scenario**: NVDA launches new GPU architecture

1. **Sentiment System Detects**:
   - Mention Frequency: +250% (spike in discussions)
   - Average Sentiment: 0.92 (very positive)
   - Engagement: 5,000+ upvotes across posts
   - Momentum: +300% (explosive growth)

2. **Metric System Responds**:
   - Story Yield: Increases as more quality posts available
   - Engagement Potential: High (community excited)
   - Trend Propagation: Cross-posted to r/technology, r/stocks
   - Novelty Index: High (new product launch)

3. **Combined Action**:
   - Prioritize r/NVDA and r/hardware as sources
   - Generate content emphasizing technical innovation
   - Target keywords: "GPU architecture", "AI performance"
   - Publish timing: Immediate (high momentum window)

---

## Performance Dashboards

### Metric System KPIs

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| Average Story Yield | >65% | 78% | ✅ Above Target |
| Cost per Story | <$0.10 | $0.08 | ✅ Under Budget |
| Content Relevance | >70% | 57% | ⚠️ Needs Improvement |
| Processing Reliability | >90% | 95% | ✅ Excellent |

### Sentiment System KPIs

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| Stocks Tracked | 100 | 100 | ✅ Complete |
| Update Frequency | 3 hours | 3 hours | ✅ On Schedule |
| Data Freshness | <4 hours | 2.5 hours | ✅ Current |
| Sentiment Accuracy | >85% | 89% | ✅ High Quality |

---

## Future Enhancements

### Planned Metrics (Q4 2025)

**Metric System**:
- **Sentiment Alignment (SA)**: Match brand voice sentiment
- **Temporal Relevance (TR)**: Time-sensitive content scoring  
- **Community Health (CH)**: Source community vitality metrics

**Sentiment System**:
- **Multi-Platform Analysis**: Include Twitter, Discord, Stocktwits
- **Influencer Tracking**: Weight by user reputation/karma
- **Topic Clustering**: Group discussions by sub-topics
- **Predictive Modeling**: Forecast sentiment trends

### Advanced Features

**Unified Dashboard**:
- Real-time metric visualization
- Sentiment correlation analysis
- Automated threshold optimization using ML
- Cross-platform metric integration
- Predictive modeling for source performance

**AI-Powered Insights**:
- Automated anomaly detection
- Pattern recognition across metrics
- Recommendation engine for content topics
- Dynamic resource allocation optimization

---

## Key Takeaways

### Metric Scoring Matrix

1. **9 Key Metrics**: Comprehensive evaluation across efficiency, quality, growth
2. **Weighted Algorithm**: Priority scoring optimizes resource allocation
3. **Real-Time Adaptation**: Daily adjustments based on performance
4. **Cost Efficiency**: Signal Density tracking keeps costs under control
5. **Quality Control**: Relevance Consistency ensures brand alignment

### Sentiment Scoring System

1. **Baseline = Index Weight**: Fair starting point based on Nasdaq-100 weighting
2. **4 Factor Model**: Frequency, Sentiment, Engagement, Momentum
3. **Dynamic Updates**: Scores refresh every 3 hours
4. **Color Coding**: Visual performance indicators at a glance
5. **Trend Tracking**: Percentage changes show sentiment direction

### Combined Power

The Unified Scoring System provides comprehensive intelligence by combining:
- **Content optimization** (Metric System)
- **Market sentiment** (Sentiment System)
- **Resource efficiency** (Both systems)
- **Trend identification** (Both systems)
- **Quality assurance** (Both systems)

This integrated approach ensures SMNB generates high-quality, relevant content while staying aligned with market sentiment and community interests.

---

**Last Updated**: October 18, 2025  
**Version**: 2.0.0  
**System Status**: ✅ Operational  
**Next Review**: Weekly automated reports
`;
