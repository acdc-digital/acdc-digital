// LIVE FEED SERVICE - Automatic Reddit polling with AI insights
import { redditAPI, type RedditPost } from '../reddit/reddit';
import { useSimpleLiveFeedStore } from './simpleLiveFeedStore';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

class SimpleLiveFeedService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private convex: ConvexHttpClient | null = null;

  constructor() {
    // Initialize Convex client
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CONVEX_URL) {
      this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Feed service already running');
      return;
    }

    const store = useSimpleLiveFeedStore.getState();
    console.log(`▶️ Starting feed service (${store.refreshInterval}s interval)`);
    
    this.isRunning = true;
    
    // Fetch immediately
    this.fetchPosts();
    
    // Then fetch on interval
    this.intervalId = setInterval(() => {
      this.fetchPosts();
    }, store.refreshInterval * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏸️ Feed service stopped');
  }

  private async fetchPosts() {
    const store = useSimpleLiveFeedStore.getState();
    
    if (!store.isLive) {
      console.log('⏸️ Feed paused, skipping fetch');
      return;
    }

    console.log(`🔄 Fetching posts from ${store.selectedSubreddits.length} subreddits...`);
    store.setLoading(true);
    store.setError(null);

    try {
      const responses = await redditAPI.fetchHotPosts(
        store.selectedSubreddits,
        10
      );

      let newPostsCount = 0;
      const seenIds = new Set(store.posts.map(p => p.id));

      for (const response of responses) {
        for (const child of response.data.children) {
          const post = child.data;
          
          // Check if already added
          if (seenIds.has(post.id)) {
            console.log(`🚫 Duplicate post: ${post.title.substring(0, 30)}...`);
            continue;
          }

          // Add post to store
          store.addPost({
            id: post.id,
            title: post.title,
            author: post.author,
            subreddit: post.subreddit,
            url: post.url,
            permalink: post.permalink,
            score: post.score,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
            thumbnail: post.thumbnail,
            selftext: post.selftext,
            is_video: post.is_video,
            domain: post.domain,
            upvote_ratio: post.upvote_ratio,
            over_18: post.over_18,
            source: 'reddit',
            addedAt: Date.now(),
            batchId: `batch-${Date.now()}`,
          });

          newPostsCount++;
          seenIds.add(post.id);

          // Generate insight for new post
          this.generateInsightForPost(post).catch(err => 
            console.error('Failed to generate insight:', err)
          );
        }
      }

      console.log(`✅ Fetch complete (${newPostsCount} new posts)`);
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to fetch posts');
    } finally {
      store.setLoading(false);
    }
  }

  private async generateInsightForPost(post: RedditPost) {
    if (!this.convex) {
      console.error('❌ Convex client not initialized');
      return;
    }

    const store = useSimpleLiveFeedStore.getState();
    
    console.log(`🤖 Generating insight for: ${post.title.substring(0, 50)}...`);
    
    try {
      // Call Convex action to generate insight (note the underscore)
      const insight = await this.convex.action(api.ai.generateInsight.generateInsight, {
        postTitle: post.title,
        postContent: post.selftext || '',
        postSubreddit: post.subreddit,
        postUrl: `https://reddit.com${post.permalink}`,
      });

      // Add to store (which will save to Convex)
      store.addInsight({
        id: `insight-${post.id}-${Date.now()}`,
        narrative: insight.narrative,
        title: post.title,
        insight_type: insight.insight_type,
        priority: insight.priority,
        sentiment: insight.sentiment,
        topics: insight.topics,
        summary: insight.summary,
        timestamp: new Date(),
        originalItem: {
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: `https://reddit.com${post.permalink}`,
          score: post.score,
          num_comments: post.num_comments,
        },
      });

      console.log(`✅ Insight generated: ${insight.insight_type} (${insight.priority})`);
    } catch (error) {
      console.error('❌ Failed to generate insight:', error);
    }
  }

  isServiceRunning() {
    return this.isRunning;
  }
}

// Export singleton instance
export const liveFeedService = new SimpleLiveFeedService();
