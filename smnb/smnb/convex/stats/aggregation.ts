// STATS AGGREGATION FUNCTIONS
// /Users/matthewsimon/Projects/SMNB/smnb/convex/stats/aggregation.ts

import { internalMutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const aggregateHourlyStats = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const hourStart = Math.floor(now / 3600000) * 3600000;
    const hourEnd = hourStart + 3600000;
    
    console.log(`📊 Starting hourly aggregation for period: ${new Date(hourStart).toISOString()}`);
    
    // Check if we already have stats for this hour
    const existing = await ctx.db
      .query("aggregate_stats")
      .withIndex("by_period")
      .filter(q => 
        q.and(
          q.eq(q.field("period_type"), "hour"),
          q.eq(q.field("period_start"), hourStart)
        )
      )
      .first();
    
    if (existing) {
      console.log(`📊 Hourly stats already exist for ${new Date(hourStart).toISOString()}`);
      return;
    }
    
    // Get all post stats from the last hour
    const postStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => 
        q.and(
          q.gte(q.field("created_at"), hourStart),
          q.lt(q.field("created_at"), hourEnd)
        )
      )
      .collect();
    
    if (postStats.length === 0) {
      console.log(`📊 No post stats found for hour ${new Date(hourStart).toISOString()}`);
      return;
    }
    
    // Calculate volume metrics
    const total_posts_fetched = postStats.length;
    const total_posts_enriched = postStats.filter(s => s.enriched_at).length;
    const total_posts_scored = postStats.filter(s => s.scored_at).length;
    const total_posts_scheduled = postStats.filter(s => s.scheduled_at).length;
    const total_posts_published = postStats.filter(s => s.published_at).length;
    const total_posts_dropped = 0; // TODO: Implement dropped post tracking
    
    // Calculate performance metrics
    const enrichmentTimes = postStats.map(s => s.enrichment_duration).filter(Boolean) as number[];
    const scoringTimes = postStats.map(s => s.scoring_duration).filter(Boolean) as number[];
    const schedulingTimes = postStats.map(s => s.scheduling_duration).filter(Boolean) as number[];
    const totalTimes = postStats.map(s => s.total_processing_time).filter(Boolean) as number[];
    
    // Calculate quality metrics
    const qualityScores = postStats.map(s => s.quality_score).filter(Boolean) as number[];
    const engagementScores = postStats.map(s => s.engagement_score).filter(Boolean) as number[];
    const priorityScores = postStats.map(s => s.priority_score).filter(Boolean) as number[];
    
    // Calculate sentiment distribution
    const sentimentDist = {
      positive: postStats.filter(s => s.sentiment === "positive").length,
      neutral: postStats.filter(s => s.sentiment === "neutral").length,
      negative: postStats.filter(s => s.sentiment === "negative").length
    };
    
    // Calculate category distribution
    const categoryMap = new Map<string, number>();
    postStats.forEach(stat => {
      (stat.categories || []).forEach(category => {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
    });
    const category_distribution = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 categories
    
    // Calculate subreddit distribution
    const subredditMap = new Map<string, number>();
    for (const stat of postStats) {
      // Get the post to find subreddit
      const post = await ctx.db
        .query("live_feed_posts")
        .filter(q => q.eq(q.field("id"), stat.post_id))
        .first();
      
      if (post?.subreddit) {
        subredditMap.set(post.subreddit, (subredditMap.get(post.subreddit) || 0) + 1);
      }
    }
    const subreddit_distribution = Array.from(subredditMap.entries())
      .map(([subreddit, count]) => ({ subreddit, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 subreddits
    
    // Calculate system performance
    const error_count = postStats.filter(s => s.processing_errors && s.processing_errors.length > 0).length;
    const retry_count = postStats.reduce((sum, s) => sum + s.retry_count, 0);
    
    // Create aggregate record
    const aggregate: Omit<Doc<"aggregate_stats">, "_id" | "_creationTime"> = {
      period_type: "hour",
      period_start: hourStart,
      period_end: hourEnd,
      
      // Volume metrics
      total_posts_fetched,
      total_posts_enriched,
      total_posts_scored,
      total_posts_scheduled,
      total_posts_published,
      total_posts_dropped,
      
      // Performance metrics
      avg_enrichment_time: average(enrichmentTimes),
      avg_scoring_time: average(scoringTimes),
      avg_scheduling_time: average(schedulingTimes),
      avg_total_processing_time: average(totalTimes),
      
      // Quality metrics
      avg_quality_score: average(qualityScores),
      avg_engagement_score: average(engagementScores),
      avg_priority_score: average(priorityScores),
      
      // Distributions
      sentiment_distribution: sentimentDist,
      category_distribution,
      subreddit_distribution,
      
      // System performance
      error_count,
      retry_count,
      
      created_at: now,
      updated_at: now
    };
    
    await ctx.db.insert("aggregate_stats", aggregate);
    console.log(`📊 Aggregated hourly stats: ${total_posts_fetched} posts processed`);
  }
});

export const aggregateDailyStats = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const dayStart = Math.floor(now / 86400000) * 86400000;
    const dayEnd = dayStart + 86400000;
    
    console.log(`📊 Starting daily aggregation for period: ${new Date(dayStart).toISOString()}`);
    
    // Check if we already have stats for this day
    const existing = await ctx.db
      .query("aggregate_stats")
      .withIndex("by_period")
      .filter(q => 
        q.and(
          q.eq(q.field("period_type"), "day"),
          q.eq(q.field("period_start"), dayStart)
        )
      )
      .first();
    
    if (existing) {
      console.log(`📊 Daily stats already exist for ${new Date(dayStart).toISOString()}`);
      return;
    }
    
    // Get all hourly stats for this day
    const hourlyStats = await ctx.db
      .query("aggregate_stats")
      .withIndex("by_period")
      .filter(q => 
        q.and(
          q.eq(q.field("period_type"), "hour"),
          q.gte(q.field("period_start"), dayStart),
          q.lt(q.field("period_start"), dayEnd)
        )
      )
      .collect();
    
    if (hourlyStats.length === 0) {
      console.log(`📊 No hourly stats found for day ${new Date(dayStart).toISOString()}`);
      return;
    }
    
    // Aggregate the hourly stats
    const aggregate: Omit<Doc<"aggregate_stats">, "_id" | "_creationTime"> = {
      period_type: "day",
      period_start: dayStart,
      period_end: dayEnd,
      
      // Sum volume metrics
      total_posts_fetched: sumField(hourlyStats, "total_posts_fetched"),
      total_posts_enriched: sumField(hourlyStats, "total_posts_enriched"),
      total_posts_scored: sumField(hourlyStats, "total_posts_scored"),
      total_posts_scheduled: sumField(hourlyStats, "total_posts_scheduled"),
      total_posts_published: sumField(hourlyStats, "total_posts_published"),
      total_posts_dropped: sumField(hourlyStats, "total_posts_dropped"),
      
      // Average performance metrics
      avg_enrichment_time: averageField(hourlyStats, "avg_enrichment_time"),
      avg_scoring_time: averageField(hourlyStats, "avg_scoring_time"),
      avg_scheduling_time: averageField(hourlyStats, "avg_scheduling_time"),
      avg_total_processing_time: averageField(hourlyStats, "avg_total_processing_time"),
      
      // Average quality metrics
      avg_quality_score: averageField(hourlyStats, "avg_quality_score"),
      avg_engagement_score: averageField(hourlyStats, "avg_engagement_score"),
      avg_priority_score: averageField(hourlyStats, "avg_priority_score"),
      
      // Aggregate sentiment distribution
      sentiment_distribution: {
        positive: sumField(hourlyStats, s => s.sentiment_distribution.positive),
        neutral: sumField(hourlyStats, s => s.sentiment_distribution.neutral),
        negative: sumField(hourlyStats, s => s.sentiment_distribution.negative)
      },
      
      // Combine category distributions
      category_distribution: aggregateCategoryDistribution(hourlyStats),
      subreddit_distribution: aggregateSubredditDistribution(hourlyStats),
      
      // Sum system performance
      error_count: sumField(hourlyStats, "error_count"),
      retry_count: sumField(hourlyStats, "retry_count"),
      
      created_at: now,
      updated_at: now
    };
    
    await ctx.db.insert("aggregate_stats", aggregate);
    console.log(`📊 Aggregated daily stats: ${aggregate.total_posts_fetched} posts total`);
  }
});

export const cleanupOldStats = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 3600000);
    const ninetyDaysAgo = now - (90 * 24 * 3600000);
    
    console.log(`🧹 Starting cleanup of old stats`);
    
    // Delete post_stats older than 30 days
    const oldPostStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.lt(q.field("created_at"), thirtyDaysAgo))
      .collect();
    
    let deletedPostStats = 0;
    for (const stat of oldPostStats) {
      await ctx.db.delete(stat._id);
      deletedPostStats++;
    }
    
    // Delete pipeline_stats older than 7 days
    const sevenDaysAgo = now - (7 * 24 * 3600000);
    const oldPipelineStats = await ctx.db
      .query("pipeline_stats")
      .withIndex("by_timestamp")
      .filter(q => q.lt(q.field("timestamp"), sevenDaysAgo))
      .collect();
    
    let deletedPipelineStats = 0;
    for (const stat of oldPipelineStats) {
      await ctx.db.delete(stat._id);
      deletedPipelineStats++;
    }
    
    // Delete system_events older than 90 days (keep longer for audit trail)
    const oldEvents = await ctx.db
      .query("system_events")
      .withIndex("by_timestamp")
      .filter(q => q.lt(q.field("timestamp"), ninetyDaysAgo))
      .collect();
    
    let deletedEvents = 0;
    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
      deletedEvents++;
    }
    
    // Delete minutely aggregate stats older than 24 hours
    const oneDayAgo = now - (24 * 3600000);
    const oldMinuteStats = await ctx.db
      .query("aggregate_stats")
      .withIndex("by_period")
      .filter(q => 
        q.and(
          q.eq(q.field("period_type"), "minute"),
          q.lt(q.field("period_start"), oneDayAgo)
        )
      )
      .collect();
    
    let deletedMinuteStats = 0;
    for (const stat of oldMinuteStats) {
      await ctx.db.delete(stat._id);
      deletedMinuteStats++;
    }
    
    // Delete hourly aggregate stats older than 90 days
    const oldHourlyStats = await ctx.db
      .query("aggregate_stats")
      .withIndex("by_period")
      .filter(q => 
        q.and(
          q.eq(q.field("period_type"), "hour"),
          q.lt(q.field("period_start"), ninetyDaysAgo)
        )
      )
      .collect();
    
    let deletedHourlyStats = 0;
    for (const stat of oldHourlyStats) {
      await ctx.db.delete(stat._id);
      deletedHourlyStats++;
    }
    
    console.log(`🧹 Cleanup completed:
      - Post stats: ${deletedPostStats}
      - Pipeline stats: ${deletedPipelineStats} 
      - System events: ${deletedEvents}
      - Minute stats: ${deletedMinuteStats}
      - Hourly stats: ${deletedHourlyStats}`);
  }
});

// Helper functions
function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function sumField<T>(items: T[], field: keyof T | ((item: T) => number)): number {
  if (typeof field === "function") {
    return items.reduce((sum, item) => sum + field(item), 0);
  }
  return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

function averageField<T>(items: T[], field: keyof T): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
  return sum / items.length;
}

function aggregateCategoryDistribution(
  stats: Doc<"aggregate_stats">[]
): { category: string; count: number }[] {
  const map = new Map<string, number>();
  
  stats.forEach(stat => {
    stat.category_distribution.forEach(item => {
      map.set(item.category, (map.get(item.category) || 0) + item.count);
    });
  });
  
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function aggregateSubredditDistribution(
  stats: Doc<"aggregate_stats">[]
): { subreddit: string; count: number }[] {
  const map = new Map<string, number>();
  
  stats.forEach(stat => {
    stat.subreddit_distribution.forEach(item => {
      map.set(item.subreddit, (map.get(item.subreddit) || 0) + item.count);
    });
  });
  
  return Array.from(map.entries())
    .map(([subreddit, count]) => ({ subreddit, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}