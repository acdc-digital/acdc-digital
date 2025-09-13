// STATS SYSTEM TESTING
// /Users/matthewsimon/Projects/SMNB/smnb/convex/stats/test.ts

import { mutation, query } from "../_generated/server";
import { api } from "../_generated/api";

/**
 * Test function to create sample stats data for development
 */
export const createTestStatsData = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    console.log("🧪 Creating test stats data...");
    
    // Create some sample post stats
    const testPosts = [
      {
        post_id: "test_post_1",
        subreddit: "news", 
        title: "Test News Article 1",
        processing_stage: "published" as const,
        enrichment_duration: 1200,
        scoring_duration: 800,
        scheduling_duration: 200,
        total_processing_time: 2200,
        quality_score: 0.85,
        engagement_score: 0.72,
        priority_score: 0.78,
        sentiment: "positive" as const,
        categories: ["politics", "technology"],
        retry_count: 0,
        created_at: hourAgo + 1000
      },
      {
        post_id: "test_post_2", 
        subreddit: "technology",
        title: "Test Tech Article 2",
        processing_stage: "published" as const,
        enrichment_duration: 1500,
        scoring_duration: 900,
        scheduling_duration: 300,
        total_processing_time: 2700,
        quality_score: 0.92,
        engagement_score: 0.88,
        priority_score: 0.90,
        sentiment: "neutral" as const,
        categories: ["technology", "ai"],
        retry_count: 1,
        created_at: hourAgo + 2000
      },
      {
        post_id: "test_post_3",
        subreddit: "worldnews",
        title: "Test World News Article 3", 
        processing_stage: "scored" as const,
        enrichment_duration: 1100,
        scoring_duration: 750,
        total_processing_time: 1850,
        quality_score: 0.65,
        engagement_score: 0.45,
        priority_score: 0.55,
        sentiment: "negative" as const,
        categories: ["politics", "international"],
        retry_count: 0,
        created_at: hourAgo + 3000
      }
    ];
    
    // Insert test post stats
    for (const post of testPosts) {
      await ctx.runMutation(api.stats.mutations.trackPostProcessing, {
        postId: post.post_id,
        stage: post.processing_stage,
        duration: post.total_processing_time,
        metrics: {
          sentiment: post.sentiment,
          quality_score: post.quality_score,
          engagement_score: post.engagement_score,
          priority_score: post.priority_score,
          categories: post.categories
        }
      });
    }
    
    // Create some pipeline stats
    await ctx.runMutation(api.stats.mutations.updatePipelineStats, {
      stage: "enrichment",
      metrics: {
        queue_depth: 5,
        processing_rate: 12.0,
        error_rate: 0.067,
        avg_processing_time: 1250,
        is_healthy: true
      }
    });
    
    await ctx.runMutation(api.stats.mutations.updatePipelineStats, {
      stage: "scoring",
      metrics: {
        queue_depth: 2,
        processing_rate: 15.0,
        error_rate: 0.0,
        avg_processing_time: 820,
        is_healthy: true
      }
    });
    
    // Log some system events
    await ctx.runMutation(api.stats.mutations.logSystemEvent, {
      event_type: "pipeline_start",
      severity: "info",
      component: "processing_pipeline",
      message: "Processing pipeline started successfully",
      details: JSON.stringify({ batch_size: 15 })
    });
    
    await ctx.runMutation(api.stats.mutations.logSystemEvent, {
      event_type: "error", 
      severity: "warning",
      component: "enrichment_agent",
      message: "Failed to enrich post due to API timeout",
      details: JSON.stringify({ post_id: "test_post_timeout", error_code: "TIMEOUT" })
    });
    
    // Update some rate limits
    await ctx.runMutation(api.stats.mutations.updateRateLimit, {
      service: "reddit_api",
      calls_made: 45,
      calls_remaining: 55,
      reset_at: now + 3600000
    });
    
    // Track some engagement
    await ctx.runMutation(api.stats.mutations.trackEngagement, {
      postId: "test_post_1",
      event_type: "view",
      user_id: "test_user_1",
      duration: 5000
    });
    
    await ctx.runMutation(api.stats.mutations.trackEngagement, {
      postId: "test_post_1", 
      event_type: "click",
      user_id: "test_user_1",
      duration: 500
    });
    
    console.log("✅ Test stats data created successfully");
    
    return { 
      message: "Test data created",
      posts_created: testPosts.length,
      timestamp: now
    };
  }
});

/**
 * Test query to validate stats system functionality
 */
export const validateStatsSystem = query({
  handler: async (ctx) => {
    console.log("🔍 Validating stats system...");
    
    try {
      // Test basic table access
      const postStatsCount = await ctx.db.query("post_stats").collect().then(r => r.length);
      const pipelineStatsCount = await ctx.db.query("pipeline_stats").collect().then(r => r.length);
      const systemEventsCount = await ctx.db.query("system_events").collect().then(r => r.length);
      const rateLimitsCount = await ctx.db.query("rate_limits").collect().then(r => r.length);
      const engagementStatsCount = await ctx.db.query("engagement_stats").collect().then(r => r.length);
      const aggregateStatsCount = await ctx.db.query("aggregate_stats").collect().then(r => r.length);
      
      console.log("✅ All stats tables accessible");
      
      return {
        status: "success",
        table_counts: {
          post_stats: postStatsCount,
          pipeline_stats: pipelineStatsCount,
          system_events: systemEventsCount,
          rate_limits: rateLimitsCount,
          engagement_stats: engagementStatsCount,
          aggregate_stats: aggregateStatsCount
        },
        validation_time: Date.now()
      };
      
    } catch (error) {
      console.error("❌ Stats system validation failed:", error);
      
      return {
        status: "error",
        error: String(error),
        validation_time: Date.now()
      };
    }
  }
});

/**
 * Clean up test data
 */
export const cleanupTestData = mutation({
  handler: async (ctx) => {
    console.log("🧹 Cleaning up test data...");
    
    let deletedCount = 0;
    
    // Delete test post stats (look for posts starting with "test_post_")
    const testPostStats = await ctx.db
      .query("post_stats")
      .collect();
      
    const testPostStatsFiltered = testPostStats.filter(stat => 
      stat.post_id.startsWith("test_post_")
    );
    
    for (const stat of testPostStatsFiltered) {
      await ctx.db.delete(stat._id);
      deletedCount++;
    }
    
    // Delete test system events (look for messages containing "test")
    const testEvents = await ctx.db
      .query("system_events") 
      .collect();
      
    const testEventsFiltered = testEvents.filter(event =>
      event.message.toLowerCase().includes("test")
    );
      
    for (const event of testEventsFiltered) {
      await ctx.db.delete(event._id);
      deletedCount++;
    }
    
    // Delete test engagement events (look for post_id starting with "test_post_")
    const testEngagement = await ctx.db
      .query("engagement_stats")
      .collect();
      
    const testEngagementFiltered = testEngagement.filter(engagement =>
      engagement.post_id.startsWith("test_post_")
    );
      
    for (const engagement of testEngagementFiltered) {
      await ctx.db.delete(engagement._id);
      deletedCount++;
    }
    
    console.log(`✅ Cleaned up ${deletedCount} test records`);
    
    return {
      deleted_count: deletedCount,
      cleanup_time: Date.now()
    };
  }
});