# Reddit Simulator - Implementation Guide

## Overview

The Reddit Simulator is an intelligent agent system that uses predictable patterns from historical data to simulate post engagement at various times and recommend optimal posting strategies. It leverages the existing keyword trends, metric scoring, and live feed infrastructure to predict which content will perform best, when to post it, and in which communities.

## Problem Statement

Currently, the system can:
- Track keyword trends from Reddit posts
- Calculate comprehensive metrics (synergy score, engagement potential, novelty index, etc.)
- Generate content based on trending keywords
- Score posts using multiple performance indicators

**The Reddit Simulator adds:**
- Time-based engagement pattern analysis
- Predictive modeling for post performance
- Optimal posting time recommendations
- Community-specific success pattern matching
- Scenario simulation for content strategy

## System Architecture

### Data Sources

The simulator leverages existing data infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
├─────────────────────────────────────────────────────────────┤
│ 1. live_feed_posts                                           │
│    - Historical Reddit posts with scores, comments, timing   │
│    - Subreddit information                                   │
│    - Created timestamp (created_utc)                         │
│    - Score and engagement metrics                            │
│                                                              │
│ 2. keyword_trends                                            │
│    - Trending keywords with engagement scores                │
│    - Performance tiers (elite, excel, good, etc.)           │
│    - Trend status (emerging, rising, peak, declining)        │
│    - Source post IDs linking to live_feed_posts             │
│                                                              │
│ 3. post_stats                                                │
│    - Quality scores, engagement scores                       │
│    - Sentiment analysis                                      │
│    - Processing timelines                                    │
│    - Categories and keywords                                 │
│                                                              │
│ 4. generated_posts                                           │
│    - AI-generated content with predictions                   │
│    - Estimated vs actual performance tracking                │
│    - Metric baselines (synergy, relevance, novelty)         │
│                                                              │
│ 5. Metric Scoring System                                     │
│    - 9 performance metrics per subreddit                     │
│    - Synergy Score (SY), Relevance Coefficient (RC)         │
│    - Engagement Potential (EP), Novelty Index (NI)          │
│    - Story Yield, Feed Contribution, etc.                   │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

```
┌──────────────────────────────────────────────────────────────┐
│                   REDDIT SIMULATOR                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  1. TEMPORAL ANALYZER                              │      │
│  │     - Analyze posting times vs engagement          │      │
│  │     - Identify peak hours per subreddit            │      │
│  │     - Calculate time-decay patterns                │      │
│  │     - Detect recurring engagement cycles           │      │
│  └────────────────────────────────────────────────────┘      │
│                          ↓                                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  2. PATTERN MATCHER                                │      │
│  │     - Match keywords to historical successes       │      │
│  │     - Identify content patterns (questions, lists) │      │
│  │     - Extract title/format strategies              │      │
│  │     - Calculate similarity scores                  │      │
│  └────────────────────────────────────────────────────┘      │
│                          ↓                                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  3. SIMULATION ENGINE                              │      │
│  │     - Run Monte Carlo simulations                  │      │
│  │     - Test multiple posting scenarios              │      │
│  │     - Predict engagement distributions             │      │
│  │     - Calculate confidence intervals               │      │
│  └────────────────────────────────────────────────────┘      │
│                          ↓                                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  4. RECOMMENDATION ENGINE                          │      │
│  │     - Rank subreddits by predicted success         │      │
│  │     - Suggest optimal posting times                │      │
│  │     - Recommend content variations                 │      │
│  │     - Provide confidence scores                    │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Key Metrics & Algorithms

### 1. Temporal Engagement Score

Analyzes when posts perform best based on historical data:

```typescript
interface TemporalPattern {
  hour_utc: number;           // 0-23 UTC
  day_of_week: number;        // 0-6 (Sunday-Saturday)
  avg_score: number;          // Average post score
  avg_comments: number;       // Average comment count
  post_count: number;         // Sample size
  engagement_rate: number;    // Normalized 0-1
  confidence: number;         // Statistical confidence 0-1
}
```

**Algorithm:**
```
1. Group live_feed_posts by subreddit + hour + day_of_week
2. Calculate mean(score), mean(comments), count(posts)
3. Normalize engagement_rate = (score + comments*2) / max_observed
4. Calculate confidence = min(1, post_count / 100)
5. Return top time windows per subreddit
```

### 2. Pattern Similarity Score

Matches new content against historical successes:

```typescript
interface ContentPattern {
  keyword_match: number;      // 0-1 keyword overlap
  title_style: string;        // question, list, how-to, discussion
  length_similarity: number;  // 0-1 title length match
  format_match: number;       // 0-1 structural similarity
  combined_score: number;     // Weighted average
}
```

**Algorithm:**
```
1. Extract patterns from top posts (keywords, style, format)
2. Compare new content keywords with historical keywords
3. Analyze title patterns (questions, numbers, emotional hooks)
4. Calculate weighted similarity: 
   - keyword_match * 0.4
   - format_match * 0.3
   - title_style * 0.2
   - length_similarity * 0.1
```

### 3. Simulation Model

Predicts engagement using Monte Carlo simulation:

```typescript
interface SimulationResult {
  subreddit: string;
  predicted_score: {
    mean: number;
    median: number;
    std_dev: number;
    confidence_95: [number, number];
  };
  predicted_comments: {
    mean: number;
    median: number;
    std_dev: number;
    confidence_95: [number, number];
  };
  success_probability: number;  // P(score > threshold)
  optimal_time: TemporalPattern;
  confidence_level: number;     // Overall prediction confidence
}
```

**Algorithm:**
```
1. Identify similar historical posts (pattern matching)
2. Extract engagement distributions (scores, comments)
3. Run 1000 simulations:
   - Sample from historical distributions
   - Apply time-of-day multipliers
   - Apply keyword trend multipliers
   - Record results
4. Calculate statistics (mean, median, confidence intervals)
5. Determine success probability (% above threshold)
```

## Implementation Plan

### Phase 1: Data Collection & Analysis (Convex Functions)

**File: `/convex/simulator/temporalAnalyzer.ts`**

```typescript
// Analyze posting time patterns per subreddit
export const analyzePostingPatterns = query({
  args: {
    subreddit: v.string(),
    lookbackDays: v.optional(v.number())
  },
  returns: v.array(v.object({
    hour_utc: v.number(),
    day_of_week: v.number(),
    avg_score: v.number(),
    avg_comments: v.number(),
    post_count: v.number(),
    engagement_rate: v.number(),
    confidence: v.number()
  })),
  handler: async (ctx, args) => {
    // Implementation details in Phase 1
  }
});

// Get best posting times across multiple subreddits
export const getBestPostingTimes = query({
  args: {
    subreddits: v.array(v.string()),
    minConfidence: v.optional(v.number())
  },
  returns: v.array(v.object({
    subreddit: v.string(),
    optimal_hours: v.array(v.number()),
    peak_time: v.object({
      hour_utc: v.number(),
      day_of_week: v.number(),
      expected_boost: v.number()
    })
  })),
  handler: async (ctx, args) => {
    // Implementation details in Phase 1
  }
});
```

**File: `/convex/simulator/patternMatcher.ts`**

```typescript
// Find similar historical posts based on keywords
export const findSimilarPosts = internalQuery({
  args: {
    keywords: v.array(v.string()),
    subreddit: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    post_id: v.string(),
    title: v.string(),
    score: v.number(),
    similarity_score: v.number(),
    pattern_matches: v.object({
      keyword_overlap: v.number(),
      style_match: v.string(),
      format_similarity: v.number()
    })
  })),
  handler: async (ctx, args) => {
    // Implementation details in Phase 1
  }
});

// Extract success patterns from top posts
export const extractSuccessPatterns = internalQuery({
  args: {
    keywords: v.array(v.string()),
    topN: v.optional(v.number())
  },
  returns: v.object({
    common_title_patterns: v.array(v.string()),
    optimal_length_range: v.object({
      min: v.number(),
      max: v.number()
    }),
    successful_formats: v.array(v.object({
      format: v.string(),
      success_rate: v.number(),
      avg_score: v.number()
    })),
    sentiment_distribution: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number()
    })
  }),
  handler: async (ctx, args) => {
    // Implementation details in Phase 1
  }
});
```

### Phase 2: Simulation Engine (Convex Actions)

**File: `/convex/simulator/simulationEngine.ts`**

```typescript
// Run simulation for post performance
export const simulatePostPerformance = action({
  args: {
    keywords: v.array(v.string()),
    subreddits: v.array(v.string()),
    postingTimes: v.optional(v.array(v.object({
      hour_utc: v.number(),
      day_of_week: v.number()
    }))),
    numSimulations: v.optional(v.number())
  },
  returns: v.array(v.object({
    subreddit: v.string(),
    posting_time: v.object({
      hour_utc: v.number(),
      day_of_week: v.number()
    }),
    predicted_score: v.object({
      mean: v.number(),
      median: v.number(),
      confidence_95_lower: v.number(),
      confidence_95_upper: v.number()
    }),
    predicted_comments: v.object({
      mean: v.number(),
      median: v.number(),
      confidence_95_lower: v.number(),
      confidence_95_upper: v.number()
    }),
    success_probability: v.number(),
    confidence_level: v.number(),
    similar_posts_found: v.number()
  })),
  handler: async (ctx, args) => {
    // Implementation details in Phase 2
  }
});

// Generate optimal posting strategy
export const generatePostingStrategy = action({
  args: {
    keywords: v.array(v.string()),
    targetScore: v.optional(v.number()),
    riskTolerance: v.optional(v.union(
      v.literal("conservative"),
      v.literal("moderate"),
      v.literal("aggressive")
    ))
  },
  returns: v.object({
    recommendations: v.array(v.object({
      rank: v.number(),
      subreddit: v.string(),
      optimal_time: v.object({
        hour_utc: v.number(),
        day_of_week: v.number(),
        time_description: v.string()
      }),
      expected_performance: v.object({
        score_range: v.array(v.number()),
        comments_range: v.array(v.number()),
        success_rate: v.number()
      }),
      reasoning: v.string(),
      confidence: v.number()
    })),
    strategy_summary: v.object({
      best_overall: v.string(),
      backup_options: v.array(v.string()),
      timing_strategy: v.string(),
      risk_assessment: v.string()
    })
  }),
  handler: async (ctx, args) => {
    // Implementation details in Phase 2
  }
});
```

### Phase 3: UI Integration (React Components)

**File: `/app/dashboard/studio/generator/components/Simulator.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SimulatorProps {
  keywords: Array<{
    keyword: string;
    count: number;
    category: string;
  }>;
  onStrategySelected?: (strategy: any) => void;
}

export function Simulator({ keywords, onStrategySelected }: SimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  
  const runSimulation = useAction(api.simulator.simulationEngine.generatePostingStrategy);
  
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const results = await runSimulation({
        keywords: keywords.map(k => k.keyword)
      });
      setSimulationResults(results);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Reddit Simulator</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Implementation details in Phase 3 */}
      </CardContent>
    </Card>
  );
}
```

### Phase 4: Schema Extensions

**Add to `/convex/schema.ts`:**

```typescript
// Simulation history tracking
simulation_runs: defineTable({
  run_id: v.string(),
  keywords: v.array(v.string()),
  subreddits_tested: v.array(v.string()),
  num_simulations: v.number(),
  results: v.string(), // JSON blob
  created_at: v.number(),
  created_by: v.optional(v.string())
})
  .index("by_run_id", ["run_id"])
  .index("by_created_at", ["created_at"]),

// Temporal patterns cache
temporal_patterns: defineTable({
  subreddit: v.string(),
  hour_utc: v.number(),
  day_of_week: v.number(),
  avg_score: v.number(),
  avg_comments: v.number(),
  post_count: v.number(),
  engagement_rate: v.number(),
  confidence: v.number(),
  last_updated: v.number()
})
  .index("by_subreddit", ["subreddit"])
  .index("by_engagement", ["engagement_rate"])
  .index("by_subreddit_time", ["subreddit", "hour_utc", "day_of_week"]),
```

## User Interaction Flow

### In the Generator/Network Tab

```
┌─────────────────────────────────────────────────────────────┐
│                    GENERATOR TAB                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Trending Keywords Panel]                                  │
│   • AI - Count: 45, Tier: Elite, Trending: 🔥              │
│   • Machine Learning - Count: 32, Tier: Excel              │
│   • React - Count: 28, Tier: Very Good                     │
│                                                              │
│  [Drag Keywords to Columns]                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │ Content Ideas│  │Research Topics│  │ Trending Now│    │
│   ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│   │ • AI         │  │ • React      │  │ • ML         │    │
│   │ • ChatGPT    │  │ • Next.js    │  │ • OpenAI     │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🎯 SIMULATOR PANEL (NEW)                             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │ Selected Keywords: AI, ChatGPT (2 keywords)          │  │
│  │                                                       │  │
│  │ [Run Simulation]  [Advanced Options ▾]               │  │
│  │                                                       │  │
│  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ │ 📊 SIMULATION RESULTS                            │ │  │
│  │ ├─────────────────────────────────────────────────┤ │  │
│  │ │                                                  │ │  │
│  │ │ Top 3 Recommendations:                          │ │  │
│  │ │                                                  │ │  │
│  │ │ 🥇 1. r/MachineLearning                         │ │  │
│  │ │    Best Time: Tue 14:00 UTC (in 3 hours)       │ │  │
│  │ │    Expected: 850-1200 score, 45-70 comments    │ │  │
│  │ │    Success Rate: 78% | Confidence: 85%         │ │  │
│  │ │    [Use This Strategy] [View Details]          │ │  │
│  │ │                                                  │ │  │
│  │ │ 🥈 2. r/artificial                              │ │  │
│  │ │    Best Time: Wed 09:00 UTC (tomorrow)         │ │  │
│  │ │    Expected: 600-950 score, 30-55 comments     │ │  │
│  │ │    Success Rate: 72% | Confidence: 81%         │ │  │
│  │ │    [Use This Strategy] [View Details]          │ │  │
│  │ │                                                  │ │  │
│  │ │ 🥉 3. r/technology                              │ │  │
│  │ │    Best Time: Mon 16:00 UTC (2 days)           │ │  │
│  │ │    Expected: 400-750 score, 20-40 comments     │ │  │
│  │ │    Success Rate: 65% | Confidence: 79%         │ │  │
│  │ │    [Use This Strategy] [View Details]          │ │  │
│  │ │                                                  │ │  │
│  │ └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │ ℹ️ Based on 2,847 similar historical posts          │  │
│  │    Last updated: 2 minutes ago                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Generate Content with Top Strategy]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Detail View

When clicking "View Details":

```
┌─────────────────────────────────────────────────────────────┐
│            r/MachineLearning - Simulation Details            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ⏰ Optimal Timing Analysis                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Best Hours (UTC):                                     │   │
│ │ • 14:00 - 16:00 (Tue, Wed, Thu) - Peak engagement    │   │
│ │ • 09:00 - 11:00 (Mon, Fri) - Good engagement         │   │
│ │ • Avoid: 00:00 - 06:00, 20:00 - 23:00 (Low activity) │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ 📈 Performance Prediction                                    │
│ ┌──────────────────────────────────────────────────────┐   │
│ │     Score Distribution (1000 simulations)             │   │
│ │                                                        │   │
│ │  400 ┌─────────────────┐                              │   │
│ │  300 │     ┌───┐       │                              │   │
│ │  200 │   ┌─┤ █ ├─┐     │                              │   │
│ │  100 │ ┌─┤ █ █ █ ├─┐   │                              │   │
│ │    0 └─┴─┴─┴─┴─┴─┴─┴─┘                              │   │
│ │       500  850  1200  1500                            │   │
│ │                                                        │   │
│ │ Median: 950 | Mean: 975 | 95% CI: [650, 1350]        │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ 🎯 Similar Successful Posts (Top 5)                         │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. "How AI is transforming..." - 1,245 ⬆ 67 💬       │   │
│ │    Posted: Tue 14:23 UTC, 89% match                  │   │
│ │                                                        │   │
│ │ 2. "Latest breakthroughs in..." - 1,089 ⬆ 52 💬     │   │
│ │    Posted: Wed 15:01 UTC, 85% match                  │   │
│ │                                                        │   │
│ │ 3. "GPT-4 vs Claude comparison" - 967 ⬆ 48 💬        │   │
│ │    Posted: Thu 14:45 UTC, 82% match                  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ 💡 Content Recommendations                                   │
│ • Use question format (68% success rate vs 52% average)    │
│ • Optimal title length: 60-80 characters                   │
│ • Include specific tech names for credibility              │
│ • Positive/neutral sentiment performs best                 │
│                                                              │
│ [Generate with These Settings] [Run Another Simulation]     │
└─────────────────────────────────────────────────────────────┘
```

## Integration with Existing Features

### 1. Keywords Tab
- Simulator uses `getTrendingKeywords` query
- Leverages keyword metrics (SY, RC, EP, NI, etc.)
- Accesses `keyword_trends` table for historical data

### 2. Generator Tab
- Simulator panel added below column system
- "Use This Strategy" pre-fills generation settings
- Integrates with `generateRedditPost` action
- Passes optimal subreddit and timing to generation

### 3. Scoreboard/Metrics
- Uses existing metric scoring matrix
- Leverages subreddit performance tiers
- Incorporates engagement potential calculations

### 4. Live Feed
- Analyzes `live_feed_posts` for patterns
- Uses historical scores and timing
- Tracks actual vs predicted performance

## API Endpoints Summary

### Queries (Read-only)
- `simulator.temporalAnalyzer.analyzePostingPatterns` - Get time-based patterns
- `simulator.temporalAnalyzer.getBestPostingTimes` - Get optimal times
- `simulator.temporalAnalyzer.getEngagementHeatmap` - Visual time data

### Actions (Compute-intensive)
- `simulator.simulationEngine.simulatePostPerformance` - Run simulations
- `simulator.simulationEngine.generatePostingStrategy` - Get recommendations
- `simulator.simulationEngine.compareStrategies` - A/B test scenarios

### Internal Queries (Helper functions)
- `simulator.patternMatcher.findSimilarPosts` - Pattern matching
- `simulator.patternMatcher.extractSuccessPatterns` - Pattern extraction
- `simulator.patternMatcher.calculateSimilarity` - Similarity scoring

## Success Metrics

Track simulator effectiveness:

```typescript
interface SimulatorMetrics {
  total_simulations_run: number;
  strategies_generated: number;
  strategies_used: number;
  avg_accuracy: number; // Predicted vs actual
  user_satisfaction: number; // Feedback score
  
  performance: {
    avg_simulation_time_ms: number;
    cache_hit_rate: number;
    posts_analyzed: number;
  };
  
  accuracy_by_subreddit: Record<string, {
    predictions: number;
    mean_error_score: number;
    mean_error_comments: number;
  }>;
}
```

## Future Enhancements

### Phase 5: Advanced Features
1. **Multi-variate Testing**
   - Test title variations
   - Test different posting times simultaneously
   - A/B test content strategies

2. **Machine Learning Integration**
   - Train on prediction accuracy
   - Improve similarity matching
   - Personalized recommendations

3. **Real-time Monitoring**
   - Track live post performance
   - Compare to predictions
   - Adjust future recommendations

4. **Competitor Analysis**
   - Track competitor posting patterns
   - Identify gaps in content calendar
   - Suggest counter-strategies

5. **Content Calendar**
   - Schedule simulations in advance
   - Auto-generate content pipeline
   - Optimize posting frequency

## Technical Considerations

### Performance Optimization
- Cache temporal patterns (refresh daily)
- Index commonly queried fields
- Limit simulation iterations for UI responsiveness
- Use pagination for large result sets

### Data Quality
- Require minimum sample sizes (e.g., 50 posts)
- Handle outliers in engagement data
- Account for subreddit size differences
- Normalize scores across timeframes

### Error Handling
- Graceful degradation with insufficient data
- Clear confidence indicators
- Fallback to general patterns
- User feedback on accuracy

### Privacy & Ethics
- No personal data in simulations
- Aggregate patterns only
- Respect Reddit's API terms
- Transparent about prediction limitations

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Implement temporal analyzer queries
- [ ] Create pattern matching functions
- [ ] Build data caching layer
- [ ] Add schema tables

### Week 3-4: Simulation Engine
- [ ] Implement Monte Carlo simulation
- [ ] Create recommendation algorithm
- [ ] Build confidence scoring
- [ ] Test accuracy on historical data

### Week 5-6: UI Integration
- [ ] Create Simulator component
- [ ] Add to Generator tab
- [ ] Implement detail views
- [ ] Add visualization charts

### Week 7-8: Testing & Refinement
- [ ] User testing
- [ ] Accuracy validation
- [ ] Performance optimization
- [ ] Documentation updates

## Conclusion

The Reddit Simulator transforms passive keyword analysis into active strategy recommendations. By leveraging existing infrastructure (metrics, keywords, live feed data), it adds predictive intelligence without requiring major architectural changes.

The system provides:
- **Data-driven decisions**: Based on real historical patterns
- **Time optimization**: Post when audience is most engaged
- **Risk assessment**: Confidence scores for every recommendation
- **Continuous learning**: Tracks accuracy and improves over time

Integration is seamless through the existing Generator tab, creating a natural workflow from trend analysis → simulation → content generation → posting strategy.
