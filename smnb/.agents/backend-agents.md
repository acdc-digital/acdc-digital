# Back-End LLM Agents Registry

Back-end agents execute on the Convex layer, orchestrating database operations, workflows, and secure integrations. They must live under `smnb/smnb/convex` and be exposed via `query`, `mutation`, or `action` with strict validators.

## Agent Registry

| Agent Key | Convex Module | Responsibility | Prompt Overview | Model | Cost Anchor | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `generateRedditPost` | `convex/generateContent.ts` | Reddit post generation | Metric-driven content creation | Claude 3.5 Haiku | $0.005-0.015 | Active |
| `costTracking.logModelUsage` | `convex/costTracking.ts` | LLM usage tracking | No LLM calls (data storage) | N/A | $0.000 | Active |
| `tokenUsage` mutations | `convex/tokenUsage.ts` | Token consumption tracking | No LLM calls (metrics) | N/A | $0.000 | Active |
| Database health checks | `convex/apiHealth.ts` | System monitoring | No LLM calls | N/A | $0.000 | Active |
| Reddit feed processing | `convex/redditFeed.ts` | Data ingestion & storage | No LLM calls | N/A | $0.000 | Active |
| Keyword metrics | `convex/keywordMetrics.ts` | Performance analytics | No LLM calls | N/A | $0.000 | Active |
| User analytics | `convex/userAnalytics.ts` | User behavior tracking | No LLM calls | N/A | $0.000 | Active |
| Content enrichment | `convex/enhancedTrends.ts` | Trend analysis | No LLM calls | N/A | $0.000 | Active |

## Prompt & Function Template

```text
### Agent: <agent key>
- **Convex File:** smnb/smnb/convex/<module>.ts
- **Function Type:** action (for LLM calls with "use node")
- **Args Validator:** 
  ```ts
  {
    keywords: v.array(v.object({
      keyword: v.string(),
      count: v.number(),
      category: v.string(),
      sentiment: v.string(),
      confidence: v.number(),
      trending: v.boolean()
    })),
    columnContext: v.string(),
    instructions: v.optional(v.string())
  }
  ```
- **Returns Validator:** 
  ```ts
  v.object({
    title: v.string(),
    content: v.string(),
    subreddit: v.string(),
    author: v.string(),
    estimatedScore: v.number(),
    estimatedComments: v.number(),
    keywords: v.array(v.string()),
    generatedAt: v.number(),
    modelCost: v.number(),
    postId: v.id("generated_posts")
  })
  ```
- **Primary Data Touchpoints:** keyword metrics, cost tracking, generated posts storage
- **Prompt Goal:** Generate Reddit posts optimized for engagement metrics
- **System Instructions:**
  ```
  You are an expert Reddit content generator that creates posts optimized 
  for maximum engagement based on data-driven metrics.
  
  CRITICAL: Your primary goal is to generate content that will score highly 
  according to our 9-metric scoring matrix: Story Yield, Feed Contribution, 
  Engagement Potential, Relevance Consistency, Novelty Index, etc.
  ```
- **User Prompt Assembly:**
  - Structured context from keyword metrics queries
  - Performance data and top posts analysis
  - Content strategy based on aggregated metrics
  - Target subreddit optimization
- **Post-Processing:** 
  - Store generated post via `api.generatedPosts.storeGeneratedPost`
  - Log model usage via `internal.costTracking.logModelUsage`
  - Track tokens and calculate costs
- **Observability:** 
  - Token usage tracking in costTracking table
  - Performance metrics in keyword metrics
  - Generated content stored with metadata
```

## Implementation Checklist

- [ ] Declare Convex action with `"use node";` directive for LLM SDK usage.
- [ ] Use new function syntax: `export const agentName = action({ args, returns, handler })`.
- [ ] Import Anthropic SDK and initialize client with environment variables.
- [ ] Implement comprehensive input validation using Convex validators.
- [ ] Query supporting data via `ctx.runQuery(internal.module.function, args)`.
- [ ] Build structured prompts with metric-driven content strategies.
- [ ] Handle streaming responses and JSON parsing with error handling.
- [ ] Store results via `ctx.runMutation(api.module.function, data)`.
- [ ] Log costs and token usage via `internal.costTracking.logModelUsage`.
- [ ] Add comprehensive error handling for API failures and malformed responses.
- [ ] Include temperature and token optimization based on content requirements.
- [ ] Update this registry and the central audit after deploying the agent.

## Cost Reference

| Model | Input $ / 1K tokens | Output $ / 1K tokens | Last Verified |
| --- | --- | --- | --- |
| GPT-4o | $0.005 | $0.015 | 2025-09-29 |
| GPT-4o Mini | $0.0006 | $0.0024 | 2025-09-29 |
| Claude 3.5 Sonnet | $0.003 | $0.015 | 2025-09-29 |

> _Keep pricing current to maintain accurate budgeting._