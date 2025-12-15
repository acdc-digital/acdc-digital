import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { SCORING_PROMPT } from "./prompts";

/**
 * Action: scoreDailyLogNew
 * Calculates an AI-generated score for a daily log entry
 */
export const scoreDailyLogNew = action({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, date } = args;
    console.log("🔍 Starting scoreDailyLogNew for user:", userId, "date:", date);
    
    try {
      // Get the daily log from the database
      const dailyLog = await ctx.runQuery(api.dailyLogs.getDailyLog, {
        userId,
        date,
      });

      if (!dailyLog) {
        throw new Error(`No daily log found for userId=${userId}, date=${date}`);
      }

      console.log("✅ Found daily log:", dailyLog._id);

      // For now, let's just return a simple calculated score without OpenAI
      // to test if the basic function works
      const answers = dailyLog.answers;
      
      // Simple scoring algorithm
      let score = 5; // base score
      
      if (answers.overallMood) {
        score = answers.overallMood;
      }
      
      // Add some basic adjustments
      if (answers.exercise) {
        score += 0.5;
      }
      
      if (answers.workSatisfaction && answers.workSatisfaction > 7) {
        score += 0.3;
      }
      
      // Ensure score is between 1-10
      score = Math.max(1, Math.min(10, score));
      
      console.log("🎯 Calculated simple score:", score);

      // Update the score in the database
      await ctx.runMutation(api.score.updateLogScore, {
        logId: dailyLog._id,
        newScore: score,
      });

      console.log("✅ Score updated successfully");

      // Trigger feed generation for this scored log
      try {
        console.log("🔄 Generating feed entry for scored log...");
        const feedResult = await ctx.runAction(api.feed.generateFeedForDailyLog, {
          userId,
          date,
        });
        console.log("✅ Feed entry generated successfully");
      } catch (feedError) {
        console.error("⚠️ Failed to generate feed entry:", feedError);
        // Don't throw here - scoring was successful, feed generation is secondary
      }

      return { score: score };
      
    } catch (error) {
      console.error("❌ Error in scoreDailyLogNew:", error);
      throw error;
    }
  },
});

/**
 * Action: scoreDailyLog
 * Calculates an AI-generated score for a daily log entry using OpenAI
 */
export const scoreDailyLog = action({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, date } = args;
    console.log("🔍 Starting AI-powered scoreDailyLog for user:", userId, "date:", date);
    
    try {
      // Get the daily log from the database
      const dailyLog = await ctx.runQuery(api.dailyLogs.getDailyLog, {
        userId,
        date,
      });

      if (!dailyLog) {
        throw new Error(`No daily log found for userId=${userId}, date=${date}`);
      }

      console.log("✅ Found daily log:", dailyLog._id);

      // Prepare the content for OpenAI
      const userContent = JSON.stringify(dailyLog.answers, null, 2);

      // Get the Anthropic API key from environment variables
      const apiKey = (process as any).env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("Missing ANTHROPIC_API_KEY in environment!");
      }

      console.log("🔑 Anthropic API key found");

      // Check SCORING_PROMPT
      if (!SCORING_PROMPT) {
        throw new Error("SCORING_PROMPT is not available");
      }
      
      console.log("📋 SCORING_PROMPT available");
      
      // Create request body for Anthropic Claude
      const claudeRequest = {
        model: "claude-3-5-haiku-20241022",
        max_tokens: 5,
        temperature: 0.0,
        system: SCORING_PROMPT,
        messages: [
          {
            role: "user",
            content: `Here is the user's daily log in JSON:\n${userContent}`,
          },
        ],
      };
      
      console.log("✅ Claude request body created");

      // Call Anthropic API
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(claudeRequest),
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error("❌ Claude API error:", claudeResponse.status, errorText);
        throw new Error(`Claude API error (${claudeResponse.status}): ${errorText}`);
      }

      const completion = await claudeResponse.json();
      console.log("📊 Claude response received");

      // Extract the score from the response
      const assistantMessage = completion.content?.[0]?.text?.trim() || "";
      let aiScore = parseInt(assistantMessage, 10);
      
      if (isNaN(aiScore) || aiScore < 1 || aiScore > 10) {
        console.warn("⚠️ Invalid score from OpenAI, using default:", assistantMessage);
        aiScore = 5; // default to 5 (middle score) if invalid
      }

      // Convert from 1-10 scale to 1-100 scale for the heatmap
      const finalScore = Math.round(aiScore * 10);

      console.log(`🎯 AI-calculated score: ${aiScore}/10 -> converted to ${finalScore}/100`);

      // Track usage if available
      if (completion.usage) {
        try {
          await ctx.runMutation(internal.anthropic.trackUsage, {
            userId,
            feature: "scoring",
            model: "claude-3-5-haiku-20241022",
            promptTokens: completion.usage.input_tokens || 0,
            completionTokens: completion.usage.output_tokens || 0,
            metadata: { date, score: finalScore, aiScore }
          });
        } catch (trackingError) {
          console.error("[scoreDailyLog] Failed to track usage:", trackingError);
        }
      }

      // Update the score in the database
      await ctx.runMutation(api.score.updateLogScore, {
        logId: dailyLog._id,
        newScore: finalScore,
      });

      console.log("✅ AI score updated successfully");

      // Trigger feed generation for this scored log
      try {
        console.log("🔄 Generating feed entry for scored log...");
        const feedResult = await ctx.runAction(api.feed.generateFeedForDailyLog, {
          userId,
          date,
        });
        console.log("✅ Feed entry generated successfully");
      } catch (feedError) {
        console.error("⚠️ Failed to generate feed entry:", feedError);
        // Don't throw here - scoring was successful, feed generation is secondary
      }

      return { score: finalScore };
      
    } catch (error) {
      console.error("❌ Error in AI scoreDailyLog:", error);
      throw error;
    }
  },
});

/**
 * Mutation: updateLogScore
 * Updates the score for a specific log entry
 */
export const updateLogScore = mutation({
  args: {
    logId: v.id("logs"),
    newScore: v.number(),
  },
  handler: async ({ db }, { logId, newScore }) => {
    await db.patch(logId, {
      score: newScore,
      updatedAt: Date.now(),
    });
    return db.get(logId);
  },
});