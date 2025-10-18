import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the mean sentiment score for the current day
 * Returns the average calculated_score per ticker from the latest calculation batch
 */
export const getDailySentiment = query({
  args: {},
  returns: v.union(
    v.object({
      meanScore: v.number(), // Average score per ticker
      direction: v.union(v.literal("up"), v.literal("down"), v.literal("neutral")),
      scoreChange: v.number(),
      calculatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx): Promise<{
    meanScore: number;
    direction: "up" | "down" | "neutral";
    scoreChange: number;
    calculatedAt: number;
  } | null> => {
    // Get all sentiment scores, sorted by most recent first
    const allScores = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_calculated_at")
      .order("desc")
      .collect();

    if (allScores.length === 0) {
      return null;
    }

    // Get the most recent calculation timestamp
    const latestTimestamp = allScores[0].calculated_at;

    // Filter scores from the latest calculation batch (within 1 hour of most recent)
    // This handles the case where 100 tickers are calculated sequentially
    const oneHourAgo = latestTimestamp - (60 * 60 * 1000);
    const latestScores = allScores.filter(
      (score) => score.calculated_at >= oneHourAgo
    );

    console.log(`📊 Found ${latestScores.length} sentiment scores in latest batch`);

    // Calculate total of all calculated_score values
    const totalScore = latestScores.reduce(
      (sum, score) => sum + score.calculated_score,
      0
    );
    
    // Calculate arithmetic mean (average per ticker)
    const meanScore = totalScore / latestScores.length;
    
    // Calculate weighted mean (accounts for index weight importance)
    // This shows the "true" market sentiment weighted by influence
    const totalWeight = latestScores.reduce((sum, score) => sum + score.weight, 0);
    const weightedMean = latestScores.reduce(
      (sum, score) => sum + (score.calculated_score * (score.weight / totalWeight)),
      0
    );
    
    console.log(`💰 Total: ${totalScore.toFixed(2)}, Mean: ${meanScore.toFixed(2)}, Weighted Mean: ${weightedMean.toFixed(2)}`);

    // Calculate mean change from previous scores
    const scoresWithChange = latestScores.filter(
      (score) => score.score_change_percent !== undefined
    );

    let scoreChange = 0;
    if (scoresWithChange.length > 0) {
      scoreChange =
        scoresWithChange.reduce(
          (sum, score) => sum + (score.score_change_percent || 0),
          0
        ) / scoresWithChange.length;
    }

    // Determine direction based on average change
    let direction: "up" | "down" | "neutral" = "neutral";
    if (scoreChange > 0.5) {
      direction = "up";
    } else if (scoreChange < -0.5) {
      direction = "down";
    }

    return {
      meanScore,
      direction,
      scoreChange,
      calculatedAt: latestTimestamp,
    };
  },
});
