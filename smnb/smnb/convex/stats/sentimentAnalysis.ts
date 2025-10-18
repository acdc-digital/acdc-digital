"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { LLM_PROMPTS, buildMessages } from "../llm/prompts";

// Initialize Anthropic SDK with API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a sentiment analysis excerpt for a ticker using Claude Haiku 3.5
 */
export const generateSentimentExcerpt = action({
  args: {
    ticker: v.string(),
    weight: v.number(),
  },
  returns: v.union(
    v.object({
      excerpt: v.string(),
      generated_at: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args): Promise<{ excerpt: string; generated_at: number } | null> => {
    try {
      // Get the latest sentiment score data
      const sentimentData = await ctx.runQuery(api.stats.latestSentiment.getLatestSentimentScore, {
        ticker: args.ticker,
      });

      if (!sentimentData) {
        return null;
      }

      // Calculate baseline and multiplier for context
      const TOTAL_POINTS = 288878;
      const baseline = (args.weight / 100) * TOTAL_POINTS;
      const multiplier = sentimentData.calculated_score / baseline;
      const changePercent = sentimentData.score_change_percent ?? 0;

      // Get prompt configuration
      const promptConfig = LLM_PROMPTS.SENTIMENT_ANALYSIS;
      
      // Build messages using centralized prompt
      const messages = buildMessages(promptConfig, {
        ticker: args.ticker,
        indexWeight: args.weight,
        sentimentScore: sentimentData.calculated_score,
        baselineCalculation: baseline,
        performanceMultiplier: multiplier,
        change24h: changePercent,
      });

      // Call Claude with centralized config
      const startTime = Date.now();
      const requestId = `sentiment_${args.ticker}_${startTime}`;
      
      const response: Anthropic.Message = await anthropic.messages.create({
        model: promptConfig.model,
        max_tokens: promptConfig.maxTokens,
        temperature: promptConfig.temperature,
        system: promptConfig.systemPrompt,
        messages,
      });

      const excerpt: string = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block: Anthropic.TextBlock) => block.text)
        .join("\n\n");

      const duration = Date.now() - startTime;
      const generatedAt = Date.now();

      // Track token usage (using centralized cost estimation)
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const inputCostPer1K = 0.001; // $1.00 per 1M input tokens = $0.001 per 1K
      const outputCostPer1K = 0.005; // $5.00 per 1M output tokens = $0.005 per 1K
      const estimatedCost = (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;

      console.log(`📊 Sentiment excerpt generated for ${args.ticker}:`, {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost: estimatedCost,
        duration,
        prompt_config: promptConfig.id,
      });

      // Log token usage to database
      const tokenUsageId = await ctx.runMutation(api.analytics.tokenUsage.recordTokenUsage, {
        request_id: requestId,
        timestamp: startTime,
        model: promptConfig.model,
        action: "analyze",
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        estimated_cost: estimatedCost,
        request_type: "producer",
        duration,
        success: true,
        metadata: JSON.stringify({ 
          ticker: args.ticker, 
          type: "sentiment_excerpt",
          prompt_id: promptConfig.id,
        }),
      });

      // Store excerpt in database with 24-hour cache
      await ctx.runMutation(api.stats.sentimentExcerptCache.storeExcerpt, {
        ticker: args.ticker,
        excerpt,
        generatedAt,
        expiresAt: generatedAt + (24 * 60 * 60 * 1000), // 24 hours
        tokenUsageId,
        sentimentScore: sentimentData.calculated_score,
        multiplier,
        changePercent,
        weight: args.weight,
      });

      return {
        excerpt,
        generated_at: generatedAt,
      };
    } catch (error) {
      console.error("Error generating sentiment excerpt:", error);
      return null;
    }
  },
});
