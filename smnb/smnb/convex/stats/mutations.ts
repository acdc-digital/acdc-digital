// STATS MUTATIONS
// /Users/matthewsimon/Projects/SMNB/smnb/convex/stats/mutations.ts

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Track post processing stats
export const trackPostProcessing = mutation({
  args: {
    postId: v.string(),
    stage: v.union(
      v.literal("fetched"),
      v.literal("enriched"),
      v.literal("scored"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    duration: v.optional(v.number()),
    metrics: v.optional(v.object({
      quality_score: v.optional(v.number()),
      engagement_score: v.optional(v.number()),
      recency_score: v.optional(v.number()),
      priority_score: v.optional(v.number()),
      sentiment: v.optional(v.string()),
      sentiment_confidence: v.optional(v.number()),
      categories: v.optional(v.array(v.string())),
      keywords: v.optional(v.array(v.string())),
      entities: v.optional(v.array(v.object({
        type: v.string(),
        value: v.string(),
        confidence: v.number()
      })))
    })),
    reddit_metrics: v.optional(v.object({
      score: v.number(),
      num_comments: v.number(),
      upvote_ratio: v.number()
    })),
    error: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get or create post stats record
    const existing = await ctx.db
      .query("post_stats")
      .withIndex("by_post", q => q.eq("post_id", args.postId))
      .first();
    
    if (existing) {
      // Update existing record
      const updates: Partial<Doc<"post_stats">> = {
        updated_at: now
      };
      
      // Update stage-specific timestamp
      switch (args.stage) {
        case "fetched":
          updates.fetched_at = now;
          break;
        case "enriched":
          updates.enriched_at = now;
          if (args.duration) updates.enrichment_duration = args.duration;
          break;
        case "scored":
          updates.scored_at = now;
          if (args.duration) updates.scoring_duration = args.duration;
          break;
        case "scheduled":
          updates.scheduled_at = now;
          if (args.duration) updates.scheduling_duration = args.duration;
          break;
        case "published":
          updates.published_at = now;
          // Calculate total processing time
          if (existing.fetched_at) {
            updates.total_processing_time = now - existing.fetched_at;
          }
          break;
      }
      
      // Update metrics if provided
      if (args.metrics) {
        // Handle sentiment conversion
        if (args.metrics.sentiment) {
          const sentimentValue = args.metrics.sentiment as "positive" | "neutral" | "negative";
          if (["positive", "neutral", "negative"].includes(sentimentValue)) {
            updates.sentiment = sentimentValue;
          }
        }
        
        // Update other metrics
        Object.keys(args.metrics).forEach(key => {
          if (key !== "sentiment" && args.metrics![key as keyof typeof args.metrics] !== undefined) {
            (updates as any)[key] = args.metrics![key as keyof typeof args.metrics];
          }
        });
      }
      
      // Track errors
      if (args.error) {
        updates.processing_errors = [
          ...(existing.processing_errors || []),
          args.error
        ];
        updates.retry_count = (existing.retry_count || 0) + 1;
      }
      
      await ctx.db.patch(existing._id, updates);
    } else {
      // Create new record - try to get the post to extract Reddit metrics
      const post = await ctx.db
        .query("live_feed_posts")
        .withIndex("by_source") // Use an existing index
        .filter(q => q.eq(q.field("id"), args.postId))
        .first();
      
      // Use provided reddit_metrics or fall back to post data from DB
      const redditScore = args.reddit_metrics?.score || post?.score || 0;
      const redditComments = args.reddit_metrics?.num_comments || post?.num_comments || 0;
      const redditUpvoteRatio = args.reddit_metrics?.upvote_ratio || post?.upvote_ratio || 0;
      
      const newRecord: Omit<Doc<"post_stats">, "_id" | "_creationTime"> = {
        post_id: args.postId,
        fetched_at: now,
        reddit_score: redditScore,
        reddit_comments: redditComments,
        reddit_upvote_ratio: redditUpvoteRatio,
        retry_count: 0,
        created_at: now,
        updated_at: now
      };
      
      // If post not found, we'll update with Reddit metrics later when post is saved
      if (!post && args.stage === "fetched") {
        console.log(`📊 Creating stats record for post ${args.postId} (post not in DB yet)`);
      } else if (!post) {
        console.warn(`⚠️ Post ${args.postId} not found in database for stage ${args.stage}`);
      }
      
      // Add metrics if provided
      if (args.metrics) {
        Object.keys(args.metrics).forEach(key => {
          if (args.metrics![key as keyof typeof args.metrics] !== undefined) {
            if (key === "sentiment") {
              const sentimentValue = args.metrics!.sentiment as "positive" | "neutral" | "negative";
              if (["positive", "neutral", "negative"].includes(sentimentValue)) {
                (newRecord as any)[key] = sentimentValue;
              }
            } else {
              (newRecord as any)[key] = args.metrics![key as keyof typeof args.metrics];
            }
          }
        });
      }
      
      // Add error if provided
      if (args.error) {
        newRecord.processing_errors = [args.error];
        newRecord.retry_count = 1;
      }
      
      await ctx.db.insert("post_stats", newRecord);
    }
    
    console.log(`📊 Tracked ${args.stage} for post ${args.postId}`);
  }
});

// Update pipeline performance metrics
export const updatePipelineStats = mutation({
  args: {
    stage: v.union(
      v.literal("fetch"),
      v.literal("enrichment"),
      v.literal("scoring"),
      v.literal("scheduling"),
      v.literal("publishing")
    ),
    metrics: v.object({
      queue_depth: v.number(),
      processing_rate: v.number(),
      error_rate: v.number(),
      avg_processing_time: v.number(),
      is_healthy: v.boolean(),
      last_error: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.insert("pipeline_stats", {
      stage: args.stage,
      queue_depth: args.metrics.queue_depth,
      processing_rate: args.metrics.processing_rate,
      error_rate: args.metrics.error_rate,
      avg_processing_time: args.metrics.avg_processing_time,
      p95_processing_time: args.metrics.avg_processing_time * 1.5, // Placeholder calculation
      p99_processing_time: args.metrics.avg_processing_time * 2,   // Placeholder calculation
      is_healthy: args.metrics.is_healthy,
      last_error: args.metrics.last_error,
      last_success_at: now,
      consecutive_errors: args.metrics.last_error ? 1 : 0,
      timestamp: now,
      created_at: now
    });
    
    console.log(`🔧 Updated pipeline stats for ${args.stage}: healthy=${args.metrics.is_healthy}`);
  }
});

// Log system events
export const logSystemEvent = mutation({
  args: {
    event_type: v.union(
      v.literal("pipeline_start"),
      v.literal("pipeline_stop"),
      v.literal("error"),
      v.literal("warning"),
      v.literal("rate_limit"),
      v.literal("config_change"),
      v.literal("deployment")
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
    component: v.string(),
    message: v.string(),
    details: v.optional(v.string()) // JSON string
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.insert("system_events", {
      event_type: args.event_type,
      severity: args.severity,
      component: args.component,
      message: args.message,
      details: args.details,
      timestamp: now,
      created_at: now
    });
  }
});

// Update rate limit status
export const updateRateLimit = mutation({
  args: {
    service: v.string(),
    calls_made: v.number(),
    calls_remaining: v.number(),
    reset_at: v.number()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_service", q => q.eq("service", args.service))
      .first();
    
    const now = Date.now();
    const hourStart = Math.floor(now / 3600000) * 3600000;
    const dayStart = Math.floor(now / 86400000) * 86400000;
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        calls_made: args.calls_made,
        calls_remaining: args.calls_remaining,
        reset_at: args.reset_at,
        total_calls_this_hour: existing.timestamp > hourStart 
          ? existing.total_calls_this_hour + 1 
          : 1,
        total_calls_today: existing.timestamp > dayStart 
          ? existing.total_calls_today + 1 
          : 1,
        is_throttled: args.calls_remaining === 0,
        throttle_until: args.calls_remaining === 0 ? args.reset_at : undefined,
        timestamp: now,
        updated_at: now
      });
    } else {
      await ctx.db.insert("rate_limits", {
        service: args.service,
        calls_made: args.calls_made,
        calls_remaining: args.calls_remaining,
        reset_at: args.reset_at,
        total_calls_today: 1,
        total_calls_this_hour: 1,
        is_throttled: args.calls_remaining === 0,
        throttle_until: args.calls_remaining === 0 ? args.reset_at : undefined,
        timestamp: now,
        updated_at: now
      });
    }
    
  }
});

// Track engagement metrics (for future use)
export const trackEngagement = mutation({
  args: {
    postId: v.string(),
    event_type: v.union(
      v.literal("view"),
      v.literal("click"),
      v.literal("share"),
      v.literal("save")
    ),
    duration: v.optional(v.number()), // For view duration
    user_id: v.optional(v.string()) // For unique viewer tracking
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("engagement_stats")
      .withIndex("by_post", q => q.eq("post_id", args.postId))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      const updates: Partial<Doc<"engagement_stats">> = {
        updated_at: now
      };
      
      switch (args.event_type) {
        case "view":
          updates.view_count = existing.view_count + 1;
          if (args.duration) {
            const totalDuration = existing.avg_view_duration * existing.view_count + args.duration;
            updates.avg_view_duration = totalDuration / (existing.view_count + 1);
          }
          break;
        case "click":
          updates.click_count = existing.click_count + 1;
          break;
        case "share":
          updates.share_count = existing.share_count + 1;
          break;
        case "save":
          updates.save_count = existing.save_count + 1;
          break;
      }
      
      // Recalculate engagement score
      const totalEvents = (updates.view_count || existing.view_count) + 
                         (updates.click_count || existing.click_count) + 
                         (updates.share_count || existing.share_count) + 
                         (updates.save_count || existing.save_count);
      updates.engagement_score = totalEvents * 0.1; // Simple scoring formula
      
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("engagement_stats", {
        post_id: args.postId,
        view_count: args.event_type === "view" ? 1 : 0,
        unique_viewers: 1, // TODO: Implement proper unique tracking
        avg_view_duration: args.duration || 0,
        click_count: args.event_type === "click" ? 1 : 0,
        share_count: args.event_type === "share" ? 1 : 0,
        save_count: args.event_type === "save" ? 1 : 0,
        engagement_score: 0.1, // Initial score
        timestamp: now,
        updated_at: now
      });
    }
    
  }
});