// DEBUG QUERIES
// /Users/matthewsimon/Projects/SMNB/smnb/convex/debug.ts

import { query } from "../_generated/server";

// Debug: Check what data is actually in our stats tables
export const checkStatsData = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Sample recent post stats
    const recentPostStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), oneDayAgo))
      .order("desc")
      .take(5);
    
    // Sample pipeline stats
    const recentPipelineStats = await ctx.db
      .query("pipeline_stats")
      .withIndex("by_timestamp")
      .filter(q => q.gte(q.field("timestamp"), fiveMinutesAgo))
      .order("desc")
      .take(5);
    
    // Count totals
    const totalPostStats = await ctx.db
      .query("post_stats")
      .collect()
      .then(results => results.length);
      
    const totalPipelineStats = await ctx.db
      .query("pipeline_stats")
      .collect()
      .then(results => results.length);
      
    const totalSystemEvents = await ctx.db
      .query("system_events")
      .collect()
      .then(results => results.length);
    
    // Check for posts with different stages
    const allPostStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), oneDayAgo))
      .collect();
    
    const stageCounts = {
      fetched: allPostStats.filter(s => s.fetched_at).length,
      enriched: allPostStats.filter(s => s.enriched_at).length,
      scored: allPostStats.filter(s => s.scored_at).length,
      scheduled: allPostStats.filter(s => s.scheduled_at).length,
      published: allPostStats.filter(s => s.published_at).length,
      withQualityScore: allPostStats.filter(s => s.quality_score && s.quality_score > 0).length,
      withProcessingTime: allPostStats.filter(s => s.total_processing_time && s.total_processing_time > 0).length
    };
    
    return {
      counts: {
        totalPostStats,
        totalPipelineStats,
        totalSystemEvents,
        recentPostStats: recentPostStats.length,
        recentPipelineStats: recentPipelineStats.length
      },
      stageCounts,
      samplePostStats: recentPostStats.map(s => ({
        post_id: s.post_id,
        fetched_at: s.fetched_at ? new Date(s.fetched_at).toLocaleTimeString() : null,
        enriched_at: s.enriched_at ? new Date(s.enriched_at).toLocaleTimeString() : null,
        quality_score: s.quality_score,
        processing_time: s.total_processing_time,
        reddit_score: s.reddit_score,
        sentiment: s.sentiment
      })),
      samplePipelineStats: recentPipelineStats.map(s => ({
        stage: s.stage,
        timestamp: new Date(s.timestamp).toLocaleTimeString(),
        is_healthy: s.is_healthy,
        queue_depth: s.queue_depth,
        processing_rate: s.processing_rate,
        error_rate: s.error_rate
      })),
      timeRanges: {
        now: new Date(now).toLocaleTimeString(),
        oneDayAgo: new Date(oneDayAgo).toLocaleTimeString(),
        fiveMinutesAgo: new Date(fiveMinutesAgo).toLocaleTimeString()
      }
    };
  }
});

// Debug: Check dashboard stats query specifically
export const debugDashboardStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const ranges = {
      "1h": 3600000,
      "24h": 86400000,
      "7d": 604800000,
      "30d": 2592000000
    };
    const since24h = now - ranges["24h"];
    const since1h = now - ranges["1h"];
    
    // Test 24h query
    const postStats24h = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), since24h))
      .collect();
    
    // Test 1h query  
    const postStats1h = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), since1h))
      .collect();
    
    // Calculate what the dashboard should show
    const calc24h = {
      totalPosts: postStats24h.length,
      publishedPosts: postStats24h.filter(s => s.published_at).length,
      enrichedPosts: postStats24h.filter(s => s.enriched_at).length,
      avgQuality: postStats24h.length > 0 
        ? postStats24h.reduce((sum, s) => sum + (s.quality_score || 0), 0) / postStats24h.length
        : 0,
      avgProcessingTime: postStats24h
        .filter(s => s.total_processing_time)
        .reduce((sum, s) => sum + (s.total_processing_time || 0), 0) / 
        Math.max(1, postStats24h.filter(s => s.total_processing_time).length)
    };
    
    return {
      timeRanges: {
        since24h: new Date(since24h).toLocaleString(),
        since1h: new Date(since1h).toLocaleString(),
        now: new Date(now).toLocaleString()
      },
      counts: {
        postStats24h: postStats24h.length,
        postStats1h: postStats1h.length
      },
      calculations24h: calc24h,
      sampleRecords: postStats24h.slice(0, 3).map(s => ({
        post_id: s.post_id,
        created_at: new Date(s.created_at).toLocaleString(),
        quality_score: s.quality_score,
        published_at: s.published_at ? new Date(s.published_at).toLocaleString() : null,
        total_processing_time: s.total_processing_time
      }))
    };
  }
});