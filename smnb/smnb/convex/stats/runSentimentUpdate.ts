import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Manual trigger to run sentiment score updates
 * Use this to force a refresh of all sentiment scores
 */
export const triggerSentimentUpdate = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Manually triggering sentiment score update...");
    
    // Schedule the sentiment update action to run immediately
    await ctx.scheduler.runAfter(0, internal.stats.sentimentActions.updateAllSentimentScores);
    
    return {
      success: true,
      message: "Sentiment score update scheduled. Check logs for progress.",
    };
  },
});

/**
 * Delete all existing sentiment scores
 * Use this to clean the database before regenerating
 */
export const clearAllSentimentScores = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🗑️ Clearing all sentiment scores...");
    
    const allScores = await ctx.db.query("sentiment_scores").collect();
    
    for (const score of allScores) {
      await ctx.db.delete(score._id);
    }
    
    console.log(`✅ Deleted ${allScores.length} sentiment score records`);
    
    return {
      success: true,
      deletedCount: allScores.length,
      message: `Cleared ${allScores.length} sentiment score records`,
    };
  },
});

/**
 * Clear and regenerate all sentiment scores
 * This combines both operations: delete old data and trigger new calculation
 */
export const resetAndRegenerateSentimentScores = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Resetting and regenerating sentiment scores...");
    
    // Step 1: Clear existing scores
    const allScores = await ctx.db.query("sentiment_scores").collect();
    for (const score of allScores) {
      await ctx.db.delete(score._id);
    }
    console.log(`✅ Deleted ${allScores.length} old sentiment score records`);
    
    // Step 2: Schedule new calculation
    await ctx.scheduler.runAfter(0, internal.stats.sentimentActions.updateAllSentimentScores);
    console.log("🚀 Scheduled new sentiment score calculation");
    
    return {
      success: true,
      deletedCount: allScores.length,
      message: `Cleared ${allScores.length} records and triggered regeneration`,
    };
  },
});
