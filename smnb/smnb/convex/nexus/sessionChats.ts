/**
 * Session Manager Chat Functions
 * 
 * Convex mutations and queries for managing SessionManagerAgent chat messages.
 * Follows best practices for AI conversational flows with token tracking,
 * tool usage metadata, and comprehensive analytics.
 */

import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";

// ============================================================================
// Validators
// ============================================================================

const roleValidator = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system")
);

const messageTypeValidator = v.union(
  v.literal("query"),
  v.literal("response"),
  v.literal("tool_result"),
  v.literal("error"),
  v.literal("context")
);

const toolCallValidator = v.object({
  toolName: v.string(),
  toolInput: v.string(),
  toolResult: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("success"),
    v.literal("error")
  ),
  executionTime: v.optional(v.number()),
  errorMessage: v.optional(v.string()),
});

const tokenUsageValidator = v.object({
  inputTokens: v.number(),
  outputTokens: v.number(),
  totalTokens: v.number(),
  estimatedCost: v.number(),
  model: v.string(),
});

const modelConfigValidator = v.object({
  model: v.string(),
  temperature: v.optional(v.number()),
  maxTokens: v.optional(v.number()),
  topP: v.optional(v.number()),
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new chat message in a session
 */
export const create = mutation({
  args: {
    sessionId: v.string(),
    role: roleValidator,
    content: v.string(),
    messageId: v.optional(v.string()),
    parentMessageId: v.optional(v.string()),
    toolCalls: v.optional(v.array(toolCallValidator)),
    tokenUsage: v.optional(tokenUsageValidator),
    modelConfig: v.optional(modelConfigValidator),
    conversationTurn: v.optional(v.number()),
    isMultiTurn: v.optional(v.boolean()),
    messageType: v.optional(messageTypeValidator),
    responseTime: v.optional(v.number()),
    streamingEnabled: v.optional(v.boolean()),
    metadata: v.optional(v.string()),
  },
  returns: v.id("sessionManagerChats"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("sessionManagerChats", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      messageId: args.messageId,
      parentMessageId: args.parentMessageId,
      toolCalls: args.toolCalls,
      tokenUsage: args.tokenUsage,
      modelConfig: args.modelConfig,
      conversationTurn: args.conversationTurn,
      isMultiTurn: args.isMultiTurn,
      messageType: args.messageType,
      responseTime: args.responseTime,
      streamingEnabled: args.streamingEnabled,
      metadata: args.metadata,
      createdAt: now,
    });
  },
});

/**
 * Update an existing message (e.g., add tool results, user feedback)
 */
export const update = mutation({
  args: {
    messageId: v.id("sessionManagerChats"),
    toolCalls: v.optional(v.array(toolCallValidator)),
    userFeedback: v.optional(v.object({
      rating: v.union(
        v.literal("helpful"),
        v.literal("neutral"),
        v.literal("unhelpful")
      ),
      comment: v.optional(v.string()),
      feedbackAt: v.number(),
    })),
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    )),
    metadata: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { messageId, ...updates } = args;
    
    await ctx.db.patch(messageId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Clear all messages from a session
 */
export const clearSession = mutation({
  args: {
    sessionId: v.string(),
  },
  returns: v.number(), // Return count of deleted messages
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    let deletedCount = 0;
    for (const message of messages) {
      await ctx.db.delete(message._id);
      deletedCount++;
    }
    
    return deletedCount;
  },
});

/**
 * Delete a specific message
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("sessionManagerChats"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all messages for a session (chronological order)
 */
export const getBySession = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("sessionManagerChats"),
    _creationTime: v.number(),
    sessionId: v.string(),
    role: roleValidator,
    content: v.string(),
    messageId: v.optional(v.string()),
    parentMessageId: v.optional(v.string()),
    toolCalls: v.optional(v.array(toolCallValidator)),
    tokenUsage: v.optional(tokenUsageValidator),
    modelConfig: v.optional(modelConfigValidator),
    conversationTurn: v.optional(v.number()),
    isMultiTurn: v.optional(v.boolean()),
    messageType: v.optional(messageTypeValidator),
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    )),
    userFeedback: v.optional(v.object({
      rating: v.union(
        v.literal("helpful"),
        v.literal("neutral"),
        v.literal("unhelpful")
      ),
      comment: v.optional(v.string()),
      feedbackAt: v.number(),
    })),
    responseTime: v.optional(v.number()),
    streamingEnabled: v.optional(v.boolean()),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId_and_createdAt", (q) => 
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .collect();
  },
});

/**
 * Get paginated messages for a session
 */
export const list = query({
  args: {
    sessionId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("sessionManagerChats"),
      _creationTime: v.number(),
      sessionId: v.string(),
      role: roleValidator,
      content: v.string(),
      messageId: v.optional(v.string()),
      parentMessageId: v.optional(v.string()),
      toolCalls: v.optional(v.array(toolCallValidator)),
      tokenUsage: v.optional(tokenUsageValidator),
      modelConfig: v.optional(modelConfigValidator),
      conversationTurn: v.optional(v.number()),
      isMultiTurn: v.optional(v.boolean()),
      messageType: v.optional(messageTypeValidator),
      sentiment: v.optional(v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative")
      )),
      userFeedback: v.optional(v.object({
        rating: v.union(
          v.literal("helpful"),
          v.literal("neutral"),
          v.literal("unhelpful")
        ),
        comment: v.optional(v.string()),
        feedbackAt: v.number(),
      })),
      responseTime: v.optional(v.number()),
      streamingEnabled: v.optional(v.boolean()),
      metadata: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    })),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId_and_createdAt", (q) => 
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Get recent messages for AI context (limited, reversed for chronological order)
 */
export const getRecentMessages = query({
  args: {
    sessionId: v.string(),
    limit: v.number(), // e.g., 50 for last 50 messages
  },
  returns: v.array(v.object({
    _id: v.id("sessionManagerChats"),
    _creationTime: v.number(),
    sessionId: v.string(),
    role: roleValidator,
    content: v.string(),
    messageId: v.optional(v.string()),
    parentMessageId: v.optional(v.string()),
    toolCalls: v.optional(v.array(toolCallValidator)),
    tokenUsage: v.optional(tokenUsageValidator),
    modelConfig: v.optional(modelConfigValidator),
    conversationTurn: v.optional(v.number()),
    isMultiTurn: v.optional(v.boolean()),
    messageType: v.optional(messageTypeValidator),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId_and_createdAt", (q) => 
        q.eq("sessionId", args.sessionId)
      )
      .order("desc")
      .take(args.limit);
    
    // Reverse to get chronological order (oldest to newest)
    return messages.reverse();
  },
});

/**
 * Get message count for a session
 */
export const getMessageCount = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    return messages.length;
  },
});

/**
 * Get token usage statistics for a session
 */
export const getTokenStats = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.object({
    totalMessages: v.number(),
    totalInputTokens: v.number(),
    totalOutputTokens: v.number(),
    totalTokens: v.number(),
    totalCost: v.number(),
    averageTokensPerMessage: v.number(),
    messagesByRole: v.object({
      user: v.number(),
      assistant: v.number(),
      system: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    const messagesByRole = { user: 0, assistant: 0, system: 0 };
    
    for (const message of messages) {
      // Count by role
      if (message.role === "user") messagesByRole.user++;
      else if (message.role === "assistant") messagesByRole.assistant++;
      else if (message.role === "system") messagesByRole.system++;
      
      // Sum token usage
      if (message.tokenUsage) {
        totalInputTokens += message.tokenUsage.inputTokens;
        totalOutputTokens += message.tokenUsage.outputTokens;
        totalCost += message.tokenUsage.estimatedCost;
      }
    }
    
    const totalTokens = totalInputTokens + totalOutputTokens;
    const averageTokensPerMessage = messages.length > 0 
      ? totalTokens / messages.length 
      : 0;
    
    return {
      totalMessages: messages.length,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalCost,
      averageTokensPerMessage,
      messagesByRole,
    };
  },
});

/**
 * Search messages by content within a session
 */
export const searchMessages = query({
  args: {
    sessionId: v.string(),
    searchQuery: v.string(),
    limit: v.optional(v.number()), // Default to 50
  },
  returns: v.array(v.object({
    _id: v.id("sessionManagerChats"),
    _creationTime: v.number(),
    sessionId: v.string(),
    role: roleValidator,
    content: v.string(),
    messageId: v.optional(v.string()),
    messageType: v.optional(messageTypeValidator),
    createdAt: v.number(),
    _score: v.number(), // Search relevance score
  })),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    const results = await ctx.db
      .query("sessionManagerChats")
      .withSearchIndex("search_chat_content", (q) =>
        q.search("content", args.searchQuery)
         .eq("sessionId", args.sessionId)
      )
      .take(limit);
    
    // Search results include a _score field for relevance ranking
    type SearchResult = typeof results[number] & { _score: number };
    
    return (results as SearchResult[]).map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      sessionId: r.sessionId,
      role: r.role,
      content: r.content,
      messageId: r.messageId,
      messageType: r.messageType,
      createdAt: r.createdAt,
      _score: r._score,
    }));
  },
});

/**
 * Get tool usage statistics for a session
 */
export const getToolUsageStats = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.object({
    totalToolCalls: v.number(),
    successfulCalls: v.number(),
    failedCalls: v.number(),
    averageExecutionTime: v.number(),
    toolBreakdown: v.array(v.object({
      toolName: v.string(),
      count: v.number(),
      successRate: v.number(),
      averageTime: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    let totalToolCalls = 0;
    let successfulCalls = 0;
    let failedCalls = 0;
    let totalExecutionTime = 0;
    let executionCount = 0;
    
    // Track per-tool stats
    const toolStats = new Map<string, {
      count: number;
      successes: number;
      totalTime: number;
      timeCount: number;
    }>();
    
    for (const message of messages) {
      if (message.toolCalls) {
        for (const toolCall of message.toolCalls) {
          totalToolCalls++;
          
          if (toolCall.status === "success") successfulCalls++;
          if (toolCall.status === "error") failedCalls++;
          
          if (toolCall.executionTime) {
            totalExecutionTime += toolCall.executionTime;
            executionCount++;
          }
          
          // Per-tool tracking
          const stats = toolStats.get(toolCall.toolName) ?? {
            count: 0,
            successes: 0,
            totalTime: 0,
            timeCount: 0,
          };
          
          stats.count++;
          if (toolCall.status === "success") stats.successes++;
          if (toolCall.executionTime) {
            stats.totalTime += toolCall.executionTime;
            stats.timeCount++;
          }
          
          toolStats.set(toolCall.toolName, stats);
        }
      }
    }
    
    const toolBreakdown = Array.from(toolStats.entries()).map(([toolName, stats]) => ({
      toolName,
      count: stats.count,
      successRate: stats.count > 0 ? stats.successes / stats.count : 0,
      averageTime: stats.timeCount > 0 ? stats.totalTime / stats.timeCount : 0,
    }));
    
    return {
      totalToolCalls,
      successfulCalls,
      failedCalls,
      averageExecutionTime: executionCount > 0 ? totalExecutionTime / executionCount : 0,
      toolBreakdown,
    };
  },
});

/**
 * Get conversation quality metrics for a session
 */
export const getConversationMetrics = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.object({
    totalTurns: v.number(),
    averageResponseTime: v.number(),
    multiTurnPercentage: v.number(),
    sentimentBreakdown: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number(),
    }),
    userSatisfaction: v.object({
      helpful: v.number(),
      neutral: v.number(),
      unhelpful: v.number(),
      totalRatings: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let multiTurnCount = 0;
    
    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
    const userSatisfaction = { helpful: 0, neutral: 0, unhelpful: 0, totalRatings: 0 };
    
    for (const message of messages) {
      if (message.responseTime) {
        totalResponseTime += message.responseTime;
        responseTimeCount++;
      }
      
      if (message.isMultiTurn) multiTurnCount++;
      
      if (message.sentiment) {
        sentimentBreakdown[message.sentiment]++;
      }
      
      if (message.userFeedback) {
        userSatisfaction[message.userFeedback.rating]++;
        userSatisfaction.totalRatings++;
      }
    }
    
    return {
      totalTurns: messages.length,
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      multiTurnPercentage: messages.length > 0 ? (multiTurnCount / messages.length) * 100 : 0,
      sentimentBreakdown,
      userSatisfaction,
    };
  },
});

/**
 * Get all active sessions (sessions with recent messages)
 */
export const getActiveSessions = query({
  args: {
    minutesThreshold: v.number(), // e.g., 30 for last 30 minutes
  },
  returns: v.array(v.object({
    sessionId: v.string(),
    lastMessageAt: v.number(),
    messageCount: v.number(),
    lastMessageContent: v.string(),
  })),
  handler: async (ctx, args) => {
    const thresholdTime = Date.now() - (args.minutesThreshold * 60 * 1000);
    
    const recentMessages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_createdAt", (q) => q.gt("createdAt", thresholdTime))
      .collect();
    
    // Group by session
    const sessionMap = new Map<string, {
      lastMessageAt: number;
      messageCount: number;
      lastMessageContent: string;
    }>();
    
    for (const message of recentMessages) {
      const existing = sessionMap.get(message.sessionId);
      
      if (!existing || message.createdAt > existing.lastMessageAt) {
        sessionMap.set(message.sessionId, {
          lastMessageAt: message.createdAt,
          messageCount: (existing?.messageCount ?? 0) + 1,
          lastMessageContent: message.content,
        });
      } else {
        existing.messageCount++;
      }
    }
    
    return Array.from(sessionMap.entries())
      .map(([sessionId, data]) => ({
        sessionId,
        ...data,
      }))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

/**
 * GLOBAL ANALYTICS QUERIES
 * These queries aggregate data across ALL sessions with timeRange filtering
 */

// Helper function to convert timeRange to milliseconds
function getTimeRangeMs(timeRange: "today" | "week" | "month" | "all"): number {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  switch (timeRange) {
    case "today":
      return now - msPerDay;
    case "week":
      return now - (7 * msPerDay);
    case "month":
      return now - (30 * msPerDay);
    case "all":
      return 0; // No time limit
  }
}

/**
 * Get global session metrics across all sessions
 */
export const getGlobalSessionMetrics = query({
  args: {
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    ),
  },
  returns: v.object({
    totalSessions: v.number(),
    activeSessions: v.number(), // Sessions with messages in last 30 min
    recentSessionCount: v.number(), // Sessions in timeRange
    totalMessages: v.number(),
    breakdown: v.object({
      userMessages: v.number(),
      assistantMessages: v.number(),
      systemMessages: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const timeThreshold = getTimeRangeMs(args.timeRange);
    
    // Get all sessions
    const allMessages = await ctx.db
      .query("sessionManagerChats")
      .collect();
    
    // Get recent messages (within timeRange)
    const recentMessages = args.timeRange === "all" 
      ? allMessages
      : allMessages.filter(m => m.createdAt > timeThreshold);
    
    // Get active sessions (last 30 minutes)
    const activeThreshold = Date.now() - (30 * 60 * 1000);
    const activeSessions = new Set(
      allMessages
        .filter(m => m.createdAt > activeThreshold)
        .map(m => m.sessionId)
    );
    
    // Get unique sessions in timeRange
    const recentSessions = new Set(recentMessages.map(m => m.sessionId));
    
    // Count all unique sessions ever
    const allSessions = new Set(allMessages.map(m => m.sessionId));
    
    // Breakdown by role
    const breakdown = {
      userMessages: recentMessages.filter(m => m.role === "user").length,
      assistantMessages: recentMessages.filter(m => m.role === "assistant").length,
      systemMessages: recentMessages.filter(m => m.role === "system").length,
    };
    
    return {
      totalSessions: allSessions.size,
      activeSessions: activeSessions.size,
      recentSessionCount: recentSessions.size,
      totalMessages: recentMessages.length,
      breakdown,
    };
  },
});

/**
 * Get global token usage statistics across all sessions
 */
export const getGlobalTokenStats = query({
  args: {
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    ),
    groupBy: v.optional(v.union(
      v.literal("session"),
      v.literal("model"),
      v.literal("day")
    )),
  },
  returns: v.object({
    totalTokens: v.number(),
    totalCost: v.number(),
    averageTokensPerMessage: v.number(),
    breakdown: v.optional(v.array(v.object({
      key: v.string(),
      tokens: v.number(),
      cost: v.number(),
      messageCount: v.number(),
    }))),
    topSessions: v.array(v.object({
      sessionId: v.string(),
      tokens: v.number(),
      cost: v.number(),
    })),
    costByModel: v.array(v.object({
      model: v.string(),
      cost: v.number(),
      tokenCount: v.number(),
      messageCount: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const timeThreshold = getTimeRangeMs(args.timeRange);
    
    // Get messages in timeRange
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_createdAt", (q) => 
        args.timeRange === "all" ? q : q.gt("createdAt", timeThreshold)
      )
      .collect();
    
    let totalTokens = 0;
    let totalCost = 0;
    let messageCount = 0;
    
    // Track by session
    const sessionStats = new Map<string, { tokens: number; cost: number }>();
    
    // Track by model
    const modelStats = new Map<string, { 
      cost: number; 
      tokenCount: number; 
      messageCount: number 
    }>();
    
    // Track by day (for groupBy: 'day')
    const dayStats = new Map<string, { 
      tokens: number; 
      cost: number; 
      messageCount: number 
    }>();
    
    for (const message of messages) {
      if (message.tokenUsage) {
        const msgTokens = message.tokenUsage.totalTokens;
        const msgCost = message.tokenUsage.estimatedCost;
        
        totalTokens += msgTokens;
        totalCost += msgCost;
        messageCount++;
        
        // By session
        const sessionData = sessionStats.get(message.sessionId) ?? { tokens: 0, cost: 0 };
        sessionData.tokens += msgTokens;
        sessionData.cost += msgCost;
        sessionStats.set(message.sessionId, sessionData);
        
        // By model
        const model = message.tokenUsage.model || "unknown";
        const modelData = modelStats.get(model) ?? { cost: 0, tokenCount: 0, messageCount: 0 };
        modelData.cost += msgCost;
        modelData.tokenCount += msgTokens;
        modelData.messageCount++;
        modelStats.set(model, modelData);
        
        // By day
        if (args.groupBy === "day") {
          const date = new Date(message.createdAt);
          const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          const dayData = dayStats.get(dayKey) ?? { tokens: 0, cost: 0, messageCount: 0 };
          dayData.tokens += msgTokens;
          dayData.cost += msgCost;
          dayData.messageCount++;
          dayStats.set(dayKey, dayData);
        }
      }
    }
    
    // Top sessions
    const topSessions = Array.from(sessionStats.entries())
      .map(([sessionId, data]) => ({ sessionId, ...data }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);
    
    // Cost by model
    const costByModel = Array.from(modelStats.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.cost - a.cost);
    
    // Breakdown based on groupBy
    let breakdown: Array<{ key: string; tokens: number; cost: number; messageCount: number }> | undefined;
    
    if (args.groupBy === "session") {
      breakdown = Array.from(sessionStats.entries()).map(([sessionId, data]) => ({
        key: sessionId,
        tokens: data.tokens,
        cost: data.cost,
        messageCount: messages.filter(m => m.sessionId === sessionId).length,
      }));
    } else if (args.groupBy === "model") {
      breakdown = Array.from(modelStats.entries()).map(([model, data]) => ({
        key: model,
        tokens: data.tokenCount,
        cost: data.cost,
        messageCount: data.messageCount,
      }));
    } else if (args.groupBy === "day") {
      breakdown = Array.from(dayStats.entries()).map(([day, data]) => ({
        key: day,
        tokens: data.tokens,
        cost: data.cost,
        messageCount: data.messageCount,
      })).sort((a, b) => a.key.localeCompare(b.key));
    }
    
    return {
      totalTokens,
      totalCost,
      averageTokensPerMessage: messageCount > 0 ? totalTokens / messageCount : 0,
      breakdown,
      topSessions,
      costByModel,
    };
  },
});

/**
 * Get global tool usage statistics across all sessions
 */
export const getGlobalToolUsageStats = query({
  args: {
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    ),
  },
  returns: v.object({
    totalToolCalls: v.number(),
    successfulCalls: v.number(),
    failedCalls: v.number(),
    averageExecutionTime: v.number(),
    toolBreakdown: v.array(v.object({
      toolName: v.string(),
      count: v.number(),
      successRate: v.number(),
      averageTime: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const timeThreshold = getTimeRangeMs(args.timeRange);
    
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_createdAt", (q) => 
        args.timeRange === "all" ? q : q.gt("createdAt", timeThreshold)
      )
      .collect();
    
    let totalToolCalls = 0;
    let successfulCalls = 0;
    let failedCalls = 0;
    let totalExecutionTime = 0;
    let executionCount = 0;
    
    const toolStats = new Map<string, {
      count: number;
      successes: number;
      totalTime: number;
      timeCount: number;
    }>();
    
    for (const message of messages) {
      if (message.toolCalls) {
        for (const toolCall of message.toolCalls) {
          totalToolCalls++;
          
          if (toolCall.status === "success") successfulCalls++;
          if (toolCall.status === "error") failedCalls++;
          
          if (toolCall.executionTime) {
            totalExecutionTime += toolCall.executionTime;
            executionCount++;
          }
          
          const stats = toolStats.get(toolCall.toolName) ?? {
            count: 0,
            successes: 0,
            totalTime: 0,
            timeCount: 0,
          };
          
          stats.count++;
          if (toolCall.status === "success") stats.successes++;
          if (toolCall.executionTime) {
            stats.totalTime += toolCall.executionTime;
            stats.timeCount++;
          }
          
          toolStats.set(toolCall.toolName, stats);
        }
      }
    }
    
    const toolBreakdown = Array.from(toolStats.entries()).map(([toolName, stats]) => ({
      toolName,
      count: stats.count,
      successRate: stats.count > 0 ? stats.successes / stats.count : 0,
      averageTime: stats.timeCount > 0 ? stats.totalTime / stats.timeCount : 0,
    })).sort((a, b) => b.count - a.count);
    
    return {
      totalToolCalls,
      successfulCalls,
      failedCalls,
      averageExecutionTime: executionCount > 0 ? totalExecutionTime / executionCount : 0,
      toolBreakdown,
    };
  },
});

/**
 * Get global conversation quality metrics across all sessions
 */
export const getGlobalConversationMetrics = query({
  args: {
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    ),
  },
  returns: v.object({
    totalMessages: v.number(),
    averageResponseTime: v.number(),
    multiTurnPercentage: v.number(),
    sentimentBreakdown: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number(),
    }),
    userSatisfaction: v.object({
      helpful: v.number(),
      neutral: v.number(),
      unhelpful: v.number(),
      totalRatings: v.number(),
    }),
    averageSentiment: v.number(), // -1 to 1 scale
    satisfactionRate: v.number(), // % of helpful ratings
  }),
  handler: async (ctx, args) => {
    const timeThreshold = getTimeRangeMs(args.timeRange);
    
    const messages = await ctx.db
      .query("sessionManagerChats")
      .withIndex("by_createdAt", (q) => 
        args.timeRange === "all" ? q : q.gt("createdAt", timeThreshold)
      )
      .collect();
    
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let multiTurnCount = 0;
    
    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
    const userSatisfaction = { helpful: 0, neutral: 0, unhelpful: 0, totalRatings: 0 };
    
    for (const message of messages) {
      if (message.responseTime) {
        totalResponseTime += message.responseTime;
        responseTimeCount++;
      }
      
      if (message.isMultiTurn) multiTurnCount++;
      
      if (message.sentiment) {
        sentimentBreakdown[message.sentiment]++;
      }
      
      if (message.userFeedback) {
        userSatisfaction[message.userFeedback.rating]++;
        userSatisfaction.totalRatings++;
      }
    }
    
    // Calculate average sentiment (-1 to 1 scale)
    const totalSentimentMessages = sentimentBreakdown.positive + sentimentBreakdown.neutral + sentimentBreakdown.negative;
    const averageSentiment = totalSentimentMessages > 0
      ? ((sentimentBreakdown.positive * 1) + (sentimentBreakdown.neutral * 0) + (sentimentBreakdown.negative * -1)) / totalSentimentMessages
      : 0;
    
    // Calculate satisfaction rate
    const satisfactionRate = userSatisfaction.totalRatings > 0
      ? (userSatisfaction.helpful / userSatisfaction.totalRatings) * 100
      : 0;
    
    return {
      totalMessages: messages.length,
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      multiTurnPercentage: messages.length > 0 ? (multiTurnCount / messages.length) * 100 : 0,
      sentimentBreakdown,
      userSatisfaction,
      averageSentiment,
      satisfactionRate,
    };
  },
});

/**
 * Get count of active sessions (simple count, not full session list)
 */
export const getActiveSessionsCount = query({
  args: {
    minutesThreshold: v.number(),
  },
  returns: v.object({
    totalSessions: v.number(),
    activeSessions: v.number(),
    recentSessionCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const thresholdTime = Date.now() - (args.minutesThreshold * 60 * 1000);
    
    const allMessages = await ctx.db
      .query("sessionManagerChats")
      .collect();
    
    const recentMessages = allMessages.filter(m => m.createdAt > thresholdTime);
    
    const allSessions = new Set(allMessages.map(m => m.sessionId));
    const activeSessions = new Set(recentMessages.map(m => m.sessionId));
    
    return {
      totalSessions: allSessions.size,
      activeSessions: activeSessions.size,
      recentSessionCount: activeSessions.size, // Same as activeSessions for this threshold
    };
  },
});
