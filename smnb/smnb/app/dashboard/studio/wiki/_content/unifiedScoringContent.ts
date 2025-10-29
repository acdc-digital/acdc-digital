export const unifiedScoringContent = `# SMNB Unified Scoring System

## Executive Summary

The SMNB Unified Scoring System is a real-time, event-driven intelligence engine that transforms raw Reddit data into actionable insights for content generation. Built on an append-only event log architecture, the system processes enrichment events through a sophisticated pipeline that tracks four core Engine metrics across multiple time windows and dimensions.

**System Architecture Overview:**
1. **Data Enrichment Pipeline**: Reddit posts → NLP processing → Enrichment events → Event log
2. **Engine Metrics**: Real-time computation of RC, NI, TP, CM across 1m/5m/15m/60m windows
3. **Story Generation**: Host AI converts enriched posts into narrative content
4. **Sentiment Analysis**: Nasdaq-100 stock sentiment tracking from Reddit discussions

This document explains the complete data flow, metric calculations, and how everything integrates to power SMNB's content generation system.

---

# Part 1: Data Enrichment Pipeline

## Overview

Before any metrics can be calculated, raw Reddit posts must be enriched with semantic metadata. The enrichment pipeline is the foundation of the entire system, transforming unstructured social media content into structured, analyzable data.

## The Enrichment Process

### Step 1: Reddit Data Collection

Posts are collected from curated subreddit sources relevant to productivity, mental health, technology, and personal development. Each post contains:

- **Post ID**: Unique Reddit identifier
- **Session ID**: Tracking ID for the collection session
- **Subreddit**: Source community (e.g., r/Productivity, r/MentalHealth)
- **Content**: Post title, body, and metadata
- **Engagement**: Upvotes, comments, shares
- **Thread ID**: Parent discussion thread (for comment chains)

### Step 2: NLP & Semantic Enrichment

Each post is processed through natural language processing to extract semantic metadata:

**Enrichment Components:**

| Component | Description | Example Output |
|-----------|-------------|----------------|
| **Entities** | Named entities (people, tools, concepts) | ["Notion", "GTD", "David Allen"] |
| **Sentiment** | Emotional tone (0.0 = negative, 1.0 = positive) | 0.78 (positive) |
| **Quality** | Content quality score (0-100) | 85 |
| **Categories** | Topical classifications | ["productivity", "time-management"] |
| **Thread Context** | Related discussion chains | "thread_123abc" |

**Quality Scoring Factors:**
- Content depth and substance
- Writing clarity and coherence
- Community engagement signals
- Factual accuracy indicators
- Originality and insight value

### Step 3: Event Emission

Once enrichment is complete, the system emits a **post_enriched** event to the append-only event log:

\`\`\`typescript
{
  kind: "post_enriched",
  at: 1729872000000,                    // Timestamp (ms)
  post_id: "abc123",
  session_id: "session_456",
  subreddit: "Productivity",
  entities: ["Notion", "GTD"],
  sentiment: 0.78,
  quality: 85,
  categories: ["productivity", "time-management"],
  engagement: { upvotes: 42, comments: 8 },
  thread_id: "thread_123abc",
  processed: false                      // Not yet applied to metrics
}
\`\`\`

**Event Log Properties:**
- **Append-only**: Events are never modified or deleted
- **Ordered by timestamp**: Chronological processing
- **Idempotent processing**: Events can be replayed safely
- **Dimension-aware**: Events generate metrics for global, subreddit, session, entity, and thread dimensions

### Step 4: Story Creation

After enrichment, selected posts are transformed into narrative stories by the Host AI system. This generates a **story_created** event:

\`\`\`typescript
{
  kind: "story_created",
  at: 1729872060000,
  post_id: "abc123",
  story_id: "story_789",
  session_id: "session_456",
  subreddit: "Productivity",
  entities: ["Notion", "GTD"],
  sentiment: 0.78,
  quality: 85,
  categories: ["productivity"],
  story_themes: ["productivity-systems", "digital-tools"],
  story_concepts: ["knowledge management", "workflow optimization"],
  is_cross_post: false,
  processed: false
}
\`\`\`

**Story-Specific Metadata:**
- **story_themes**: High-level thematic categories (used for RC calculation)
- **story_concepts**: Unique ideas/concepts (used for NI calculation)
- **is_cross_post**: Whether story appeared in multiple subreddits (used for TP calculation)

## Event Processing Flow

### The Event Applier (Combiner)

The Event Applier is a scheduled action that runs every 10 seconds (or immediately if a large batch is pending). It's responsible for consuming unprocessed events and updating metric buckets.

**Processing Steps:**

1. **Fetch Unprocessed Events** (batch of 2,000)
   - Query events where `processed = false`
   - Ordered by timestamp (`at` field)
   - Starting after last watermark

2. **Group by Time Windows**
   - Round event timestamps to bucket boundaries
   - Create groups for 1m, 5m, 15m, 60m windows
   - Each event generates 4 buckets (one per window)

3. **Group by Dimensions**
   - **Global**: All events combined
   - **Subreddit**: Per-subreddit metrics (e.g., r/Productivity)
   - **Session**: Per-collection-session metrics
   - **Entity**: Per-entity metrics (e.g., "Notion" mentions)
   - **Thread**: Per-discussion-thread metrics

4. **Compute Deltas**
   - Calculate incremental changes for each group
   - Stories total, aligned stories, concepts, cross-posts
   - Sentiment aggregations with quality weighting

5. **Upsert Buckets**
   - Merge deltas into existing buckets (or create new)
   - Recalculate percentage metrics (RC, TP, CM)
   - Update counts and aggregates

6. **Mark Events Processed**
   - Set `processed = true` on all events
   - Update watermark with last processed timestamp
   - Track processing count and status

### Processing Watermark

The system maintains a watermark to track processing progress and ensure idempotent operations:

\`\`\`typescript
{
  processor_id: "event_applier",
  last_processed_at: 1729872000000,    // Last event timestamp
  last_event_id: "evt_123",            // Last event ID
  processed_count: 2000,               // Events in this batch
  last_run_at: 1729872100000,          // When applier last ran
  status: "idle" | "running" | "error",
  error_message: undefined
}
\`\`\`

### Time Window Buckets

Events are aggregated into time buckets for efficient querying:

| Window | Bucket Size | Use Case | Data Retention |
|--------|-------------|----------|----------------|
| **1m** | 1 minute | Real-time monitoring | 1 hour (60 buckets) |
| **5m** | 5 minutes | Recent trends | 5 hours (60 buckets) |
| **15m** | 15 minutes | Session analysis | 15 hours (60 buckets) |
| **60m** | 60 minutes | Historical patterns | 2.5 days (60 buckets) |

**Bucket Structure:**
- Each bucket stores **running totals** (not just current window data)
- Metrics are recalculated on each delta merge
- Buckets are dimension-specific (global, subreddit, session, etc.)

## Enrichment Event Types

The system supports four event types:

### 1. post_enriched
**Triggered**: After NLP processing completes  
**Purpose**: Track posts entering the system  
**Used For**: Story yield calculations (CM metric)

### 2. story_created
**Triggered**: After Host AI generates narrative  
**Purpose**: Track story generation and thematic metadata  
**Used For**: RC, NI, TP metric calculations

### 3. sentiment_updated
**Triggered**: When sentiment scores are recalculated  
**Purpose**: Track sentiment changes over time  
**Used For**: Average sentiment calculations

### 4. engagement_updated
**Triggered**: When upvote/comment counts change (debounced)  
**Purpose**: Track community engagement evolution  
**Used For**: Engagement-weighted sentiment calculations

## Data Flow Diagram

\`\`\`
Reddit API
    ↓
[Collection Session]
    ↓
[Reddit Posts] → [NLP Enrichment] → [post_enriched event] → [Event Log]
    ↓                                                              ↓
[Story Selection] → [Host AI] → [story_created event] → [Event Log]
                                                              ↓
                                        [Event Applier (10s interval)]
                                                              ↓
                                        [Compute Deltas by Window & Dimension]
                                                              ↓
                                        [Upsert stat_buckets with Running Totals]
                                                              ↓
                                        [Update Processing Watermark]
                                                              ↓
                                        [Mark Events as Processed]
                                                              ↓
                            [UI Queries stat_buckets for Real-Time Metrics]
\`\`\`

---

# Part 2: Engine Metrics (RC, NI, TP, CM)

## Overview

The Engine tracks **four core metrics** that measure content quality, novelty, reach, and growth. These metrics are computed in real-time from enrichment events and stored in time-windowed buckets for each dimension.

**The Four Metrics:**

| Symbol | Metric Name | Type | Range | Purpose |
|--------|-------------|------|-------|---------|
| **RC** | Relevance Consistency | Percentage | 0-100% | Measures theme alignment |
| **NI** | Novelty Index | Count | 0-∞ | Tracks unique concepts |
| **TP** | Trend Propagation | Percentage | 0-100% | Monitors viral potential |
| **CM** | Conversion Momentum | Percentage | -100% to +100% | Tracks story yield change |

---

## Metric 1: RC (Relevance Consistency)

### Definition

**Relevance Consistency** measures the percentage of stories that align with SMNB's core thematic categories. It answers the question: *"Are we generating content that matches our brand identity?"*

### Calculation Formula

\`\`\`
RC = (stories_aligned / stories_total) × 100
\`\`\`

Where:
- **stories_aligned**: Stories with at least one `story_theme` tag
- **stories_total**: Total stories created in the time window

### How Alignment is Determined

A story is considered "aligned" if the `story_themes` array contains at least one theme tag when the `story_created` event is emitted. Theme tags are generated by the Host AI during story creation based on semantic analysis.

**Common Theme Tags:**
- `productivity-systems`
- `mental-health`
- `digital-tools`
- `habit-formation`
- `knowledge-management`
- `time-management`
- `mindfulness`
- `tech-workflows`

### Example Calculation

**Scenario**: In a 5-minute window, 10 stories are created

| Story ID | Themes | Aligned? |
|----------|--------|----------|
| story_001 | ["productivity-systems", "digital-tools"] | ✅ Yes |
| story_002 | ["mental-health"] | ✅ Yes |
| story_003 | [] | ❌ No |
| story_004 | ["habit-formation", "mindfulness"] | ✅ Yes |
| story_005 | ["tech-workflows"] | ✅ Yes |
| story_006 | [] | ❌ No |
| story_007 | ["knowledge-management"] | ✅ Yes |
| story_008 | ["productivity-systems"] | ✅ Yes |
| story_009 | [] | ❌ No |
| story_010 | ["time-management"] | ✅ Yes |

**Result**: 7 aligned / 10 total = **70% RC**

### Interpretation

| RC Value | Performance | Meaning |
|----------|-------------|---------|
| **80-100%** | 🟢 Excellent | Highly consistent brand alignment |
| **60-79%** | 🟡 Good | Solid thematic consistency |
| **40-59%** | 🟠 Fair | Mixed relevance, needs tuning |
| **0-39%** | 🔴 Poor | Off-topic content, review sources |

### Impact on Content Strategy

- **High RC (>70%)**: Sources and topics are well-aligned; maintain current strategy
- **Medium RC (50-70%)**: Some drift; review theme tags and adjust selection criteria
- **Low RC (<50%)**: Significant misalignment; audit sources and refine enrichment prompts

### Real-Time Monitoring

The Engine UI displays RC for:
- **Global**: Across all sessions and sources
- **Per-Subreddit**: Which communities provide aligned content
- **Per-Session**: Quality of individual collection runs
- **Per-Entity**: Which entities drive thematic stories

---

## Metric 2: NI (Novelty Index)

### Definition

**Novelty Index** counts the number of unique concepts identified across all stories in a time window. It measures content diversity and innovation, answering: *"Are we discovering fresh ideas or repeating ourselves?"*

### Calculation Formula

\`\`\`
NI = count(unique_concepts)
\`\`\`

Where:
- **unique_concepts**: Set of distinct concept strings (case-insensitive, trimmed)
- Concepts are extracted from `story_concepts` array in `story_created` events
- Duplicates within the window are counted only once

### How Concepts are Extracted

When the Host AI generates a story, it identifies key concepts, methodologies, and ideas from the source post. These are emitted as the `story_concepts` array.

**Example Concepts:**
- "knowledge management"
- "workflow optimization"
- "pomodoro technique"
- "zettelkasten method"
- "cognitive load management"
- "habit stacking"
- "deep work"

### Example Calculation

**Scenario**: In a 15-minute window, 8 stories are created

| Story ID | Concepts | Unique Additions |
|----------|----------|------------------|
| story_001 | ["knowledge management", "workflow optimization"] | +2 (NI = 2) |
| story_002 | ["pomodoro technique"] | +1 (NI = 3) |
| story_003 | ["knowledge management", "zettelkasten method"] | +1 (NI = 4) |
| story_004 | ["cognitive load management"] | +1 (NI = 5) |
| story_005 | ["habit stacking", "deep work"] | +2 (NI = 7) |
| story_006 | ["workflow optimization"] | +0 (NI = 7, duplicate) |
| story_007 | ["pomodoro technique", "time blocking"] | +1 (NI = 8) |
| story_008 | ["deep work"] | +0 (NI = 8, duplicate) |

**Result**: **NI = 8 unique concepts**

### Interpretation

| NI Value | Performance | Meaning |
|----------|-------------|---------|
| **40+** | 🟢 Excellent | High diversity, many unique ideas |
| **20-39** | 🟡 Good | Healthy variety of concepts |
| **10-19** | 🟠 Fair | Some repetition, limited novelty |
| **0-9** | 🔴 Poor | Highly repetitive content |

*Note: Interpretation depends on window size and story volume. A 1-minute window naturally has lower NI than a 60-minute window.*

### Impact on Content Strategy

- **High NI**: Sources are providing diverse, innovative content
- **Low NI**: Content is becoming repetitive; expand sources or adjust selection
- **Declining NI over time**: Existing sources are exhausting fresh ideas; seek new communities

### Concept Merging

Concepts are stored as a **Set** in each bucket, meaning:
- When a bucket is updated with new events, concepts are merged with existing concepts
- Duplicate concepts are automatically filtered
- Concept strings are normalized (lowercase, trimmed) before comparison

**Merging Example:**
\`\`\`typescript
Existing bucket concepts: ["workflow optimization", "deep work"]
New event concepts: ["deep work", "habit stacking"]
Merged concepts: ["workflow optimization", "deep work", "habit stacking"]
Updated NI: 3
\`\`\`

---

## Metric 3: TP (Trend Propagation)

### Definition

**Trend Propagation** measures the percentage of stories that originated as cross-posts (posts appearing in multiple subreddits). It indicates viral potential and cross-community reach, answering: *"Are we capturing trending conversations?"*

### Calculation Formula

\`\`\`
TP = (stories_cross_post / stories_total) × 100
\`\`\`

Where:
- **stories_cross_post**: Stories where `is_cross_post = true`
- **stories_total**: Total stories created in the time window

### How Cross-Posts are Identified

A post is flagged as a cross-post during data collection if:
- The same content appears in multiple subreddits
- Reddit's native cross-post indicator is present
- The post explicitly references another subreddit

This flag is carried through enrichment and included in the `story_created` event.

### Example Calculation

**Scenario**: In a 60-minute window, 50 stories are created

| Cross-Post Status | Count | Percentage |
|-------------------|-------|------------|
| Cross-posted stories (`is_cross_post = true`) | 12 | 24% |
| Original stories (`is_cross_post = false`) | 38 | 76% |
| **Total stories** | **50** | **100%** |

**Result**: 12 cross-posted / 50 total = **24% TP**

### Interpretation

| TP Value | Performance | Meaning |
|----------|-------------|---------|
| **30%+** | 🟢 Excellent | High viral potential, trending content |
| **15-29%** | 🟡 Good | Moderate cross-community reach |
| **5-14%** | 🟠 Fair | Limited propagation |
| **0-4%** | 🔴 Low | Isolated content, low viral reach |

### Impact on Content Strategy

- **High TP**: Content has broad appeal; prioritize cross-post sources
- **Low TP**: Content is niche; consider whether to expand reach or maintain focus
- **Sudden TP spike**: Viral trend detected; capitalize on momentum

### TP and Content Amplification

Cross-posted content indicates:
- **Community validation**: Multiple communities find the content valuable
- **Viral potential**: Ideas spreading organically across Reddit
- **Multi-angle stories**: Topics with broad relevance

**Strategic Use:**
- Prioritize cross-posted stories for featured content
- Analyze which topics drive cross-community sharing
- Identify subreddit combinations that amplify reach

---

## Metric 4: CM (Conversion Momentum)

### Definition

**Conversion Momentum** tracks the rate of change in story yield (stories per post) compared to the previous bucket. It measures efficiency trends, answering: *"Is our content generation improving or declining?"*

### Calculation Formula

\`\`\`
Story Yield = stories_total / posts_total

CM = ((Story Yield_current - Story Yield_previous) / Story Yield_previous) × 100
\`\`\`

Where:
- **Story Yield**: Ratio of stories created to posts processed
- **CM**: Percentage change from previous bucket in same dimension
- Positive CM = improving efficiency
- Negative CM = declining efficiency

### Understanding Story Yield

**Story Yield** is the foundation of CM. It represents conversion efficiency:

\`\`\`
Story Yield = 0.75  →  75% of posts became stories
Story Yield = 0.50  →  50% of posts became stories
Story Yield = 0.25  →  25% of posts became stories
\`\`\`

### Example Calculation

**Scenario**: 5-minute window buckets over 15 minutes

| Time Window | Posts | Stories | Story Yield | CM Calculation |
|-------------|-------|---------|-------------|----------------|
| 12:00-12:05 | 20 | 12 | 0.60 (60%) | N/A (baseline) |
| 12:05-12:10 | 25 | 18 | 0.72 (72%) | (0.72-0.60)/0.60 = **+20% CM** |
| 12:10-12:15 | 18 | 11 | 0.61 (61%) | (0.61-0.72)/0.72 = **-15.3% CM** |

**Interpretation**:
- First bucket establishes 60% story yield baseline
- Second bucket improves to 72% (+20% momentum)
- Third bucket drops to 61% (-15.3% momentum)

### Interpretation

| CM Value | Performance | Meaning |
|----------|-------------|---------|
| **+20% or more** | 🟢 Excellent | Rapidly improving efficiency |
| **+5% to +19%** | 🟡 Good | Steady improvement |
| **-5% to +5%** | ⚪ Stable | Consistent performance |
| **-6% to -19%** | 🟠 Declining | Efficiency dropping |
| **-20% or worse** | 🔴 Poor | Significant degradation |

### Impact on Content Strategy

**Positive CM (+)**:
- Source quality improving
- Better post selection
- Enhanced enrichment accuracy
- Growing momentum to maintain

**Negative CM (-)**:
- Source quality declining
- Post selection needs adjustment
- Enrichment misalignment
- Review recent changes

**Zero CM (0%)**:
- Stable, predictable performance
- Mature, well-tuned system
- No intervention needed

### CM and Session Analysis

CM is particularly useful for:
- **Session comparison**: Which collection runs are most efficient?
- **Subreddit trends**: Which communities have improving/declining yields?
- **Time-of-day patterns**: When is story generation most effective?
- **Entity focus**: Do certain topics drive higher conversion?

### CM Calculation Edge Cases

**First Bucket**: CM = 0% (no previous bucket to compare)

**Zero Previous Yield**: If previous bucket had 0 stories, CM = 0% (avoid division by zero)

**Large Swings**: CM can exceed ±100% with dramatic changes:
- Story Yield: 0.20 → 0.60 = +200% CM (tripled)
- Story Yield: 0.60 → 0.15 = -75% CM (dropped to 1/4)

---

## Engine Metrics Dashboard

### Real-Time Display

The Engine UI shows current metrics across four cards:

| Metric | Display Format | Color Coding |
|--------|----------------|--------------|
| **RC** | 72.5% | Green if >70%, Yellow if 50-70%, Red if <50% |
| **NI** | 42 concepts | White (informational) |
| **TP** | 18.3% | Green if >20%, Yellow if 10-20%, Red if <10% |
| **CM** | +8.7% | Green if positive, Red if negative |

### Time Window Selector

Users can view metrics across different time windows:

- **1m**: Real-time monitoring (last 60 minutes, 1-minute buckets)
- **5m**: Recent trends (last 5 hours, 5-minute buckets)
- **15m**: Session analysis (last 15 hours, 15-minute buckets)
- **60m**: Historical patterns (last 2.5 days, 60-minute buckets)

### Dimension Filtering

Metrics can be filtered by dimension:

| Dimension | Example | Use Case |
|-----------|---------|----------|
| **Global** | All data combined | Overall system health |
| **Subreddit** | r/Productivity | Source performance comparison |
| **Session** | session_abc123 | Individual collection run analysis |
| **Entity** | "Notion" | Entity-specific trends |
| **Thread** | thread_xyz789 | Discussion chain analysis |

### Time Series Visualization

Each metric has a sparkline chart showing the last 60 buckets:

\`\`\`
RC Over Time (5m window):
75% ▂▃▅▆▆▅▄▃▅▆▇▆▅▄▃ 68%

NI Over Time (5m window):
35 ▁▂▃▄▅▆▇▆▅▄▃▂▃▄▅ 48

TP Over Time (5m window):
12% ▂▃▂▁▃▄▅▆▅▄▃▄▅▆▇ 22%

CM Over Time (5m window):
-5% ▃▄▅▃▂▁▂▃▄▅▆▅▄▃▂ +3%
\`\`\`

---

## Metric Interdependencies

The four metrics are interconnected and influence each other:

### RC ↔ NI Relationship

- **High RC + High NI**: Ideal state—aligned content with diverse concepts
- **High RC + Low NI**: Content is on-brand but repetitive; expand topics
- **Low RC + High NI**: Diverse but off-brand; refine theme detection
- **Low RC + Low NI**: Poor state—both alignment and novelty need improvement

### TP ↔ RC Relationship

- **High TP + High RC**: Viral content that's on-brand; amplify these stories
- **High TP + Low RC**: Trending but off-topic; decide if worth covering
- **Low TP + High RC**: Niche but aligned; maintain for brand identity
- **Low TP + Low RC**: Low-value content; deprioritize these sources

### CM ↔ All Metrics

Conversion Momentum affects the rate at which other metrics change:

- **Positive CM**: System is improving; RC, NI, TP trends likely positive
- **Negative CM**: System degrading; monitor other metrics for root cause
- **Stable CM**: Predictable performance; other metrics should be steady

### Strategic Metric Combinations

**Content Quality Indicators:**
- RC > 70% + NI > 30 = High-quality, on-brand, diverse content
- RC < 50% + NI < 15 = Low-quality, off-brand, repetitive content

**Growth Indicators:**
- CM > +10% + TP > 20% = Accelerating viral content generation
- CM < -10% + TP < 10% = Declining performance, low reach

**Source Health Indicators:**
- RC > 70% + CM > 0% = Healthy, improving source
- RC < 50% + CM < 0% = Underperforming source, review or remove

---

## Advanced Metric Analysis

### Weighted Sentiment Calculations

While not one of the four core metrics, **average sentiment** is tracked alongside them using a sophisticated weighting system.

**Sentiment Weighting Formula:**
\`\`\`
Weight = (Quality × 0.4) + (Engagement × 0.3) + (Credibility × 0.3)

Weighted Sentiment = Σ(sentiment × weight) / Σ(weight)
\`\`\`

**Weighting Factors:**

| Factor | Range | Normalization | Weight % |
|--------|-------|---------------|----------|
| **Quality** | 0-100 | Divide by 100 → 0-1 | 40% |
| **Engagement** | 0-∞ | log₁₀(total+1)/2 → 0-1 | 30% |
| **Credibility** | 0-1 | Assumed 0.5 for now | 30% |

**Why Weighted Sentiment?**
- High-quality posts have more reliable sentiment
- Highly-engaged posts represent broader sentiment
- Credible sources carry more weight

**Example:**
\`\`\`
Post A: sentiment=0.8, quality=90, upvotes=50, comments=10
  Weight = (0.9 × 0.4) + (0.47 × 0.3) + (0.5 × 0.3) = 0.651
  Contribution = 0.8 × 0.651 = 0.521

Post B: sentiment=0.6, quality=60, upvotes=5, comments=1
  Weight = (0.6 × 0.4) + (0.20 × 0.3) + (0.5 × 0.3) = 0.450
  Contribution = 0.6 × 0.450 = 0.270

Average Weighted Sentiment = (0.521 + 0.270) / (0.651 + 0.450) = 0.72
\`\`\`

### Variance and Statistical Helpers

Each bucket tracks variance helpers for statistical analysis:

\`\`\`typescript
variance_helper: {
  sum_x: Σ(sentiment),
  sum_x2: Σ(sentiment²),
  n: count(sentiment_events)
}
\`\`\`

**Variance Calculation:**
\`\`\`
Mean (μ) = sum_x / n
Variance (σ²) = (sum_x2 / n) - μ²
Standard Deviation (σ) = √(σ²)
\`\`\`

**Use Cases:**
- Detect sentiment volatility (high variance = mixed opinions)
- Identify consensus topics (low variance = agreement)
- Flag controversial content (high variance + high engagement)

---

## Metric Thresholds and Alerts

### Performance Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **RC** | ≥70% | <60% | <40% |
| **NI** | ≥25/window | <15/window | <8/window |
| **TP** | ≥15% | <10% | <5% |
| **CM** | -5% to +15% | <-10% or >+30% | <-20% or >+50% |

### Alert Triggers

**Immediate Action Required:**
- RC drops below 40% for 3+ consecutive buckets
- NI falls below 8 for 1-hour window
- TP remains below 5% for 15m+ window
- CM shows <-20% decline

**Review Recommended:**
- Any metric in "Warning" range for 5+ consecutive buckets
- CM volatility: swings of >30% between adjacent buckets
- Sentiment variance spike: σ >0.3 with low story yield

### Automated Responses

The system can trigger automated adjustments based on metric patterns:

**Low RC Recovery:**
- Increase theme detection sensitivity
- Adjust source selection filters
- Review recent theme tag changes

**Low NI Recovery:**
- Expand subreddit sources
- Reduce concept merging aggressiveness
- Prioritize diverse entity extraction

**Low TP Recovery:**
- Increase weight on cross-posted content
- Monitor trending topics more aggressively
- Adjust viral potential scoring

**Negative CM Recovery:**
- Review recent enrichment changes
- Analyze failed story conversions
- Compare session performance patterns

---

# Part 3: Reddit Sentiment Scoring System

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

# Part 3: Reddit Sentiment Scoring System

## Overview

The Sentiment Scoring System is a parallel intelligence pipeline that analyzes Reddit discussions about Nasdaq-100 stocks to calculate dynamic sentiment scores. While the Engine metrics (RC, NI, TP, CM) focus on SMNB's content generation, sentiment scoring tracks market mindshare and community perception of publicly-traded companies.

**Key Differences from Engine Metrics:**
- **Separate data source**: Uses Reddit stock discussions, not productivity/mental health posts
- **Different purpose**: Market sentiment tracking vs. content quality measurement
- **Update frequency**: Every 3 hours vs. real-time streaming
- **Static baseline**: Index-weighted starting points vs. event-driven computation

---

## How Sentiment Scoring Works

### The Baseline Allocation Model

Every Nasdaq-100 stock begins with a **baseline allocation** derived from its official index weight. This represents the "expected" sentiment if the stock were to receive discussion proportional to its market cap importance.

**Baseline Formula:**
\`\`\`
Total Points Pool = 288,878 points
Baseline Points = Stock's Index Weight (%) × Total Points Pool
\`\`\`

**Example: Apple (AAPL)**
- Index weight: 10.63%
- Baseline: 0.1063 × 288,878 = **30,705 points**

**Why this approach?**
- **Fair starting point**: Larger companies naturally get more discussion
- **Normalized comparison**: Scores reflect performance relative to expectations
- **Market-weighted**: Aligns with actual Nasdaq-100 composition

### The Performance Multiplier

The baseline is then adjusted by a **multiplier** (0.5x to 1.5x) computed from four sentiment factors. The multiplier represents whether a stock is over-performing (>1.0x) or under-performing (<1.0x) community expectations.

**Final Score Formula:**
\`\`\`
Final Sentiment Score = Baseline Points × Multiplier
\`\`\`

**Multiplier Bounds:**
- **1.5x maximum**: 50% boost for exceptional sentiment
- **1.0x neutral**: Exactly at baseline expectations
- **0.5x minimum**: 50% penalty for poor sentiment

---

## The Four Sentiment Factors

### Factor 1: Mention Frequency (20% influence)

**What it measures**: How often the stock is discussed on Reddit  
**Lookback period**: Past 12 months of posts  
**Why it matters**: More mentions = greater mindshare and relevance

**Scoring Methodology:**
1. Count total Reddit posts mentioning the stock ticker or company name
2. Compare to other Nasdaq-100 stocks
3. Normalize to 0-1 scale where:
   - Highest mention count = 1.0
   - Lowest mention count = 0.0
   - All others distributed proportionally

**Example Data:**
| Stock | Mentions (12mo) | Normalized Score |
|-------|-----------------|------------------|
| NVDA | 1,250 | 1.00 (highest) |
| AAPL | 980 | 0.78 |
| TSLA | 850 | 0.68 |
| MSFT | 720 | 0.58 |
| META | 420 | 0.34 |
| WBA | 45 | 0.04 (lowest) |

**Interpretation:**
- High frequency (>0.7): Stock is a regular conversation topic
- Medium frequency (0.3-0.7): Moderate community interest
- Low frequency (<0.3): Limited discussion, niche interest

### Factor 2: Average Sentiment (40% influence)

**What it measures**: Whether community sentiment is positive or negative  
**Lookback period**: Past 12 months of posts  
**Why it matters**: This is the most important factor—what people actually think

**Sentiment Scale:**
- **1.0** = Very positive (bullish, excited, recommending)
- **0.5** = Neutral (informational, mixed feelings)
- **0.0** = Very negative (bearish, concerns, problems)

**Calculation:**
\`\`\`
Average Sentiment = Σ(post_sentiment × post_weight) / Σ(post_weight)
\`\`\`

Where weight accounts for:
- Post quality score
- Engagement (upvotes/comments)
- Recency (recent posts weighted higher)

**Example Sentiment Analysis:**

| Stock | Avg Sentiment | Community Tone |
|-------|---------------|----------------|
| NVDA | 0.87 | Very positive—AI boom excitement |
| AAPL | 0.72 | Positive—solid brand loyalty |
| MSFT | 0.68 | Positive—steady enterprise trust |
| META | 0.52 | Neutral—mixed on privacy issues |
| INTC | 0.35 | Negative—competitive concerns |
| WBA | 0.28 | Negative—declining retail |

**Sentiment Examples:**
- **Positive (0.85)**: "NVDA's new GPU release is game-changing for AI workloads!"
- **Neutral (0.50)**: "MSFT released quarterly earnings, revenue up 8% YoY"
- **Negative (0.30)**: "META's ad revenue guidance is concerning for Q3"

### Factor 3: Engagement Level (20% influence)

**What it measures**: Total community engagement on posts mentioning the stock  
**Metrics**: Upvotes + comments (weighted)  
**Why it matters**: High engagement means the community cares deeply about this topic

**Engagement Score Formula:**
\`\`\`
Engagement Score = log₁₀(total_upvotes + (total_comments × 2) + 1) / 4
\`\`\`

**Why logarithmic scaling?**
- Prevents viral posts from dominating
- Treats 100 → 1,000 upvotes similar to 1,000 → 10,000
- Captures "order of magnitude" interest

**Example Data:**

| Stock | Total Upvotes | Total Comments | Engagement Score |
|-------|---------------|----------------|------------------|
| TSLA | 45,000 | 12,000 | 0.92 (highest) |
| NVDA | 38,000 | 8,500 | 0.87 |
| AAPL | 22,000 | 5,200 | 0.76 |
| MSFT | 15,000 | 3,800 | 0.69 |
| INTC | 8,000 | 1,200 | 0.54 |
| WBA | 500 | 120 | 0.21 (lowest) |

**Interpretation:**
- High engagement (>0.75): Community passionately discussing
- Medium engagement (0.40-0.75): Steady, consistent interest
- Low engagement (<0.40): Limited community energy

### Factor 4: Momentum (20% influence)

**What it measures**: Is discussion increasing or decreasing over time?  
**Comparison**: Recent 3 months vs. previous 3 months  
**Why it matters**: Shows whether interest is growing or fading

**Momentum Formula:**
\`\`\`
Momentum = (mentions_recent_3mo - mentions_prev_3mo) / mentions_prev_3mo
\`\`\`

**Normalization:**
- Clamp to -1.0 to +1.0 range
- +1.0 = mentions doubled or more
- 0.0 = no change
- -1.0 = mentions halved or more

**Example Data:**

| Stock | Prev 3mo | Recent 3mo | Raw Momentum | Normalized |
|-------|----------|------------|--------------|------------|
| NVDA | 280 | 650 | +132% | +1.00 📈 |
| PLTR | 45 | 85 | +89% | +0.89 📈 |
| ARM | 20 | 35 | +75% | +0.75 📈 |
| AAPL | 380 | 420 | +11% | +0.11 ↗️ |
| MSFT | 290 | 285 | -2% | -0.02 → |
| INTC | 180 | 95 | -47% | -0.47 📉 |
| WBA | 25 | 8 | -68% | -0.68 📉 |

**Interpretation:**
- **Strong positive (>+0.5)**: Rapidly growing interest, trending topic
- **Moderate positive (+0.1 to +0.5)**: Steady growth
- **Stable (-0.1 to +0.1)**: Consistent discussion levels
- **Moderate negative (-0.5 to -0.1)**: Declining interest
- **Strong negative (<-0.5)**: Rapidly fading relevance

---

## Computing the Multiplier

The four factors are combined using weighted averaging to produce the final multiplier:

**Multiplier Formula:**
\`\`\`
Raw Score = (Mention Frequency × 0.20) + 
            (Average Sentiment × 0.40) + 
            (Engagement Level × 0.20) + 
            (Momentum × 0.20)

Multiplier = 0.5 + (Raw Score × 1.0)
\`\`\`

**Why this weighting?**
- **Sentiment (40%)**: What people think is most important
- **Frequency, Engagement, Momentum (20% each)**: Supporting indicators

**Multiplier Range:**
- If Raw Score = 0.0 → Multiplier = 0.5x (worst case)
- If Raw Score = 0.5 → Multiplier = 1.0x (neutral)
- If Raw Score = 1.0 → Multiplier = 1.5x (best case)

### Example Calculation: NVDA (Strong Positive)

| Factor | Value | Weight | Contribution |
|--------|-------|--------|--------------|
| Mention Frequency | 1.00 | 20% | 0.200 |
| Average Sentiment | 0.87 | 40% | 0.348 |
| Engagement Level | 0.87 | 20% | 0.174 |
| Momentum | 1.00 | 20% | 0.200 |
| **Raw Score** | — | — | **0.922** |

**Multiplier** = 0.5 + 0.922 = **1.42x**

**Final Score:**
- Baseline: 24,414 points (8.45% index weight)
- Multiplier: 1.42x
- **Final Score: 34,668 points**

### Example Calculation: INTC (Strong Negative)

| Factor | Value | Weight | Contribution |
|--------|-------|--------|--------------|
| Mention Frequency | 0.45 | 20% | 0.090 |
| Average Sentiment | 0.35 | 40% | 0.140 |
| Engagement Level | 0.54 | 20% | 0.108 |
| Momentum | -0.47 | 20% | -0.094 |
| **Raw Score** | — | — | **0.244** |

**Multiplier** = 0.5 + 0.244 = **0.74x**

**Final Score:**
- Baseline: 3,005 points (1.04% index weight)
- Multiplier: 0.74x
- **Final Score: 2,224 points**

---

## Sentiment Score Interpretation

### Color-Coded Performance Indicators

The Dashboard sidebar displays sentiment scores with color coding for quick assessment:

| Color | Multiplier Range | Performance | Meaning |
|-------|------------------|-------------|---------|
| 🟢 **Dark Green** | ≥1.20x | Exceptional | 20%+ above baseline |
| 🟢 **Light Green** | 1.05-1.19x | Strong | 5-20% above baseline |
| ⚪ **Gray** | 0.95-1.04x | Neutral | Within 5% of baseline |
| 🟠 **Orange** | 0.80-0.94x | Weak | 5-20% below baseline |
| 🔴 **Red** | <0.80x | Poor | 20%+ below baseline |

**Sidebar Display Example:**
\`\`\`
🟢 NVDA  10.8%
   34,668.45  +2.3%

⚪ AAPL  10.6%
   30,923.12  +0.1%

🔴 INTC  0.7%
   2,224.87  -3.8%
\`\`\`

### Score Components Explained

**Line 1**: Ticker + Current Score Percentage
- Shows stock's percentage of total points pool
- Useful for comparing relative mindshare

**Line 2**: Absolute Score + Percentage Change
- Absolute score: Baseline × Multiplier
- Percentage change: Since last 3-hour update
- Green (+) = improving sentiment
- Red (-) = declining sentiment

---

## Score Updates and Change Tracking

### Automatic Update Schedule

Sentiment scores recalculate **every 3 hours** using a scheduled cron job:

**Update Times** (UTC):
- 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00

**Update Process:**
1. Fetch Reddit posts from past 12 months for each stock
2. Recompute four factors (frequency, sentiment, engagement, momentum)
3. Calculate new multipliers
4. Apply multipliers to baselines
5. Store new scores with timestamps
6. Calculate percentage changes from previous scores

### Change Tracking

The system stores historical scores to compute change percentages:

\`\`\`typescript
{
  ticker: "AAPL",
  current_score: 30,923.12,
  previous_score: 30,892.50,
  change_percent: +0.10,
  updated_at: 1729872000000,
  multiplier: 1.007
}
\`\`\`

**Change Interpretation:**

| Change | Meaning | Typical Causes |
|--------|---------|----------------|
| **+5% or more** | 🟢 Surging sentiment | Positive news, product launch, strong earnings |
| **+1% to +5%** | 🟡 Improving | Growing mentions, positive discussions |
| **-1% to +1%** | ⚪ Stable | Normal fluctuations, steady state |
| **-1% to -5%** | 🟠 Declining | Concerns emerging, competitive pressure |
| **-5% or more** | 🔴 Deteriorating | Bad news, controversies, bearish sentiment |

### Volatility Indicators

Rapid score swings can indicate:
- **News events**: Earnings reports, product announcements, executive changes
- **Market reactions**: Sector rotation, macro trends
- **Viral discussions**: Reddit memes, coordinated campaigns
- **Competitive shifts**: Rival product launches, market share changes

---

## What Drives Sentiment Changes?

### Positive Sentiment Drivers ⬆️

**Product & Innovation:**
- Major product launches (e.g., new iPhone, GPU architecture)
- Breakthrough technology announcements
- Patent filings, R&D milestones
- Strategic partnerships

**Financial Performance:**
- Better-than-expected earnings
- Raised guidance
- Strong revenue growth
- Successful cost management

**Community & Brand:**
- Positive customer experiences shared
- Brand loyalty discussions
- Community recommendations
- Influencer endorsements

**Market Position:**
- Market share gains
- Competitive advantages highlighted
- Industry leadership recognition
- Award wins, accolades

### Negative Sentiment Drivers ⬇️

**Product & Innovation:**
- Product delays, failures
- Quality issues, recalls
- Losing competitive edge
- Negative reviews

**Financial Performance:**
- Missed earnings expectations
- Lowered guidance
- Revenue declines
- Cost overruns, layoffs

**Community & Brand:**
- Controversies, scandals
- Customer complaints
- Privacy/security concerns
- Executive departures

**Market Position:**
- Market share losses
- Competitive threats
- Regulatory challenges
- Negative analyst reports

### Example: NVDA Sentiment Surge (2024-2025)

**Context**: AI boom drives GPU demand

**Positive Factors:**
- **Mention Frequency**: +150% (AI/ML discussions spike)
- **Average Sentiment**: 0.87 (excitement about AI capabilities)
- **Engagement**: Massive upvotes on GPU benchmark posts
- **Momentum**: +132% (mentions doubled in 3 months)

**Result**: Multiplier climbs to 1.42x, score +35% above baseline

**Community Themes:**
- "NVDA GPUs are essential for AI training"
- "Can't get enough supply, massive demand"
- "Competitors nowhere close to their performance"

---

## Integration with Content Generation

### How Sentiment Informs Content Strategy

While sentiment scoring tracks **stock market discussions**, it indirectly influences SMNB's content generation:

**Cross-System Intelligence:**

| Sentiment Signal | Content Response |
|------------------|------------------|
| **High sentiment stock** | Monitor related tech/productivity discussions |
| **Surging momentum stock** | Look for trending topics in related subreddits |
| **Low sentiment stock** | Identify community pain points, address in content |
| **Volatile stock** | Capitalize on trending conversations |

### Sentiment + Engine Metrics

The two systems can be analyzed together:

**Example: NVDA AI Boom**

**Sentiment System Detects:**
- NVDA sentiment: 1.42x multiplier (exceptional)
- Momentum: +132% (surging mentions)
- Themes: AI, machine learning, GPU performance

**Engine System Responds:**
- RC: r/MachineLearning posts → productivity workflows with AI
- NI: "AI-assisted coding", "ML model training" concepts emerge
- TP: Cross-posts to r/Productivity, r/Programming
- CM: Higher story yield from AI-related posts

**Content Strategy:**
- Generate stories on "AI productivity tools"
- Cover "How ML engineers optimize workflows"
- Explore "AI-enhanced knowledge management"

### Unified Dashboard Vision

Future integration will enable:

| Data Point | Source | Use Case |
|------------|--------|----------|
| Trending stocks | Sentiment | Identify hot topics |
| High-RC subreddits | Engine | Find on-brand sources |
| High-NI entities | Engine | Discover novel concepts |
| High-TP stories | Engine | Amplify viral content |
| Sentiment volatility | Sentiment | Detect newsworthy events |
| CM trends | Engine | Optimize collection timing |

---

# Part 4: System Architecture and Operations

## Event-Driven Architecture

### Core Principles

The SMNB system is built on three architectural pillars:

**1. Append-Only Event Log**
- Events are never modified or deleted
- Complete audit trail of all enrichments and stories
- Enables replay, debugging, and reprocessing
- Foundation for all metric calculations

**2. Incremental Computation**
- Metrics computed incrementally as events arrive
- No expensive full-table scans
- Sub-second query performance
- Scales to millions of events

**3. Multi-Dimensional Aggregation**
- Same events generate metrics across 5 dimensions
- Time-windowed buckets (1m, 5m, 15m, 60m)
- Efficient filtering and drill-down
- Flexible analysis granularity

### Data Flow Summary

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     ENRICHMENT PIPELINE                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │   Reddit Data Collection Session     │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  NLP Enrichment (sentiment, entities, │
        │  quality, categories, thread context) │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Emit post_enriched event → Event Log│
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Story Selection & Host AI Generation │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Emit story_created event → Event Log│
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ENGINE PROCESSING                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Event Applier (10s interval)        │
        │  - Fetch 2,000 unprocessed events    │
        │  - Group by window & dimension       │
        │  - Compute deltas                    │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Upsert stat_buckets                 │
        │  - Merge deltas with existing buckets│
        │  - Recalculate RC, NI, TP, CM        │
        │  - Update sentiment aggregates       │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Mark events processed & update      │
        │  watermark for idempotent processing │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          UI QUERIES                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Query stat_buckets by:              │
        │  - Dimension (global, subreddit, etc)│
        │  - Time window (1m, 5m, 15m, 60m)    │
        │  - Return 60 buckets for time series │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │  Dashboard displays RC, NI, TP, CM   │
        │  with real-time updates every 10s    │
        └──────────────────────────────────────┘
\`\`\`

---

## Database Schema

### enrichment_events Table

**Purpose**: Append-only log of all enrichment and story creation events

\`\`\`typescript
{
  _id: Id<"enrichment_events">,
  at: number,                          // Timestamp (ms epoch)
  kind: "post_enriched" | "story_created" | "sentiment_updated" | "engagement_updated",
  post_id: string,
  story_id?: string,                   // Only for story_created
  session_id: string,
  subreddit?: string,
  entities?: string[],
  thread_id?: string,
  sentiment?: number,
  quality?: number,
  categories?: string[],
  engagement?: { upvotes, comments, shares },
  story_themes?: string[],             // Only for story_created
  story_concepts?: string[],           // Only for story_created
  is_cross_post?: boolean,             // Only for story_created
  processed: boolean,                  // false until applied to buckets
  applied_at?: number                  // Timestamp when applied
}
\`\`\`

**Indexes:**
- `by_at`: [at] - chronological ordering
- `by_processed`: [processed, at] - fetch unprocessed events
- `by_session`: [session_id, at] - session analysis
- `by_kind`: [kind, at] - event type filtering

### stat_buckets Table

**Purpose**: Pre-aggregated time windows with running totals

\`\`\`typescript
{
  _id: Id<"stat_buckets">,
  window: "1m" | "5m" | "15m" | "60m",
  bucket_start: number,                // Timestamp (ms) rounded to window
  dim_kind: "global" | "subreddit" | "session" | "entity" | "thread",
  dim_value?: string,                  // Dimension value (e.g., "r/Productivity")
  dim_hash: string,                    // Fast lookup key: "dim_kind:dim_value"
  
  // Core metrics
  stories_total: number,
  stories_aligned: number,             // Stories with themes
  rc_percent: number,                  // Relevance Consistency (%)
  
  unique_concepts: string[],           // Set of unique concepts
  ni_count: number,                    // Novelty Index (count)
  
  stories_cross_post: number,          // Cross-posted stories
  tp_percent: number,                  // Trend Propagation (%)
  
  posts_total: number,                 // Total posts processed
  story_yield: number,                 // stories_total / posts_total
  story_yield_delta?: number,          // Change from previous bucket
  cm_percent?: number,                 // Conversion Momentum (%)
  
  // Supporting aggregates
  sum_sentiment: number,
  sum_weighted_sentiment: number,
  sum_weights: number,
  sum_engagement: number,
  variance_helper: {
    sum_x: number,
    sum_x2: number,
    n: number
  },
  
  last_updated_at: number,
  event_count: number,                 // Events applied to this bucket
  last_event_id?: Id<"enrichment_events">
}
\`\`\`

**Indexes:**
- `by_window_and_bucket`: [window, bucket_start, dim_hash] - efficient bucket lookups
- `by_dim`: [dim_kind, dim_value, bucket_start] - dimension filtering
- `by_session_window`: [dim_kind, dim_value, window, bucket_start] - session queries
- `by_updated`: [last_updated_at] - recently updated buckets

### processing_watermarks Table

**Purpose**: Track event processing progress for idempotent operations

\`\`\`typescript
{
  _id: Id<"processing_watermarks">,
  processor_id: "event_applier",
  last_processed_at: number,           // Last event timestamp processed
  last_event_id?: Id<"enrichment_events">,
  processed_count: number,             // Events in last batch
  last_run_at: number,                 // When applier last ran
  status: "idle" | "running" | "error",
  error_message?: string
}
\`\`\`

**Index:**
- `by_processor`: [processor_id] - single watermark per processor

### stats_snapshots Table

**Purpose**: Frozen metric snapshots when broadcast is OFF

\`\`\`typescript
{
  _id: Id<"stats_snapshots">,
  snapshot_id: string,
  session_id?: string,
  created_at: number,
  metrics: {
    rc_percent: number,
    ni_count: number,
    tp_percent: number,
    cm_percent: number,
    story_yield: number
  },
  by_dimension: Array<{
    dim_kind: string,
    dim_value?: string,
    metrics: { rc_percent, ni_count, tp_percent, cm_percent, story_yield }
  }>,
  is_active: boolean
}
\`\`\`

**Indexes:**
- `by_active`: [is_active, created_at] - fetch active snapshot
- `by_session`: [session_id, created_at] - session-specific snapshots

---

## Performance Characteristics

### Query Performance

| Query Type | Latency | Notes |
|------------|---------|-------|
| **Current metrics** | <50ms | Single bucket read |
| **Time series (60 buckets)** | <200ms | Indexed range scan |
| **Dimension filter** | <100ms | Optimized by dim_hash |
| **Session analysis** | <150ms | by_session_window index |
| **Global dashboard** | <300ms | Multiple dimension queries |

### Processing Throughput

| Metric | Value | Notes |
|--------|-------|-------|
| **Events per batch** | 2,000 | Configurable, optimized for 10s cycle |
| **Batch processing time** | 1-3s | Depends on event grouping |
| **Buckets per event** | 20+ | 4 windows × 5 dimensions avg |
| **Events per day** | ~17M | At full scale (2k every 10s) |
| **Storage growth** | ~1GB/week | With retention policies |

### Scalability Limits

The current architecture supports:
- **10,000+ events/minute** sustained
- **100+ dimensions** tracked simultaneously
- **1M+ concepts** in unique_concepts sets
- **90-day retention** for 1m/5m windows
- **1-year retention** for 15m/60m windows

---

## Operational Monitoring

### Engine Health Dashboard

The system exposes an Engine Health endpoint for monitoring:

\`\`\`typescript
{
  status: "healthy" | "degraded" | "error",
  lag_ms: 1250,                        // Time behind real-time
  processed_count: 2000,               // Last batch size
  last_run_at: 1729872100000,         // Last applier run
  events_pending: 450,                 // Unprocessed events
  error_message?: string
}
\`\`\`

**Status Thresholds:**
- **Healthy**: lag < 10s, no errors
- **Degraded**: lag 10s-60s, processing slowly
- **Error**: lag >60s or processor failed

### Key Performance Indicators

| KPI | Target | Warning | Critical |
|-----|--------|---------|----------|
| **Processing Lag** | <5s | 10-30s | >60s |
| **Events Pending** | <500 | 500-2000 | >5000 |
| **Batch Processing Time** | <2s | 2-5s | >10s |
| **Bucket Update Success Rate** | >99.9% | 99-99.9% | <99% |
| **Query Latency (p95)** | <300ms | 300-1000ms | >1s |

### Alert Triggers

**Immediate Page:**
- Processing lag >120s for 5+ minutes
- Events pending >10,000
- Processor status = "error" for 2+ cycles
- Query failures >1% rate

**Warning Notification:**
- Processing lag 30-60s sustained
- Events pending 2,000-5,000
- Batch processing time >5s consistently
- Any metric outside warning threshold for 15+ minutes

---

## Maintenance Operations

### Event Log Cleanup

Old events can be pruned after metrics are aggregated:

**Retention Policy:**
- Keep processed events for 90 days
- Archive events older than 90 days to cold storage
- Never delete unprocessed events

**Cleanup Procedure:**
\`\`\`typescript
// Archive events older than 90 days
const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
const oldEvents = await ctx.db
  .query("enrichment_events")
  .withIndex("by_at", q => q.lt("at", cutoff))
  .filter(q => q.eq(q.field("processed"), true))
  .collect();

// Export to cold storage, then delete
await archiveToS3(oldEvents);
await deleteOldEvents(oldEvents.map(e => e._id));
\`\`\`

### Bucket Aggregation

Old buckets can be aggregated into larger windows:

**Aggregation Strategy:**
- Aggregate 1m buckets into 5m buckets after 24 hours
- Aggregate 5m buckets into 15m buckets after 7 days
- Aggregate 15m buckets into 60m buckets after 30 days
- Keep 60m buckets for 1 year

### Reprocessing Events

If metric calculations need to be corrected:

**Reset Procedure:**
1. Mark all events as unprocessed
2. Clear all stat_buckets
3. Reset processing_watermarks
4. Restart event applier
5. Monitor reprocessing progress

\`\`\`typescript
// Reset all events
await ctx.runMutation(internal.engine.mutations.markAllEventsUnprocessed);

// Clear buckets
await ctx.runMutation(internal.engine.control.clearAllBuckets);

// Reset watermark
await ctx.runMutation(internal.engine.mutations.resetWatermark, {
  processor_id: "event_applier"
});

// Applier will automatically reprocess all events
\`\`\`

---

# Part 5: Future Enhancements

## Planned Features (Q4 2025)

### Multi-Platform Analysis

**Expand beyond Reddit:**
- Twitter/X sentiment tracking
- Discord community discussions
- Hacker News threads
- GitHub issue/PR analysis
- Stack Overflow trends

**Benefits:**
- Broader mindshare coverage
- Cross-platform sentiment correlation
- Earlier trend detection
- More diverse concept discovery

### Predictive Modeling

**ML-Powered Forecasting:**
- Predict next-hour RC/NI/TP/CM values
- Forecast sentiment trajectory for stocks
- Identify emerging trends before they peak
- Recommend optimal collection timing

**Training Data:**
- Historical metric time series
- Event patterns and sequences
- External signals (market data, news)
- Seasonal/temporal patterns

### Advanced Sentiment Features

**Enhanced Stock Analysis:**
- Subreddit-specific sentiment (r/WallStreetBets vs. r/Investing)
- User reputation weighting (karma-based)
- Topic clustering (earnings, products, governance)
- Competitive sentiment mapping

**Sentiment Drivers:**
- Automatic identification of sentiment catalysts
- Root cause analysis for score changes
- Influencer impact tracking
- Viral post detection

### Real-Time Alerting

**Intelligent Notifications:**
- RC drops below threshold → Slack alert
- NI spike detected → investigate new concepts
- TP surge → capitalize on viral content
- CM negative trend → review recent changes

**Custom Alert Rules:**
- User-defined metric thresholds
- Multi-metric conditions (e.g., low RC + negative CM)
- Dimension-specific alerts (per-subreddit)
- Rate-of-change triggers

### Automated Optimization

**Self-Tuning System:**
- Dynamic threshold adjustment based on historical patterns
- Automatic source discovery and evaluation
- Theme tag optimization using reinforcement learning
- Concept extraction fine-tuning

**A/B Testing Framework:**
- Test enrichment prompt variations
- Compare source collection strategies
- Evaluate theme tag sets
- Measure impact on downstream metrics

---

## Research Directions

### Causal Inference

**Questions to Answer:**
- Does improving RC actually lead to better content engagement?
- What RC/NI combinations maximize story quality?
- How does TP influence long-term content performance?
- Can we quantify the ROI of different CM improvement strategies?

**Methodology:**
- Quasi-experimental designs with metric interventions
- Time series causal analysis
- Counterfactual modeling
- Long-term cohort studies

### Semantic Understanding

**Deep Concept Analysis:**
- Concept embeddings for similarity clustering
- Concept lifecycle tracking (emergence → peak → decline)
- Cross-concept relationship mapping
- Concept-to-theme alignment scoring

**Knowledge Graph:**
- Build entity-concept-theme relationship graph
- Track concept evolution over time
- Identify concept "neighborhoods"
- Discover hidden connections

### Multi-Agent Orchestration

**Specialized Agent Roles:**
- **Curator Agent**: Selects high-potential posts
- **Enrichment Agent**: Performs NLP processing
- **Theme Agent**: Assigns thematic categories
- **Concept Agent**: Extracts unique ideas
- **Quality Agent**: Scores content substance
- **Coordinator Agent**: Orchestrates workflow

**Benefits:**
- Specialized expertise per task
- Parallel processing for speed
- Independent optimization
- Easier debugging and tuning

---

# Part 6: Key Takeaways

## System Summary

The SMNB Unified Scoring System is a **real-time, event-driven intelligence engine** that transforms social media data into actionable insights through:

1. **Data Enrichment Pipeline**: Reddit → NLP → Events → Metrics
2. **Four Engine Metrics**: RC (relevance), NI (novelty), TP (virality), CM (efficiency)
3. **Multi-Dimensional Analysis**: Global, subreddit, session, entity, thread views
4. **Time-Windowed Aggregation**: 1m/5m/15m/60m buckets for flexible queries
5. **Parallel Sentiment Tracking**: Nasdaq-100 stock sentiment from Reddit discussions

## Metric Interrelationships

**Content Quality Matrix:**

| RC | NI | Interpretation | Action |
|----|----|--------------|----|
| High | High | 🟢 Ideal—on-brand, diverse | Maintain strategy |
| High | Low | 🟡 Consistent but repetitive | Expand topics |
| Low | High | 🟠 Diverse but off-brand | Refine alignment |
| Low | Low | 🔴 Poor—needs full review | Audit sources |

**Growth Indicators:**

| CM | TP | Interpretation | Action |
|----|----|--------------|----|
| Positive | High | 🟢 Accelerating viral content | Amplify momentum |
| Positive | Low | 🟡 Improving but niche | Sustain growth |
| Negative | High | 🟠 Declining despite reach | Investigate cause |
| Negative | Low | 🔴 Deteriorating performance | Emergency review |

## Operational Excellence

**Daily Monitoring:**
- ✅ Engine health status (lag, errors, pending events)
- ✅ Global RC/NI/TP/CM trends
- ✅ Per-subreddit performance
- ✅ Sentiment score changes
- ✅ Processing throughput

**Weekly Reviews:**
- 📊 Metric trends and patterns
- 📊 Source performance evaluation
- 📊 Concept diversity analysis
- 📊 Sentiment volatility investigation
- 📊 Threshold tuning

**Monthly Audits:**
- 🔍 Long-term metric trajectories
- 🔍 Source portfolio optimization
- 🔍 Theme tag effectiveness
- 🔍 Sentiment model accuracy
- 🔍 System scalability assessment

## Success Metrics

**Unified Scoring System KPIs:**

| Category | Metric | Target | Current Status |
|----------|--------|--------|----------------|
| **Content Quality** | Average RC | ≥70% | Monitor via dashboard |
| **Content Diversity** | Average NI | ≥25/window | Monitor via dashboard |
| **Viral Potential** | Average TP | ≥15% | Monitor via dashboard |
| **Efficiency** | CM consistency | Within ±10% | Monitor via dashboard |
| **Processing Performance** | Lag | <10s | Health endpoint |
| **Query Performance** | p95 latency | <300ms | Metrics database |
| **Sentiment Accuracy** | Prediction alignment | >85% | Validation studies |
| **System Uptime** | Availability | >99.9% | Infrastructure monitoring |

---

**Last Updated**: October 25, 2025  
**Version**: 3.0.0  
**System Status**: ✅ Operational  
**Architecture**: Event-Driven, Real-Time, Multi-Dimensional  
**Next Review**: Weekly automated reports + Monthly comprehensive audit

---

*This document is the authoritative reference for SMNB's Unified Scoring System. All metric calculations, data flows, and operational procedures are documented here. For questions or clarifications, consult the source code in \`/convex/engine/\` or the dashboard implementation in \`/app/dashboard/studio/engine/\`.*

---

# Part 3: Reddit Sentiment Scoring System (LEGACY)

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
