/**
 * SMNB Analytics Queries for MCP Server
 * 
 * These functions provide data access for the MCP server to respond to
 * Session Manager queries about platform metrics and performance.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// Session Metrics Analysis
export const getSessionMetrics = query({
  args: {
    sessionId: v.optional(v.id("sessions")),
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"), 
      v.literal("month"),
      v.literal("all")
    ),
  },
  returns: v.object({
    totalSessions: v.number(),
    activeSessions: v.number(),
    pausedSessions: v.number(),
    archivedSessions: v.number(),
    averageMessagesPerSession: v.number(),
    totalMessages: v.number(),
    averageSessionDuration: v.number(),
    mostActiveSession: v.optional(v.object({
      sessionId: v.id("sessions"),
      name: v.string(),
      messageCount: v.number(),
      lastActivity: v.number(),
      status: v.string(),
    })),
    recentActivity: v.array(v.object({
      sessionId: v.id("sessions"),
      name: v.string(),
      lastActivity: v.number(),
      messageCount: v.number(),
      status: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    let startTime = 0;

    // Calculate time range
    switch (args.timeRange) {
      case "today":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = 0;
    }

    // Get sessions in time range
    let sessionsQuery = ctx.db.query("sessions");
    if (args.sessionId) {
      sessionsQuery = sessionsQuery.filter(q => q.eq(q.field("_id"), args.sessionId));
    }
    
    const allSessions = await sessionsQuery.collect();
    const sessions = allSessions.filter(s => s._creationTime >= startTime);

    // Calculate session metrics
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.status === "active").length;
    const pausedSessions = sessions.filter(s => s.status === "paused").length;
    const archivedSessions = sessions.filter(s => s.status === "archived").length;

    // Get message counts for each session
    const sessionMetrics = await Promise.all(
      sessions.map(async (session) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_sessionId", q => q.eq("sessionId", session._id))
          .collect();
        
        return {
          sessionId: session._id,
          name: session.name,
          messageCount: messages.length,
          status: session.status,
          lastActivity: messages.length > 0 
            ? Math.max(...messages.map(m => m._creationTime))
            : session._creationTime,
        };
      })
    );

    const totalMessages = sessionMetrics.reduce((sum, s) => sum + s.messageCount, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    // Find most active session
    const mostActiveSession = sessionMetrics.length > 0
      ? sessionMetrics.reduce((max, current) => 
          current.messageCount > max.messageCount ? current : max
        )
      : undefined;

    // Get recent activity (last 10 sessions with activity)
    const recentActivity = sessionMetrics
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, 10);

    return {
      totalSessions,
      activeSessions,
      pausedSessions,
      archivedSessions,
      averageMessagesPerSession,
      totalMessages,
      averageSessionDuration: 0, // TODO: Calculate when we track session duration
      mostActiveSession,
      recentActivity,
    };
  },
});

// Token Usage Analysis
export const getTokenUsage = query({
  args: {
    groupBy: v.union(
      v.literal("session"),
      v.literal("model"),
      v.literal("day"),
      v.literal("hour")
    ),
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    ),
  },
  returns: v.object({
    totalTokens: v.number(),
    totalInputTokens: v.number(),
    totalOutputTokens: v.number(),
    totalCost: v.number(),
    requestCount: v.number(),
    successRate: v.number(),
    breakdown: v.any(), // Flexible structure based on groupBy
    trends: v.object({
      tokenTrend: v.string(),
      costTrend: v.string(),
      usagePattern: v.string(),
    }),
    topModels: v.array(v.object({
      model: v.string(),
      tokens: v.number(),
      cost: v.number(),
      requests: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    let startTime = 0;

    // Calculate time range
    switch (args.timeRange) {
      case "today":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = 0;
    }

    // Get token usage records
    const tokenUsage = await ctx.db
      .query("token_usage")
      .filter(q => q.gte(q.field("timestamp"), startTime))
      .collect();

    // Calculate totals
    const totalInputTokens = tokenUsage.reduce((sum, t) => sum + (t.input_tokens || 0), 0);
    const totalOutputTokens = tokenUsage.reduce((sum, t) => sum + (t.output_tokens || 0), 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCost = tokenUsage.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
    const requestCount = tokenUsage.length;
    const successfulRequests = tokenUsage.filter(t => t.success).length;
    const successRate = requestCount > 0 ? (successfulRequests / requestCount) * 100 : 0;

    // Create breakdown based on groupBy parameter
    const breakdown: Record<string, { tokens: number; cost: number; requests: number }> = {};

    switch (args.groupBy) {
      case "session":
        for (const usage of tokenUsage) {
          const sessionId = usage.session_id || "unknown";
          if (!breakdown[sessionId]) {
            breakdown[sessionId] = { tokens: 0, cost: 0, requests: 0 };
          }
          breakdown[sessionId].tokens += usage.total_tokens || 0;
          breakdown[sessionId].cost += usage.estimated_cost || 0;
          breakdown[sessionId].requests += 1;
        }
        break;

      case "model":
        for (const usage of tokenUsage) {
          const model = usage.model || "unknown";
          if (!breakdown[model]) {
            breakdown[model] = { tokens: 0, cost: 0, requests: 0 };
          }
          breakdown[model].tokens += usage.total_tokens || 0;
          breakdown[model].cost += usage.estimated_cost || 0;
          breakdown[model].requests += 1;
        }
        break;

      case "day":
        for (const usage of tokenUsage) {
          const day = new Date(usage.timestamp).toISOString().split('T')[0];
          if (!breakdown[day]) {
            breakdown[day] = { tokens: 0, cost: 0, requests: 0 };
          }
          breakdown[day].tokens += usage.total_tokens || 0;
          breakdown[day].cost += usage.estimated_cost || 0;
          breakdown[day].requests += 1;
        }
        break;

      case "hour":
        for (const usage of tokenUsage) {
          const hour = new Date(usage.timestamp).toISOString().split('T')[0] + 
                      'T' + new Date(usage.timestamp).getHours().toString().padStart(2, '0') + ':00';
          if (!breakdown[hour]) {
            breakdown[hour] = { tokens: 0, cost: 0, requests: 0 };
          }
          breakdown[hour].tokens += usage.total_tokens || 0;
          breakdown[hour].cost += usage.estimated_cost || 0;
          breakdown[hour].requests += 1;
        }
        break;
    }

    // Calculate trends (simplified)
    const recentUsage = tokenUsage.slice(-10);
    const olderUsage = tokenUsage.slice(-20, -10);
    
    const recentAvgTokens = recentUsage.length > 0 ? 
      recentUsage.reduce((sum, t) => sum + (t.total_tokens || 0), 0) / recentUsage.length : 0;
    const olderAvgTokens = olderUsage.length > 0 ? 
      olderUsage.reduce((sum, t) => sum + (t.total_tokens || 0), 0) / olderUsage.length : 0;

    const tokenTrend = recentAvgTokens > olderAvgTokens ? "increasing" : 
                      recentAvgTokens < olderAvgTokens ? "decreasing" : "stable";

    // Top models analysis
    const modelStats: Record<string, { tokens: number; cost: number; requests: number }> = {};
    for (const usage of tokenUsage) {
      const model = usage.model || "unknown";
      if (!modelStats[model]) {
        modelStats[model] = { tokens: 0, cost: 0, requests: 0 };
      }
      modelStats[model].tokens += usage.total_tokens || 0;
      modelStats[model].cost += usage.estimated_cost || 0;
      modelStats[model].requests += 1;
    }

    const topModels = Object.entries(modelStats)
      .map(([model, stats]: [string, { tokens: number; cost: number; requests: number }]) => ({
        model,
        tokens: stats.tokens,
        cost: stats.cost,
        requests: stats.requests,
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    return {
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      requestCount,
      successRate,
      breakdown,
      trends: {
        tokenTrend,
        costTrend: tokenTrend, // Simplified - cost follows token trend
        usagePattern: requestCount > 50 ? "high" : requestCount > 20 ? "medium" : "low",
      },
      topModels,
    };
  },
});

// Message Search
export const searchMessages = query({
  args: {
    query: v.string(),
    sessionId: v.optional(v.id("sessions")),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    messageId: v.id("messages"),
    sessionId: v.id("sessions"),
    sessionName: v.string(),
    content: v.string(),
    role: v.string(),
    timestamp: v.number(),
    relevanceScore: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchQuery = args.query.toLowerCase();

    // Get messages (optionally filtered by session)
    const messages = args.sessionId 
      ? await ctx.db
          .query("messages")
          .withIndex("by_sessionId", q => q.eq("sessionId", args.sessionId!))
          .collect()
      : await ctx.db.query("messages").collect();

    // Simple text search with relevance scoring
    const results = [];
    for (const message of messages) {
      const content = (message.content || "").toLowerCase();
      if (content.includes(searchQuery)) {
        // Get session name
        const session = await ctx.db.get(message.sessionId);
        const sessionName = session?.name || "Unknown Session";

        // Calculate simple relevance score
        const exactMatches = (content.match(new RegExp(searchQuery, 'g')) || []).length;
        const relevanceScore = exactMatches * 10 + (1 / content.length * 100);

        results.push({
          messageId: message._id,
          sessionId: message.sessionId,
          sessionName,
          content: message.content,
          role: message.role,
          timestamp: message._creationTime,
          relevanceScore,
        });
      }
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  },
});

// Active Sessions Status
export const getActiveSessions = query({
  args: {
    includeDetails: v.optional(v.boolean()),
  },
  returns: v.array(v.object({
    sessionId: v.id("sessions"),
    name: v.string(),
    status: v.string(),
    lastActivity: v.number(),
    messageCount: v.number(),
    details: v.optional(v.object({
      settings: v.any(),
      recentMessages: v.array(v.object({
        content: v.string(),
        role: v.string(),
        timestamp: v.number(),
      })),
    })),
  })),
  handler: async (ctx, args) => {
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_status", q => q.eq("status", "active"))
      .collect();

    const results = [];
    for (const session of activeSessions) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_sessionId", q => q.eq("sessionId", session._id))
        .order("desc")
        .take(5);

      const lastActivity = messages.length > 0 ? 
        Math.max(...messages.map(m => m._creationTime)) : 
        session._creationTime;

      let details = undefined;
      if (args.includeDetails) {
        details = {
          settings: session.settings,
          recentMessages: messages.map(m => ({
            content: m.content.length > 100 ? m.content.substring(0, 100) + "..." : m.content,
            role: m.role,
            timestamp: m._creationTime,
          })),
        };
      }

      results.push({
        sessionId: session._id,
        name: session.name,
        status: session.status,
        lastActivity,
        messageCount: messages.length,
        details,
      });
    }

    return results.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

// Engagement Analysis
export const analyzeEngagement = query({
  args: {
    metric: v.union(
      v.literal("messages"),
      v.literal("duration"),
      v.literal("retention"),
      v.literal("cost_efficiency")
    ),
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month")
    ),
  },
  returns: v.object({
    metric: v.string(),
    timeRange: v.string(),
    current: v.number(),
    previous: v.number(),
    change: v.number(),
    changePercent: v.number(),
    trend: v.string(),
    insights: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    let currentStart = 0;
    let previousStart = 0;

    // Calculate time ranges
    switch (args.timeRange) {
      case "today":
        currentStart = now - 24 * 60 * 60 * 1000;
        previousStart = now - 48 * 60 * 60 * 1000;
        break;
      case "week":
        currentStart = now - 7 * 24 * 60 * 60 * 1000;
        previousStart = now - 14 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        currentStart = now - 30 * 24 * 60 * 60 * 1000;
        previousStart = now - 60 * 24 * 60 * 60 * 1000;
        break;
    }

    let current = 0;
    let previous = 0;
    const insights: string[] = [];

    // Calculate metrics based on type
    switch (args.metric) {
      case "messages":
        const currentMessages = await ctx.db
          .query("messages")
          .filter(q => q.gte(q.field("_creationTime"), currentStart))
          .collect();
        const previousMessages = await ctx.db
          .query("messages")
          .filter(q => q.and(
            q.gte(q.field("_creationTime"), previousStart),
            q.lt(q.field("_creationTime"), currentStart)
          ))
          .collect();

        current = currentMessages.length;
        previous = previousMessages.length;

        if (current > previous * 1.2) {
          insights.push("Message volume is significantly increasing");
        }
        if (current < previous * 0.8) {
          insights.push("Message volume is declining - consider engagement strategies");
        }
        break;

      case "cost_efficiency":
        const currentTokens = await ctx.db
          .query("token_usage")
          .filter(q => q.gte(q.field("timestamp"), currentStart))
          .collect();
        const previousTokens = await ctx.db
          .query("token_usage")
          .filter(q => q.and(
            q.gte(q.field("timestamp"), previousStart),
            q.lt(q.field("timestamp"), currentStart)
          ))
          .collect();

        const currentCost = currentTokens.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
        const previousCost = previousTokens.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);

        current = currentCost;
        previous = previousCost;

        if (current > previous * 1.3) {
          insights.push("Costs are rising faster than usual - review usage patterns");
        }
        break;

      default:
        current = Math.random() * 100; // Placeholder for other metrics
        previous = Math.random() * 100;
    }

    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    const trend = change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable";

    return {
      metric: args.metric,
      timeRange: args.timeRange,
      current,
      previous,
      change,
      changePercent,
      trend,
      insights,
    };
  },
});

// System Health Check
export const getSystemHealth = query({
  args: {},
  returns: v.object({
    status: v.string(),
    uptime: v.string(),
    activeSessions: v.number(),
    totalUsers: v.number(),
    systemLoad: v.object({
      messages: v.number(),
      tokenUsage: v.number(),
      errors: v.number(),
    }),
    health: v.object({
      database: v.string(),
      api: v.string(),
      chat: v.string(),
    }),
    alerts: v.array(v.string()),
  }),
  handler: async (ctx, _args) => {
    // Check active sessions
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_status", q => q.eq("status", "active"))
      .collect();

    // Check recent errors
    const recentErrors = await ctx.db
      .query("token_usage")
      .filter(q => q.and(
        q.eq(q.field("success"), false),
        q.gte(q.field("timestamp"), Date.now() - 60 * 60 * 1000) // Last hour
      ))
      .collect();

    // Check recent activity
    const recentMessages = await ctx.db
      .query("messages")
      .filter(q => q.gte(q.field("_creationTime"), Date.now() - 60 * 60 * 1000))
      .collect();

    const alerts: string[] = [];
    if (recentErrors.length > 10) {
      alerts.push(`High error rate: ${recentErrors.length} errors in the last hour`);
    }
    if (activeSessions.length === 0) {
      alerts.push("No active sessions - system may be idle");
    }

    return {
      status: recentErrors.length > 20 ? "degraded" : "healthy",
      uptime: "System operational", // TODO: Calculate actual uptime
      activeSessions: activeSessions.length,
      totalUsers: 0, // TODO: Count unique users when user system is implemented
      systemLoad: {
        messages: recentMessages.length,
        tokenUsage: await ctx.db.query("token_usage").collect().then(usage => 
          usage.reduce((sum, t) => sum + (t.total_tokens || 0), 0)
        ),
        errors: recentErrors.length,
      },
      health: {
        database: "operational",
        api: recentErrors.length > 20 ? "degraded" : "operational", 
        chat: activeSessions.length > 0 ? "operational" : "idle",
      },
      alerts,
    };
  },
});

// Cost Breakdown Analysis
export const getCostBreakdown = query({
  args: {
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
  },
  returns: v.object({
    period: v.string(),
    totalCost: v.number(),
    breakdown: v.object({
      chat: v.number(),
      generation: v.number(),
      analysis: v.number(),
      other: v.number(),
    }),
    trends: v.array(v.object({
      date: v.string(),
      cost: v.number(),
    })),
    projections: v.object({
      daily: v.number(),
      weekly: v.number(),
      monthly: v.number(),
    }),
    recommendations: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    let startTime = 0;

    switch (args.period) {
      case "daily":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "weekly":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "monthly":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const tokenUsage = await ctx.db
      .query("token_usage")
      .filter(q => q.gte(q.field("timestamp"), startTime))
      .collect();

    const totalCost = tokenUsage.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);

    // Breakdown by action type
    const breakdown = {
      chat: 0,
      generation: 0,
      analysis: 0,
      other: 0,
    };

    for (const usage of tokenUsage) {
      const cost = usage.estimated_cost || 0;
      switch (usage.action) {
        case "generate":
          breakdown.generation += cost;
          break;
        case "analyze":
          breakdown.analysis += cost;
          break;
        default:
          breakdown.chat += cost;
      }
    }

    // Create trends (simplified - daily costs over period)
    const trends = [];
    const daysInPeriod = args.period === "daily" ? 1 : args.period === "weekly" ? 7 : 30;
    
    for (let i = daysInPeriod - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      
      const dayCost = tokenUsage
        .filter(t => t.timestamp >= dayStart && t.timestamp < dayEnd)
        .reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
      
      trends.push({
        date: new Date(dayStart).toISOString().split('T')[0],
        cost: dayCost,
      });
    }

    // Calculate projections
    const avgDailyCost = totalCost / daysInPeriod;
    const projections = {
      daily: avgDailyCost,
      weekly: avgDailyCost * 7,
      monthly: avgDailyCost * 30,
    };

    // Generate recommendations
    const recommendations: string[] = [];
    if (breakdown.generation > totalCost * 0.6) {
      recommendations.push("Content generation is 60%+ of costs - consider caching or batch processing");
    }
    if (projections.monthly > 100) {
      recommendations.push("Monthly costs trending above $100 - review usage patterns");
    }
    if (breakdown.chat < totalCost * 0.1) {
      recommendations.push("Chat usage is low - consider promoting interactive features");
    }

    return {
      period: args.period,
      totalCost,
      breakdown,
      trends,
      projections,
      recommendations,
    };
  },
});