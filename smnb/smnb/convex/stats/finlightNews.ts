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
 * Fetch and summarize news from Finlight.me API for a specific ticker
 */
export const generateNewsSummary = action({
  args: {
    ticker: v.string(),
    weight: v.number(),
  },
  returns: v.union(
    v.object({
      summary: v.string(),
      generated_at: v.number(),
      articles_count: v.number(),
      sources: v.array(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args): Promise<{ summary: string; generated_at: number; articles_count: number; sources: string[] } | null> => {
    try {
      const API_KEY = process.env.FINLIGHT_API_KEY;
      if (!API_KEY) {
        console.error("❌ FINLIGHT_API_KEY not configured");
        return null;
      }

      // Fetch news from Finlight.me API using their query syntax
      // API uses POST method with JSON body, not GET with query params
      console.log(`📰 Fetching Finlight news for ${args.ticker}...`);
      
      const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days ago
      
      const requestBody = {
        query: `ticker:${args.ticker}`,
        from: fromDate,
        pageSize: 10,
        language: 'en',
        includeContent: true,
        includeEntities: true,
      };
      
      const response = await fetch('https://api.finlight.me/v2/articles', {
        method: 'POST',
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`❌ Finlight API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`Response body: ${errorText}`);
        return null;
      }

      const newsData = await response.json();
      
      if (!newsData.articles || newsData.articles.length === 0) {
        console.log(`ℹ️ No news articles found for ${args.ticker}`);
        return null;
      }

      const articles = newsData.articles;
      const sources = Array.from(new Set(articles.map((a: { source?: string }) => a.source).filter(Boolean))).slice(0, 5);
      
      // Prepare articles for prompt
      const formattedArticles = articles.slice(0, 10).map((article: any) => ({
        title: article.headline || article.title,
        description: article.summary || article.description || 'N/A',
        publishedAt: article.published_at || article.date || new Date().toISOString(),
        source: article.source || 'Unknown',
      }));

      // Get prompt configuration
      const promptConfig = LLM_PROMPTS.NEWS_SUMMARY;
      
      // Build messages using centralized prompt
      const messages = buildMessages(promptConfig, {
        ticker: args.ticker,
        indexWeight: args.weight,
        articles: formattedArticles,
      });

      // Call Claude with centralized config
      const startTime = Date.now();
      const requestId = `finlight_${args.ticker}_${startTime}`;
      
      const anthropicResponse: Anthropic.Message = await anthropic.messages.create({
        model: promptConfig.model,
        max_tokens: promptConfig.maxTokens,
        temperature: promptConfig.temperature,
        system: promptConfig.systemPrompt,
        messages,
      });

      const fullResponse: string = anthropicResponse.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block: Anthropic.TextBlock) => block.text)
        .join("\n\n");

      // Parse sentiment score from response - try multiple patterns
      let newsSentimentScore = 50; // Default to neutral
      const sentimentPatterns = [
        /SENTIMENT_SCORE:\s*(\d+)/i,
        /SENTIMENT:\s*(\d+)/i,
        /Score:\s*(\d+)/i,
      ];
      
      for (const pattern of sentimentPatterns) {
        const match = fullResponse.match(pattern);
        if (match) {
          newsSentimentScore = parseInt(match[1], 10);
          break;
        }
      }
      
      const summaryMatch = fullResponse.match(/SUMMARY:\s*([\s\S]+)/i);
      const summary = summaryMatch ? summaryMatch[1].trim() : fullResponse;

      const duration = Date.now() - startTime;
      const generatedAt = Date.now();

      // Track token usage (using centralized cost estimation)
      const inputTokens = anthropicResponse.usage.input_tokens;
      const outputTokens = anthropicResponse.usage.output_tokens;
      const inputCostPer1K = 0.001; // $1.00 per 1M input tokens = $0.001 per 1K
      const outputCostPer1K = 0.005; // $5.00 per 1M output tokens = $0.005 per 1K
      const estimatedCost = (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;

      console.log(`📰 News summary generated for ${args.ticker}:`, {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost: estimatedCost,
        duration,
        articles_count: articles.length,
        news_sentiment_score: newsSentimentScore,
        prompt_config: promptConfig.id,
      });

      // Log token usage to database
      await ctx.runMutation(api.analytics.tokenUsage.recordTokenUsage, {
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
          type: "finlight_news_summary", 
          articles_count: articles.length, 
          news_sentiment_score: newsSentimentScore,
          prompt_id: promptConfig.id,
        }),
      });

      // Store summary in database cache
      await ctx.runMutation(api.stats.finlightNewsCache.storeSummary, {
        ticker: args.ticker,
        summary,
        newsSentimentScore,
        generatedAt,
        expiresAt: generatedAt + (24 * 60 * 60 * 1000), // 24 hours
        articlesCount: articles.length,
        sources: sources as string[],
        weight: args.weight,
      });

      return {
        summary,
        generated_at: generatedAt,
        articles_count: articles.length,
        sources: sources as string[],
      };
    } catch (error) {
      console.error("Error generating Finlight news summary:", error);
      return null;
    }
  },
});
