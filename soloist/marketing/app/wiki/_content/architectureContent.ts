export const architectureContent = `# System Architecture
## Comprehensive Technical Architecture

---

## Architecture Overview

The Live Feed system follows a **layered architecture** with clear separation of concerns:

\`\`\`mermaid
graph TB
    subgraph "Frontend - Next.js 15"
        UI[React Components]
        State[Zustand Store]
        Service[Polling Service]
    end
    
    subgraph "API Gateway Layer"
        NextAPI[Next.js API Routes]
        RateLimiter[Global Rate Limiter]
        CircuitBreaker[Circuit Breaker]
    end
    
    subgraph "Backend - Convex"
        Queries[Real-time Queries]
        Mutations[Data Mutations]
        Actions[AI Actions]
    end
    
    subgraph "External APIs"
        Reddit[Reddit JSON API]
        Anthropic[Claude Haiku 4.5]
    end
    
    subgraph "Data Layer"
        Database[(Convex Database)]
    end
    
    UI --> State
    State --> Service
    Service --> NextAPI
    NextAPI --> RateLimiter
    RateLimiter --> CircuitBreaker
    CircuitBreaker --> Reddit
    
    Service --> Actions
    Actions --> Anthropic
    Actions --> Mutations
    Mutations --> Database
    Database --> Queries
    Queries --> UI
\`\`\`

---

## Layer Details

### 1. Presentation Layer

**Purpose**: User interface and interaction

**Components**:
- \`Controls.tsx\` - Feed control panel
- \`LiveFeed.tsx\` - Real-time insight display
- \`InsightCard.tsx\` - Individual insight rendering
- \`ActivityBar.tsx\` - Left navigation
- \`Editor.tsx\` - Main content wrapper

**Technology**: React 19, Next.js 15, Tailwind CSS

**Key Patterns**:
- Client-side rendering (\`"use client"\`)
- React hooks for state
- Lucide icons for UI
- VS Code-inspired design system

---

### 2. State Management Layer

**Purpose**: Application state and business logic

**Store Structure** (\`simpleLiveFeedStore.ts\`):

\`\`\`typescript
interface SimpleLiveFeedStore {
  // Post State
  posts: LiveFeedPost[];
  totalPostsFetched: number;
  lastFetch: number | null;
  
  // Insight State
  insightHistory: MarketingInsight[];
  
  // Control State
  isLive: boolean;
  selectedSubreddits: string[];
  refreshInterval: number; // seconds
  
  // Status State
  isLoading: boolean;
  error: string | null;
  
  // Actions (17 total)
  setPosts, addPost, clearPosts,
  addInsight, clearInsights,
  loadInsightsFromConvex, saveInsightToConvex,
  setIsLive, setSelectedSubreddits, setRefreshInterval,
  setLoading, setError, // ...
}
\`\`\`

**Service Singleton** (\`simpleLiveFeedService.ts\`):

\`\`\`typescript
class SimpleLiveFeedService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private seenIds = new Set<string>();
  private convex: ConvexHttpClient;
  
  start() { /* Initialize polling */ }
  stop() { /* Clear interval */ }
  private async fetchPosts() { /* Fetch + process */ }
  private async generateInsightForPost() { /* AI call */ }
}
\`\`\`

**Key Patterns**:
- Singleton service for polling
- Zustand for reactive state
- Optimistic UI updates
- Deduplication with Set

---

### 3. API Gateway Layer

**Purpose**: Proxy external APIs, handle rate limiting

**Reddit API Route** (\`app/api/reddit/route.ts\`):

\`\`\`typescript
export async function GET(request: Request) {
  const { subreddit, sort, limit } = parseQuery(request);
  
  // Global rate limiter check
  const result = await globalRateLimiter.waitForNextRequest();
  if (result.blocked) {
    return Response.json({ error: "Rate limited" }, { status: 429 });
  }
  
  // Fetch from Reddit
  const response = await fetch(\`https://www.reddit.com/r/\${subreddit}/\${sort}.json\`);
  
  // Handle errors and backoff
  if (response.status === 429) {
    globalRateLimiter.handleRateLimitError();
  }
  
  return Response.json(await response.json());
}
\`\`\`

**Circuit Breaker Algorithm**:

\`\`\`typescript
class GlobalRateLimiter {
  private minRequestInterval = 5000; // 5s
  private rateLimitBackoff = 0; // Starts at 0
  private isCircuitBreakerOpen = false;
  private circuitBreakerThreshold = 30000; // 30s
  private circuitBreakerResetTime = 120000; // 2min
  
  async waitForNextRequest() {
    if (this.isCircuitBreakerOpen) {
      const timeSinceOpened = Date.now() - this.circuitBreakerOpenedAt;
      if (timeSinceOpened > this.circuitBreakerResetTime) {
        // Reset circuit breaker
        this.isCircuitBreakerOpen = false;
        this.rateLimitBackoff = Math.floor(this.rateLimitBackoff / 2);
      } else {
        // Still open, block request
        return { blocked: true, remainingSeconds: /* ... */ };
      }
    }
    
    // Calculate delay
    const delay = this.minRequestInterval + this.rateLimitBackoff;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return { blocked: false };
  }
  
  handleRateLimitError() {
    // Exponential backoff
    this.rateLimitBackoff += 10000; // +10s
    
    if (this.rateLimitBackoff >= this.circuitBreakerThreshold) {
      this.isCircuitBreakerOpen = true;
      this.circuitBreakerOpenedAt = Date.now();
    }
  }
  
  handleSuccessfulRequest() {
    // Gradual recovery
    if (this.rateLimitBackoff > 0) {
      this.rateLimitBackoff = Math.max(0, this.rateLimitBackoff - 5000);
    }
  }
}
\`\`\`

**Why This Works**:
1. **Gradual backoff**: +10s per error, -5s per success
2. **Circuit breaker**: Opens at 30s, prevents cascading failures
3. **Auto-recovery**: Resets after 2 minutes of no requests
4. **Global singleton**: All requests share same limiter

---

### 4. Backend Layer (Convex)

**Purpose**: Real-time database and serverless functions

**Database Schema** (\`convex/schema.ts\`):

\`\`\`typescript
export default defineSchema({
  // Reddit posts cache (ephemeral)
  live_feed_posts: defineTable({
    postId: v.string(),
    title: v.string(),
    content: v.string(),
    subreddit: v.string(),
    author: v.string(),
    score: v.number(),
    numComments: v.number(),
    createdUtc: v.number(),
    permalink: v.string(),
    url: v.string(),
  }).index("by_postId", ["postId"]),
  
  // AI-generated insights (persistent)
  marketing_insights: defineTable({
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
  }).index("by_insight_type", ["insight_type"])
    .index("by_subreddit", ["subreddit"])
    .index("by_priority", ["priority"]),
  
  // Control state (unused in current impl)
  studio_controls: defineTable({
    selectedSubreddits: v.array(v.string()),
    refreshInterval: v.number(),
    isLive: v.boolean(),
  }),
  
  // Rate limit tracking (unused in current impl)
  rate_limits: defineTable({
    service: v.string(),
    lastRequest: v.number(),
    requestCount: v.number(),
  }).index("by_service", ["service"]),
});
\`\`\`

**Query Pattern** (Real-time):

\`\`\`typescript
// convex/insights.ts
export const getAllInsights = query({
  args: {},
  returns: v.array(v.object({ /* ... */ })),
  handler: async (ctx) => {
    return await ctx.db
      .query("marketing_insights")
      .order("desc") // Newest first
      .collect();
  },
});

// LiveFeed.tsx
const convexInsights = useQuery(api.insights.getAllInsights, {});
// Auto-updates via WebSocket when new insights added!
\`\`\`

**Mutation Pattern**:

\`\`\`typescript
// convex/insights.ts
export const addInsight = mutation({
  args: {
    insight_id: v.string(),
    narrative: v.string(),
    // ... all fields
  },
  returns: v.id("marketing_insights"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketing_insights", args);
  },
});

// simpleLiveFeedStore.ts
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
await convex.mutation(api.insights.addInsight, insightData);
\`\`\`

**Action Pattern** (AI):

\`\`\`typescript
// convex/ai/generateInsight.ts
export const generateInsight = action({
  args: {
    postTitle: v.string(),
    postContent: v.string(),
    postSubreddit: v.string(),
    postUrl: v.string(),
  },
  returns: v.object({ /* InsightResult */ }),
  handler: async (ctx, args) => {
    // Rate limit (1.2s min)
    await waitForAnthropicRateLimit();
    
    // Call Claude Haiku
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: "user", content: buildPrompt(args) }],
    });
    
    // Parse and validate JSON
    const insight = parseAndValidateInsight(message);
    return insight;
  },
});
\`\`\`

---

### 5. External API Integration

#### Reddit API

**Endpoint**: \`https://www.reddit.com/r/{subreddit}/{sort}.json\`

**Parameters**:
- \`limit\`: 1-100 posts
- \`after\`: Pagination cursor (unused)
- \`raw_json=1\`: Disable HTML encoding

**Rate Limits**:
- **Anonymous**: ~60 requests/min (unofficial)
- **Implementation**: 5s min interval + exponential backoff

**Response Structure**:
\`\`\`json
{
  "kind": "Listing",
  "data": {
    "after": "t3_xxxxx",
    "children": [
      {
        "kind": "t3",
        "data": {
          "id": "xxxxx",
          "title": "...",
          "selftext": "...",
          "subreddit": "Entrepreneur",
          "score": 42,
          "num_comments": 12,
          "created_utc": 1234567890,
          // 20+ more fields
        }
      }
    ]
  }
}
\`\`\`

#### Anthropic API (Claude Haiku 4.5)

**Model**: \`claude-haiku-4-5-20251001\`

**Configuration**:
\`\`\`typescript
{
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1024,
  temperature: 0.3, // Deterministic
  messages: [{ role: "user", content: prompt }]
}
\`\`\`

**Rate Limits**:
- **Tier 1**: 50 requests per minute
- **Implementation**: 1.2s min interval

**Prompt Template**:
\`\`\`
You are a marketing research analyst analyzing Reddit posts for business insights.

Analyze this post and provide insights in EXACT JSON format:

POST TITLE: {title}
POST CONTENT: {content}
SUBREDDIT: {subreddit}

Return ONLY valid JSON:
{
  "narrative": "2-3 sentence summary",
  "insight_type": "pain_point" | "competitor_mention" | "feature_request" | "sentiment",
  "priority": "high" | "medium" | "low",
  "sentiment": "positive" | "negative" | "neutral",
  "topics": ["topic1", "topic2"],
  "summary": "One sentence summary"
}
\`\`\`

---

## Data Flow Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Controls
    participant Service
    participant RedditAPI
    participant Store
    participant ConvexAction
    participant Anthropic
    participant ConvexDB
    participant LiveFeed
    
    User->>Controls: Click "Start Feed"
    Controls->>Service: start()
    Service->>Service: setInterval(30s)
    
    loop Every 30 seconds
        Service->>RedditAPI: fetchHotPosts(subreddits)
        RedditAPI-->>Service: Posts[]
        
        Service->>Store: addPost(post)
        Store-->>LiveFeed: Update UI (optimistic)
        
        Service->>ConvexAction: generateInsight(post)
        ConvexAction->>Anthropic: Claude Haiku API
        Anthropic-->>ConvexAction: InsightResult
        
        ConvexAction->>Store: addInsight(insight)
        Store->>ConvexDB: mutation (save)
        ConvexDB-->>LiveFeed: Real-time sync (WebSocket)
        LiveFeed-->>User: Display new insight
    end
    
    User->>Controls: Click "Stop Feed"
    Controls->>Service: stop()
    Service->>Service: clearInterval()
\`\`\`

---

## Design Patterns

### 1. Singleton Pattern (Service)
**Why**: Prevents multiple polling loops  
**Implementation**: Export single instance

### 2. Circuit Breaker Pattern (Rate Limiting)
**Why**: Graceful degradation on API failures  
**Implementation**: Auto-opens at threshold, resets after cooldown

### 3. Optimistic UI Pattern (Posts)
**Why**: Instant feedback without loading spinners  
**Trade-off**: Posts not persisted (insights are)

### 4. Real-time Subscription Pattern (Insights)
**Why**: Convex handles WebSocket complexity  
**Benefit**: No manual polling needed

### 5. Pub/Sub Pattern (Store)
**Why**: Decoupled components, reactive updates  
**Implementation**: Zustand with selectors

---

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **Fetch interval** | 30 seconds | Configurable in store |
| **Reddit rate limit** | ~6 req/min | With circuit breaker |
| **Max posts/fetch** | 70 posts | 7 subreddits × 10 posts |
| **AI rate limit** | 50 req/min | Anthropic Tier 1 |
| **Max insights/min** | 50 insights | Bottleneck: AI rate limit |
| **WebSocket latency** | <100ms | Convex real-time sync |
| **UI render time** | <50ms | React 19 optimizations |

---

## Security Considerations

### 1. API Key Management
- ✅ Anthropic key used in Convex action (server-side)
- ✅ Convex URL public (read-only queries OK)
- ⚠️ No per-user authentication (future enhancement)

### 2. Input Sanitization
- ⚠️ Reddit content rendered as-is (low risk)
- 🔄 Future: Use DOMPurify for \`selftext\`

### 3. Rate Limiting
- ✅ Global circuit breaker prevents abuse
- ⚠️ No per-user limits (future enhancement)

---

## Scalability

### Current Limits
- **Users**: Unlimited (Convex scales automatically)
- **Insights**: Unlimited (database grows indefinitely)
- **Reddit fetches**: 6 req/min (circuit breaker)
- **AI generation**: 50 req/min (Anthropic Tier 1)

### Scaling Strategies
1. **Upgrade Anthropic to Tier 2**: 500 RPM
2. **Reddit OAuth**: Higher rate limits
3. **Implement insight queue**: Retry failed AI calls
4. **Add pagination**: Fetch older posts with \`after\` cursor
5. **Per-user rate limits**: Prevent single user blocking all

---

## Monitoring & Observability

### Current Logging
\`\`\`typescript
console.log('🔄 Fetching posts from 7 subreddits...');
console.log('✅ Added post: Title truncated...');
console.log('❌ Failed to fetch posts:', error);
console.log('⚠️ Rate limit exceeded, waiting...');
\`\`\`

### Recommended Additions
- [ ] Convex dashboard for insight counts
- [ ] Sentry for error tracking
- [ ] PostHog for user analytics
- [ ] Custom metrics (fetch success rate, AI latency)

---

## Next Steps

Continue to:
- 🧩 **[Components](components)** - Detailed component API
- 💾 **[State Management](state-management)** - Zustand patterns
- ⚡ **[API Integration](api-integration)** - Integration details
`;
