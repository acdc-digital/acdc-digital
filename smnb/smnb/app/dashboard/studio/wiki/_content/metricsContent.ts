export const wikiContent: Record<string, string> = {
  overview: `# SMNB Metric Scoring Matrix - Complete Guide

## Executive Summary
The Metric Scoring Matrix is the core intelligence system that drives SMNB's content generation pipeline. It evaluates Reddit sources across 9 key metrics to optimize keyword extraction and post generation quality.

## Quick Reference - Metric Categories

| Category | Metrics | Purpose | Weight in Generation |
|----------|---------|---------|---------------------|
| **Efficiency** | Story Yield (SY), Signal Density (SD), Volume Reliability (VR) | Resource optimization | 45% |
| **Quality** | Engagement Potential (EP), Relevance Consistency (RC), Novelty Index (NI) | Content quality | 40% |
| **Growth** | Trend Propagation (TP), Conversion Momentum (CM), Feed Contribution (FC) | Strategic insights | 15% |

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

## Generation Pipeline Integration

### Priority Scoring Algorithm
The system uses weighted scoring to prioritize sources:

**Formula**: priority_score = (story_yield × 0.30) + (engagement_potential × 0.25) + (relevance_consistency × 0.20) + (novelty_index × 0.15) + (signal_density × 0.10)

### Content Generation Flow

| Stage | Metric Influence | Process |
|-------|------------------|---------|
| **Source Selection** | SY, VR, SD | Filter by efficiency thresholds |
| **Keyword Extraction** | EP, RC, NI | Weight keywords by engagement & relevance |
| **Content Creation** | All metrics | Metric-weighted prompt engineering |
| **Quality Validation** | EP, RC | Validate against expected performance |

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

## Future Enhancements

### Planned Metrics (Q4 2025)
- **Sentiment Alignment (SA)**: Match brand voice sentiment
- **Temporal Relevance (TR)**: Time-sensitive content scoring  
- **Community Health (CH)**: Source community vitality metrics

### Advanced Features
- Real-time metric visualization dashboard
- Predictive modeling for source performance
- Automated threshold optimization using ML
- Cross-platform metric correlation analysis

This comprehensive system ensures SMNB generates high-quality, relevant content while optimizing costs and maintaining brand alignment across all sources.`,

  metrics: `# Interactive Metrics Table

View the complete scoring matrix with real-time data and performance indicators.`,

  'story-yield': `# Story Yield (SY) Deep Dive

**Formula**: SY = Stories Extracted ÷ Posts Collected

**Current Performance**: 78/100

## Source Analysis
- r/MentalHealth: 81.8% efficiency
- r/GetDisciplined: 75.2% efficiency  
- r/Notion: 0% efficiency (flagged)

## Optimization Thresholds
- >60%: High priority processing
- 30-60%: Standard processing
- <30%: Reduced processing`,

  'feed-contribution': `# Feed Contribution (FC) Analysis

**Formula**: FC = Feed Items from Source ÷ Total Feed Items

**Current Performance**: 7/100

## Top Contributors
- r/GetDisciplined: ~7% of total feed
- r/Productivity: ~5% of total feed
- r/MentalHealth: ~4% of total feed`,

  'engagement-potential': `# Engagement Potential (EP) Metrics

**Formula**: EP = Σ(EngagementScore) ÷ N

**Current Performance**: 95/100 🔥

## Performance Indicators
- Viral Potential (80-100): Current category
- Strong Engagement (60-79): Target maintenance  
- Needs Work (<40): Not applicable`,

  'relevance-consistency': `# Relevance Consistency (RC) Tracking

**Formula**: RC = Relevant Stories ÷ Total Stories

**Current Performance**: 57/100 ⚠️

## Improvement Areas
- Better theme filtering needed
- Enhanced relevance algorithms
- Manual review process optimization`,

  'novelty-index': `# Novelty Index (NI) Innovation Tracking

**Formula**: NI = Unique Concepts ÷ Total Stories

**Current Performance**: 42/100

## Innovation Sources
- r/Therapy: High novelty concepts
- r/Zettelkasten: Unique methodologies
- r/Productivity: Mixed novelty levels`,

  'trend-propagation': `# Trend Propagation (TP) Viral Analysis

**Formula**: TP = Cross-posted Stories ÷ Total Stories from Source

**Current Performance**: 16/100

## Cross-Platform Opportunities
- Identify viral content patterns
- Optimize for multi-community reach
- Track propagation pathways`,

  'volume-reliability': `# Volume Reliability (VR) Consistency Metrics

**Formula**: VR = Posts Collected in Period ÷ Period Length

**Current Performance**: 71/100

## Reliability Tiers
- r/Evernote: 8 posts/day (stable)
- r/Productivity: 5 posts/day (good)
- r/ZenHabits: 1 post/week (low)`,

  'signal-density': `# Signal Density (SD) Cost Optimization

**Formula**: SD = Stories Extracted ÷ (Tokens Consumed ÷ 1000)

**Current Performance**: 59/100

## Cost Analysis
- r/Zettelkasten: 0.83 stories/1k tokens (excellent)
- r/MentalHealth: 0.71 stories/1k tokens (good)
- r/Notion: 0.00 stories/1k tokens (poor)`,

  'conversion-momentum': `# Conversion Momentum (CM) Trend Analysis

**Formula**: CM = (SY_current - SY_previous) ÷ Time_delta

**Current Performance**: 57/100

## Momentum Tracking
- Positive trends: r/Therapy (+15% SY growth)
- Stable sources: r/Productivity (±2% variance)
- Declining sources: r/Notion (-8% SY decline)`,

  extraction: `# Keyword Extraction Pipeline

## Process Overview
The extraction system uses metric scores to prioritize and weight content themes for optimal keyword identification.

## Extraction Weights
- Story Yield (30%): Efficiency filter
- Engagement Potential (25%): Quality booster  
- Relevance Consistency (20%): Brand alignment
- Novelty Index (15%): Innovation factor
- Signal Density (10%): Cost efficiency`,

  generation: `# Post Generation System

## Metric-Driven Content Creation
All generated content is influenced by the 9-metric scoring system to ensure quality, relevance, and cost efficiency.

## Generation Pipeline
1. Source prioritization via composite scoring
2. Keyword extraction with metric weights
3. Context building using performance data
4. LLM prompting with optimized parameters
5. Quality validation against metric thresholds`,

  pipeline: `# Data Pipeline Architecture

## End-to-End Flow
From Reddit source discovery through content generation, every step is optimized using our metric intelligence system.

## Key Stages
1. **Discovery**: VR + CM for source identification
2. **Collection**: SY + SD for efficiency filtering  
3. **Processing**: EP + RC for quality control
4. **Generation**: All metrics for optimal output
5. **Validation**: Performance feedback loop`
};