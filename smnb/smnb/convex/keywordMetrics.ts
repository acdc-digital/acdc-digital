import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Internal query to get top posts for keywords
export const getTopPostsForKeywords = internalQuery({
  args: { 
    keywords: v.array(v.string()),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    keyword: v.string(),
    posts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      url: v.string(),
      subreddit: v.string(),
      score: v.number(),
      num_comments: v.number(),
      created_utc: v.number(),
      upvote_ratio: v.optional(v.number()),
      permalink: v.string()
    }))
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 3;
    const results = [];
    
    for (const keyword of args.keywords) {
      const normalized = keyword.toLowerCase().trim();
      
      // Get keyword record to find source posts
      const keywordRecord = await ctx.db
        .query("keyword_trends")
        .withIndex("by_keyword", q => q.eq("normalized_keyword", normalized))
        .first();
      
      if (!keywordRecord || !keywordRecord.source_post_ids) {
        results.push({ keyword, posts: [] });
        continue;
      }
      
      // Get the actual posts and their stats
      const posts = [];
      for (const postId of keywordRecord.source_post_ids.slice(0, limit)) {
        const post = await ctx.db
          .query("live_feed_posts")
          .filter(q => q.eq(q.field("id"), postId))
          .first();
        
        if (post) {
          posts.push({
            id: post.id,
            title: post.title,
            url: post.url,
            subreddit: post.subreddit,
            score: post.score,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
            upvote_ratio: post.upvote_ratio || 0.85, // Remove stats upvote_ratio since it doesn't exist
            permalink: post.permalink.startsWith('http') ? post.permalink : `https://reddit.com${post.permalink}`
          });
        }
      }
      
      // Sort by score to get top performers
      posts.sort((a, b) => b.score - a.score);
      
      results.push({
        keyword,
        posts: posts.slice(0, limit)
      });
    }
    
    return results;
  }
});

// Get metric scores for keywords
export const getKeywordMetrics = internalQuery({
  args: { 
    keywords: v.array(v.string())
  },
  returns: v.array(v.object({
    keyword: v.string(),
    metrics: v.object({
      // Core Performance Metrics
      engagementScore: v.number(),
      viralCoefficient: v.number(),
      performanceTier: v.string(),
      
      // Synergy Metrics (SY, RC, EP)
      synergyScore: v.number(), // SY
      relevanceCoefficient: v.number(), // RC
      engagementPotential: v.number(), // EP
      
      // Trend Metrics
      trendStatus: v.string(),
      trendVelocity: v.number(),
      freshnessCoefficient: v.number(), // FC
      noveltyIndex: v.number(), // NI
      
      // Sentiment
      dominantSentiment: v.string(),
      sentimentConfidence: v.number(),
      
      // Top Performing Subreddits
      topSubreddits: v.array(v.object({
        name: v.string(),
        avgScore: v.number(),
        postCount: v.number()
      }))
    })
  })),
  handler: async (ctx, args) => {
    const results = [];
    
    for (const keyword of args.keywords) {
      const normalized = keyword.toLowerCase().trim();
      
      const keywordData = await ctx.db
        .query("keyword_trends")
        .withIndex("by_keyword", q => q.eq("normalized_keyword", normalized))
        .first();
      
      if (!keywordData) {
        // Return default metrics if keyword not found
        results.push({
          keyword,
          metrics: {
            engagementScore: 50,
            viralCoefficient: 0.1,
            performanceTier: "avg",
            synergyScore: 50,
            relevanceCoefficient: 50,
            engagementPotential: 50,
            trendStatus: "stable",
            trendVelocity: 0,
            freshnessCoefficient: 50,
            noveltyIndex: 50,
            dominantSentiment: "neutral",
            sentimentConfidence: 0.5,
            topSubreddits: []
          }
        });
        continue;
      }
      
      // Calculate synergy score (how well metrics work together)
      const synergyScore = calculateSynergyScore(keywordData);
      
      // Calculate relevance coefficient (how well it fits the context)
      const relevanceCoefficient = calculateRelevanceCoefficient(keywordData);
      
      // Calculate engagement potential (predicted max engagement)
      const engagementPotential = calculateEngagementPotential(keywordData);
      
      // Calculate freshness coefficient (how recent/active)
      const freshnessCoefficient = calculateFreshnessCoefficient(keywordData);
      
      // Calculate novelty index (uniqueness)
      const noveltyIndex = calculateNoveltyIndex(keywordData);
      
      results.push({
        keyword,
        metrics: {
          engagementScore: keywordData.total_engagement_score,
          viralCoefficient: keywordData.viral_coefficient,
          performanceTier: keywordData.performance_tier,
          synergyScore,
          relevanceCoefficient,
          engagementPotential,
          trendStatus: keywordData.trend_status,
          trendVelocity: keywordData.trend_velocity,
          freshnessCoefficient,
          noveltyIndex,
          dominantSentiment: keywordData.dominant_sentiment,
          sentimentConfidence: keywordData.sentiment_confidence,
          topSubreddits: (keywordData.top_subreddits || []).slice(0, 3).map(sub => ({
            name: sub.subreddit,
            avgScore: sub.avg_score,
            postCount: sub.count
          }))
        }
      });
    }
    
    return results;
  }
});

// Helper functions for metric calculations
function calculateSynergyScore(keyword: any): number {
  // Synergy = how well different metrics align
  const sentimentAlignment = keyword.sentiment_confidence * 100;
  const engagementAlignment = Math.min(keyword.total_engagement_score / 10, 100);
  const trendAlignment = keyword.trend_status === "rising" ? 90 : 
                        keyword.trend_status === "peak" ? 100 :
                        keyword.trend_status === "stable" ? 60 : 40;
  
  return Math.round((sentimentAlignment * 0.3 + engagementAlignment * 0.4 + trendAlignment * 0.3));
}

function calculateRelevanceCoefficient(keyword: any): number {
  // Relevance = how closely content matches expectations
  const categoryRelevance = keyword.primary_category ? 80 : 40;
  const subredditDiversity = Math.min((keyword.top_subreddits?.length || 0) * 20, 100);
  const keywordTypeBonus = keyword.keyword_type === "phrase" ? 20 : 
                           keyword.keyword_type === "entity" ? 15 : 10;
  
  return Math.min(Math.round((categoryRelevance + subredditDiversity + keywordTypeBonus) / 2), 100);
}

function calculateEngagementPotential(keyword: any): number {
  // Potential = predicted maximum engagement based on trajectory
  const currentEngagement = keyword.total_engagement_score;
  const velocity = keyword.trend_velocity;
  const viralBoost = keyword.viral_coefficient * 100;
  
  const potential = currentEngagement + (velocity * 24) + viralBoost;
  return Math.min(Math.round(potential), 100);
}

function calculateFreshnessCoefficient(keyword: any): number {
  // Freshness = how recently active (lower is fresher)
  const now = Date.now();
  const lastSeen = keyword.last_seen_at;
  const hoursSinceActive = (now - lastSeen) / (1000 * 60 * 60);
  
  if (hoursSinceActive < 1) return 2.7;
  if (hoursSinceActive < 6) return 10;
  if (hoursSinceActive < 24) return 25;
  if (hoursSinceActive < 72) return 50;
  return 75;
}

function calculateNoveltyIndex(keyword: any): number {
  // Novelty = uniqueness of content
  const occurrences = keyword.total_occurrences;
  
  if (occurrences <= 5) return 100; // Very novel
  if (occurrences <= 10) return 80;
  if (occurrences <= 20) return 60;
  if (occurrences <= 50) return 40;
  return 20; // Common topic
}