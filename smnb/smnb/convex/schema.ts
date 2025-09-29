// CONVEX SCHEMA
// /Users/matthewsimon/Projects/SMNB/smnb/convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Token usage tracking
  token_usage: defineTable({
    request_id: v.string(), // Unique identifier for the request
    timestamp: v.number(), // Unix timestamp
    model: v.string(), // e.g. "claude-3-5-haiku-20241022"
    action: v.union(
      v.literal("generate"),
      v.literal("stream"),
      v.literal("analyze"),
      v.literal("test")
    ),
    input_tokens: v.number(),
    output_tokens: v.number(),
    total_tokens: v.number(),
    estimated_cost: v.number(), // Cost in USD
    request_type: v.union(
      v.literal("host"),
      v.literal("producer")
    ),
    duration: v.optional(v.number()), // Request duration in milliseconds
    success: v.boolean(),
    error_message: v.optional(v.string()),
    // Additional metadata
    session_id: v.optional(v.string()), // Link to host_sessions if applicable
    source_post_id: v.optional(v.string()), // Link to originating post if applicable
    metadata: v.optional(v.string()), // JSON blob for additional data
    // Enhanced tool tracking
    tools_used: v.optional(v.string()), // Comma-separated list of tool names
    tool_definitions_tokens: v.optional(v.number()), // Tokens used for tool definitions
    tool_results_tokens: v.optional(v.number()), // Tokens used for tool results
    has_tools: v.optional(v.boolean()), // Whether this request used tools
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_model", ["model"])
    .index("by_action", ["action"])
    .index("by_request_type", ["request_type"])
    .index("by_success", ["success"])
    .index("by_session_id", ["session_id"])
    .index("by_source_post_id", ["source_post_id"])
    .index("by_has_tools", ["has_tools"]), // New index for tool usage queries

  live_feed_posts: defineTable({
    id: v.string(),
    title: v.string(),
    author: v.string(),
    subreddit: v.string(),
    url: v.string(),
    permalink: v.string(),
    score: v.number(),
    num_comments: v.number(),
    created_utc: v.number(),
    thumbnail: v.string(),
    selftext: v.string(),
    is_video: v.boolean(),
    domain: v.string(),
    upvote_ratio: v.number(),
    over_18: v.boolean(),
    source: v.string(), // e.g. "technology/hot", "all/rising"
    addedAt: v.number(),
  batchId: v.string(), // unique ID for each batch fetch
  // Free-form JSON blob holding many computed attributes/features used by the ranking model
  attributesJson: v.optional(v.string()),
  })
    .index("by_batchId", ["batchId"])
    .index("by_source", ["source"])
    .index("by_addedAt", ["addedAt"])
    .index("by_created_utc", ["created_utc"])
    .index("by_score", ["score"])
    // Search indexes for live feed posts
    .searchIndex("live_search_title", {
      searchField: "title",
      filterFields: ["subreddit", "source", "over_18", "batchId"]
    }),

  studio_controls: defineTable({
    profile_id: v.string(),
    active_group_id: v.optional(v.string()),
    enabled_defaults: v.array(v.string()),
    custom_subreddits: v.array(v.string()),
    search_domains: v.array(v.string()),
    has_customizations: v.boolean(),
    default_groups_version: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
    last_synced_at: v.optional(v.number()),
  })
    .index("by_profile_id", ["profile_id"]),

  editor_documents: defineTable({
    story_id: v.string(), // References the story ID from story_history or live_feed_posts
    blog_content: v.optional(v.string()), // Generated blog post content
    newsletter_content: v.optional(v.string()), // Generated newsletter content
    analysis_content: v.optional(v.string()), // Generated analysis content
    social_content: v.optional(v.string()), // Generated social insights content
    context_content: v.optional(v.string()), // Generated context content
    created_at: v.number(),
    updated_at: v.number(),
    // Metadata for tracking generation status
    blog_generated_at: v.optional(v.number()),
    newsletter_generated_at: v.optional(v.number()),
    analysis_generated_at: v.optional(v.number()),
    social_generated_at: v.optional(v.number()),
    context_generated_at: v.optional(v.number()),
  })
    .index("by_story_id", ["story_id"])
    .index("by_created_at", ["created_at"])
    .index("by_updated_at", ["updated_at"]),

  host_sessions: defineTable({
    session_id: v.string(), // Unique identifier for the session
    title: v.string(), // Session name/title
    status: v.union(v.literal("active"), v.literal("ended"), v.literal("archived")),
    created_at: v.number(),
    ended_at: v.optional(v.number()),
    
    // Host configuration for this session
    personality: v.string(), // Host personality type
    verbosity: v.string(), // Verbosity level
    context_window: v.number(), // Number of items to consider
    update_frequency: v.number(), // Processing frequency in ms
    
    // Session statistics
    total_narrations: v.number(),
    total_words: v.number(),
    total_duration: v.number(), // Total session duration in seconds
    items_processed: v.number(),
    
    // Session metadata
    session_metadata: v.optional(v.string()), // JSON blob for additional session data
  })
    .index("by_session_id", ["session_id"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"])
    .index("by_ended_at", ["ended_at"]),

  host_documents: defineTable({
    session_id: v.optional(v.string()), // Make optional for migration from old schema
    content_text: v.string(), // Current accumulated content for this session
    content_json: v.optional(v.string()), // Optional JSON metadata for future use
    word_count: v.number(),
    character_count: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
    
    // Current narration metadata (for live updates)
    current_narration_id: v.optional(v.string()), // ID of currently streaming narration
    last_narration_type: v.optional(v.union(
      v.literal("breaking"),
      v.literal("developing"),
      v.literal("analysis"),
      v.literal("summary"),
      v.literal("commentary")
    )),
    last_tone: v.optional(v.union(
      v.literal("urgent"),
      v.literal("informative"),
      v.literal("conversational"),
      v.literal("dramatic")
    )),
    last_priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    
    // Track source posts for this session
    source_posts: v.optional(v.array(v.string())), // IDs of posts that influenced narrations in this session
    generation_metadata: v.optional(v.string()), // JSON blob with latest generation details
    
    // Legacy fields (for backward compatibility during migration)
    document_id: v.optional(v.string()),
    title: v.optional(v.string()),
    version: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    generated_by_agent: v.optional(v.boolean()),
    narration_type: v.optional(v.union(
      v.literal("breaking"),
      v.literal("developing"),
      v.literal("analysis"),
      v.literal("summary"),
      v.literal("commentary")
    )),
    tone: v.optional(v.union(
      v.literal("urgent"),
      v.literal("informative"),
      v.literal("conversational"),
      v.literal("dramatic")
    )),
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
  })
    .index("by_session_id", ["session_id"])
    .index("by_created_at", ["created_at"])
    .index("by_updated_at", ["updated_at"])
    .index("by_current_narration_id", ["current_narration_id"])
    // Legacy indexes (for migration period)
    .index("by_document_id", ["document_id"])
    .index("by_status", ["status"])
    // Search index for host documents
    .searchIndex("search_host_content", {
      searchField: "content_text",
      filterFields: ["session_id", "last_narration_type", "last_tone", "last_priority"]
    }),

  story_history: defineTable({
    story_id: v.string(), // Unique identifier for the story
    narrative: v.string(), // The completed story content
    title: v.optional(v.string()), // Optional story title
    tone: v.union(
      v.literal("breaking"),
      v.literal("developing"),
      v.literal("analysis"),
      v.literal("opinion"),
      v.literal("human-interest")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    agent_type: v.union(
      v.literal("host")
    ), // Which agent created this story
    duration: v.number(), // Estimated reading time in seconds
    word_count: v.number(), // Word count of the narrative
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("negative"), 
      v.literal("neutral")
    )),
    topics: v.optional(v.array(v.string())), // Topic tags
    summary: v.optional(v.string()), // Brief summary
    created_at: v.number(), // Timestamp when story was created
    completed_at: v.number(), // Timestamp when story was completed
    // Original source information
    original_item: v.optional(v.object({
      title: v.string(),
      author: v.string(),
      subreddit: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    // Metadata for future use
    metadata: v.optional(v.string()), // JSON blob for additional data
  })
    .index("by_agent_type", ["agent_type"])
    .index("by_priority", ["priority"])
    .index("by_tone", ["tone"])
    .index("by_created_at", ["created_at"])
    .index("by_completed_at", ["completed_at"])
    .index("by_sentiment", ["sentiment"])
    // Search index for stories
    .searchIndex("search_stories", {
      searchField: "narrative",
      filterFields: ["agent_type", "priority", "tone", "sentiment"]
    }),

  // 📊 STATS SYSTEM TABLES - Track comprehensive analytics
  
  // 1. Post Processing Stats - Track lifecycle of each post
  post_stats: defineTable({
    post_id: v.string(), // References live_feed_posts.id
    
    // Processing timeline
    fetched_at: v.number(), // Unix timestamp
    enriched_at: v.optional(v.number()),
    scored_at: v.optional(v.number()),
    scheduled_at: v.optional(v.number()),
    published_at: v.optional(v.number()),
    
    // Processing durations (ms)
    enrichment_duration: v.optional(v.number()),
    scoring_duration: v.optional(v.number()),
    scheduling_duration: v.optional(v.number()),
    total_processing_time: v.optional(v.number()),
    
    // Quality metrics
    quality_score: v.optional(v.number()),
    engagement_score: v.optional(v.number()),
    recency_score: v.optional(v.number()),
    priority_score: v.optional(v.number()),
    
    // Content analysis
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    )),
    sentiment_confidence: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
    entities: v.optional(v.array(v.object({
      type: v.string(), // person, organization, location
      value: v.string(),
      confidence: v.number()
    }))),
    keywords: v.optional(v.array(v.string())),
    
    // Reddit metrics
    reddit_score: v.number(),
    reddit_comments: v.number(),
    reddit_upvote_ratio: v.number(),
    
    // Performance flags
    processing_errors: v.optional(v.array(v.string())),
    retry_count: v.number(),
    
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_post", ["post_id"])
    .index("by_published", ["published_at"])
    .index("by_priority", ["priority_score"])
    .index("by_created", ["created_at"])
    .index("by_sentiment", ["sentiment", "created_at"]),

  // 2. Aggregate Stats - Hourly/Daily rollups
  aggregate_stats: defineTable({
    period_type: v.union(
      v.literal("minute"),
      v.literal("hour"),
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    ),
    period_start: v.number(), // Unix timestamp
    period_end: v.number(),
    
    // Volume metrics
    total_posts_fetched: v.number(),
    total_posts_enriched: v.number(),
    total_posts_scored: v.number(),
    total_posts_scheduled: v.number(),
    total_posts_published: v.number(),
    total_posts_dropped: v.number(),
    
    // Processing performance
    avg_enrichment_time: v.number(),
    avg_scoring_time: v.number(),
    avg_scheduling_time: v.number(),
    avg_total_processing_time: v.number(),
    
    // Quality metrics
    avg_quality_score: v.number(),
    avg_engagement_score: v.number(),
    avg_priority_score: v.number(),
    
    // Distribution metrics
    sentiment_distribution: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number()
    }),
    
    category_distribution: v.array(v.object({
      category: v.string(),
      count: v.number()
    })),
    
    subreddit_distribution: v.array(v.object({
      subreddit: v.string(),
      count: v.number()
    })),
    
    // System performance
    error_count: v.number(),
    retry_count: v.number(),
    
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_period", ["period_type", "period_start"])
    .index("by_type", ["period_type"]),

  // 3. Pipeline Performance - Real-time pipeline metrics
  pipeline_stats: defineTable({
    stage: v.union(
      v.literal("fetch"),
      v.literal("enrichment"),
      v.literal("scoring"),
      v.literal("scheduling"),
      v.literal("publishing")
    ),
    
    // Current state
    queue_depth: v.number(),
    processing_rate: v.number(), // items/second
    error_rate: v.number(), // errors/minute
    
    // Performance metrics
    avg_processing_time: v.number(),
    p95_processing_time: v.number(),
    p99_processing_time: v.number(),
    
    // Health indicators
    is_healthy: v.boolean(),
    last_error: v.optional(v.string()),
    last_success_at: v.number(),
    consecutive_errors: v.number(),
    
    timestamp: v.number(),
    created_at: v.number()
  })
    .index("by_stage", ["stage", "timestamp"])
    .index("by_timestamp", ["timestamp"])
    .index("by_health", ["is_healthy", "timestamp"]),

  // 4. System Events - Track important system events
  system_events: defineTable({
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
    
    component: v.string(), // enrichmentAgent, scoringAgent, etc.
    message: v.string(),
    details: v.optional(v.string()), // JSON string with event-specific data
    
    timestamp: v.number(),
    created_at: v.number()
  })
    .index("by_type", ["event_type", "timestamp"])
    .index("by_severity", ["severity", "timestamp"])
    .index("by_component", ["component", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  // 5. Rate Limit Tracking
  rate_limits: defineTable({
    service: v.string(), // reddit, enrichment_api, etc.
    
    // Current state
    calls_made: v.number(),
    calls_remaining: v.number(),
    reset_at: v.number(),
    
    // Historical tracking
    total_calls_today: v.number(),
    total_calls_this_hour: v.number(),
    
    // Throttling state
    is_throttled: v.boolean(),
    throttle_until: v.optional(v.number()),
    
    timestamp: v.number(),
    updated_at: v.number()
  })
    .index("by_service", ["service"])
    .index("by_timestamp", ["timestamp"])
    .index("by_throttled", ["is_throttled", "timestamp"]),

  // 6. User Engagement Stats (Future)
  engagement_stats: defineTable({
    post_id: v.string(), // References live_feed_posts.id
    
    // View metrics
    view_count: v.number(),
    unique_viewers: v.number(),
    avg_view_duration: v.number(),
    
    // Interaction metrics
    click_count: v.number(),
    share_count: v.number(),
    save_count: v.number(),
    
    // Engagement scoring
    engagement_score: v.number(),
    
    timestamp: v.number(),
    updated_at: v.number()
  })
    .index("by_post", ["post_id"])
    .index("by_engagement", ["engagement_score"])
    .index("by_timestamp", ["timestamp"]),

  // 7. API Health Tracking - Monitor external API endpoints
  api_health: defineTable({
    endpoint: v.string(), // Endpoint identifier/name
    category: v.union(
      v.literal("reddit"),
      v.literal("claude"),
      v.literal("internal"),
      v.literal("external")
    ),
    
    // Health status
    status: v.union(
      v.literal("healthy"),
      v.literal("degraded"),
      v.literal("unhealthy"),
      v.literal("unknown")
    ),
    
    // Current metrics
    response_time: v.number(), // milliseconds
    last_check: v.number(), // timestamp
    consecutive_failures: v.number(),
    
    // Historical tracking
    total_checks: v.number(),
    successful_checks: v.number(),
    error_rate: v.number(), // percentage
    uptime: v.number(), // percentage
    
    // Error information
    last_error: v.optional(v.string()),
    last_success_at: v.optional(v.number()),
    
    // Performance metrics
    avg_response_time: v.number(),
    p95_response_time: v.number(),
    
    // Metadata
    url: v.optional(v.string()),
    method: v.optional(v.string()),
    description: v.optional(v.string()),
    
    timestamp: v.number(),
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_endpoint", ["endpoint"])
    .index("by_category", ["category", "timestamp"])
    .index("by_status", ["status", "timestamp"])
    .index("by_timestamp", ["timestamp"])
    .index("by_health", ["status", "error_rate", "uptime"]),

  // 📊 USER ANALYTICS TABLES - Comprehensive user behavior tracking

  // 8. User Analytics - Core user metrics and behavior patterns
  user_analytics: defineTable({
    user_id: v.string(), // Unique user identifier
    
    // Core Identity Metrics (Level 1)
    account_type: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("editor"),
      v.literal("admin")
    ),
    registration_date: v.number(),
    last_active: v.number(),
    total_sessions: v.number(),
    verification_status: v.boolean(),
    subscription_tier: v.optional(v.string()),
    credits_remaining: v.optional(v.number()),
    api_usage_this_month: v.number(),
    
    // Engagement Scores
    overall_engagement_score: v.number(), // 0-100
    content_quality_rating: v.number(),
    influence_score: v.number(),
    
    // Live Feed Metrics (Level 3)
    posts_viewed: v.number(),
    posts_scrolled_past: v.number(),
    avg_view_duration: v.number(),
    scroll_depth: v.number(),
    refresh_frequency: v.number(),
    posts_clicked: v.number(),
    posts_expanded: v.number(),
    external_links_clicked: v.number(),
    posts_upvoted: v.number(),
    posts_downvoted: v.number(),
    posts_shared: v.number(),
    posts_saved: v.number(),
    posts_hidden: v.number(),
    posts_reported: v.number(),
    
    // Category & Content Preferences
    categories_viewed: v.string(), // JSON: Record<string, number>
    subreddits_engaged: v.string(), // JSON: Record<string, number>
    sentiment_preference: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number()
    }),
    
    // Time-based Patterns
    peak_viewing_hours: v.array(v.number()),
    avg_posts_per_visit: v.number(),
    time_between_visits: v.number(),
    
    // Quality Preferences
    min_quality_score_engaged: v.number(),
    avg_quality_score_preference: v.number(),
    high_priority_engagement_rate: v.number(),
    
    // Story & Newsletter Metrics (Levels 4-5)
    stories_opened: v.number(),
    stories_completed: v.number(),
    completion_rate: v.number(),
    avg_reading_time: v.number(),
    reading_speed: v.number(),
    
    // Newsletter engagement
    newsletter_subscribed: v.boolean(),
    newsletter_open_rate: v.number(),
    newsletter_click_through_rate: v.number(),
    emails_sent: v.number(),
    emails_opened: v.number(),
    
    // Editor Usage (Level 6)
    documents_created: v.number(),
    documents_published: v.number(),
    ai_requests_made: v.number(),
    ai_acceptance_rate: v.number(),
    
    // Behavioral Classification (Level 7)
    user_archetype: v.union(
      v.literal("lurker"),
      v.literal("engager"),
      v.literal("creator"),
      v.literal("curator"),
      v.literal("influencer")
    ),
    engagement_trend: v.union(
      v.literal("increasing"),
      v.literal("stable"),
      v.literal("decreasing")
    ),
    churn_risk_score: v.number(), // 0-100
    upgrade_likelihood: v.number(), // 0-100
    viral_content_potential: v.number(), // 0-100
    
    // Business Metrics (Level 9)
    lifetime_value: v.number(),
    revenue_generated: v.number(),
    referrals_made: v.number(),
    days_since_last_visit: v.number(),
    login_streak: v.number(),
    
    // Metadata
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_user", ["user_id"])
    .index("by_account_type", ["account_type"])
    .index("by_engagement", ["overall_engagement_score"])
    .index("by_last_active", ["last_active"])
    .index("by_archetype", ["user_archetype"])
    .index("by_churn_risk", ["churn_risk_score"])
    .index("by_created", ["created_at"]),

  // 9. User Events - Real-time event tracking for all user interactions
  user_events: defineTable({
    event_id: v.string(), // Unique event identifier
    user_id: v.string(),
    session_id: v.string(),
    
    // Event Classification
    event_type: v.union(
      v.literal("page_view"),
      v.literal("route_change"),
      v.literal("post_view"),
      v.literal("post_click"),
      v.literal("post_share"),
      v.literal("post_save"),
      v.literal("button_click"),
      v.literal("form_submit"),
      v.literal("search"),
      v.literal("filter_apply"),
      v.literal("scroll"),
      v.literal("error"),
      v.literal("performance"),
      v.literal("api_call")
    ),
    
    event_category: v.union(
      v.literal("navigation"),
      v.literal("content"),
      v.literal("interaction"),
      v.literal("system")
    ),
    
    event_action: v.string(),
    event_label: v.optional(v.string()),
    event_value: v.optional(v.number()),
    
    // Context Information
    page_url: v.string(),
    page_title: v.string(),
    referrer: v.optional(v.string()),
    
    // Custom Properties (JSON blob for flexibility)
    properties: v.string(), // JSON: Record<string, any>
    
    // Processing State
    processed: v.boolean(),
    aggregated: v.boolean(),
    
    timestamp: v.number(),
    created_at: v.number()
  })
    .index("by_user", ["user_id"])
    .index("by_session", ["session_id"])
    .index("by_type", ["event_type", "timestamp"])
    .index("by_category", ["event_category", "timestamp"])
    .index("by_timestamp", ["timestamp"])
    .index("by_processed", ["processed"])
    .index("by_user_type", ["user_id", "event_type"])
    .searchIndex("search_events", {
      searchField: "event_action",
      filterFields: ["user_id", "event_type", "event_category"]
    }),

  // 10. User Sessions - Detailed session tracking with device/geo data
  user_sessions: defineTable({
    session_id: v.string(), // Unique session identifier
    user_id: v.string(),
    
    // Session Timing
    session_start: v.number(),
    session_end: v.optional(v.number()),
    session_duration: v.optional(v.number()), // seconds
    page_views: v.number(),
    bounce_rate: v.boolean(),
    
    // Device & Platform (Level 2)
    device_type: v.union(
      v.literal("desktop"),
      v.literal("mobile"),
      v.literal("tablet")
    ),
    browser: v.string(),
    os: v.string(),
    screen_resolution: v.optional(v.string()),
    connection_speed: v.union(
      v.literal("slow"),
      v.literal("medium"),
      v.literal("fast")
    ),
    
    // Geographic Data
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    language: v.string(),
    
    // Navigation Patterns
    entry_point: v.string(), // First page visited
    exit_point: v.optional(v.string()), // Last page before leaving
    referrer_source: v.optional(v.string()),
    utm_campaign: v.optional(v.string()),
    utm_source: v.optional(v.string()),
    
    // Session Metrics
    events_count: v.number(),
    interactions_count: v.number(),
    content_engagement_score: v.number(),
    
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_user", ["user_id"])
    .index("by_session", ["session_id"])
    .index("by_start_time", ["session_start"])
    .index("by_device", ["device_type", "session_start"])
    .index("by_country", ["country", "session_start"])
    .index("by_duration", ["session_duration"])
    .index("by_engagement", ["content_engagement_score"]),

  // 11. User Behavior Patterns - ML/AI features and advanced analytics
  user_behavior_patterns: defineTable({
    user_id: v.string(),
    
    // ML Features (Level 8)
    user_cluster_id: v.optional(v.string()),
    content_affinity_vector: v.array(v.number()), // Multi-dimensional preferences
    
    // Time Series Patterns
    daily_activity_pattern: v.array(v.number()), // 24-hour distribution
    weekly_activity_pattern: v.array(v.number()), // 7-day pattern
    monthly_activity_pattern: v.array(v.number()), // 30-day pattern
    
    // Recommendation Signals
    collaborative_filtering_scores: v.string(), // JSON: Record<string, number>
    content_based_filtering_scores: v.string(), // JSON: Record<string, number>
    
    // Anomaly Detection
    unusual_activity_flags: v.array(v.string()),
    bot_probability_score: v.number(),
    
    // Content Journey Patterns
    content_discovery_paths: v.array(v.string()),
    typical_session_flows: v.array(v.string()),
    
    // Social Behavior
    sharing_personality: v.union(
      v.literal("private"),
      v.literal("selective"),
      v.literal("social")
    ),
    comment_sentiment: v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("critical")
    ),
    community_participation_score: v.number(), // 0-100
    
    // Learning & Exploration
    topic_exploration_rate: v.number(),
    content_depth_preference: v.union(
      v.literal("surface"),
      v.literal("moderate"),
      v.literal("deep")
    ),
    feature_adoption_rate: v.number(),
    
    // Calculated at timestamp
    calculated_at: v.number(),
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_user", ["user_id"])
    .index("by_cluster", ["user_cluster_id"])
    .index("by_calculated", ["calculated_at"])
    .index("by_bot_score", ["bot_probability_score"])
    .index("by_participation", ["community_participation_score"]),

  // 12. Content Interaction Metrics - Detailed content engagement tracking
  content_interactions: defineTable({
    interaction_id: v.string(),
    user_id: v.string(),
    content_id: v.string(), // References post/story/newsletter ID
    content_type: v.union(
      v.literal("live_feed_post"),
      v.literal("story"),
      v.literal("newsletter"),
      v.literal("editor_document")
    ),
    
    // Interaction Details
    interaction_type: v.union(
      v.literal("view"),
      v.literal("click"),
      v.literal("expand"),
      v.literal("share"),
      v.literal("save"),
      v.literal("upvote"),
      v.literal("downvote"),
      v.literal("hide"),
      v.literal("report")
    ),
    
    // Engagement Metrics
    view_duration: v.optional(v.number()), // seconds
    scroll_depth: v.optional(v.number()), // percentage
    interaction_value: v.optional(v.number()), // weighted value
    
    // Context
    page_url: v.string(),
    session_id: v.string(),
    device_type: v.string(),
    
    timestamp: v.number(),
    created_at: v.number()
  })
    .index("by_user", ["user_id", "timestamp"])
    .index("by_content", ["content_id", "timestamp"])
    .index("by_type", ["interaction_type", "timestamp"])
    .index("by_content_type", ["content_type", "timestamp"])
    .index("by_session", ["session_id"])
    .index("by_user_content", ["user_id", "content_id"]),

  // 📊 KEYWORD TRENDS SYSTEM - AI-powered keyword extraction and trend analysis
  
  // Keyword trends table with comprehensive tracking
  keyword_trends: defineTable({
    // Core keyword data
    keyword: v.string(), // The actual keyword or phrase
    normalized_keyword: v.string(), // Lowercase, trimmed version for deduplication
    keyword_type: v.union(
      v.literal("phrase"), // Multi-word phrase
      v.literal("entity"), // Named entity (person, org, location)
      v.literal("topic"), // Single topic word
      v.literal("subreddit"), // Subreddit name
      v.literal("hashtag") // Hashtag or trending term
    ),
    
    // Frequency & performance metrics
    total_occurrences: v.number(), // Total times seen across all posts
    unique_posts_count: v.number(), // Number of unique posts containing this keyword
    first_seen_at: v.number(), // When keyword was first detected
    last_seen_at: v.number(), // Most recent occurrence
    peak_occurrence_time: v.optional(v.number()), // When keyword was most popular
    
    // Quality & engagement scores
    avg_post_score: v.number(), // Average Reddit score of posts containing this
    avg_comment_count: v.number(), // Average comments on posts with this keyword
    avg_upvote_ratio: v.number(), // Average upvote ratio
    total_engagement_score: v.number(), // Combined engagement metric
    viral_coefficient: v.number(), // Likelihood of going viral (0-1)
    
    // Categorization
    primary_category: v.string(), // Main category (mental-health, productivity, etc.)
    secondary_categories: v.optional(v.array(v.string())), // Additional categories
    related_keywords: v.optional(v.array(v.string())), // Related/co-occurring keywords
    parent_keyword: v.optional(v.string()), // For hierarchical relationships
    
    // Sentiment analysis
    sentiment_scores: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number(),
      mixed: v.number()
    }),
    dominant_sentiment: v.string(),
    sentiment_confidence: v.number(), // 0-1 confidence score
    
    // Source tracking
    top_subreddits: v.array(v.object({
      subreddit: v.string(),
      count: v.number(),
      avg_score: v.number()
    })),
    source_post_ids: v.array(v.string()), // Sample of post IDs for reference
    
    // Trend analysis
    trend_status: v.union(
      v.literal("emerging"), // Just starting to appear
      v.literal("rising"), // Gaining momentum
      v.literal("peak"), // At peak popularity
      v.literal("declining"), // Losing momentum
      v.literal("stable"), // Consistent presence
      v.literal("dormant") // Was popular but inactive
    ),
    trend_velocity: v.number(), // Rate of change in popularity
    trend_acceleration: v.number(), // Rate of change of velocity
    
    // Performance tier (matching your heatmap)
    performance_tier: v.union(
      v.literal("elite"),
      v.literal("excel"),
      v.literal("veryGood"),
      v.literal("good"),
      v.literal("avgPlus"),
      v.literal("avg"),
      v.literal("avgMinus"),
      v.literal("poor"),
      v.literal("veryPoor"),
      v.literal("critical")
    ),
    
    // LLM enrichment (if processed by AI)
    llm_processed: v.boolean(),
    llm_summary: v.optional(v.string()), // AI-generated context about this keyword
    llm_suggested_content: v.optional(v.string()), // Content ideas for this keyword
    llm_target_audience: v.optional(v.array(v.string())), // Who's interested in this
    
    // Time-based patterns
    hourly_distribution: v.optional(v.array(v.number())), // 24-hour activity pattern
    weekly_distribution: v.optional(v.array(v.number())), // 7-day pattern
    seasonal_relevance: v.optional(v.string()), // If keyword is seasonal
    
    // Metadata
    created_at: v.number(),
    updated_at: v.number(),
    last_processed_at: v.number(), // When analysis was last run
    processing_version: v.number(), // Track algorithm version
  })
    .index("by_keyword", ["normalized_keyword"])
    .index("by_performance", ["performance_tier", "total_engagement_score"])
    .index("by_trend", ["trend_status", "trend_velocity"])
    .index("by_category", ["primary_category", "total_engagement_score"])
    .index("by_recency", ["last_seen_at"])
    .index("by_engagement", ["total_engagement_score"])
    .searchIndex("search_keywords", {
      searchField: "keyword",
      filterFields: ["primary_category", "trend_status", "performance_tier"]
    }),

  // Keyword extraction sessions (track processing runs)
  keyword_extraction_runs: defineTable({
    run_id: v.string(), // Unique run identifier
    started_at: v.number(),
    completed_at: v.optional(v.number()),
    
    // Processing stats
    posts_processed: v.number(),
    keywords_extracted: v.number(),
    new_keywords_found: v.number(),
    keywords_updated: v.number(),
    
    // Configuration used
    extraction_config: v.object({
      min_keyword_length: v.number(),
      max_keyword_length: v.number(),
      min_occurrence_threshold: v.number(),
      time_window_hours: v.number(),
      use_llm_enrichment: v.boolean()
    }),
    
    // Performance metrics
    processing_duration_ms: v.optional(v.number()),
    errors_encountered: v.optional(v.array(v.string())),
    
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("partial")
    ),
    
    created_at: v.number(),
    updated_at: v.number()
  })
    .index("by_status", ["status", "created_at"])
    .index("by_created", ["created_at"]),

  // Model usage tracking for cost analysis
  model_usage_logs: defineTable({
    model: v.string(), // e.g., "claude-3-haiku", "gpt-4", etc.
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(), // in USD
    purpose: v.string(), // e.g., "reddit_post_generation", "keyword_enrichment"
    metadata: v.optional(v.any()),
    timestamp: v.number()
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_model", ["model", "timestamp"])
    .index("by_purpose", ["purpose", "timestamp"]),

  // Generated Reddit posts tracking
  generated_posts: defineTable({
    // Post Content
    title: v.string(),
    content: v.string(),
    author: v.string(),
    
    // Reddit Context
    target_subreddit: v.string(),
    estimated_score: v.number(),
    estimated_comments: v.number(),
    
    // Generation Context
    source_keywords: v.array(v.string()),
    column_context: v.string(), // "Content Ideas", "Research Topics", etc.
    generation_prompt_hash: v.optional(v.string()), // To track prompt variations
    
    // Performance Metrics Used
    avg_synergy_score: v.optional(v.number()),
    avg_relevance_coefficient: v.optional(v.number()),
    avg_engagement_potential: v.optional(v.number()),
    avg_freshness_coefficient: v.optional(v.number()),
    avg_novelty_index: v.optional(v.number()),
    
    // Model & Cost Info
    model_used: v.string(),
    generation_cost: v.number(),
    input_tokens: v.number(),
    output_tokens: v.number(),
    
    // Timestamps
    generated_at: v.number(),
    created_at: v.number(),
    
    // Status & Performance Tracking
    status: v.union(
      v.literal("generated"), // Just created
      v.literal("published"), // Actually posted to Reddit
      v.literal("archived"),  // Saved for later
      v.literal("discarded")  // Marked as not useful
    ),
    
    // If actually published
    actual_reddit_url: v.optional(v.string()),
    actual_score: v.optional(v.number()),
    actual_comments: v.optional(v.number()),
    published_at: v.optional(v.number()),
    
    // User feedback
    user_rating: v.optional(v.union(
      v.literal("excellent"),
      v.literal("good"), 
      v.literal("fair"),
      v.literal("poor")
    )),
    user_notes: v.optional(v.string()),
    
    // Analytics
    view_count: v.optional(v.number()),
    last_viewed_at: v.optional(v.number())
  })
    .index("by_generated_at", ["generated_at"])
    .index("by_status", ["status", "generated_at"])
    .index("by_subreddit", ["target_subreddit", "generated_at"])
    .index("by_column_context", ["column_context", "generated_at"])
    .index("by_keywords", ["source_keywords"])
    .index("by_cost", ["generation_cost"])
    .index("by_user_rating", ["user_rating", "generated_at"]),

  // User Management
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk's unique identifier
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Session Management
  sessions: defineTable({
    userId: v.id("users"), // Reference to users table
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    settings: v.object({
      model: v.string(),
      temperature: v.number(),
      maxTokens: v.number(),
      topP: v.number(),
      frequencyPenalty: v.number(),
      presencePenalty: v.number(),
      controlMode: v.union(
        v.literal("hands-free"),
        v.literal("balanced"),
        v.literal("full-control")
      ),
    }),
  })
    .index("by_status", ["status"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"]),

  // Session Messages
  messages: defineTable({
    sessionId: v.id("sessions"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  })
    .index("by_sessionId", ["sessionId"]),

});
