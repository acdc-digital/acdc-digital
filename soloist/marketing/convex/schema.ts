import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Reddit posts cache
  live_feed_posts: defineTable({
    id: v.string(),
    title: v.string(),
    author: v.optional(v.string()),
    subreddit: v.optional(v.string()),
    url: v.string(),
    permalink: v.string(),
    score: v.optional(v.number()),
    num_comments: v.optional(v.number()),
    created_utc: v.number(),
    thumbnail: v.string(),
    selftext: v.string(),
    is_video: v.boolean(),
    domain: v.string(),
    upvote_ratio: v.number(),
    over_18: v.boolean(),
    source: v.string(), // e.g. "technology/hot"
    addedAt: v.number(),
    batchId: v.string(),
  })
    .index("by_batchId", ["batchId"])
    .index("by_source", ["source"])
    .index("by_addedAt", ["addedAt"])
    .index("by_created_utc", ["created_utc"]),

  // Marketing insights (no session_id - indefinite persistence)
  marketing_insights: defineTable({
    insight_id: v.string(),
    narrative: v.string(),
    title: v.optional(v.string()),
    insight_type: v.union(
      v.literal("pain_point"),
      v.literal("competitor_mention"),
      v.literal("feature_request"),
      v.literal("sentiment")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    )),
    topics: v.optional(v.array(v.string())),
    summary: v.optional(v.string()),
    created_at: v.number(),
    completed_at: v.number(),
    original_item: v.optional(v.object({
      title: v.string(),
      author: v.optional(v.string()),
      subreddit: v.optional(v.string()),
      url: v.optional(v.string()),
      score: v.optional(v.number()),
      num_comments: v.optional(v.number()),
    })),
  })
    .index("by_insight_type", ["insight_type"])
    .index("by_priority", ["priority"])
    .index("by_created_at", ["created_at"])
    .index("by_sentiment", ["sentiment"]),

  // Subreddit control state
  studio_controls: defineTable({
    profile_id: v.string(),
    enabled_subreddits: v.array(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_profile_id", ["profile_id"]),

  // Rate limiting tracking
  rate_limits: defineTable({
    service: v.string(), // "reddit" or "anthropic"
    calls_made: v.number(),
    calls_remaining: v.number(),
    reset_at: v.number(),
    total_calls_today: v.number(),
    total_calls_this_hour: v.number(),
    is_throttled: v.boolean(),
    throttle_until: v.optional(v.number()),
    timestamp: v.number(),
    updated_at: v.number(),
  })
    .index("by_service", ["service"])
    .index("by_timestamp", ["timestamp"]),
});
