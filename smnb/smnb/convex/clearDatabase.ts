// Clear all data from the database
// Run with: npx convex run clearDatabase:clearAll

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAll = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("🗑️ Starting database clear...");
    
    const tables = [
      "aggregate_stats",
      "api_health",
      "content_interactions",
      "editor_documents",
      "engagement_stats",
      "generated_posts",
      "host_documents",
      "host_sessions",
      "keyword_extraction_runs",
      "keyword_trends",
      "live_feed_posts",
      "messages",
      "model_usage_logs",
      "pipeline_stats",
      "post_stats",
      "rate_limits",
      "sessionManagerChats",
      "sessions",
      "story_history",
      "studio_controls",
      "system_events",
      "token_usage",
      "user_analytics",
      "user_behavior_patterns",
      "user_events",
      "user_sessions",
      // Don't clear users table - keep user accounts
      // "users",
    ];

    let totalDeleted = 0;

    for (const tableName of tables) {
      try {
        const docs = await ctx.db.query(tableName as any).collect();
        console.log(`🗑️ Clearing ${tableName}: ${docs.length} documents`);
        
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
        
        console.log(`✅ Cleared ${tableName}`);
      } catch (error) {
        console.error(`❌ Error clearing ${tableName}:`, error);
      }
    }

    console.log(`✅ Database cleared! Deleted ${totalDeleted} documents total.`);
    console.log(`ℹ️ Users table was preserved.`);
    
    return null;
  },
});

export const clearTable = internalMutation({
  args: { tableName: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { tableName } = args;
    
    console.log(`🗑️ Clearing table: ${tableName}`);
    
    try {
      const docs = await ctx.db.query(tableName as any).collect();
      console.log(`Found ${docs.length} documents to delete`);
      
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      
      console.log(`✅ Cleared ${docs.length} documents from ${tableName}`);
    } catch (error) {
      console.error(`❌ Error clearing ${tableName}:`, error);
      throw error;
    }
    
    return null;
  },
});
