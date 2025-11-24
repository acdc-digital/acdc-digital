export const apiIntegrationContent = `# API Integration
## Reddit, Convex, and Anthropic Integration Guide

---

## Reddit API Integration

### Overview
Reddit provides a public JSON API that doesn't require authentication for read-only access.

### Base URL
\`\`\`
https://www.reddit.com/r/{subreddit}/{sort}.json
\`\`\`

### Available Sorts
- \`hot\` - Trending posts (default)
- \`new\` - Newest posts
- \`rising\` - Rising posts
- \`top\` - Top posts (requires \`t\` parameter)

### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| \`limit\` | number | Max posts (1-100) | 25 |
| \`after\` | string | Pagination cursor | null |
| \`t\` | string | Time filter (hour/day/week/month/year/all) | day |
| \`raw_json\` | number | Disable HTML encoding (0 or 1) | 0 |

### Example Request
\`\`\`bash
curl "https://www.reddit.com/r/Entrepreneur/hot.json?limit=10&raw_json=1"
\`\`\`

### Response Structure
\`\`\`json
{
  "kind": "Listing",
  "data": {
    "after": "t3_abc123",
    "dist": 10,
    "children": [
      {
        "kind": "t3",
        "data": {
          "id": "abc123",
          "title": "How I built a $10k/mo SaaS",
          "selftext": "Long post content...",
          "author": "username",
          "subreddit": "Entrepreneur",
          "score": 142,
          "num_comments": 35,
          "created_utc": 1700000000,
          "permalink": "/r/Entrepreneur/comments/abc123/...",
          "url": "https://...",
          "over_18": false,
          "spoiler": false,
          "thumbnail": "https://...",
          // ... 30+ more fields
        }
      }
    ]
  }
}
\`\`\`

---

## Reddit API Client

### File: \`lib/api/reddit.ts\`

\`\`\`typescript
class RedditAPI {
  private baseURL = '/api/reddit'; // Next.js proxy
  
  async fetchPosts(
    subreddit: string = 'all',
    sort: SortType = 'hot',
    limit: number = 25,
    timeFilter: TimeFilter = 'day',
    after?: string
  ): Promise<RedditResponse> {
    const params = new URLSearchParams({
      subreddit,
      sort,
      limit: Math.min(limit, 100).toString(),
    });
    
    if (timeFilter && sort === 'top') {
      params.append('t', timeFilter);
    }
    
    if (after) {
      params.append('after', after);
    }
    
    const response = await fetch(\`\${this.baseURL}?\${params}\`);
    
    if (!response.ok) {
      throw new Error(\`Reddit API error: \${response.status}\`);
    }
    
    return await response.json();
  }
  
  async fetchHotPosts(
    subreddits: string[] = ['all'],
    limit: number = 10
  ): Promise<RedditResponse[]> {
    const results = await Promise.allSettled(
      subreddits.map(sub => this.fetchPosts(sub, 'hot', limit))
    );
    
    return results
      .filter((r): r is PromiseFulfilledResult<RedditResponse> => 
        r.status === 'fulfilled'
      )
      .map(r => r.value);
  }
}

export const redditAPI = new RedditAPI();
\`\`\`

---

## Next.js API Route (Proxy)

### Why Use a Proxy?
1. **CORS bypass**: Reddit's API doesn't allow browser requests
2. **Rate limiting**: Centralized control
3. **Error handling**: Consistent error responses
4. **Security**: Hide implementation details

### File: \`app/api/reddit/route.ts\`

\`\`\`typescript
import { NextRequest } from 'next/server';

// Global rate limiter singleton
const globalRateLimiter = new GlobalRateLimiter();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddit = searchParams.get('subreddit') || 'all';
  const sort = searchParams.get('sort') || 'hot';
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '25'),
    100
  );
  
  // Rate limit check
  const rateLimitResult = await globalRateLimiter.waitForNextRequest();
  
  if (rateLimitResult.blocked) {
    return Response.json(
      { 
        error: 'Rate limited',
        retry_after: rateLimitResult.remainingSeconds 
      },
      { status: 429 }
    );
  }
  
  try {
    // Build Reddit URL
    const redditUrl = new URL(
      \`https://www.reddit.com/r/\${subreddit}/\${sort}.json\`
    );
    redditUrl.searchParams.set('limit', limit.toString());
    redditUrl.searchParams.set('raw_json', '1');
    
    if (searchParams.has('after')) {
      redditUrl.searchParams.set('after', searchParams.get('after')!);
    }
    
    if (searchParams.has('t')) {
      redditUrl.searchParams.set('t', searchParams.get('t')!);
    }
    
    // Fetch from Reddit
    const response = await fetch(redditUrl.toString(), {
      headers: {
        'User-Agent': 'soloist-marketing-dashboard/1.0',
      },
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        globalRateLimiter.handleRateLimitError();
        return Response.json(
          { error: 'Reddit rate limit exceeded' },
          { status: 429 }
        );
      }
      
      throw new Error(\`Reddit API error: \${response.status}\`);
    }
    
    const data = await response.json();
    globalRateLimiter.handleSuccessfulRequest();
    
    return Response.json(data);
    
  } catch (error) {
    console.error('Reddit API error:', error);
    return Response.json(
      { error: 'Failed to fetch from Reddit' },
      { status: 500 }
    );
  }
}
\`\`\`

---

## Rate Limiter Implementation

\`\`\`typescript
class GlobalRateLimiter {
  private lastRequestTime = 0;
  private minRequestInterval = 5000; // 5 seconds
  private rateLimitBackoff = 0;
  private maxBackoff = 60000; // 1 minute
  private isCircuitBreakerOpen = false;
  private circuitBreakerThreshold = 30000; // 30s
  private circuitBreakerResetTime = 120000; // 2 minutes
  private circuitBreakerOpenedAt = 0;
  
  async waitForNextRequest(): Promise<{
    blocked: boolean;
    remainingSeconds?: number;
  }> {
    // Check circuit breaker
    if (this.isCircuitBreakerOpen) {
      const timeSinceOpened = Date.now() - this.circuitBreakerOpenedAt;
      
      if (timeSinceOpened > this.circuitBreakerResetTime) {
        console.log('🔄 Circuit breaker reset');
        this.isCircuitBreakerOpen = false;
        this.rateLimitBackoff = Math.floor(this.rateLimitBackoff / 2);
      } else {
        const remaining = Math.ceil(
          (this.circuitBreakerResetTime - timeSinceOpened) / 1000
        );
        console.log(\`⚠️ Circuit breaker open, retry in \${remaining}s\`);
        return { blocked: true, remainingSeconds: remaining };
      }
    }
    
    // Calculate delay
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const totalDelay = this.minRequestInterval + this.rateLimitBackoff;
    const remainingDelay = Math.max(0, totalDelay - timeSinceLastRequest);
    
    if (remainingDelay > 0) {
      console.log(\`⏳ Waiting \${remainingDelay}ms before next request\`);
      await new Promise(resolve => setTimeout(resolve, remainingDelay));
    }
    
    this.lastRequestTime = Date.now();
    return { blocked: false };
  }
  
  handleRateLimitError() {
    console.log('❌ Rate limit error received');
    
    // Exponential backoff
    this.rateLimitBackoff = Math.min(
      this.rateLimitBackoff + 10000,
      this.maxBackoff
    );
    
    console.log(\`📈 Backoff increased to \${this.rateLimitBackoff}ms\`);
    
    // Open circuit breaker if needed
    if (this.rateLimitBackoff >= this.circuitBreakerThreshold) {
      this.isCircuitBreakerOpen = true;
      this.circuitBreakerOpenedAt = Date.now();
      console.log('🔴 Circuit breaker opened');
    }
  }
  
  handleSuccessfulRequest() {
    // Gradual recovery
    if (this.rateLimitBackoff > 0) {
      this.rateLimitBackoff = Math.max(
        0,
        this.rateLimitBackoff - 5000
      );
      console.log(\`📉 Backoff decreased to \${this.rateLimitBackoff}ms\`);
    }
  }
}
\`\`\`

---

## Convex Integration

### Setup

1. **Install Convex CLI**:
\`\`\`bash
npm install -g convex
\`\`\`

2. **Initialize Convex**:
\`\`\`bash
npx convex dev
\`\`\`

3. **Add \`.env.local\`**:
\`\`\`env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
\`\`\`

### Query Pattern (Real-time)

\`\`\`typescript
// convex/insights.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAllInsights = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("marketing_insights"),
    _creationTime: v.number(),
    insight_id: v.string(),
    narrative: v.string(),
    // ... all fields
  })),
  handler: async (ctx) => {
    return await ctx.db
      .query("marketing_insights")
      .order("desc")
      .collect();
  },
});

// React component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const insights = useQuery(api.insights.getAllInsights, {});
// Auto-updates via WebSocket!
\`\`\`

### Mutation Pattern

\`\`\`typescript
// convex/insights.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addInsight = mutation({
  args: {
    insight_id: v.string(),
    narrative: v.string(),
    insight_type: v.union(
      v.literal("pain_point"),
      v.literal("competitor_mention"),
      v.literal("feature_request"),
      v.literal("sentiment")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    sentiment: v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    ),
    topics: v.array(v.string()),
    summary: v.string(),
    postTitle: v.string(),
    postUrl: v.string(),
    subreddit: v.string(),
  },
  returns: v.id("marketing_insights"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketing_insights", args);
  },
});

// React component
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const addInsight = useMutation(api.insights.addInsight);
await addInsight(insightData);
\`\`\`

### Action Pattern (AI)

\`\`\`typescript
// convex/ai/generateInsight.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateInsight = action({
  args: {
    postTitle: v.string(),
    postContent: v.string(),
    postSubreddit: v.string(),
    postUrl: v.string(),
  },
  returns: v.object({
    narrative: v.string(),
    insight_type: v.union(/* ... */),
    priority: v.union(/* ... */),
    sentiment: v.union(/* ... */),
    topics: v.array(v.string()),
    summary: v.string(),
  }),
  handler: async (ctx, args) => {
    // Rate limit
    await waitForAnthropicRateLimit();
    
    // Call Claude
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{
        role: "user",
        content: buildPrompt(args)
      }],
    });
    
    // Parse response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
    
    const jsonText = content.text
      .replace(/^\`\`\`json\\n/, '')
      .replace(/\\n\`\`\`$/, '')
      .trim();
    
    return JSON.parse(jsonText);
  },
});
\`\`\`

---

## Anthropic API (Claude)

### Model: Claude Haiku 4.5

**Identifier**: \`claude-haiku-4-5-20251001\`

**Characteristics**:
- **Speed**: Fastest Claude model (~1s response)
- **Cost**: $0.25 per 1M input tokens, $1.25 per 1M output
- **Context**: 200k tokens
- **Best for**: JSON generation, classification, summaries

### Rate Limits

| Tier | RPM | TPM | Cost |
|------|-----|-----|------|
| **Tier 1** (Free) | 50 | 40k | $5/month credit |
| **Tier 2** | 500 | 80k | Usage-based |
| **Tier 3** | 5000 | 400k | Usage-based |

**Current Implementation**: Tier 1 (50 RPM)

### Prompt Engineering

\`\`\`typescript
function buildPrompt(args: {
  postTitle: string;
  postContent: string;
  postSubreddit: string;
  postUrl: string;
}): string {
  return \`You are a marketing research analyst analyzing Reddit posts for business insights.

Analyze this post and provide insights in EXACT JSON format.

POST TITLE: \${args.postTitle}

POST CONTENT: \${args.postContent || '(No content)'}

SUBREDDIT: r/\${args.postSubreddit}

URL: \${args.postUrl}

CRITICAL: Return ONLY valid JSON matching this EXACT format (no markdown, no extra text):

{
  "narrative": "A 2-3 sentence summary of the key insight from this post",
  "insight_type": "pain_point" | "competitor_mention" | "feature_request" | "sentiment",
  "priority": "high" | "medium" | "low",
  "sentiment": "positive" | "negative" | "neutral",
  "topics": ["topic1", "topic2", "topic3"],
  "summary": "One sentence summary"
}

Rules:
- insight_type MUST be one of: pain_point, competitor_mention, feature_request, sentiment
- priority MUST be one of: high, medium, low
- sentiment MUST be one of: positive, negative, neutral
- topics MUST be an array of 2-5 relevant keywords
- All fields are required\`;
}
\`\`\`

### Response Validation

\`\`\`typescript
function validateInsight(data: any): InsightResult {
  const validTypes = ['pain_point', 'competitor_mention', 'feature_request', 'sentiment'];
  const validPriorities = ['high', 'medium', 'low'];
  const validSentiments = ['positive', 'negative', 'neutral'];
  
  if (!validTypes.includes(data.insight_type)) {
    console.warn('Invalid insight_type, defaulting to sentiment');
    data.insight_type = 'sentiment';
  }
  
  if (!validPriorities.includes(data.priority)) {
    console.warn('Invalid priority, defaulting to medium');
    data.priority = 'medium';
  }
  
  if (!validSentiments.includes(data.sentiment)) {
    console.warn('Invalid sentiment, defaulting to neutral');
    data.sentiment = 'neutral';
  }
  
  if (!Array.isArray(data.topics)) {
    data.topics = [];
  }
  
  return data as InsightResult;
}
\`\`\`

---

## Error Handling

### Reddit API Errors

\`\`\`typescript
try {
  const response = await fetch(redditUrl);
  
  if (response.status === 429) {
    // Rate limited
    globalRateLimiter.handleRateLimitError();
    return { error: 'Rate limited', retry_after: 120 };
  }
  
  if (response.status === 503) {
    // Reddit down
    return { error: 'Reddit temporarily unavailable' };
  }
  
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }
  
} catch (error) {
  console.error('Reddit fetch failed:', error);
  return { error: 'Network error' };
}
\`\`\`

### Anthropic API Errors

\`\`\`typescript
try {
  const message = await anthropic.messages.create({/* ... */});
  
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    console.error('Anthropic rate limit:', error);
    await new Promise(resolve => setTimeout(resolve, 60000));
    // Retry logic here
  } else if (error instanceof Anthropic.APIError) {
    console.error('Anthropic API error:', error.status, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
  
  // Return neutral insight on failure
  return {
    narrative: 'Failed to generate insight',
    insight_type: 'sentiment',
    priority: 'low',
    sentiment: 'neutral',
    topics: [],
    summary: 'Error generating insight',
  };
}
\`\`\`

---

## Testing API Integration

\`\`\`typescript
describe('Reddit API', () => {
  it('should fetch posts from subreddit', async () => {
    const response = await redditAPI.fetchPosts('Entrepreneur', 'hot', 10);
    expect(response.data.children).toHaveLength(10);
  });
  
  it('should handle rate limits', async () => {
    // Mock 429 response
    global.fetch = jest.fn(() =>
      Promise.resolve({ status: 429, ok: false })
    );
    
    await expect(redditAPI.fetchPosts('test')).rejects.toThrow();
  });
});

describe('Anthropic Integration', () => {
  it('should generate valid insight', async () => {
    const insight = await generateInsight({
      postTitle: 'Test post',
      postContent: 'Content',
      postSubreddit: 'test',
      postUrl: 'https://...',
    });
    
    expect(insight.narrative).toBeDefined();
    expect(['pain_point', 'competitor_mention', 'feature_request', 'sentiment'])
      .toContain(insight.insight_type);
  });
});
\`\`\`

---

Continue to:
- 🚀 **[Deployment](deployment)** - Production guide
- 🔧 **[Troubleshooting](troubleshooting)** - Common issues
`;
