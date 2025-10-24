/**
 * ENGINE - Initialization Script
 * 
 * Run this once to initialize the Engine and start processing.
 * Can be run from browser console or as a Convex function.
 */

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";

/**
 * One-time setup: Initialize Engine and verify it's working
 */
export const setupEngine = action({
  args: {},
  returns: v.object({
    initialized: v.boolean(),
    health: v.object({
      status: v.string(),
      lag_ms: v.number(),
      processed_count: v.number(),
      events_pending: v.number(),
    }),
    message: v.string(),
  }),
  handler: async (ctx) => {
    try {
      // Initialize the Engine (this creates the watermark and starts the scheduler)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initResult: any = await ctx.runAction((api.engine as any).control.initializeEngine, {});
      
      if (!initResult.success) {
        throw new Error(initResult.message);
      }
      
      // Return immediately - health check can be done separately
      // The Engine will start processing in the background
      return {
        initialized: true,
        health: {
          status: "starting",
          lag_ms: 0,
          processed_count: 0,
          events_pending: 0,
        },
        message: initResult.message + " Check the Engine tab for status.",
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        initialized: false,
        health: {
          status: "error",
          lag_ms: 0,
          processed_count: 0,
          events_pending: 0,
        },
        message: `Setup failed: ${error.message}`,
      };
    }
  },
});

/**
 * Test the Engine with sample events
 */
export const testEngine = action({
  args: {},
  returns: v.object({
    events_created: v.number(),
    processing_triggered: v.boolean(),
    metrics_available: v.boolean(),
  }),
  handler: async (ctx) => {
    const testSessionId = "test_session_" + Date.now();
    
    // Create test events
    const eventIds = [];
    
    // Test post enrichment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event1: any = await ctx.runMutation((api.engine as any).emitEvent.emitPostEnriched, {
      post_id: "test_post_1",
      session_id: testSessionId,
      subreddit: "technology",
      sentiment: 0.8,
      quality: 90,
      categories: ["ai", "technology"],
      entities: ["OpenAI", "Microsoft"],
    });
    eventIds.push(event1);
    
    // Test story creation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event2: any = await ctx.runMutation((api.engine as any).emitEvent.emitStoryCreated, {
      post_id: "test_post_1",
      story_id: "test_story_1",
      session_id: testSessionId,
      story_themes: ["ai-innovation", "tech-partnerships"],
      story_concepts: ["artificial intelligence", "collaboration", "innovation"],
      is_cross_post: false,
    });
    eventIds.push(event2);
    
    // Trigger processing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processResult: any = await ctx.runAction((api.engine as any).control.triggerProcessing, {});
    
    // Check if metrics are available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metrics: any = await ctx.runQuery((api.engine as any).queries.getMetrics, {
      dim_kind: "session",
      dim_value: testSessionId,
      window: "15m",
      bucket_count: 1,
    });
    
    return {
      events_created: eventIds.length,
      processing_triggered: processResult.processed > 0,
      metrics_available: metrics.metrics.stories_total > 0,
    };
  },
});
