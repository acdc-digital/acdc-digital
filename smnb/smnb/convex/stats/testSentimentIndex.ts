/**
 * PUBLIC ACTION - Trigger sentiment index backfill
 * This is a public wrapper so you can call it easily from the dashboard or app
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const triggerBackfill = action({
  args: {
    hoursBack: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    hoursProcessed: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; hoursProcessed: number; message: string }> => {
    console.log("🚀 Starting sentiment index backfill...");
    
    const result: {
      success: boolean;
      hoursProcessed: number;
      scores: Array<{ hour: number; sentimentIndex: number }>;
    } = await ctx.runAction(
      internal.stats.sentimentIndex.backfillHistoricalSentimentIndex,
      {
        hoursBack: args.hoursBack || 24,
      }
    );

    console.log(`✅ Backfill complete! Processed ${result.hoursProcessed} hours`);
    
    return {
      success: result.success,
      hoursProcessed: result.hoursProcessed,
      message: `Successfully backfilled ${result.hoursProcessed} hours of sentiment index data`,
    };
  },
});
