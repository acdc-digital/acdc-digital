import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// 📊 USER ANALYTICS FUNCTIONS - Working with existing schema

export const getUserAnalytics = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("user_analytics")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .first();

    if (!analytics) {
      console.log(`❌ No analytics found for user: ${args.user_id}`);
      return null;
    }

    console.log(`📈 Retrieved analytics for user: ${args.user_id}`);
    return analytics;
  },
});

export const createUserAnalytics = mutation({
  args: {
    user_id: v.string(),
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
    api_usage_this_month: v.number(),
    overall_engagement_score: v.number(),
    content_quality_rating: v.number(),
    influence_score: v.number(),
    posts_viewed: v.number(),
    posts_clicked: v.number(),
    ai_requests_made: v.number(),
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
    churn_risk_score: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`📊 Creating analytics profile for user: ${args.user_id}`);
    
    // Use the existing user_analytics schema fields
    const analyticsData = {
      user_id: args.user_id,
      account_type: args.account_type,
      registration_date: args.registration_date,
      last_active: args.last_active,
      total_sessions: args.total_sessions,
      verification_status: args.verification_status,
      api_usage_this_month: args.api_usage_this_month,
      
      // Core engagement metrics
      overall_engagement_score: args.overall_engagement_score,
      content_quality_rating: args.content_quality_rating,
      influence_score: args.influence_score,
      
      // Live feed metrics - using existing schema fields
      posts_viewed: args.posts_viewed,
      posts_scrolled_past: 0,
      avg_view_duration: 0,
      scroll_depth: 0,
      refresh_frequency: 0,
      posts_clicked: args.posts_clicked,
      posts_expanded: 0,
      external_links_clicked: 0,
      posts_upvoted: 0,
      posts_downvoted: 0,
      posts_shared: 0,
      posts_saved: 0,
      posts_hidden: 0,
      posts_reported: 0,
      
      // Content preferences as JSON strings
      categories_viewed: "{}",
      subreddits_engaged: "{}",
      sentiment_preference: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      
      // Time patterns
      peak_viewing_hours: [],
      avg_posts_per_visit: 0,
      time_between_visits: 0,
      
      // Quality metrics
      min_quality_score_engaged: 0,
      avg_quality_score_preference: 0,
      high_priority_engagement_rate: 0,
      
      // Story metrics
      stories_opened: 0,
      stories_completed: 0,
      completion_rate: 0,
      avg_reading_time: 0,
      reading_speed: 0,
      
      // Newsletter metrics
      newsletter_subscribed: false,
      newsletter_open_rate: 0,
      newsletter_click_through_rate: 0,
      emails_sent: 0,
      emails_opened: 0,
      
      // Editor metrics
      documents_created: 0,
      documents_published: 0,
      ai_requests_made: args.ai_requests_made,
      ai_acceptance_rate: 0,
      
      // Behavioral classification
      user_archetype: args.user_archetype,
      engagement_trend: args.engagement_trend,
      churn_risk_score: args.churn_risk_score,
      upgrade_likelihood: 0,
      viral_content_potential: 0,
      
      // Business metrics
      lifetime_value: 0,
      revenue_generated: 0,
      referrals_made: 0,
      days_since_last_visit: 0,
      login_streak: 1,
      
      // Timestamps
      created_at: args.created_at,
      updated_at: args.updated_at
    };

    const analyticsId = await ctx.db.insert("user_analytics", analyticsData);
    console.log(`✅ Analytics profile created with ID: ${analyticsId}`);
    return analyticsId;
  },
});

export const updateUserAnalytics = mutation({
  args: {
    user_id: v.string(),
    updates: v.object({
      last_active: v.optional(v.number()),
      total_sessions: v.optional(v.number()),
      posts_viewed: v.optional(v.number()),
      posts_clicked: v.optional(v.number()),
      ai_requests_made: v.optional(v.number()),
      overall_engagement_score: v.optional(v.number()),
      user_archetype: v.optional(v.union(
        v.literal("lurker"),
        v.literal("engager"),
        v.literal("creator"),
        v.literal("curator"),
        v.literal("influencer")
      )),
      engagement_trend: v.optional(v.union(
        v.literal("increasing"),
        v.literal("stable"),
        v.literal("decreasing")
      )),
      churn_risk_score: v.optional(v.number()),
      updated_at: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("user_analytics")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .first();

    if (!analytics) {
      throw new Error(`Analytics not found for user: ${args.user_id}`);
    }

    await ctx.db.patch(analytics._id, {
      ...args.updates,
      updated_at: Date.now(),
    });

    console.log(`📝 Analytics updated for user: ${args.user_id}`);
    return analytics._id;
  },
});

// 📈 USER EVENT TRACKING

export const createUserEvent = mutation({
  args: {
    event_id: v.string(),
    user_id: v.string(),
    session_id: v.string(),
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
    page_url: v.string(),
    page_title: v.string(),
    referrer: v.optional(v.string()),
    properties: v.string(), // JSON string
    processed: v.optional(v.boolean()),
    aggregated: v.optional(v.boolean()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("user_events", {
      event_id: args.event_id,
      user_id: args.user_id,
      session_id: args.session_id,
      event_type: args.event_type,
      event_category: args.event_category,
      event_action: args.event_action,
      event_label: args.event_label,
      event_value: args.event_value,
      page_url: args.page_url,
      page_title: args.page_title,
      referrer: args.referrer,
      properties: args.properties,
      processed: args.processed || false,
      aggregated: args.aggregated || false,
      timestamp: args.timestamp,
      created_at: Date.now(),
    });

    console.log(`🎯 Event tracked: ${args.event_type} for user ${args.user_id}`);
    return eventId;
  },
});

export const getUserEvents = query({
  args: {
    user_id: v.string(),
    event_type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("user_events")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .order("desc");

    const events = await query.collect();

    // Apply limit if specified
    const limitedEvents = args.limit ? events.slice(0, args.limit) : events;
    
    // Filter by event type if specified
    if (args.event_type) {
      return limitedEvents.filter(event => event.event_type === args.event_type);
    }

    return limitedEvents;
  },
});

// 📊 USER SESSION TRACKING

export const createUserSession = mutation({
  args: {
    session_id: v.string(),
    user_id: v.string(),
    session_start: v.number(),
    device_type: v.union(
      v.literal("desktop"),
      v.literal("mobile"),
      v.literal("tablet")
    ),
    browser: v.string(),
    os: v.string(),
    language: v.string(),
    entry_point: v.string(),
    referrer_source: v.optional(v.string()),
    page_views: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sessionDocId = await ctx.db.insert("user_sessions", {
      session_id: args.session_id,
      user_id: args.user_id,
      session_start: args.session_start,
      page_views: args.page_views || 1,
      bounce_rate: false, // Initial value
      device_type: args.device_type,
      browser: args.browser,
      os: args.os,
      connection_speed: "medium", // Default value
      language: args.language,
      entry_point: args.entry_point,
      referrer_source: args.referrer_source,
      events_count: 0,
      interactions_count: 0,
      content_engagement_score: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    console.log(`🚀 Session created: ${args.session_id} for user ${args.user_id}`);
    return sessionDocId;
  },
});

export const updateUserSession = mutation({
  args: {
    session_id: v.string(),
    updates: v.object({
      session_end: v.optional(v.number()),
      session_duration: v.optional(v.number()),
      page_views: v.optional(v.number()),
      events_count: v.optional(v.number()),
      interactions_count: v.optional(v.number()),
      content_engagement_score: v.optional(v.number()),
      exit_point: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("user_sessions")
      .withIndex("by_session", (q) => q.eq("session_id", args.session_id))
      .first();

    if (!session) {
      throw new Error(`Session not found: ${args.session_id}`);
    }

    await ctx.db.patch(session._id, {
      ...args.updates,
      updated_at: Date.now(),
    });
    
    console.log(`📝 Session updated: ${args.session_id}`);
    return session._id;
  },
});

export const getUserSession = query({
  args: { session_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_sessions")
      .withIndex("by_session", (q) => q.eq("session_id", args.session_id))
      .first();
  },
});

// 📊 CONTENT INTERACTION TRACKING

export const createContentInteraction = mutation({
  args: {
    interaction_id: v.string(),
    user_id: v.string(),
    content_id: v.string(),
    content_type: v.union(
      v.literal("live_feed_post"),
      v.literal("story"),
      v.literal("newsletter"),
      v.literal("editor_document")
    ),
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
    view_duration: v.optional(v.number()),
    scroll_depth: v.optional(v.number()),
    interaction_value: v.optional(v.number()),
    page_url: v.string(),
    session_id: v.string(),
    device_type: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const interactionId = await ctx.db.insert("content_interactions", {
      interaction_id: args.interaction_id,
      user_id: args.user_id,
      content_id: args.content_id,
      content_type: args.content_type,
      interaction_type: args.interaction_type,
      view_duration: args.view_duration,
      scroll_depth: args.scroll_depth,
      interaction_value: args.interaction_value,
      page_url: args.page_url,
      session_id: args.session_id,
      device_type: args.device_type,
      timestamp: args.timestamp,
      created_at: Date.now(),
    });

    console.log(`💫 Content interaction: ${args.interaction_type} on ${args.content_type} ${args.content_id}`);
    return interactionId;
  },
});

// 🧠 ANALYTICS INSIGHTS & REPORTS

export const getEngagementMetrics = query({
  args: {
    user_id: v.string(),
    timeframe_days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timeframe = args.timeframe_days || 30;
    const startTime = Date.now() - (timeframe * 24 * 60 * 60 * 1000);

    // Get user analytics
    const analytics = await ctx.db
      .query("user_analytics")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .first();

    if (!analytics) {
      return {
        success: false,
        message: "No analytics data found",
        data: null,
      };
    }

    // Get recent events
    const events = await ctx.db
      .query("user_events")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    // Get recent sessions
    const sessions = await ctx.db
      .query("user_sessions")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .filter((q) => q.gte(q.field("session_start"), startTime))
      .collect();

    // Calculate engagement metrics
    const engagementData = {
      user_profile: {
        overall_engagement_score: analytics.overall_engagement_score,
        user_archetype: analytics.user_archetype,
        engagement_trend: analytics.engagement_trend,
        churn_risk_score: analytics.churn_risk_score,
      },
      activity_summary: {
        total_sessions: sessions.length,
        total_events: events.length,
        posts_viewed: analytics.posts_viewed,
        posts_clicked: analytics.posts_clicked,
        ai_requests_made: analytics.ai_requests_made,
      },
      time_metrics: {
        avg_session_duration: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + (s.session_duration || 0), 0) / sessions.length 
          : 0,
        last_active: analytics.last_active,
        login_streak: analytics.login_streak,
      },
      content_engagement: {
        stories_opened: analytics.stories_opened,
        stories_completed: analytics.stories_completed,
        completion_rate: analytics.completion_rate,
        newsletter_subscribed: analytics.newsletter_subscribed,
      }
    };

    console.log(`📊 Retrieved engagement metrics for user: ${args.user_id}`);
    return {
      success: true,
      message: "Engagement metrics retrieved successfully",
      data: engagementData,
    };
  },
});

export const getDashboardStats = query({
  args: {
    timeframe_days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timeframe = args.timeframe_days || 7;
    const startTime = Date.now() - (timeframe * 24 * 60 * 60 * 1000);

    // Get total user count
    const allUsers = await ctx.db.query("user_analytics").collect();
    
    // Get recent events
    const recentEvents = await ctx.db
      .query("user_events")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", startTime))
      .collect();

    // Get recent sessions
    const recentSessions = await ctx.db
      .query("user_sessions")
      .withIndex("by_start_time", (q) => q.gte("session_start", startTime))
      .collect();

    // Calculate statistics
    const stats = {
      overview: {
        total_users: allUsers.length,
        active_users_last_7_days: recentSessions.length,
        total_events_last_7_days: recentEvents.length,
        avg_engagement_score: allUsers.length > 0 
          ? allUsers.reduce((sum, u) => sum + u.overall_engagement_score, 0) / allUsers.length 
          : 0,
      },
      user_distribution: {
        by_archetype: allUsers.reduce((acc, user) => {
          acc[user.user_archetype] = (acc[user.user_archetype] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        by_account_type: allUsers.reduce((acc, user) => {
          acc[user.account_type] = (acc[user.account_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      engagement_trends: {
        high_engagement_users: allUsers.filter(u => u.overall_engagement_score > 70).length,
        at_risk_users: allUsers.filter(u => u.churn_risk_score > 70).length,
        new_users_this_period: allUsers.filter(u => u.registration_date > startTime).length,
      },
      content_stats: {
        total_posts_viewed: allUsers.reduce((sum, u) => sum + u.posts_viewed, 0),
        total_ai_requests: allUsers.reduce((sum, u) => sum + u.ai_requests_made, 0),
        total_stories_read: allUsers.reduce((sum, u) => sum + u.stories_opened, 0),
      }
    };

    console.log(`📈 Dashboard stats calculated for ${timeframe} days`);
    return stats;
  },
});