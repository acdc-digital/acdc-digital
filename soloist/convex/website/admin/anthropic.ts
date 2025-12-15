import { v } from "convex/values";
import { mutation, query, internalMutation } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";
import { requireAdmin, requireAuth } from "../../shared/lib/requireAdmin";

// Model pricing in cents per 1M tokens (Claude 3.5 Haiku pricing as of Oct 2024)
const PRICING = {
  "claude-3-5-haiku-20241022": {
    input: 80, // $0.80 per 1M input tokens = 0.08 cents per 1K tokens
    output: 400, // $4.00 per 1M output tokens = 0.40 cents per 1K tokens
  },
  // Keep other Claude models for future use
  "claude-3-5-sonnet-20241022": {
    input: 300, // $3.00 per 1M input tokens
    output: 1500, // $15.00 per 1M output tokens
  },
  "claude-3-opus-20240229": {
    input: 1500, // $15.00 per 1M input tokens
    output: 7500, // $75.00 per 1M output tokens
  },
};

/**
 * Track Anthropic API usage and calculate costs
 * Internal mutation - should only be called from other Convex functions
 */
export const trackUsage = internalMutation({
  args: {
    userId: v.string(),
    feature: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    requestId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const pricing = PRICING[args.model as keyof typeof PRICING] || PRICING["claude-3-5-haiku-20241022"];
    
    // Calculate cost in cents (pricing is per 1M tokens)
    const inputCost = (args.promptTokens / 1_000_000) * pricing.input;
    const outputCost = (args.completionTokens / 1_000_000) * pricing.output;
    const totalCost = Math.round((inputCost + outputCost) * 100); // Store as cents
    
    const usage = await ctx.db.insert("anthropicUsage", {
      userId: args.userId,
      feature: args.feature,
      model: args.model,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.promptTokens + args.completionTokens,
      cost: totalCost,
      requestId: args.requestId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
    
    console.log(`💰 Anthropic Usage tracked: ${args.feature} - $${(totalCost / 100).toFixed(4)} (${args.promptTokens + args.completionTokens} tokens)`);
    
    return usage;
  },
});

/**
 * Get comprehensive usage statistics for admin dashboard (admin only)
 */
export const getUsageStats = query({
  args: {
    timeRange: v.optional(v.number()), // Days to look back (default 30)
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);
    
    const timeRange = args.timeRange || 30;
    const startDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
    
    // Get all usage records in time range
    const usage = await ctx.db
      .query("anthropicUsage")
      .withIndex("by_user_and_date")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();
    
    // Calculate aggregated stats
    const totalCost = usage.reduce((sum, record) => sum + record.cost, 0) / 100; // Convert to dollars
    const totalTokens = usage.reduce((sum, record) => sum + record.totalTokens, 0);
    const totalRequests = usage.length;
    
    // Group by feature
    const byFeature = usage.reduce((acc, record) => {
      if (!acc[record.feature]) {
        acc[record.feature] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[record.feature].cost += record.cost / 100;
      acc[record.feature].tokens += record.totalTokens;
      acc[record.feature].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);
    
    // Group by model
    const byModel = usage.reduce((acc, record) => {
      if (!acc[record.model]) {
        acc[record.model] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[record.model].cost += record.cost / 100;
      acc[record.model].tokens += record.totalTokens;
      acc[record.model].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);
    
    // Daily breakdown for chart
    const dailyUsage = usage.reduce((acc, record) => {
      const date = new Date(record.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[date].cost += record.cost / 100;
      acc[date].tokens += record.totalTokens;
      acc[date].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);
    
    // User breakdown (top spenders)
    const byUser = usage.reduce((acc, record) => {
      const userId = record.userId;
      if (!acc[userId]) {
        acc[userId] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[userId].cost += record.cost / 100;
      acc[userId].tokens += record.totalTokens;
      acc[userId].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);
    
    return {
      totalCost,
      totalTokens,
      totalRequests,
      byFeature,
      byModel,
      dailyUsage,
      byUser,
      timeRange,
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
    };
  },
});

/**
 * Get recent usage records with user information (admin only)
 */
export const getRecentUsage = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);
    
    const limit = args.limit || 50;
    
    const usage = await ctx.db
      .query("anthropicUsage")
      .order("desc")
      .take(limit);
    
    // Enrich with user information by looking up via authId
    const enrichedUsage = await Promise.all(
      usage.map(async (record) => {
        const user = await ctx.db
          .query("users")
          .withIndex("byAuthId", (q) => q.eq("authId", record.userId))
          .first();
        return {
          ...record,
          user: user ? {
            name: user.name || "Anonymous",
            email: user.email || "No email",
          } : null,
        };
      })
    );
    
    return enrichedUsage;
  },
});

/**
 * Get usage statistics for a specific user (admin only)
 */
export const getUserUsageStats = query({
  args: {
    userId: v.string(),
    timeRange: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);
    
    const timeRange = args.timeRange || 30;
    const startDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
    
    const usage = await ctx.db
      .query("anthropicUsage")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).gte("createdAt", startDate)
      )
      .collect();
    
    const totalCost = usage.reduce((sum, record) => sum + record.cost, 0) / 100;
    const totalTokens = usage.reduce((sum, record) => sum + record.totalTokens, 0);
    const totalRequests = usage.length;
    
    // Group by feature for this user
    const byFeature = usage.reduce((acc, record) => {
      if (!acc[record.feature]) {
        acc[record.feature] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[record.feature].cost += record.cost / 100;
      acc[record.feature].tokens += record.totalTokens;
      acc[record.feature].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);
    
    return {
      totalCost,
      totalTokens,
      totalRequests,
      byFeature,
      timeRange,
    };
  },
});

/**
 * Get cost trends over time for analytics (admin only)
 */
export const getCostTrends = query({
  args: {
    timeRange: v.optional(v.number()),
    interval: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);
    
    const timeRange = args.timeRange || 30;
    const interval = args.interval || "daily";
    const startDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
    
    const usage = await ctx.db
      .query("anthropicUsage")
      .withIndex("by_user_and_date")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();
    
    // Group by time interval
    const trends = usage.reduce((acc, record) => {
      let dateKey: string;
      const date = new Date(record.createdAt);
      
      switch (interval) {
        case "weekly":
          // Get Monday of the week
          const monday = new Date(date);
          monday.setDate(date.getDate() - date.getDay() + 1);
          dateKey = monday.toISOString().split('T')[0];
          break;
        case "monthly":
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // daily
          dateKey = date.toISOString().split('T')[0];
      }
      
      if (!acc[dateKey]) {
        acc[dateKey] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[dateKey].cost += record.cost / 100;
      acc[dateKey].tokens += record.totalTokens;
      acc[dateKey].requests += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);
    
    // Convert to array and sort by date
    const trendArray = Object.entries(trends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return trendArray;
  },
});

/**
 * Get top features by cost (admin only)
 */
export const getTopFeatures = query({
  args: {
    timeRange: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin access
    await requireAdmin(ctx);
    
    const timeRange = args.timeRange || 30;
    const limit = args.limit || 10;
    const startDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
    
    const usage = await ctx.db
      .query("anthropicUsage")
      .withIndex("by_user_and_date")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();
    
    // Group by feature and calculate totals
    const featureStats = usage.reduce((acc, record) => {
      if (!acc[record.feature]) {
        acc[record.feature] = { 
          feature: record.feature,
          cost: 0, 
          tokens: 0, 
          requests: 0,
          avgCostPerRequest: 0,
        };
      }
      acc[record.feature].cost += record.cost / 100;
      acc[record.feature].tokens += record.totalTokens;
      acc[record.feature].requests += 1;
      return acc;
    }, {} as Record<string, { 
      feature: string;
      cost: number; 
      tokens: number; 
      requests: number;
      avgCostPerRequest: number;
    }>);
    
    // Calculate average cost per request and sort by cost
    const sortedFeatures = Object.values(featureStats)
      .map(feature => ({
        ...feature,
        avgCostPerRequest: feature.requests > 0 ? feature.cost / feature.requests : 0,
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, limit);
    
    return sortedFeatures;
  },
});

/**
 * Delete old usage records (for cleanup/privacy)
 * Internal mutation - dangerous operation, should not be exposed to clients
 */
export const cleanupOldUsage = internalMutation({
  args: {
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldRecords = await ctx.db
      .query("anthropicUsage")
      .withIndex("by_user_and_date")
      .filter((q) => q.lt(q.field("createdAt"), cutoffDate))
      .collect();
    
    let deletedCount = 0;
    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }
    
    console.log(`🧹 Cleaned up ${deletedCount} old Anthropic usage records`);
    return deletedCount;
  },
});
