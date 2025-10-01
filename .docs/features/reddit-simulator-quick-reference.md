# Reddit Simulator - Quick Reference

> **Quick Start**: This is a condensed reference for the Reddit Simulator feature. For full implementation details, see [reddit-simulator.md](./reddit-simulator.md)

## What is the Reddit Simulator?

An AI agent that predicts Reddit post performance using historical data patterns to recommend:
- **Optimal posting times** (hour + day of week)
- **Best subreddits** for your keywords
- **Expected engagement** (score + comments with confidence intervals)
- **Content strategies** based on successful patterns

## Key Features

### 🕐 Temporal Analysis
Analyzes when posts perform best based on historical timing data
- Identifies peak engagement hours per subreddit
- Accounts for day-of-week patterns
- Calculates time-decay factors

### 🔍 Pattern Matching
Finds similar successful posts in history
- Keyword overlap scoring
- Title format analysis (questions, lists, how-to)
- Content style matching

### 🎲 Monte Carlo Simulation
Runs 1000+ simulations to predict performance
- Score distribution predictions
- Comment count predictions
- Success probability calculations
- 95% confidence intervals

### 🎯 Smart Recommendations
Ranks strategies by predicted success
- Top 3 subreddit/time combinations
- Risk assessment (conservative/moderate/aggressive)
- Reasoning for each recommendation

## Data Sources (All Existing)

| Table | What It Provides |
|-------|------------------|
| `live_feed_posts` | Historical Reddit posts with scores, timing, subreddit |
| `keyword_trends` | Trending keywords with engagement scores & tiers |
| `post_stats` | Quality scores, sentiment analysis, categories |
| `generated_posts` | AI-generated content with actual vs predicted tracking |
| Metric System | 9-metric scoring per subreddit (SY, RC, EP, NI, etc.) |

## Where It Lives

**Location**: Generator/Network Tab in Dashboard Studio

**Integration**: New panel added below the existing keyword drag-and-drop columns

**Workflow**:
```
1. Drag keywords to columns (existing feature)
2. Click "Run Simulation" in new Simulator panel
3. View top 3 recommendations with timing + performance
4. Click "Use This Strategy" to auto-fill generator
5. Generate content with optimal settings
```

## API Endpoints (To Be Implemented)

### Queries
```typescript
// Get best posting times for subreddits
api.simulator.temporalAnalyzer.getBestPostingTimes({
  subreddits: ["MachineLearning", "artificial"],
  minConfidence: 0.7
})

// Analyze patterns for a specific subreddit
api.simulator.temporalAnalyzer.analyzePostingPatterns({
  subreddit: "MachineLearning",
  lookbackDays: 30
})
```

### Actions
```typescript
// Run full simulation and get strategy
api.simulator.simulationEngine.generatePostingStrategy({
  keywords: ["AI", "ChatGPT"],
  riskTolerance: "moderate"
})

// Simulate specific scenario
api.simulator.simulationEngine.simulatePostPerformance({
  keywords: ["AI", "ML"],
  subreddits: ["MachineLearning", "artificial"],
  numSimulations: 1000
})
```

## Example Output

```typescript
{
  recommendations: [
    {
      rank: 1,
      subreddit: "r/MachineLearning",
      optimal_time: {
        hour_utc: 14,
        day_of_week: 2, // Tuesday
        time_description: "Tue 14:00 UTC (in 3 hours)"
      },
      expected_performance: {
        score_range: [850, 1200],
        comments_range: [45, 70],
        success_rate: 0.78 // 78% above threshold
      },
      reasoning: "High engagement during US afternoon, strong keyword match with 2,847 similar posts",
      confidence: 0.85
    }
    // ... 2 more recommendations
  ],
  strategy_summary: {
    best_overall: "r/MachineLearning on Tue 14:00 UTC",
    backup_options: ["r/artificial Wed 09:00", "r/technology Mon 16:00"],
    timing_strategy: "Post during peak US hours (14:00-16:00 UTC)",
    risk_assessment: "Moderate - good historical data, seasonal variation possible"
  }
}
```

## UI Components (To Be Built)

### Main Simulator Panel
**File**: `/app/dashboard/studio/generator/components/Simulator.tsx`
- Shows selected keywords
- "Run Simulation" button
- Results display with top 3 recommendations
- "Use This Strategy" buttons for each recommendation

### Detail Modal
**Component**: `SimulationDetailModal.tsx`
- Full timing analysis with heatmap
- Performance prediction charts
- Similar successful posts list
- Content recommendations

### Time Heatmap
**Component**: `EngagementHeatmap.tsx`
- Visual 24x7 grid showing best posting times
- Color-coded by engagement rate
- Interactive hover for details

## Schema Additions Needed

```typescript
// Add to convex/schema.ts

simulation_runs: defineTable({
  run_id: v.string(),
  keywords: v.array(v.string()),
  subreddits_tested: v.array(v.string()),
  num_simulations: v.number(),
  results: v.string(), // JSON
  created_at: v.number()
})
  .index("by_run_id", ["run_id"])
  .index("by_created_at", ["created_at"]),

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
  .index("by_subreddit_time", ["subreddit", "hour_utc", "day_of_week"])
```

## Implementation Phases

### Phase 1: Data Collection (Week 1-2)
- [ ] Build temporal analyzer queries
- [ ] Create pattern matching functions
- [ ] Add caching layer

### Phase 2: Simulation Engine (Week 3-4)
- [ ] Implement Monte Carlo simulation
- [ ] Build recommendation algorithm
- [ ] Test prediction accuracy

### Phase 3: UI Integration (Week 5-6)
- [ ] Create Simulator component
- [ ] Add to Generator tab
- [ ] Build detail views

### Phase 4: Testing & Polish (Week 7-8)
- [ ] User testing
- [ ] Performance optimization
- [ ] Documentation updates

## Key Algorithms

### Temporal Engagement Score
```
1. Group posts by subreddit + hour + day_of_week
2. Calculate mean(score), mean(comments), count
3. Normalize engagement_rate = (score + comments*2) / max_observed
4. Calculate confidence = min(1, post_count / 100)
5. Return top time windows
```

### Pattern Similarity
```
similarity = 
  keyword_match * 0.4 +
  format_match * 0.3 +
  title_style * 0.2 +
  length_similarity * 0.1
```

### Monte Carlo Simulation
```
For 1000 iterations:
  1. Sample from historical score distribution
  2. Apply time-of-day multiplier
  3. Apply keyword trend multiplier
  4. Record result
Calculate mean, median, confidence intervals
```

## Success Metrics to Track

- **Accuracy**: Predicted vs actual engagement
- **Usage**: Simulations run, strategies used
- **Performance**: Simulation speed, cache hit rate
- **User Satisfaction**: Feedback scores

## Technical Considerations

✅ **Cache temporal patterns** (refresh daily)  
✅ **Require min 50 posts** for confidence  
✅ **Handle outliers** in engagement data  
✅ **Graceful degradation** with insufficient data  
✅ **Clear confidence indicators** in UI  
⚠️ **Respect Reddit API terms**  
⚠️ **No personal data** in simulations  

## Integration Points

### Existing Features Used
- `getTrendingKeywords` query from keywords system
- Metric scoring matrix (9 metrics per subreddit)
- `live_feed_posts` historical data
- `generated_posts` tracking system

### New Features Added
- Temporal pattern analysis
- Predictive simulation engine
- Strategy recommendation system
- Time-based optimization

## Quick Links

- **Full Documentation**: [reddit-simulator.md](./reddit-simulator.md)
- **Architecture Overview**: See "System Architecture" section in full doc
- **API Reference**: See "API Endpoints Summary" section
- **UI Mockups**: See "User Interaction Flow" section

---

*Last Updated: October 1, 2024*  
*For questions or implementation help, see the full documentation.*
