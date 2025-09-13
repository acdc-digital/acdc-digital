// API HEALTH CONVEX FUNCTIONS
// /Users/matthewsimon/Projects/SMNB/smnb/convex/apiHealth.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 📊 API HEALTH QUERIES

// Get current API health status for all endpoints
export const getAPIHealthStatus = query({
  args: {},
  handler: async (ctx) => {
    const healthRecords = await ctx.db
      .query("api_health")
      .order("desc")
      .collect();
    
    // Get the latest record for each endpoint
    const latestByEndpoint = new Map<string, any>();
    
    for (const record of healthRecords) {
      if (!latestByEndpoint.has(record.endpoint) || 
          record.timestamp > latestByEndpoint.get(record.endpoint).timestamp) {
        latestByEndpoint.set(record.endpoint, record);
      }
    }
    
    return Array.from(latestByEndpoint.values()).sort((a, b) => 
      a.endpoint.localeCompare(b.endpoint)
    );
  },
});

// Get API health by category (reddit, claude, internal, external)
export const getAPIHealthByCategory = query({
  args: {
    category: v.union(
      v.literal("reddit"),
      v.literal("claude"),
      v.literal("internal"),
      v.literal("external")
    )
  },
  handler: async (ctx, args) => {
    const healthRecords = await ctx.db
      .query("api_health")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
    
    // Get latest record for each endpoint in this category
    const latestByEndpoint = new Map<string, any>();
    
    for (const record of healthRecords) {
      if (!latestByEndpoint.has(record.endpoint) || 
          record.timestamp > latestByEndpoint.get(record.endpoint).timestamp) {
        latestByEndpoint.set(record.endpoint, record);
      }
    }
    
    return Array.from(latestByEndpoint.values()).sort((a, b) => 
      a.endpoint.localeCompare(b.endpoint)
    );
  },
});

// Get API health summary - overall metrics
export const getAPIHealthSummary = query({
  args: {},
  handler: async (ctx) => {
    const allHealth = await ctx.db
      .query("api_health")
      .order("desc")
      .collect();
    
    if (allHealth.length === 0) {
      return {
        totalEndpoints: 0,
        healthyEndpoints: 0,
        degradedEndpoints: 0,
        unhealthyEndpoints: 0,
        averageResponseTime: 0,
        averageUptime: 0,
        lastUpdated: Date.now()
      };
    }
    
    // Get latest status for each endpoint
    const latestByEndpoint = new Map<string, any>();
    for (const record of allHealth) {
      if (!latestByEndpoint.has(record.endpoint) || 
          record.timestamp > latestByEndpoint.get(record.endpoint).timestamp) {
        latestByEndpoint.set(record.endpoint, record);
      }
    }
    
    const latestRecords = Array.from(latestByEndpoint.values());
    
    const summary = {
      totalEndpoints: latestRecords.length,
      healthyEndpoints: latestRecords.filter(r => r.status === 'healthy').length,
      degradedEndpoints: latestRecords.filter(r => r.status === 'degraded').length,
      unhealthyEndpoints: latestRecords.filter(r => r.status === 'unhealthy').length,
      averageResponseTime: latestRecords.reduce((sum, r) => sum + r.response_time, 0) / latestRecords.length,
      averageUptime: latestRecords.reduce((sum, r) => sum + r.uptime, 0) / latestRecords.length,
      lastUpdated: Math.max(...latestRecords.map(r => r.timestamp))
    };
    
    return summary;
  },
});

// Get API health history for a specific endpoint
export const getAPIHealthHistory = query({
  args: {
    endpoint: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("api_health")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

// Get API health trends - for charts and analytics
export const getAPIHealthTrends = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("1h"),
      v.literal("6h"),
      v.literal("24h"),
      v.literal("7d")
    ))
  },
  handler: async (ctx, args) => {
    const timeRange = args.timeRange ?? "24h";
    const now = Date.now();
    
    let startTime: number;
    switch (timeRange) {
      case "1h":
        startTime = now - (60 * 60 * 1000);
        break;
      case "6h":
        startTime = now - (6 * 60 * 60 * 1000);
        break;
      case "24h":
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case "7d":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = now - (24 * 60 * 60 * 1000);
    }
    
    const healthRecords = await ctx.db
      .query("api_health")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", startTime))
      .order("desc")
      .collect();
    
    // Group by endpoint and time buckets for trending
    const trends: Record<string, Array<{
      timestamp: number;
      status: string;
      response_time: number;
      uptime: number;
    }>> = {};
    
    for (const record of healthRecords) {
      if (!trends[record.endpoint]) {
        trends[record.endpoint] = [];
      }
      
      trends[record.endpoint].push({
        timestamp: record.timestamp,
        status: record.status,
        response_time: record.response_time,
        uptime: record.uptime
      });
    }
    
    return trends;
  },
});

// 🔄 API HEALTH MUTATIONS

// Record API health check result
export const recordAPIHealth = mutation({
  args: {
    endpoint: v.string(),
    category: v.union(
      v.literal("reddit"),
      v.literal("claude"),
      v.literal("internal"),
      v.literal("external")
    ),
    status: v.union(
      v.literal("healthy"),
      v.literal("degraded"),
      v.literal("unhealthy"),
      v.literal("unknown")
    ),
    response_time: v.number(),
    consecutive_failures: v.number(),
    total_checks: v.number(),
    successful_checks: v.number(),
    last_error: v.optional(v.string()),
    url: v.optional(v.string()),
    method: v.optional(v.string()),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Calculate derived metrics
    const error_rate = args.total_checks > 0 
      ? ((args.total_checks - args.successful_checks) / args.total_checks) * 100 
      : 0;
    
    const uptime = args.total_checks > 0 
      ? (args.successful_checks / args.total_checks) * 100 
      : 0;
    
    // Get recent records for this endpoint to calculate averages
    const recentRecords = await ctx.db
      .query("api_health")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .order("desc")
      .take(10);
    
    const responseTimes = [args.response_time, ...recentRecords.map(r => r.response_time)];
    const avg_response_time = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    
    // Calculate p95
    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const p95_index = Math.floor(sortedResponseTimes.length * 0.95);
    const p95_response_time = sortedResponseTimes[p95_index] || args.response_time;
    
    const healthRecord = {
      endpoint: args.endpoint,
      category: args.category,
      status: args.status,
      response_time: args.response_time,
      last_check: now,
      consecutive_failures: args.consecutive_failures,
      total_checks: args.total_checks,
      successful_checks: args.successful_checks,
      error_rate,
      uptime,
      last_error: args.last_error,
      last_success_at: args.status === 'healthy' ? now : recentRecords[0]?.last_success_at,
      avg_response_time,
      p95_response_time,
      url: args.url,
      method: args.method,
      description: args.description,
      timestamp: now,
      created_at: now,
      updated_at: now
    };
    
    const recordId = await ctx.db.insert("api_health", healthRecord);
    
    console.log(`📊 Recorded API health for ${args.endpoint}: ${args.status} (${args.response_time}ms)`);
    
    return recordId;
  },
});

// Batch update multiple API health records
export const recordMultipleAPIHealth = mutation({
  args: {
    healthData: v.array(v.object({
      endpoint: v.string(),
      category: v.union(
        v.literal("reddit"),
        v.literal("claude"),
        v.literal("internal"),
        v.literal("external")
      ),
      status: v.union(
        v.literal("healthy"),
        v.literal("degraded"),
        v.literal("unhealthy"),
        v.literal("unknown")
      ),
      response_time: v.number(),
      consecutive_failures: v.number(),
      total_checks: v.number(),
      successful_checks: v.number(),
      last_error: v.optional(v.string()),
      url: v.optional(v.string()),
      method: v.optional(v.string()),
      description: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    const recordIds = [];
    
    for (const healthData of args.healthData) {
      // Manually call the recordAPIHealth logic here to avoid circular dependency
      const now = Date.now();
      
      // Calculate derived metrics
      const error_rate = healthData.total_checks > 0 
        ? ((healthData.total_checks - healthData.successful_checks) / healthData.total_checks) * 100 
        : 0;
      
      const uptime = healthData.total_checks > 0 
        ? (healthData.successful_checks / healthData.total_checks) * 100 
        : 0;
      
      // Get recent records for this endpoint to calculate averages
      const recentRecords = await ctx.db
        .query("api_health")
        .withIndex("by_endpoint", (q) => q.eq("endpoint", healthData.endpoint))
        .order("desc")
        .take(10);
      
      const responseTimes = [healthData.response_time, ...recentRecords.map(r => r.response_time)];
      const avg_response_time = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
      
      // Calculate p95
      const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
      const p95_index = Math.floor(sortedResponseTimes.length * 0.95);
      const p95_response_time = sortedResponseTimes[p95_index] || healthData.response_time;
      
      const healthRecord = {
        endpoint: healthData.endpoint,
        category: healthData.category,
        status: healthData.status,
        response_time: healthData.response_time,
        last_check: now,
        consecutive_failures: healthData.consecutive_failures,
        total_checks: healthData.total_checks,
        successful_checks: healthData.successful_checks,
        error_rate,
        uptime,
        last_error: healthData.last_error,
        last_success_at: healthData.status === 'healthy' ? now : recentRecords[0]?.last_success_at,
        avg_response_time,
        p95_response_time,
        url: healthData.url,
        method: healthData.method,
        description: healthData.description,
        timestamp: now,
        created_at: now,
        updated_at: now
      };
      
      const recordId = await ctx.db.insert("api_health", healthRecord);
      recordIds.push(recordId);
    }
    
    console.log(`📊 Recorded ${recordIds.length} API health checks`);
    
    return recordIds;
  },
});

// Update API health status (for manual overrides)
export const updateAPIHealthStatus = mutation({
  args: {
    endpoint: v.string(),
    status: v.union(
      v.literal("healthy"),
      v.literal("degraded"),
      v.literal("unhealthy"),
      v.literal("unknown")
    ),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the latest record for this endpoint
    const latestRecord = await ctx.db
      .query("api_health")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .order("desc")
      .first();
    
    if (!latestRecord) {
      throw new Error(`No health record found for endpoint: ${args.endpoint}`);
    }
    
    // Create a new record with updated status
    const updatedRecord = {
      ...latestRecord,
      status: args.status,
      last_error: args.reason || latestRecord.last_error,
      timestamp: now,
      updated_at: now
    };
    
    const recordId = await ctx.db.insert("api_health", updatedRecord);
    
    console.log(`📊 Updated API health status for ${args.endpoint}: ${args.status}`);
    
    return recordId;
  },
});

// Clean up old API health records (retention policy)
export const cleanupOldAPIHealthRecords = mutation({
  args: {
    retentionDays: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const retentionDays = args.retentionDays ?? 30;
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    const oldRecords = await ctx.db
      .query("api_health")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffTime))
      .collect();
    
    let deletedCount = 0;
    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }
    
    console.log(`🧹 Cleaned up ${deletedCount} API health records older than ${retentionDays} days`);
    
    return deletedCount;
  },
});

// Initialize API health records for new endpoints
export const initializeAPIEndpoint = mutation({
  args: {
    endpoint: v.string(),
    category: v.union(
      v.literal("reddit"),
      v.literal("claude"),
      v.literal("internal"),
      v.literal("external")
    ),
    url: v.optional(v.string()),
    method: v.optional(v.string()),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if endpoint already exists
    const existingRecord = await ctx.db
      .query("api_health")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();
    
    if (existingRecord) {
      console.log(`⚠️ API endpoint ${args.endpoint} already exists`);
      return existingRecord._id;
    }
    
    // Create initial health record
    const initialRecord = {
      endpoint: args.endpoint,
      category: args.category,
      status: "unknown" as const,
      response_time: 0,
      last_check: 0,
      consecutive_failures: 0,
      total_checks: 0,
      successful_checks: 0,
      error_rate: 0,
      uptime: 0,
      avg_response_time: 0,
      p95_response_time: 0,
      url: args.url,
      method: args.method,
      description: args.description,
      timestamp: now,
      created_at: now,
      updated_at: now
    };
    
    const recordId = await ctx.db.insert("api_health", initialRecord);
    
    console.log(`📊 Initialized API health tracking for ${args.endpoint}`);
    
    return recordId;
  },
});