// STATS QUERIES
// /Users/matthewsimon/Projects/SMNB/smnb/convex/stats/queries.ts

import { v } from "convex/values";
import { query } from "../_generated/server";

// Get real-time dashboard stats
export const getDashboardStats = query({
  args: {
    timeRange: v.union(
      v.literal("1h"),
      v.literal("24h"),
      v.literal("7d"),
      v.literal("30d")
    )
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ranges = {
      "1h": 3600000,
      "24h": 86400000,
      "7d": 604800000,
      "30d": 2592000000
    };
    const since = now - ranges[args.timeRange];
    
    // Get post stats
    const postStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), since))
      .collect();
    
    // Calculate metrics
    const totalPosts = postStats.length;
    const publishedPosts = postStats.filter(s => s.published_at).length;
    const enrichedPosts = postStats.filter(s => s.enriched_at).length;
    const scoredPosts = postStats.filter(s => s.scored_at).length;
    
    // Calculate averages (handle division by zero)
    const avgQualityScore = totalPosts > 0 
      ? postStats.reduce((sum, s) => sum + (s.quality_score || 0), 0) / totalPosts
      : 0;
    
    const avgProcessingTime = publishedPosts > 0 
      ? postStats
          .filter(s => s.total_processing_time)
          .reduce((sum, s) => sum + (s.total_processing_time || 0), 0) / publishedPosts
      : 0;
    
    const avgEngagementScore = totalPosts > 0
      ? postStats.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / totalPosts
      : 0;
    
    // Get sentiment distribution
    const sentimentDist = postStats.reduce((acc, s) => {
      if (s.sentiment) {
        acc[s.sentiment] = (acc[s.sentiment] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Get category distribution
    const categoryDist = postStats.reduce((acc, s) => {
      (s.categories || []).forEach(cat => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    // Get subreddit distribution from related posts
    const subredditDist: Record<string, number> = {};
    for (const stat of postStats) {
      // Get the actual post to find subreddit
      const post = await ctx.db
        .query("live_feed_posts")
        .filter(q => q.eq(q.field("id"), stat.post_id))
        .first();
      
      if (post?.subreddit) {
        subredditDist[post.subreddit] = (subredditDist[post.subreddit] || 0) + 1;
      }
    }
    
    // Get latest pipeline stats (last 5 minutes)
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const pipelineStats = await ctx.db
      .query("pipeline_stats")
      .withIndex("by_timestamp")
      .filter(q => q.gte(q.field("timestamp"), fiveMinutesAgo))
      .order("desc")
      .take(10);
    
    // Get recent events
    const recentEvents = await ctx.db
      .query("system_events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(10);
    
    // Get rate limit status
    const rateLimits = await ctx.db
      .query("rate_limits")
      .collect();
    
    // Calculate publish rate (posts per hour)
    const publishRatePerHour = publishedPosts / (ranges[args.timeRange] / 3600000);
    
    return {
      overview: {
        totalPosts,
        publishedPosts,
        enrichedPosts,
        scoredPosts,
        avgQualityScore: Number(avgQualityScore.toFixed(3)),
        avgProcessingTime: Math.round(avgProcessingTime),
        avgEngagementScore: Number(avgEngagementScore.toFixed(3)),
        publishRate: Number(publishRatePerHour.toFixed(1)),
        processingEfficiency: totalPosts > 0 ? Number((publishedPosts / totalPosts * 100).toFixed(1)) : 0
      },
      sentiment: sentimentDist,
      categories: Object.entries(categoryDist)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([category, count]) => ({ category, count })),
      subreddits: Object.entries(subredditDist)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([subreddit, count]) => ({ subreddit, count })),
      pipeline: pipelineStats,
      events: recentEvents,
      rateLimits
    };
  }
});

// Get detailed post processing stats
export const getPostProcessingStats = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let stats;
    
    if (args.status === "published") {
      stats = await ctx.db
        .query("post_stats")
        .withIndex("by_published")
        .order("desc")
        .take(args.limit || 100);
    } else {
      stats = await ctx.db
        .query("post_stats")
        .withIndex("by_created")
        .order("desc")
        .take(args.limit || 100);
    }
    
    // Enrich with post data
    const enrichedStats = await Promise.all(
      stats.map(async (stat) => {
        const post = await ctx.db
          .query("live_feed_posts")
          .filter(q => q.eq(q.field("id"), stat.post_id))
          .first();
        
        return {
          ...stat,
          post_title: post?.title,
          post_subreddit: post?.subreddit,
          post_score: post?.score,
          post_created_utc: post?.created_utc
        };
      })
    );
    
    return enrichedStats;
  }
});

// Get aggregate stats for time periods
export const getAggregateStats = query({
  args: {
    period_type: v.union(
      v.literal("minute"),
      v.literal("hour"),
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    ),
    periods: v.optional(v.number()) // How many periods to fetch
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("aggregate_stats")
      .withIndex("by_period")
      .filter(q => q.eq(q.field("period_type"), args.period_type))
      .order("desc")
      .take(args.periods || 24);
    
    return stats.reverse(); // Return in chronological order
  }
});

// Get pipeline health status
export const getPipelineHealth = query({
  handler: async (ctx) => {
    const stages = ["fetch", "enrichment", "scoring", "scheduling", "publishing"] as const;
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000); // Only consider recent stats
    
    const health = await Promise.all(
      stages.map(async (stage) => {
        const latest = await ctx.db
          .query("pipeline_stats")
          .withIndex("by_stage")
          .filter(q => 
            q.and(
              q.eq(q.field("stage"), stage),
              q.gte(q.field("timestamp"), fiveMinutesAgo)
            )
          )
          .order("desc")
          .first();
        
        // Always include all stages, but mark their activity level
        const hasRecentData = !!latest;
        const hasActivity = latest ? (latest.processing_rate > 0 || latest.queue_depth > 0 || latest.error_rate > 0 || !latest.is_healthy) : false;
        
        return {
          stage,
          status: latest?.is_healthy !== undefined ? (latest.is_healthy ? "healthy" : "unhealthy") : "inactive",
          queue_depth: latest?.queue_depth || 0,
          processing_rate: latest?.processing_rate || 0,
          error_rate: latest?.error_rate || 0,
          avg_processing_time: latest?.avg_processing_time || 0,
          last_update: latest?.timestamp || 0,
          last_error: latest?.last_error,
          hasActivity,
          hasRecentData
        };
      })
    );
    
    // Sort by status priority: unhealthy -> active -> healthy -> inactive
    return health.sort((a, b) => {
      const priority = { unhealthy: 0, healthy: a.hasActivity ? 1 : 2, inactive: 3 };
      return priority[a.status as keyof typeof priority] - priority[b.status as keyof typeof priority];
    });
  }
});

// Get system events with filtering
export const getSystemEvents = query({
  args: {
    severity: v.optional(v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    )),
    component: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let events;
    
    if (args.severity) {
      events = await ctx.db
        .query("system_events")
        .withIndex("by_severity")
        .filter(q => q.eq(q.field("severity"), args.severity!))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.component) {
      events = await ctx.db
        .query("system_events")
        .withIndex("by_component")
        .filter(q => q.eq(q.field("component"), args.component!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      events = await ctx.db
        .query("system_events")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit || 50);
    }
    
    return events;
  }
});

// Get rate limit status for all services
export const getRateLimitStatus = query({
  handler: async (ctx) => {
    const rateLimits = await ctx.db
      .query("rate_limits")
      .collect();
    
    const now = Date.now();
    
    // Group by service and get latest for each
    const serviceMap = new Map<string, typeof rateLimits[0]>();
    
    rateLimits.forEach(limit => {
      const existing = serviceMap.get(limit.service);
      if (!existing || limit.timestamp > existing.timestamp) {
        serviceMap.set(limit.service, limit);
      }
    });
    
    return Array.from(serviceMap.values()).map(limit => ({
      ...limit,
      usage_percentage: limit.calls_made / (limit.calls_made + limit.calls_remaining) * 100,
      is_near_limit: limit.calls_remaining < (limit.calls_made + limit.calls_remaining) * 0.2, // Less than 20% remaining
      time_until_reset: Math.max(0, limit.reset_at - now)
    }));
  }
});

// Get trending topics from recent posts
export const getTrendingTopics = query({
  args: {
    hours: v.optional(v.number()) // Look back this many hours
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const hoursBack = args.hours || 24;
    const since = now - (hoursBack * 3600000);
    
    const recentStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), since))
      .collect();
    
    // Count keyword frequency
    const keywordFreq: Record<string, number> = {};
    const categoryFreq: Record<string, number> = {};
    
    recentStats.forEach(stat => {
      // Count keywords
      (stat.keywords || []).forEach(keyword => {
        keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
      });
      
      // Count categories
      (stat.categories || []).forEach(category => {
        categoryFreq[category] = (categoryFreq[category] || 0) + 1;
      });
    });
    
    // Sort and return top trends
    const trendingKeywords = Object.entries(keywordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));
    
    const trendingCategories = Object.entries(categoryFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));
    
    return {
      keywords: trendingKeywords,
      categories: trendingCategories,
      timeRange: `${hoursBack}h`,
      totalPosts: recentStats.length
    };
  }
});

// Get processing performance metrics
export const getProcessingMetrics = query({
  args: {
    stage: v.optional(v.union(
      v.literal("fetch"),
      v.literal("enrichment"),
      v.literal("scoring"),
      v.literal("scheduling"),
      v.literal("publishing")
    )),
    hours: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const hoursBack = args.hours || 24;
    const since = now - (hoursBack * 3600000);
    
    let query = ctx.db.query("pipeline_stats")
      .withIndex("by_timestamp")
      .filter(q => q.gte(q.field("timestamp"), since));
    
    if (args.stage) {
      query = ctx.db.query("pipeline_stats")
        .withIndex("by_stage")
        .filter(q => 
          q.and(
            q.eq(q.field("stage"), args.stage),
            q.gte(q.field("timestamp"), since)
          )
        );
    }
    
    const metrics = await query
      .order("desc")
      .take(1000); // Reasonable limit for performance
    
    // Calculate performance statistics
    const processingTimes = metrics.map(m => m.avg_processing_time).filter(Boolean);
    const queueDepths = metrics.map(m => m.queue_depth);
    const errorRates = metrics.map(m => m.error_rate).filter(Boolean);
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;
    
    const avgQueueDepth = queueDepths.length > 0
      ? queueDepths.reduce((a, b) => a + b, 0) / queueDepths.length
      : 0;
    
    const avgErrorRate = errorRates.length > 0
      ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length
      : 0;
    
    return {
      timeRange: `${hoursBack}h`,
      stage: args.stage || "all",
      metrics: {
        avgProcessingTime: Number(avgProcessingTime.toFixed(2)),
        avgQueueDepth: Number(avgQueueDepth.toFixed(1)),
        avgErrorRate: Number(avgErrorRate.toFixed(4)),
        dataPoints: metrics.length,
        healthyPercentage: metrics.length > 0 
          ? Number((metrics.filter(m => m.is_healthy).length / metrics.length * 100).toFixed(1))
          : 0
      },
      timeSeries: metrics.reverse() // Chronological order for charts
    };
  }
});