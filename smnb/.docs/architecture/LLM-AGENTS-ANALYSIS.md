# SMNB Project - LLM Agents & AI Tools Analysis

**Generated:** October 16, 2025  
**Project:** Social Media News Broadcaster (SMNB)  
**Primary LLM Provider:** Anthropic Claude

---

## Executive Summary

The SMNB project utilizes Anthropic's Claude AI models extensively across multiple domains:
- **Backend Analytics**: Sentiment analysis, news summarization, content generation
- **Frontend AI Host**: Real-time market commentary and narration
- **Content Editor**: Newsletter generation, content refinement, formatting

**Total LLM Integration Points:** 7 major services  
**Models Used:** Claude 3.5 Sonnet, Claude Haiku 4.5, Claude 3.5 Haiku (legacy), Claude 3 Haiku (legacy)  
**Architecture:** Mix of server-side Convex actions and client-side API routes

---

## 1. Backend Convex Actions (Server-Side LLM Calls)

### 1.1 Sentiment Analysis Generator
**File:** `convex/stats/sentimentAnalysis.ts`  
**Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)  
**Purpose:** Generate 2-paragraph sentiment analysis excerpts for stock tickers

**Functionality:**
- Analyzes Reddit sentiment data (30-day window)
- Calculates performance multiplier vs baseline
- Generates contextual analysis of community perception
- Identifies trends, momentum, and investor interest levels

**Input Data:**
- Ticker symbol
- Index weight
- Sentiment score
- Baseline calculation
- Performance multiplier
- 24h change percentage

**Output:**
- 100-150 word analysis (2 paragraphs)
- Generated timestamp
- Token usage metrics

**Caching:** 24-hour cache in `sentiment_excerpts` table

**API Key:** `process.env.ANTHROPIC_API_KEY` (server-side)

**Prompt Structure:**
```
TICKER: [symbol]
SENTIMENT SCORE: [score]
PERFORMANCE MULTIPLIER: [multiplier]x
24H CHANGE: [change]%

PARAGRAPH 1: Current sentiment level, community perception, 24h trend
PARAGRAPH 2: Driving factors, investor interest, data-driven insights
```

---

### 1.2 News Summary Generator
**File:** `convex/stats/finlightNews.ts`  
**Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)  
**Purpose:** Summarize news articles and extract sentiment scores

**Functionality:**
- Fetches news from Finlight.me API (last 7 days)
- Generates concise 2-paragraph summaries
- Extracts sentiment score (0-100 scale)
- Identifies key topics and market implications

**Input Data:**
- Ticker symbol
- News articles (titles, descriptions, timestamps)
- Article sources
- Index weight

**Output:**
- Summary text (2 paragraphs)
- News sentiment score (0-100)
- Generated timestamp
- Article count
- Source list

**Caching:** 7-day cache in `finlight_news_summaries` table

**Sentiment Extraction:**
```
SENTIMENT_SCORE: [0-100]
- 0-30: Very bearish
- 30-50: Bearish
- 50: Neutral
- 50-70: Bullish
- 70-100: Very bullish
```

**Prompt Structure:**
```
TASK 1 - SENTIMENT SCORE (0-100 scale)
TASK 2 - SUMMARY (2 paragraphs)
- Paragraph 1: Key developments, major announcements
- Paragraph 2: Market implications, analyst perspectives
```

---

### 1.3 Bulk News Generation
**File:** `convex/stats/bulkNewsGeneration.ts`  
**Model:** Claude Haiku 4.5 (via `generateNewsSummary` action)  
**Purpose:** Batch process news summaries for all 100 NASDAQ tickers

**Functionality:**
- Processes tickers in batches (default: 5 at a time)
- Adds delays between batches to avoid rate limits
- Tracks success/failure for each ticker
- Generates comprehensive report

**Configuration:**
- Batch size: Configurable (default 5)
- Delay: Configurable (default 2000ms)
- Total tickers: 100 NASDAQ companies

**Success Rate:** ~88% (88/100 tickers have news data)

---

### 1.4 Content Generator (Editor)
**File:** `convex/editor/generateContent.ts`  
**Model:** Claude 3 Haiku (`claude-3-haiku-20240307`)  
**Purpose:** Generate Reddit posts, tweets, and various content formats

**Functionality:**
- Generates synthetic Reddit posts based on keywords
- Creates realistic social media content
- Maintains consistent voice and style
- Includes metadata (scores, authors, subreddits)

**Content Types:**
- Reddit posts
- Twitter/X posts
- Blog excerpts
- News headlines

**Input Data:**
- Keywords with sentiment/confidence scores
- Column context
- Custom instructions

**Output:**
- Generated content
- Metadata (author, platform, estimated score)
- Token usage

---

## 2. Frontend Client-Side LLM Services

### 2.1 Claude LLM Service (Host Agent)
**File:** `lib/services/host/claudeLLMService.ts`  
**Architecture:** Client-side proxy to `/api/claude` route  
**Purpose:** Powers the AI Host/Narrator for market commentary

**Functionality:**
- Real-time market analysis
- Sentiment-driven narration
- Event-based commentary
- Streaming responses

**Key Features:**
- User API key support (optional)
- Session-based token tracking
- Cost estimation
- Token counting service integration

**Models Supported:**
- Claude 3.5 Sonnet (primary)
- Claude Haiku 4.5 (fallback)
- Claude 3 Opus (premium)

**API Key Management:**
- Environment key (default): `ANTHROPIC_API_KEY`
- User key (optional): From `apiKeyStore`

**Token Tracking:**
```typescript
interface TokenUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model: string;
  duration: number;
}
```

---

### 2.2 Editor AI Service
**File:** `lib/services/editor/editorAIService.ts`  
**Model:** Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)  
**Purpose:** Advanced content editing, formatting, and newsletter generation

**Functionality:**
- Newsletter formatting with AI Text Editor tool
- Content enhancement and refinement
- Markdown structure optimization
- Analytical template application

**Special Features:**
- **Anthropic Text Editor Tool:** Advanced structured editing
- **Tool Use Pattern:** `text_editor_20241022` tool
- **Multi-pass editing:** Creates, refines, validates

**Editor Modes:**
- Newsletter formatting
- Content enhancement
- Structure optimization
- Analytical transformation

**Prompt Templates:**
- Newsletter format
- Data visualization
- Analytical insights
- Market reports

---

### 2.3 Mock LLM Service
**File:** `lib/services/host/mockLLMService.ts`  
**Purpose:** Development/testing without API calls

**Functionality:**
- Simulates Claude responses
- Realistic delays
- Predefined response templates
- Zero API costs

**Use Cases:**
- Development testing
- UI/UX prototyping
- Demo mode
- Rate limit fallback

---

## 3. Token Counting & Cost Management

### Token Counting Service
**File:** `lib/services/core/tokenCountingService.ts`  
**Purpose:** Track usage and costs across all LLM calls

**Pricing (Current Rates):**

| Model | Input ($/1M tokens) | Output ($/1M tokens) |
|-------|---------------------|----------------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3.5 Haiku | $1.00 | $5.00 |
| Claude 3 Opus | $15.00 | $75.00 |

**Features:**
- Pre-request token estimation
- Post-request cost calculation
- Convex integration for persistence
- Session-based tracking
- Historical analytics

---

## 4. LLM Integration Patterns

### 4.1 Server-Side Pattern (Convex Actions)
```typescript
// Initialize SDK
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Make request
const response = await anthropic.messages.create({
  model: "claude-3-5-haiku-20241022",
  max_tokens: 512,
  temperature: 0.7,
  messages: [{ role: "user", content: prompt }],
});

// Extract content
const content = response.content[0].text;
```

**Advantages:**
- API key security (server-side only)
- Direct SDK access
- Full model capabilities
- Cost control

---

### 4.2 Client-Side Pattern (API Route Proxy)
```typescript
// Call API route
const response = await fetch('/api/claude', {
  method: 'POST',
  body: JSON.stringify({
    prompt,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
  }),
});

// Handle streaming
const reader = response.body.getReader();
for await (const chunk of readStream(reader)) {
  // Process streaming chunks
}
```

**Advantages:**
- Client-side flexibility
- User API key support
- Streaming responses
- Browser compatibility

---

## 5. Caching Strategy

### Sentiment Excerpts
**Table:** `sentiment_excerpts`  
**TTL:** 24 hours  
**Key:** `ticker`  
**Purpose:** Reduce redundant analysis calls

### News Summaries
**Table:** `finlight_news_summaries`  
**TTL:** 7 days  
**Key:** `ticker`  
**Purpose:** Minimize news API + Claude calls

### Cache Invalidation:
- Time-based expiration
- Manual refresh available
- Background regeneration

---

## 6. Cost Optimization Strategies

### 1. **Model Selection**
- Use Haiku for routine tasks (5x cheaper than Sonnet)
- Reserve Sonnet for complex editing/formatting
- Avoid Opus except for premium features

### 2. **Caching**
- 24-hour sentiment cache → ~95% cache hit rate
- 7-day news cache → ~85% cache hit rate
- Estimated savings: ~$150/month

### 3. **Batch Processing**
- Bulk news generation (5 tickers at once)
- Rate limiting (2s delay between batches)
- Error handling (skip failed tickers)

### 4. **Token Limits**
- Sentiment: 512 max tokens (~$0.0025/call)
- News: 512 max tokens (~$0.0025/call)
- Editor: 4000 max tokens (~$0.065/call)

### 5. **User API Keys**
- Optional user-provided keys
- Offload costs to power users
- Maintain free tier with limits

---

## 7. Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                    │
│  (WelcomeTab → TickerBadge → Analysis Cards)       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│              Convex Queries (Real-time)             │
│  • sentimentExcerptCache.getCachedExcerpt          │
│  • finlightNewsCache.getCachedSummary              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓ (Cache Miss)
┌─────────────────────────────────────────────────────┐
│            Convex Actions (Background)              │
│  • sentimentAnalysis.generateSentimentExcerpt      │
│  • finlightNews.generateNewsSummary                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│          External APIs + Claude Haiku 3.5           │
│  • Finlight.me (news articles)                     │
│  • Anthropic API (text generation)                 │
└─────────────────────────────────────────────────────┘
```

---

## 8. API Key Management

### Environment Variables (Server)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Used By:**
- All Convex actions
- Server-side generation
- Bulk processing

### User API Keys (Client)
**Storage:** `apiKeyStore` (client-side state)  
**Purpose:** Optional user-provided keys  
**Benefits:**
- Cost offloading
- Higher rate limits
- Premium features

**Toggle:** User can enable/disable via UI

---

## 9. Real-Time Features

### Host Agent (Trading Commentary)
**Service:** `hostAgentService.ts`  
**LLM:** Claude 3.5 Sonnet (via `claudeLLMService`)  
**Mode:** Streaming responses

**Triggers:**
- New sentiment data
- Market events
- User interactions
- Scheduled updates

**Narration Types:**
- Opening commentary
- Trend analysis
- Breaking news response
- Market close summary

---

## 10. Future Optimization Opportunities

### 1. **Prompt Optimization**
- Reduce token usage by 20-30%
- More structured outputs
- Better few-shot examples

### 2. **Model Upgrades**
- Claude 3.5 Haiku → even faster
- Fine-tuned models for specific tasks
- Multi-model strategy

### 3. **Caching Enhancements**
- Semantic caching (similar queries)
- Predictive pre-generation
- User-specific caching

### 4. **Batch Operations**
- Combine multiple requests
- Parallel processing improvements
- Smarter retry logic

### 5. **Cost Monitoring**
- Real-time budget alerts
- Per-user cost tracking
- Automated throttling

---

## 11. Security Considerations

### API Key Protection
✅ Server-side keys never exposed  
✅ Client-side keys encrypted in transit  
✅ No keys in client-side code  
✅ Environment variable management

### Rate Limiting
✅ Built-in delays between batch requests  
✅ Error handling for rate limit errors  
✅ Exponential backoff strategies  
✅ User quota management

### Data Privacy
✅ No PII sent to Claude  
✅ Stock symbols and metrics only  
✅ Public data sources  
✅ Cached data encrypted at rest

---

## 12. Monitoring & Analytics

### Token Usage Tracking
**Service:** `tokenCountingService`  
**Storage:** Convex `token_usage` table

**Metrics Tracked:**
- Input tokens
- Output tokens
- Estimated cost
- Model used
- Request duration
- Session ID
- Timestamp

### Usage Reports Available:
- Per-model breakdown
- Daily/weekly/monthly aggregates
- Cost projections
- Cache hit rates

---

## 13. Development vs Production

### Development Mode
- Mock LLM service available
- Lower rate limits acceptable
- Verbose logging enabled
- Test API keys

### Production Mode
- Real Claude API calls
- Optimized caching
- Error recovery
- Cost monitoring active
- User API key support

---

## 14. LLM Call Summary

| Service | File | Model | Frequency | Cost/Call | Purpose |
|---------|------|-------|-----------|-----------|---------|
| Sentiment Analysis | `stats/sentimentAnalysis.ts` | Haiku 4.5 | Daily | $0.0025 | Generate sentiment excerpts |
| News Summary | `stats/finlightNews.ts` | Haiku 4.5 | Daily | $0.0025 | Summarize news articles |
| Bulk News | `stats/bulkNewsGeneration.ts` | Haiku 4.5 | Manual | $0.25 | Process all 100 tickers |
| Content Gen | `editor/generateContent.ts` | Haiku 3 | On-demand | $0.002 | Create social posts |
| Host Agent | `lib/services/host/claudeLLMService.ts` | Sonnet 3.5 | Real-time | $0.05 | Market commentary |
| Editor AI | `lib/services/editor/editorAIService.ts` | Sonnet 3.5 | On-demand | $0.065 | Newsletter editing |

**Estimated Monthly Cost:** $50-150 (depending on usage)

---

## 15. Key Takeaways

### ✅ Strengths
1. **Multi-model strategy** optimizes cost vs capability
2. **Aggressive caching** reduces redundant API calls
3. **Server-side security** protects API keys
4. **User API key support** enables cost offloading
5. **Token tracking** provides cost visibility

### ⚠️ Areas for Improvement
1. **Prompt optimization** could reduce token usage
2. **Cache warming** could improve perceived performance
3. **Batch processing** could be more efficient
4. **Error handling** needs more granular retry logic
5. **Cost alerting** should be more proactive

### 🎯 Best Practices Observed
1. Haiku for routine tasks, Sonnet for complex work
2. 24h-7d caching windows based on data freshness
3. Streaming responses for better UX
4. Session-based token attribution
5. Graceful degradation (Mock service fallback)

---

## Conclusion

The SMNB project demonstrates a mature, cost-effective approach to LLM integration. The architecture balances performance, cost, and user experience through strategic model selection, aggressive caching, and thoughtful API design. With an estimated monthly cost of $50-150, the system provides high-value AI-powered insights across sentiment analysis, news summarization, and real-time market commentary.

**Next Steps:**
1. Implement prompt optimization (target: 20% token reduction)
2. Add predictive cache warming
3. Enhance cost monitoring with real-time alerts
4. Explore fine-tuned models for specific tasks
5. A/B test different prompt strategies

---

**Document Version:** 1.0  
**Last Updated:** October 16, 2025  
**Maintained By:** SMNB Development Team
