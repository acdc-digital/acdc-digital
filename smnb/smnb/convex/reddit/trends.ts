import { v } from "convex/values";
import { query } from "../_generated/server";

// Performance tier thresholds based on Reddit scores (what you actually have)
const PERFORMANCE_TIERS = {
  elite: 1000,     // High-scoring posts (1000+ upvotes)
  excel: 500,      // Very good posts (500+ upvotes)
  veryGood: 200,   // Good posts (200+ upvotes)
  good: 100,       // Decent posts (100+ upvotes)
  avgPlus: 50,     // Above average (50+ upvotes)
  avg: 20,         // Average (20+ upvotes)
  avgMinus: 10,    // Below average (10+ upvotes)
  poor: 5,         // Poor performance (5+ upvotes)
  veryPoor: 1,     // Very poor (1+ upvotes)
  critical: 0      // No traction (0 upvotes)
};

interface TrendBadge {
  keyword: string;
  count: number;
  tier: string;
  sentiment: string;
  avgScore: number;
  topSubreddits: string[];
  trending: boolean;
}

export const getTopTrends = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("1h"),
      v.literal("6h"),
      v.literal("24h"),
      v.literal("7d")
    )),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    keyword: v.string(),
    count: v.number(),
    tier: v.string(),
    sentiment: v.string(),
    avgScore: v.number(),
    topSubreddits: v.array(v.string()),
    trending: v.boolean()
  })),
  handler: async (ctx, args) => {
    const timeRange = args.timeRange || "24h";
    const limit = args.limit || 20;
    
    // Calculate time window
    const now = Date.now();
    const timeWindows = {
      "1h": 3600000,
      "6h": 21600000,
      "24h": 86400000,
      "7d": 604800000
    };
    const since = now - timeWindows[timeRange];
    
    // Get recent posts from live_feed_posts (existing data)
    const recentPosts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_addedAt")
      .filter(q => q.gte(q.field("addedAt"), since))
      .take(1000);
    
    // Extract trending keywords from titles and analyze performance
    const keywordMap = new Map<string, {
      count: number,
      scores: number[],
      subreddits: Set<string>,
      posts: typeof recentPosts[0][]
    }>();
    
    // Process each post to extract keywords
    for (const post of recentPosts) {
      // Simple keyword extraction from title (you can enhance this later)
      const keywords = extractKeywordsFromTitle(post.title);
      
      for (const keyword of keywords) {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, {
            count: 0,
            scores: [],
            subreddits: new Set(),
            posts: []
          });
        }
        
        const data = keywordMap.get(keyword)!;
        data.count++;
        data.scores.push(post.score);
        data.subreddits.add(post.subreddit);
        data.posts.push(post);
      }
    }
    
    // Transform to trend badges
    const trends: TrendBadge[] = [];
    
    for (const [keyword, data] of keywordMap.entries()) {
      // Skip low-frequency keywords
      if (data.count < 2) continue;
      
      // Calculate average Reddit score
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      
      // Determine performance tier based on Reddit scores
      let tier = 'critical';
      for (const [tierName, threshold] of Object.entries(PERFORMANCE_TIERS)) {
        if (avgScore >= threshold) {
          tier = tierName;
          break;
        }
      }
      
      // Determine trending status (high frequency + good scores)
      const trending = data.count >= 3 && avgScore >= 50;
      
      // Simple sentiment analysis based on scores (you can enhance this)
      let sentiment = 'neutral';
      if (avgScore > 100) sentiment = 'positive';
      else if (avgScore < 5) sentiment = 'negative';
      
      trends.push({
        keyword,
        count: data.count,
        tier,
        sentiment,
        avgScore: Number(avgScore.toFixed(1)),
        topSubreddits: Array.from(data.subreddits).slice(0, 3),
        trending
      });
    }
    
    // Sort by impact (score * count) and return top trends
    return trends
      .sort((a, b) => (b.avgScore * b.count) - (a.avgScore * a.count))
      .slice(0, limit);
  }
});

// Simple keyword extraction function (you can enhance this)
function extractKeywordsFromTitle(title: string): string[] {
  // Convert to lowercase and remove common words
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'its', 'our', 'their', 'what', 'how', 'when', 'where', 'why', 'who', 'which'
  ]);
  
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 5); // Limit to top 5 keywords per title
}

// Get subreddit-based trends from existing data
export const getSubredditTrends = query({
  args: {
    timeRange: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    subreddit: v.string(),
    postCount: v.number(),
    avgScore: v.number(),
    topKeywords: v.array(v.string()),
    sentiment: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number()
    }),
    tier: v.string()
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get recent posts from existing data
    const now = Date.now();
    const since = now - (24 * 3600000); // Last 24 hours
    
    const recentPosts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_addedAt")
      .filter(q => q.gte(q.field("addedAt"), since))
      .take(1000);
    
    // Aggregate subreddit data
    const subredditMap = new Map<string, {
      count: number,
      scores: number[],
      keywords: Set<string>
    }>();
    
    for (const post of recentPosts) {
      if (!subredditMap.has(post.subreddit)) {
        subredditMap.set(post.subreddit, {
          count: 0,
          scores: [],
          keywords: new Set()
        });
      }
      
      const data = subredditMap.get(post.subreddit)!;
      data.count++;
      data.scores.push(post.score);
      
      // Extract keywords from title
      const keywords = extractKeywordsFromTitle(post.title);
      keywords.forEach(k => data.keywords.add(k));
    }
    
    // Transform to output format
    return Array.from(subredditMap.entries())
      .filter(([, data]) => data.count >= 2) // Only subreddits with multiple posts
      .map(([subreddit, data]) => {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        
        // Determine tier based on average score
        let tier = 'critical';
        for (const [tierName, threshold] of Object.entries(PERFORMANCE_TIERS)) {
          if (avgScore >= threshold) {
            tier = tierName;
            break;
          }
        }
        
        // Simple sentiment based on scores
        const sentiment = {
          positive: data.scores.filter(s => s > 100).length,
          neutral: data.scores.filter(s => s >= 5 && s <= 100).length,
          negative: data.scores.filter(s => s < 5).length
        };
        
        return {
          subreddit,
          postCount: data.count,
          avgScore: Number(avgScore.toFixed(1)),
          topKeywords: Array.from(data.keywords).slice(0, 5),
          sentiment,
          tier
        };
      })
      .sort((a, b) => (b.avgScore * b.postCount) - (a.avgScore * a.postCount))
      .slice(0, limit);
  }
});