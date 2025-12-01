# AI Usage Tracking API Reference

> Anthropic/OpenAI API usage tracking, analytics, and prompts

---

## Convex Functions

### Queries

| Function | Description |
|----------|-------------|
| `anthropic.getUsageStats` | Get overall usage statistics |
| `anthropic.getRecentUsage` | Get recent usage records |
| `anthropic.getUserUsageStats` | Get user-specific usage stats |
| `anthropic.getCostTrends` | Get cost trends over time |
| `anthropic.getTopFeatures` | Get top features by usage |

### Mutations

| Function | Description |
|----------|-------------|
| `anthropic.trackUsage` | Track AI API usage |
| `anthropic.cleanupOldUsage` | Clean up old usage records |

---

## Backend Utilities (prompts.ts)

Constants and functions used by AI-related Convex actions.

### Configuration

| Export | Type | Description |
|--------|------|-------------|
| `AI_CONFIG` | const | AI model configuration settings |
| `COLOR_CATEGORIES` | const | Score-to-color category mappings |
| `PROMPT_METADATA` | const | Metadata for all prompt types |

### Prompt Templates

| Export | Description |
|--------|-------------|
| `SCORING_PROMPT` | Mood scoring analysis prompt |
| `FORECASTING_PROMPT` | 3-day emotional forecast prompt |
| `FEED_SUMMARY_PROMPT` | Daily reflection summary prompt |
| `DAILY_CONSULTATION_PROMPT` | Selected day analysis prompt |
| `WEEKLY_INSIGHTS_PROMPT` | 7-day pattern insights prompt |
| `RANDOM_LOG_PROMPT` | Random log entry generator prompt |

### Helper Functions

| Function | Description |
|----------|-------------|
| `getColorCategory(score)` | Get color category for a score |
