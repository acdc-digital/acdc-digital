// NASDAQ-100 TRADING ENHANCED STATS QUERIES
// Transform existing content analytics to prioritize NASDAQ-100 sentiment analysis
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/stats/tradingEnhanced.ts

import { query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

/**
 * Get subreddit distribution ranked by NASDAQ-100 company mentions
 * Replaces: getSubredditStats
 */
export const getSubredditsByNasdaqMentions = query({
  args: {
    timeRange: v.optional(v.string()), // "24h", "7d", "30d"
  },
  returns: v.object({
    totalPosts: v.number(),
    totalMentions: v.number(),
    totalSubreddits: v.number(),
    subredditStats: v.array(v.object({
      subreddit: v.string(),
      postCount: v.number(),
      mentionCount: v.number(),
      uniqueTickers: v.array(v.string()),
      avgSentiment: v.number(), // -1 to 1 scale
      topMentions: v.array(v.object({
        ticker: v.string(),
        count: v.number(),
        sentiment: v.number(),
      })),
      mentionDensity: v.number(), // mentions per post
      sentimentStrength: v.string(), // "bullish", "bearish", "neutral"
      avgImpactScore: v.number(), // 0-100 market impact potential
      percentage: v.number(), // percentage of total mentions
    })),
  }),
  handler: async (ctx) => {
    // Get recent company mentions (limit to avoid document read cap)
    const mentions = await ctx.db.query("company_mentions")
      .order("desc")
      .take(8000);
    
    // Get recent posts for subreddit mapping
    const posts = await ctx.db.query("live_feed_posts")
      .order("desc")
      .take(3000);
    
    // Create post lookup map for efficiency
    const postMap = new Map(posts.map(p => [p.id, p]));
    
    // Build subreddit -> mentions map
    const subredditMap = new Map<string, {
      postIds: Set<string>;
      mentions: typeof mentions;
      tickers: Map<string, { count: number; sentiment: number[]; impact: number[] }>;
    }>();
    
    mentions.forEach(mention => {
      const post = postMap.get(mention.post_id);
      if (!post) return;
      
      if (!subredditMap.has(post.subreddit)) {
        subredditMap.set(post.subreddit, {
          postIds: new Set(),
          mentions: [],
          tickers: new Map(),
        });
      }
      
      const data = subredditMap.get(post.subreddit)!;
      data.postIds.add(post.id);
      data.mentions.push(mention);
      
      // Track ticker frequency and sentiment
      const tickerData = data.tickers.get(mention.ticker) || { 
        count: 0, 
        sentiment: [], 
        impact: [] 
      };
      tickerData.count++;
      tickerData.sentiment.push(
        mention.sentiment === "bullish" ? 1 : 
        mention.sentiment === "bearish" ? -1 : 0
      );
      tickerData.impact.push(mention.impact_score);
      data.tickers.set(mention.ticker, tickerData);
    });
    
    // Transform to output format
    const subredditStats = Array.from(subredditMap.entries())
      .map(([subreddit, data]) => {
        const topMentions = Array.from(data.tickers.entries())
          .map(([ticker, info]) => ({
            ticker,
            count: info.count,
            sentiment: info.sentiment.reduce((a, b) => a + b, 0) / info.sentiment.length,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        const avgSentiment = data.mentions.reduce((sum, m) => 
          sum + (m.sentiment === "bullish" ? 1 : m.sentiment === "bearish" ? -1 : 0), 0
        ) / (data.mentions.length || 1);
        
        const avgImpactScore = data.mentions.reduce((sum, m) => 
          sum + m.impact_score, 0
        ) / (data.mentions.length || 1);
        
        let sentimentStrength: "bullish" | "bearish" | "neutral";
        if (avgSentiment > 0.2) sentimentStrength = "bullish";
        else if (avgSentiment < -0.2) sentimentStrength = "bearish";
        else sentimentStrength = "neutral";
        
        return {
          subreddit,
          postCount: data.postIds.size,
          mentionCount: data.mentions.length,
          uniqueTickers: Array.from(data.tickers.keys()),
          avgSentiment,
          topMentions,
          mentionDensity: data.mentions.length / data.postIds.size,
          sentimentStrength,
          avgImpactScore,
          percentage: 0, // Will be calculated after we know total
        };
      })
      .sort((a, b) => b.mentionCount - a.mentionCount);
    
    // Calculate percentages
    const totalMentions = subredditStats.reduce((sum, s) => sum + s.mentionCount, 0);
    subredditStats.forEach(stat => {
      stat.percentage = totalMentions > 0 
        ? Math.round((stat.mentionCount / totalMentions) * 100 * 10) / 10 
        : 0;
    });
    
    return {
      totalPosts: posts.length,
      totalMentions: mentions.length,
      totalSubreddits: subredditStats.length,
      subredditStats,
    };
  },
});

/**
 * Get story history distribution ranked by NASDAQ-100 mentions
 * Replaces: getStoryHistorySubredditStats
 */
export const getStoryHistoryByNasdaqMentions = query({
  args: {},
  returns: v.object({
    totalStories: v.number(),
    storiesWithMentions: v.number(),
    totalMentions: v.number(),
    totalSubreddits: v.number(),
    correlationRate: v.number(),
    subredditStats: v.array(v.object({
      subreddit: v.string(),
      storyCount: v.number(),
      mentionedTickers: v.array(v.string()),
      avgImpactScore: v.number(),
      sentiment: v.string(),
      viralityPotential: v.number(),
      percentage: v.number(),
    })),
  }),
  handler: async (ctx) => {
    // Reduce limits to stay under 32K document cap
    const stories = await ctx.db.query("story_history").order("desc").take(1000);
    const mentions = await ctx.db.query("company_mentions").order("desc").take(5000);
    const posts = await ctx.db.query("live_feed_posts").order("desc").take(2000);
    
    // Create mention lookup by post_id
    const mentionsByPost = new Map<string, typeof mentions>();
    mentions.forEach(mention => {
      if (!mentionsByPost.has(mention.post_id)) {
        mentionsByPost.set(mention.post_id, []);
      }
      mentionsByPost.get(mention.post_id)!.push(mention);
    });
    
    // Create post lookup by title for faster matching
    const postsByTitle = new Map<string, typeof posts[0]>();
    posts.forEach(post => {
      postsByTitle.set(post.title, post);
    });
    
    // Match stories with their source posts' mentions
    const storyMentionMap = new Map<string, {
      stories: typeof stories;
      mentions: typeof mentions;
    }>();
    
    for (const story of stories) {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) continue;
      
      // Try to find post by title (faster lookup)
      const relatedPost = story.original_item?.title 
        ? postsByTitle.get(story.original_item.title)
        : undefined;
      
      if (relatedPost) {
        const storyMentions = mentionsByPost.get(relatedPost.id) || [];
        
        if (storyMentions.length > 0) {
          if (!storyMentionMap.has(subreddit)) {
            storyMentionMap.set(subreddit, {
              stories: [],
              mentions: [],
            });
          }
          
          const data = storyMentionMap.get(subreddit)!;
          data.stories.push(story);
          data.mentions.push(...storyMentions);
        }
      }
    }
    
    // Calculate stats
    const subredditStats = Array.from(storyMentionMap.entries())
      .map(([subreddit, data]) => {
        const uniqueTickers = [...new Set(data.mentions.map(m => m.ticker))];
        const avgImpact = data.mentions.reduce((sum, m) => 
          sum + m.impact_score, 0
        ) / (data.mentions.length || 1);
        
        const sentimentScore = data.mentions.reduce((sum, m) => 
          sum + (m.sentiment === "bullish" ? 1 : m.sentiment === "bearish" ? -1 : 0), 0
        ) / (data.mentions.length || 1);
        
        let sentiment: "bullish" | "bearish" | "neutral";
        if (sentimentScore > 0.2) sentiment = "bullish";
        else if (sentimentScore < -0.2) sentiment = "bearish";
        else sentiment = "neutral";
        
        // Virality = impact * story count
        const viralityPotential = avgImpact * data.stories.length;
        
        return {
          subreddit,
          storyCount: data.stories.length,
          mentionedTickers: uniqueTickers,
          avgImpactScore: Math.round(avgImpact * 10) / 10,
          sentiment,
          viralityPotential: Math.round(viralityPotential * 10) / 10,
          percentage: 0,
        };
      })
      .sort((a, b) => b.viralityPotential - a.viralityPotential);
    
    const storiesWithMentions = subredditStats.reduce((sum, s) => sum + s.storyCount, 0);
    const totalMentions = Array.from(storyMentionMap.values())
      .reduce((sum, data) => sum + data.mentions.length, 0);
    
    subredditStats.forEach(stat => {
      stat.percentage = storiesWithMentions > 0
        ? Math.round((stat.storyCount / storiesWithMentions) * 100 * 10) / 10
        : 0;
    });
    
    return {
      totalStories: stories.length,
      storiesWithMentions,
      totalMentions,
      totalSubreddits: subredditStats.length,
      correlationRate: stories.length > 0 
        ? Math.round((storiesWithMentions / stories.length) * 100 * 10) / 10
        : 0,
      subredditStats,
    };
  },
});

/**
 * Get enhanced content correlation showing trading relevance
 * Replaces: getSubredditContentCorrelation
 */
export const getTradingContentCorrelation = query({
  args: {},
  returns: v.object({
    totalPosts: v.number(),
    totalStories: v.number(),
    postsWithMentions: v.number(),
    storiesWithMentions: v.number(),
    tradingRelevanceRate: v.number(),
    subredditCorrelations: v.array(v.object({
      subreddit: v.string(),
      postCount: v.number(),
      storyCount: v.number(),
      mentionCount: v.number(),
      uniqueTickers: v.number(),
      conversionRate: v.number(),
      tradingRelevance: v.number(),
      avgImpactScore: v.number(),
      sentimentStrength: v.string(),
    })),
  }),
  handler: async (ctx) => {
    const posts = await ctx.db.query("live_feed_posts").order("desc").take(3000);
    const stories = await ctx.db.query("story_history").order("desc").take(1500);
    const mentions = await ctx.db.query("company_mentions").order("desc").take(6000);
    
    // Build mention lookup
    const mentionsByPost = new Map<string, typeof mentions>();
    mentions.forEach(mention => {
      if (!mentionsByPost.has(mention.post_id)) {
        mentionsByPost.set(mention.post_id, []);
      }
      mentionsByPost.get(mention.post_id)!.push(mention);
    });
    
    // Build subreddit data
    const subredditData = new Map<string, {
      postCount: number;
      storyCount: number;
      mentions: typeof mentions;
      tickers: Set<string>;
      postsWithMentions: number;
      storiesWithMentions: number;
    }>();
    
    // Process posts
    posts.forEach(post => {
      if (!subredditData.has(post.subreddit)) {
        subredditData.set(post.subreddit, {
          postCount: 0,
          storyCount: 0,
          mentions: [],
          tickers: new Set(),
          postsWithMentions: 0,
          storiesWithMentions: 0,
        });
      }
      
      const data = subredditData.get(post.subreddit)!;
      data.postCount++;
      
      const postMentions = mentionsByPost.get(post.id) || [];
      if (postMentions.length > 0) {
        data.postsWithMentions++;
        data.mentions.push(...postMentions);
        postMentions.forEach(m => data.tickers.add(m.ticker));
      }
    });
    
    // Process stories
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, {
          postCount: 0,
          storyCount: 0,
          mentions: [],
          tickers: new Set(),
          postsWithMentions: 0,
          storiesWithMentions: 0,
        });
      }
      
      const data = subredditData.get(subreddit)!;
      data.storyCount++;
      
      const relatedPosts = posts.filter(p => 
        p.title === story.original_item?.title || 
        p.url === story.original_item?.url
      );
      
      if (relatedPosts.some(p => mentionsByPost.has(p.id))) {
        data.storiesWithMentions++;
      }
    });
    
    // Calculate correlation stats
    const subredditCorrelations = Array.from(subredditData.entries())
      .map(([subreddit, data]) => {
        const conversionRate = data.postCount > 0 
          ? (data.storyCount / data.postCount) * 100 
          : 0;
        
        const avgImpactScore = data.mentions.length > 0
          ? data.mentions.reduce((sum, m) => sum + m.impact_score, 0) / data.mentions.length
          : 0;
        
        const avgSentiment = data.mentions.length > 0
          ? data.mentions.reduce((sum, m) => 
              sum + (m.sentiment === "bullish" ? 1 : m.sentiment === "bearish" ? -1 : 0), 0
            ) / data.mentions.length
          : 0;
        
        let sentimentStrength: "bullish" | "bearish" | "neutral";
        if (avgSentiment > 0.2) sentimentStrength = "bullish";
        else if (avgSentiment < -0.2) sentimentStrength = "bearish";
        else sentimentStrength = "neutral";
        
        const mentionDensity = data.postCount > 0 ? data.mentions.length / data.postCount : 0;
        const tradingRelevance = Math.min(100, 
          (mentionDensity * 30) + 
          (avgImpactScore * 0.4) + 
          (conversionRate * 0.3)
        );
        
        return {
          subreddit,
          postCount: data.postCount,
          storyCount: data.storyCount,
          mentionCount: data.mentions.length,
          uniqueTickers: data.tickers.size,
          conversionRate: Math.round(conversionRate * 10) / 10,
          tradingRelevance: Math.round(tradingRelevance * 10) / 10,
          avgImpactScore: Math.round(avgImpactScore * 10) / 10,
          sentimentStrength,
        };
      })
      .sort((a, b) => b.tradingRelevance - a.tradingRelevance);
    
    const postsWithMentions = Array.from(subredditData.values())
      .reduce((sum, d) => sum + d.postsWithMentions, 0);
    const storiesWithMentions = Array.from(subredditData.values())
      .reduce((sum, d) => sum + d.storiesWithMentions, 0);
    
    return {
      totalPosts: posts.length,
      totalStories: stories.length,
      postsWithMentions,
      storiesWithMentions,
      tradingRelevanceRate: posts.length > 0 
        ? Math.round((postsWithMentions / posts.length) * 100 * 10) / 10
        : 0,
      subredditCorrelations,
    };
  },
});

/**
 * Get enhanced post rankings prioritizing trading signals
 * Replaces: getPostRankings
 */
export const getTradingPostRankings = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    totalPosts: v.number(),
    posts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      subreddit: v.string(),
      author: v.string(),
      url: v.string(),
      permalink: v.string(),
      score: v.number(),
      num_comments: v.number(),
      created_utc: v.number(),
      mentionedTickers: v.array(v.object({
        ticker: v.string(),
        sentiment: v.string(),
        confidence: v.number(),
        impactScore: v.number(),
      })),
      tradingRelevance: v.number(),
      marketImpact: v.string(),
      overallSentiment: v.string(),
      overallScore: v.number(),
      rank: v.number(),
      rankChange: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const posts = await ctx.db.query("live_feed_posts")
      .order("desc")
      .take(Math.min(limit * 2, 500));
    
    const mentions = await ctx.db.query("company_mentions").order("desc").take(5000);
    const postStats = await ctx.db.query("post_stats").order("desc").take(3000);
    const statsMap = new Map(postStats.map(stat => [stat.post_id, stat]));
    
    const rankedPosts = posts.map(post => {
      const postMentions = mentions.filter(m => m.post_id === post.id);
      const stats = statsMap.get(post.id);
      
      const mentionedTickers = postMentions.map(m => ({
        ticker: m.ticker,
        sentiment: m.sentiment,
        confidence: m.confidence,
        impactScore: m.impact_score,
      }));
      
      const mentionCount = postMentions.length;
      const maxImpact = Math.max(...postMentions.map(m => m.impact_score), 0);
      const avgConfidence = postMentions.length > 0
        ? postMentions.reduce((sum, m) => sum + m.confidence, 0) / postMentions.length
        : 0;
      
      const tradingRelevance = postMentions.length > 0 ? 
        Math.min(100, 
          (mentionCount * 10) +
          (maxImpact * 0.5) +
          (avgConfidence * 20) +
          (post.score / 100)
        ) : 0;
      
      let marketImpact: "high" | "medium" | "low";
      if (maxImpact >= 70) marketImpact = "high";
      else if (maxImpact >= 40) marketImpact = "medium";
      else marketImpact = "low";
      
      const sentimentScore = postMentions.reduce((sum, m) => 
        sum + (m.sentiment === "bullish" ? 1 : m.sentiment === "bearish" ? -1 : 0), 0
      );
      let overallSentiment: "bullish" | "bearish" | "neutral";
      if (sentimentScore > 0) overallSentiment = "bullish";
      else if (sentimentScore < 0) overallSentiment = "bearish";
      else overallSentiment = "neutral";
      
      const qualityScore = stats?.quality_score || 0;
      const engagementScore = stats?.engagement_score || 0;
      const redditScore = Math.min(post.score / 1000 * 10, 30);
      
      const overallScore = (
        tradingRelevance * 0.50 +
        (qualityScore || 0) * 0.20 +
        (engagementScore || 0) * 0.15 +
        redditScore * 0.15
      );
      
      return {
        id: post.id,
        title: post.title,
        subreddit: post.subreddit,
        author: post.author,
        url: post.url,
        permalink: post.permalink.startsWith('https://') ? post.permalink : `https://reddit.com${post.permalink}`,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        mentionedTickers,
        tradingRelevance: Math.round(tradingRelevance * 10) / 10,
        marketImpact,
        overallSentiment,
        overallScore: Math.round(overallScore * 10) / 10,
        rank: 0,
        rankChange: "stable" as string,
      };
    });
    
    rankedPosts.sort((a, b) => b.overallScore - a.overallScore);
    
    rankedPosts.forEach((post, index) => {
      post.rank = index + 1;
      const randomChange = Math.random();
      if (post.tradingRelevance > 70 && randomChange < 0.6) post.rankChange = "up";
      else if (post.tradingRelevance < 30 && randomChange < 0.6) post.rankChange = "down";
      else post.rankChange = "stable";
    });
    
    return {
      totalPosts: posts.length,
      posts: rankedPosts,
    };
  },
});

/**
 * Get enhanced metric scoring matrix with trading weights
 * Replaces: getMetricScoringMatrix
 */
export const getTradingMetricScoringMatrix = query({
  args: {},
  returns: v.object({
    totalSubreddits: v.number(),
    totalPosts: v.number(),
    totalStories: v.number(),
    totalMentions: v.number(),
    overallMetrics: v.object({
      avgStoryYield: v.number(),
      avgTradingRelevance: v.number(),
      avgMentionDensity: v.number(),
      avgImpactScore: v.number(),
      avgSentimentScore: v.number(),
      avgTickerDiversity: v.number(),
    }),
    subredditScores: v.array(v.object({
      subreddit: v.string(),
      storyYield: v.number(),
      tradingRelevance: v.number(),
      mentionDensity: v.number(),
      avgImpactScore: v.number(),
      sentimentScore: v.number(),
      tickerDiversity: v.number(),
      overallScore: v.number(),
      tier: v.union(
        v.literal("Tier 1"), 
        v.literal("Tier 2"), 
        v.literal("Tier 3"), 
        v.literal("Tier 4")
      ),
      posts: v.number(),
      stories: v.number(),
      mentions: v.number(),
      uniqueTickers: v.number(),
    })),
  }),
  handler: async (ctx) => {
    const posts = await ctx.db.query("live_feed_posts").order("desc").take(5000);
    const stories = await ctx.db.query("story_history").order("desc").take(3000);
    const mentions = await ctx.db.query("company_mentions").order("desc").take(6000);
    
    const mentionsByPost = new Map<string, typeof mentions>();
    mentions.forEach(mention => {
      if (!mentionsByPost.has(mention.post_id)) {
        mentionsByPost.set(mention.post_id, []);
      }
      mentionsByPost.get(mention.post_id)!.push(mention);
    });
    
    const subredditData = new Map<string, {
      posts: number;
      stories: number;
      mentions: typeof mentions;
      tickers: Set<string>;
      impactScores: number[];
      sentiments: number[];
    }>();
    
    posts.forEach(post => {
      if (!subredditData.has(post.subreddit)) {
        subredditData.set(post.subreddit, {
          posts: 0,
          stories: 0,
          mentions: [],
          tickers: new Set(),
          impactScores: [],
          sentiments: [],
        });
      }
      
      const data = subredditData.get(post.subreddit)!;
      data.posts++;
      
      const postMentions = mentionsByPost.get(post.id) || [];
      if (postMentions.length > 0) {
        data.mentions.push(...postMentions);
        postMentions.forEach(m => {
          data.tickers.add(m.ticker);
          data.impactScores.push(m.impact_score);
          data.sentiments.push(
            m.sentiment === "bullish" ? 1 : 
            m.sentiment === "bearish" ? -1 : 0
          );
        });
      }
    });
    
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, {
          posts: 0,
          stories: 0,
          mentions: [],
          tickers: new Set(),
          impactScores: [],
          sentiments: [],
        });
      }
      
      subredditData.get(subreddit)!.stories++;
    });
    
    const subredditScores = Array.from(subredditData.entries())
      .map(([subreddit, data]) => {
        const storyYield = data.posts > 0 ? (data.stories / data.posts) * 100 : 0;
        const mentionDensity = data.posts > 0 ? data.mentions.length / data.posts : 0;
        
        const avgImpactScore = data.impactScores.length > 0
          ? data.impactScores.reduce((sum, s) => sum + s, 0) / data.impactScores.length
          : 0;
        
        const avgSentiment = data.sentiments.length > 0
          ? data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length
          : 0;
        const sentimentScore = (avgSentiment + 1) * 50;
        
        const tickerDiversity = Math.min(100, data.tickers.size * 5);
        
        const tradingRelevance = Math.min(100,
          (data.mentions.length / Math.max(data.posts, 1)) * 20 +
          avgImpactScore * 0.5 +
          tickerDiversity * 0.3
        );
        
        const overallScore = (
          storyYield * 0.15 +
          tradingRelevance * 0.35 +
          mentionDensity * 15 +
          avgImpactScore * 0.25 +
          (sentimentScore - 50) * 0.05
        );
        
        let tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
        if (overallScore >= 70) tier = "Tier 1";
        else if (overallScore >= 50) tier = "Tier 2";
        else if (overallScore >= 30) tier = "Tier 3";
        else tier = "Tier 4";
        
        return {
          subreddit,
          storyYield: Math.round(storyYield * 10) / 10,
          tradingRelevance: Math.round(tradingRelevance * 10) / 10,
          mentionDensity: Math.round(mentionDensity * 100) / 100,
          avgImpactScore: Math.round(avgImpactScore * 10) / 10,
          sentimentScore: Math.round(sentimentScore * 10) / 10,
          tickerDiversity: Math.round(tickerDiversity * 10) / 10,
          overallScore: Math.round(overallScore * 10) / 10,
          tier,
          posts: data.posts,
          stories: data.stories,
          mentions: data.mentions.length,
          uniqueTickers: data.tickers.size,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);
    
    const totalSubs = subredditScores.length;
    const overallMetrics = totalSubs > 0 ? {
      avgStoryYield: subredditScores.reduce((sum, s) => sum + s.storyYield, 0) / totalSubs,
      avgTradingRelevance: subredditScores.reduce((sum, s) => sum + s.tradingRelevance, 0) / totalSubs,
      avgMentionDensity: subredditScores.reduce((sum, s) => sum + s.mentionDensity, 0) / totalSubs,
      avgImpactScore: subredditScores.reduce((sum, s) => sum + s.avgImpactScore, 0) / totalSubs,
      avgSentimentScore: subredditScores.reduce((sum, s) => sum + s.sentimentScore, 0) / totalSubs,
      avgTickerDiversity: subredditScores.reduce((sum, s) => sum + s.tickerDiversity, 0) / totalSubs,
    } : {
      avgStoryYield: 0,
      avgTradingRelevance: 0,
      avgMentionDensity: 0,
      avgImpactScore: 0,
      avgSentimentScore: 0,
      avgTickerDiversity: 0,
    };
    
    return {
      totalSubreddits: totalSubs,
      totalPosts: posts.length,
      totalStories: stories.length,
      totalMentions: mentions.length,
      overallMetrics,
      subredditScores,
    };
  },
});

/**
 * Get top posts by subreddit with trading emphasis
 * Replaces: getTopPostsBySubreddit
 */
export const getTopTradingPostsBySubreddit = query({
  args: {},
  returns: v.object({
    totalSubreddits: v.number(),
    topPostsBySubreddit: v.array(v.object({
      subreddit: v.string(),
      subredditRank: v.number(),
      overallScore: v.number(),
      tier: v.union(
        v.literal("Tier 1"), 
        v.literal("Tier 2"), 
        v.literal("Tier 3"), 
        v.literal("Tier 4")
      ),
      topPost: v.optional(v.object({
        id: v.string(),
        title: v.string(),
        author: v.string(),
        url: v.string(),
        permalink: v.string(),
        score: v.number(),
        num_comments: v.number(),
        overallScore: v.number(),
        postRank: v.number(),
        mentionCount: v.number(),
        topTickers: v.array(v.string()),
      })),
      totalPosts: v.number(),
      totalStories: v.number(),
      totalMentions: v.number(),
    })),
  }),
  handler: async (ctx) => {
    type ScoringMatrixResult = {
      totalSubreddits: number;
      totalPosts: number;
      totalStories: number;
      totalMentions: number;
      overallMetrics: {
        avgStoryYield: number;
        avgTradingRelevance: number;
        avgMentionDensity: number;
        avgImpactScore: number;
        avgSentimentScore: number;
        avgTickerDiversity: number;
      };
      subredditScores: Array<{
        subreddit: string;
        storyYield: number;
        tradingRelevance: number;
        mentionDensity: number;
        avgImpactScore: number;
        sentimentScore: number;
        tickerDiversity: number;
        overallScore: number;
        tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
        posts: number;
        stories: number;
        mentions: number;
        uniqueTickers: number;
      }>;
    };
    
    const scoringData = await ctx.runQuery(
      api.stats.tradingEnhanced.getTradingMetricScoringMatrix
    ) as ScoringMatrixResult | null;
    
    if (!scoringData) {
      return {
        totalSubreddits: 0,
        topPostsBySubreddit: [],
      };
    }
    
    const posts = await ctx.db.query("live_feed_posts").order("desc").take(3000);
    const mentions = await ctx.db.query("company_mentions").order("desc").take(6000);
    
    const mentionsByPost = new Map<string, typeof mentions>();
    mentions.forEach(mention => {
      if (!mentionsByPost.has(mention.post_id)) {
        mentionsByPost.set(mention.post_id, []);
      }
      mentionsByPost.get(mention.post_id)!.push(mention);
    });
    
    const postsBySubreddit = new Map<string, typeof posts>();
    posts.forEach(post => {
      if (!postsBySubreddit.has(post.subreddit)) {
        postsBySubreddit.set(post.subreddit, []);
      }
      postsBySubreddit.get(post.subreddit)!.push(post);
    });
    
    const topPostsBySubreddit = scoringData.subredditScores.map((subredditScore, index: number) => {
      const subredditPosts = postsBySubreddit.get(subredditScore.subreddit) || [];
      
      const rankedPosts = subredditPosts
        .map(post => {
          const postMentions = mentionsByPost.get(post.id) || [];
          const mentionCount = postMentions.length;
          const maxImpact = Math.max(...postMentions.map(m => m.impact_score), 0);
          const topTickers = [...new Set(postMentions.map(m => m.ticker))].slice(0, 3);
          
          const tradingScore = mentionCount > 0
            ? (mentionCount * 10) + (maxImpact * 0.5) + (post.score / 100)
            : post.score / 100;
          
          return {
            ...post,
            tradingScore,
            mentionCount,
            topTickers,
          };
        })
        .sort((a, b) => b.tradingScore - a.tradingScore);
      
      const topPost = rankedPosts.length > 0 ? rankedPosts[0] : undefined;
      
      let postRank = 0;
      if (topPost) {
        const allRankedPosts = posts.map(p => {
          const pMentions = mentionsByPost.get(p.id) || [];
          const tradingScore = pMentions.length > 0
            ? (pMentions.length * 10) + (Math.max(...pMentions.map(m => m.impact_score), 0) * 0.5) + (p.score / 100)
            : p.score / 100;
          return { id: p.id, tradingScore };
        }).sort((a, b) => b.tradingScore - a.tradingScore);
        
        const globalRankIndex = allRankedPosts.findIndex(p => p.id === topPost.id);
        postRank = globalRankIndex >= 0 ? globalRankIndex + 1 : 0;
      }
      
      return {
        subreddit: subredditScore.subreddit,
        subredditRank: index + 1,
        overallScore: subredditScore.overallScore,
        tier: subredditScore.tier,
        topPost: topPost ? {
          id: topPost.id,
          title: topPost.title,
          author: topPost.author,
          url: topPost.url,
          permalink: topPost.permalink.startsWith('https://') ? topPost.permalink : `https://reddit.com${topPost.permalink}`,
          score: topPost.score,
          num_comments: topPost.num_comments,
          overallScore: Math.round(topPost.tradingScore * 10) / 10,
          postRank,
          mentionCount: topPost.mentionCount,
          topTickers: topPost.topTickers,
        } : undefined,
        totalPosts: rankedPosts.length,
        totalStories: subredditScore.stories,
        totalMentions: subredditScore.mentions,
      };
    });
    
    return {
      totalSubreddits: topPostsBySubreddit.length,
      topPostsBySubreddit,
    };
  },
});

/**
 * Get combined content distribution stats ranked by NASDAQ-100 mentions
 */
export const getTradingCombinedContentStats = query({
  args: {},
  returns: v.object({
    totalContent: v.number(),
    totalSubreddits: v.number(),
    totalMentions: v.number(),
    contentStats: v.array(v.object({
      subreddit: v.string(),
      postCount: v.number(),
      storyCount: v.number(),
      totalContent: v.number(),
      percentage: v.number(),
      mentions: v.number(),
      uniqueTickers: v.number(),
      avgImpactScore: v.number(),
      tradingRelevance: v.number(),
      overallSentiment: v.string(),
    })),
  }),
  handler: async (ctx) => {
    const posts = await ctx.db.query("live_feed_posts").order("desc").take(5000);
    const stories = await ctx.db.query("story_history").order("desc").take(3000);
    const mentions = await ctx.db.query("company_mentions").order("desc").take(6000);
    
    const mentionsByPost = new Map<string, typeof mentions>();
    mentions.forEach(mention => {
      if (!mentionsByPost.has(mention.post_id)) {
        mentionsByPost.set(mention.post_id, []);
      }
      mentionsByPost.get(mention.post_id)!.push(mention);
    });
    
    const subredditData = new Map<string, {
      postCount: number;
      storyCount: number;
      mentions: typeof mentions;
      tickers: Set<string>;
    }>();
    
    posts.forEach(post => {
      if (!subredditData.has(post.subreddit)) {
        subredditData.set(post.subreddit, {
          postCount: 0,
          storyCount: 0,
          mentions: [],
          tickers: new Set(),
        });
      }
      
      const data = subredditData.get(post.subreddit)!;
      data.postCount++;
      
      const postMentions = mentionsByPost.get(post.id) || [];
      if (postMentions.length > 0) {
        data.mentions.push(...postMentions);
        postMentions.forEach(m => data.tickers.add(m.ticker));
      }
    });
    
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, {
          postCount: 0,
          storyCount: 0,
          mentions: [],
          tickers: new Set(),
        });
      }
      
      subredditData.get(subreddit)!.storyCount++;
    });
    
    const totalContent = posts.length + stories.length;
    const totalMentions = mentions.length;
    
    const contentStats = Array.from(subredditData.entries())
      .map(([subreddit, data]) => {
        const totalSubredditContent = data.postCount + data.storyCount;
        const percentage = totalContent > 0 ? (totalSubredditContent / totalContent) * 100 : 0;
        
        const avgImpactScore = data.mentions.length > 0
          ? data.mentions.reduce((sum, m) => sum + m.impact_score, 0) / data.mentions.length
          : 0;
        
        const mentionDensity = totalSubredditContent > 0 ? data.mentions.length / totalSubredditContent : 0;
        const tradingRelevance = Math.min(
          (mentionDensity * 40) + (avgImpactScore * 0.3) + (data.tickers.size * 2),
          100
        );
        
        const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };
        data.mentions.forEach(m => {
          if (m.sentiment === 'bullish') sentimentCounts.bullish++;
          else if (m.sentiment === 'bearish') sentimentCounts.bearish++;
          else sentimentCounts.neutral++;
        });
        
        const dominantSentiment = 
          sentimentCounts.bullish > sentimentCounts.bearish && sentimentCounts.bullish > sentimentCounts.neutral ? 'bullish' :
          sentimentCounts.bearish > sentimentCounts.bullish && sentimentCounts.bearish > sentimentCounts.neutral ? 'bearish' :
          'neutral';
        
        return {
          subreddit,
          postCount: data.postCount,
          storyCount: data.storyCount,
          totalContent: totalSubredditContent,
          percentage,
          mentions: data.mentions.length,
          uniqueTickers: data.tickers.size,
          avgImpactScore,
          tradingRelevance,
          overallSentiment: dominantSentiment,
        };
      })
      .sort((a, b) => b.mentions - a.mentions);
    
    return {
      totalContent,
      totalSubreddits: contentStats.length,
      totalMentions,
      contentStats,
    };
  },
});

/**
 * Get subreddit member stats ranked by NASDAQ-100 mentions
 */
export const getSubredditMemberStatsByMentions = query({
  args: {},
  returns: v.object({
    totalSubreddits: v.number(),
    totalContent: v.number(),
    totalMentions: v.number(),
    subredditMemberStats: v.array(v.object({
      subreddit: v.string(),
      subscribers: v.number(),
      description: v.optional(v.string()),
      isActive: v.boolean(),
      postCount: v.number(),
      storyCount: v.number(),
      totalContent: v.number(),
      mentions: v.number(),
      uniqueTickers: v.number(),
      avgImpactScore: v.number(),
      tradingRelevance: v.number(),
      overallSentiment: v.string(),
    })),
  }),
  handler: async (ctx) => {
    const posts = await ctx.db.query("live_feed_posts").order("desc").take(5000);
    const stories = await ctx.db.query("story_history").order("desc").take(3000);
    const mentions = await ctx.db.query("company_mentions").order("desc").take(6000);
    
    const mentionsByPost = new Map<string, typeof mentions>();
    mentions.forEach(mention => {
      if (!mentionsByPost.has(mention.post_id)) {
        mentionsByPost.set(mention.post_id, []);
      }
      mentionsByPost.get(mention.post_id)!.push(mention);
    });
    
    const subredditData = new Map<string, {
      postCount: number;
      storyCount: number;
      mentions: typeof mentions;
      tickers: Set<string>;
    }>();
    
    posts.forEach(post => {
      if (!subredditData.has(post.subreddit)) {
        subredditData.set(post.subreddit, {
          postCount: 0,
          storyCount: 0,
          mentions: [],
          tickers: new Set(),
        });
      }
      
      const data = subredditData.get(post.subreddit)!;
      data.postCount++;
      
      const postMentions = mentionsByPost.get(post.id) || [];
      if (postMentions.length > 0) {
        data.mentions.push(...postMentions);
        postMentions.forEach(m => data.tickers.add(m.ticker));
      }
    });
    
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, {
          postCount: 0,
          storyCount: 0,
          mentions: [],
          tickers: new Set(),
        });
      }
      
      subredditData.get(subreddit)!.storyCount++;
    });
    
    const mockSubredditData: Record<string, { subscribers: number; description: string }> = {
      "AskReddit": { subscribers: 45200000, description: "r/AskReddit is the place to ask and answer thought-provoking questions." },
      "funny": { subscribers: 58000000, description: "Welcome to r/Funny: reddit's largest humour depository." },
      "todayilearned": { subscribers: 32000000, description: "You learn something new every day; what did you learn today?" },
      "worldnews": { subscribers: 37000000, description: "A place for major news from around the world, excluding US-internal news." },
      "pics": { subscribers: 30000000, description: "A place for photographs, pictures, and other images." },
      "gaming": { subscribers: 41000000, description: "The Number One Gaming forum on the Internet." },
      "movies": { subscribers: 32000000, description: "The goal of /r/Movies is to provide an inclusive place for discussions and news about films." },
      "news": { subscribers: 26000000, description: "The place for news articles about current events in the United States and the rest of the world." },
      "technology": { subscribers: 14000000, description: "Subreddit dedicated to the news and discussions about the creation and use of technology." },
      "science": { subscribers: 29000000, description: "This community is a place to share and discuss new scientific research." },
      "politics": { subscribers: 8500000, description: "The place for political news and discussion." },
      "sports": { subscribers: 2100000, description: "Sports News and Highlights from the NFL, NBA, NHL, MLB, MLS, and leagues around the world." },
      "books": { subscribers: 21000000, description: "This is a moderated subreddit. It is our intent and purpose to foster and encourage." },
      "history": { subscribers: 17000000, description: "r/history is a place for discussions about history." },
      "space": { subscribers: 23000000, description: "Share & discuss informative content on: Astrophysics, Cosmology, Space Exploration." },
    };
    
    const totalMentions = mentions.length;
    const totalAllContent = posts.length + stories.length;
    
    const subredditMemberStats = Array.from(subredditData.entries())
      .map(([subreddit, data]) => {
        const totalContent = data.postCount + data.storyCount;
        const mockData = mockSubredditData[subreddit];
        
        const avgImpactScore = data.mentions.length > 0
          ? data.mentions.reduce((sum, m) => sum + m.impact_score, 0) / data.mentions.length
          : 0;
        
        const mentionDensity = totalContent > 0 ? data.mentions.length / totalContent : 0;
        const tradingRelevance = Math.min(
          (mentionDensity * 40) + (avgImpactScore * 0.3) + (data.tickers.size * 2),
          100
        );
        
        const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };
        data.mentions.forEach(m => {
          if (m.sentiment === 'bullish') sentimentCounts.bullish++;
          else if (m.sentiment === 'bearish') sentimentCounts.bearish++;
          else sentimentCounts.neutral++;
        });
        
        const dominantSentiment = 
          sentimentCounts.bullish > sentimentCounts.bearish && sentimentCounts.bullish > sentimentCounts.neutral ? 'bullish' :
          sentimentCounts.bearish > sentimentCounts.bullish && sentimentCounts.bearish > sentimentCounts.neutral ? 'bearish' :
          'neutral';
        
        return {
          subreddit,
          subscribers: mockData?.subscribers || Math.floor(Math.random() * 1000000) + 100000,
          description: mockData?.description,
          isActive: true,
          postCount: data.postCount,
          storyCount: data.storyCount,
          totalContent,
          mentions: data.mentions.length,
          uniqueTickers: data.tickers.size,
          avgImpactScore,
          tradingRelevance,
          overallSentiment: dominantSentiment,
        };
      })
      .sort((a, b) => b.mentions - a.mentions);
    
    return {
      totalSubreddits: subredditMemberStats.length,
      totalContent: totalAllContent,
      totalMentions,
      subredditMemberStats,
    };
  },
});
