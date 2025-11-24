export const stateManagementContent = `# State Management
## Zustand Store Patterns and Service Architecture

---

## Store Architecture

### Store File: \`lib/stores/simpleLiveFeedStore.ts\`

\`\`\`typescript
import { create } from 'zustand';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

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
  refreshInterval: number;
  
  // Status State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPosts: (posts: LiveFeedPost[]) => void;
  addPost: (post: LiveFeedPost) => void;
  clearPosts: () => void;
  
  addInsight: (insight: MarketingInsight) => void;
  clearInsights: () => void;
  loadInsightsFromConvex: () => Promise<void>;
  saveInsightToConvex: (insight: MarketingInsight) => Promise<void>;
  
  setIsLive: (isLive: boolean) => void;
  setSelectedSubreddits: (subreddits: string[]) => void;
  setRefreshInterval: (interval: number) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
\`\`\`

---

## State Patterns

### 1. Optimistic UI Updates

**Pattern**: Update local state immediately, sync to backend asynchronously

\`\`\`typescript
addPost: (post) => {
  set((state) => {
    // Check for duplicates
    if (state.posts.some(p => p.id === post.id)) {
      return state;
    }
    
    // Add to front of array (newest first)
    return {
      posts: [
        { ...post, addedAt: Date.now(), isNew: true },
        ...state.posts
      ],
      totalPostsFetched: state.totalPostsFetched + 1,
    };
  });
  
  // Remove 'new' flag after 2 seconds
  setTimeout(() => {
    set(state => ({
      posts: state.posts.map(p => 
        p.isNew ? { ...p, isNew: false } : p
      )
    }));
  }, 2000);
}
\`\`\`

**Why This Works**:
- Instant UI feedback
- No loading spinners
- Posts ephemeral (not critical to persist)

### 2. Async Insight Persistence

**Pattern**: Add to local state, then save to Convex

\`\`\`typescript
addInsight: (insight) => {
  set((state) => ({
    insightHistory: [insight, ...state.insightHistory]
  }));
  
  // Async save (fire-and-forget)
  get().saveInsightToConvex(insight);
}

saveInsightToConvex: async (insight) => {
  try {
    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );
    
    await convex.mutation(api.insights.addInsight, {
      insight_id: insight.id,
      narrative: insight.narrative,
      insight_type: insight.insight_type,
      priority: insight.priority,
      sentiment: insight.sentiment,
      topics: insight.topics,
      summary: insight.summary,
      postTitle: insight.postTitle || '',
      postUrl: insight.postUrl,
      subreddit: insight.subreddit,
    });
    
    console.log('✅ Insight saved to Convex:', insight.id);
  } catch (error) {
    console.error('❌ Failed to save insight:', error);
    // Could implement retry logic here
  }
}
\`\`\`

**Why This Works**:
- Insights visible immediately
- Persistence happens in background
- Failures logged but don't block UI

### 3. Selective Re-renders

**Pattern**: Use Zustand selectors to prevent unnecessary renders

\`\`\`typescript
// ❌ Bad: Re-renders on ANY state change
const store = useSimpleLiveFeedStore();

// ✅ Good: Only re-renders when isLive changes
const isLive = useSimpleLiveFeedStore(state => state.isLive);

// ✅ Good: Only re-renders when posts change
const posts = useSimpleLiveFeedStore(state => state.posts);
\`\`\`

---

## Service Singleton

### Service File: \`lib/stores/simpleLiveFeedService.ts\`

\`\`\`typescript
class SimpleLiveFeedService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private seenIds = new Set<string>();
  private convex: ConvexHttpClient;
  
  constructor() {
    this.convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );
  }
  
  start() {
    if (this.isRunning) {
      console.log('⚠️ Service already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Starting live feed service...');
    
    // Immediate fetch
    this.fetchPosts();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.fetchPosts();
    }, store.refreshInterval * 1000);
  }
  
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Service not running');
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Stopped live feed service');
  }
  
  private async fetchPosts() {
    const subreddits = store.selectedSubreddits;
    
    if (subreddits.length === 0) {
      console.log('⚠️ No subreddits selected');
      return;
    }
    
    store.setLoading(true);
    store.setError(null);
    
    try {
      console.log(\`🔄 Fetching posts from \${subreddits.length} subreddits...\`);
      
      const responses = await redditAPI.fetchHotPosts(subreddits, 10);
      
      let newPosts = 0;
      
      for (const response of responses) {
        for (const child of response.data.children) {
          const post = child.data;
          
          // Deduplicate
          if (this.seenIds.has(post.id)) {
            continue;
          }
          
          // Add to store
          store.addPost({
            id: post.id,
            title: post.title,
            content: post.selftext || '',
            subreddit: post.subreddit,
            author: post.author,
            score: post.score,
            numComments: post.num_comments,
            createdUtc: post.created_utc,
            permalink: post.permalink,
            url: post.url,
          });
          
          // Generate insight
          this.generateInsightForPost(post);
          
          this.seenIds.add(post.id);
          newPosts++;
        }
      }
      
      console.log(\`✅ Added \${newPosts} new posts\`);
      store.setLoading(false);
      
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to fetch');
      store.setLoading(false);
    }
  }
  
  private async generateInsightForPost(post: RedditPost) {
    try {
      const insight = await this.convex.action(
        api.ai.generateInsight.generateInsight,
        {
          postTitle: post.title,
          postContent: post.selftext || '',
          postSubreddit: post.subreddit,
          postUrl: \`https://reddit.com\${post.permalink}\`,
        }
      );
      
      store.addInsight({
        id: \`insight-\${post.id}-\${Date.now()}\`,
        narrative: insight.narrative,
        insight_type: insight.insight_type,
        priority: insight.priority,
        sentiment: insight.sentiment,
        topics: insight.topics,
        summary: insight.summary,
        postTitle: post.title,
        postUrl: \`https://reddit.com\${post.permalink}\`,
        subreddit: post.subreddit,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error(\`❌ Failed to generate insight for post \${post.id}:\`, error);
    }
  }
}

export const liveFeedService = new SimpleLiveFeedService();
\`\`\`

---

## State Flow Diagrams

### Post Addition Flow

\`\`\`mermaid
sequenceDiagram
    participant Service
    participant Store
    participant UI
    
    Service->>Store: addPost(post)
    Store->>Store: Check duplicate
    Store->>Store: Add with isNew=true
    Store->>Store: Increment totalPostsFetched
    Store->>UI: Trigger re-render
    UI->>UI: Display post with animation
    
    Note over Store: Wait 2 seconds
    
    Store->>Store: Set isNew=false
    Store->>UI: Trigger re-render
    UI->>UI: Remove animation
\`\`\`

### Insight Addition Flow

\`\`\`mermaid
sequenceDiagram
    participant Service
    participant Store
    participant Convex
    participant LiveFeed
    
    Service->>Store: addInsight(insight)
    Store->>Store: Add to insightHistory[]
    Store->>Convex: saveInsightToConvex()
    Convex-->>Convex: mutation (async)
    
    Note over Convex: Real-time sync
    
    Convex->>LiveFeed: useQuery hook updates
    LiveFeed->>LiveFeed: Re-render with new insight
\`\`\`

---

## Store Initialization

### Default Values

\`\`\`typescript
const useSimpleLiveFeedStore = create<SimpleLiveFeedStore>((set, get) => ({
  // Post State
  posts: [],
  totalPostsFetched: 0,
  lastFetch: null,
  
  // Insight State
  insightHistory: [],
  
  // Control State
  isLive: false,
  selectedSubreddits: [
    'Entrepreneur',
    'startups',
    'SaaS',
    'marketing',
    'smallbusiness',
    'EntrepreneurRideAlong',
    'growmybusiness'
  ],
  refreshInterval: 30, // seconds
  
  // Status State
  isLoading: false,
  error: null,
  
  // Actions (implementations follow)
  // ...
}));
\`\`\`

---

## Advanced Patterns

### 1. Middleware (Logging)

\`\`\`typescript
const logMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  Before:', get());
      set(...args);
      console.log('  After:', get());
    },
    get,
    api
  );

const useSimpleLiveFeedStore = create(
  logMiddleware((set, get) => ({
    // Store implementation
  }))
);
\`\`\`

### 2. Persist to LocalStorage

\`\`\`typescript
import { persist } from 'zustand/middleware';

const useSimpleLiveFeedStore = create(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'live-feed-storage',
      partialize: (state) => ({
        selectedSubreddits: state.selectedSubreddits,
        refreshInterval: state.refreshInterval,
      }),
    }
  )
);
\`\`\`

### 3. DevTools Integration

\`\`\`typescript
import { devtools } from 'zustand/middleware';

const useSimpleLiveFeedStore = create(
  devtools((set, get) => ({
    // Store implementation
  }), { name: 'LiveFeedStore' })
);
\`\`\`

---

## Testing Store

### Unit Tests

\`\`\`typescript
import { renderHook, act } from '@testing-library/react';
import { useSimpleLiveFeedStore } from '@/lib/stores/simpleLiveFeedStore';

describe('simpleLiveFeedStore', () => {
  beforeEach(() => {
    // Reset store
    const { result } = renderHook(() => useSimpleLiveFeedStore());
    act(() => {
      result.current.clearPosts();
      result.current.clearInsights();
    });
  });
  
  it('should add post without duplicates', () => {
    const { result } = renderHook(() => useSimpleLiveFeedStore());
    const mockPost = { id: '123', title: 'Test' /* ... */ };
    
    act(() => {
      result.current.addPost(mockPost);
    });
    
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.totalPostsFetched).toBe(1);
    
    // Try to add same post again
    act(() => {
      result.current.addPost(mockPost);
    });
    
    expect(result.current.posts).toHaveLength(1); // Still 1
    expect(result.current.totalPostsFetched).toBe(1); // Still 1
  });
  
  it('should toggle isLive state', () => {
    const { result } = renderHook(() => useSimpleLiveFeedStore());
    
    expect(result.current.isLive).toBe(false);
    
    act(() => {
      result.current.setIsLive(true);
    });
    
    expect(result.current.isLive).toBe(true);
  });
});
\`\`\`

### Integration Tests

\`\`\`typescript
describe('Service Integration', () => {
  it('should fetch and add posts to store', async () => {
    // Mock Reddit API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRedditResponse),
      })
    );
    
    liveFeedService.start();
    
    await waitFor(() => {
      const posts = useSimpleLiveFeedStore.getState().posts;
      expect(posts.length).toBeGreaterThan(0);
    });
    
    liveFeedService.stop();
  });
});
\`\`\`

---

## Performance Considerations

### 1. Avoid Large Arrays
\`\`\`typescript
// ❌ Bad: Unbounded growth
posts: [...state.posts, newPost]

// ✅ Good: Limit to 100 most recent
posts: [newPost, ...state.posts].slice(0, 100)
\`\`\`

### 2. Memoize Selectors
\`\`\`typescript
const selectedPosts = useSimpleLiveFeedStore(
  useCallback(
    state => state.posts.filter(p => p.score > 100),
    []
  )
);
\`\`\`

### 3. Batch Updates
\`\`\`typescript
// ❌ Bad: Multiple renders
setIsLive(true);
setError(null);
setLoading(false);

// ✅ Good: Single render
set({ isLive: true, error: null, isLoading: false });
\`\`\`

---

## Debugging Tips

### 1. Log State Changes
\`\`\`typescript
useEffect(() => {
  console.log('Store state:', useSimpleLiveFeedStore.getState());
}, []);
\`\`\`

### 2. Inspect Store in DevTools
\`\`\`typescript
// In browser console
window.store = useSimpleLiveFeedStore.getState();
console.log(window.store.posts);
\`\`\`

### 3. Track Re-renders
\`\`\`typescript
useEffect(() => {
  console.log('Component re-rendered');
});
\`\`\`

---

## Best Practices

1. ✅ **Use selectors** to prevent unnecessary re-renders
2. ✅ **Keep actions simple** - one responsibility per action
3. ✅ **Async operations** should be fire-and-forget or have error handling
4. ✅ **Immutability** - never mutate state directly
5. ✅ **Type safety** - use TypeScript interfaces
6. ✅ **Test store logic** separately from components

---

Continue to:
- ⚡ **[API Integration](api-integration)** - Integration details
- 🚀 **[Deployment](deployment)** - Production guide
`;
