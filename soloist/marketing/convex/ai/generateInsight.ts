"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

// Rate limiter for Anthropic (50 RPM Tier 1)
let lastAnthropicCall = 0;
const ANTHROPIC_MIN_INTERVAL = 1200; // 1.2 seconds (50 calls per minute)

async function waitForAnthropicRateLimit() {
  const now = Date.now();
  const timeSinceLastCall = now - lastAnthropicCall;
  
  if (timeSinceLastCall < ANTHROPIC_MIN_INTERVAL) {
    const delay = ANTHROPIC_MIN_INTERVAL - timeSinceLastCall;
    console.log(`⏳ Anthropic rate limit: waiting ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastAnthropicCall = Date.now();
}

export const generateInsight = action({
  args: {
    postTitle: v.string(),
    postContent: v.string(),
    postSubreddit: v.string(),
    postUrl: v.string(),
  },
  returns: v.object({
    narrative: v.string(),
    insight_type: v.union(
      v.literal("pain_point"),
      v.literal("competitor_mention"),
      v.literal("feature_request"),
      v.literal("sentiment")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    sentiment: v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    ),
    topics: v.array(v.string()),
    summary: v.string(),
  }),
  handler: async (ctx, args) => {
    // Wait for rate limit
    await waitForAnthropicRateLimit();
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are a marketing research analyst. Analyze this Reddit post and extract ONE valuable marketing insight.

Post from r/${args.postSubreddit}:
Title: ${args.postTitle}
Content: ${args.postContent}

CRITICAL: Return ONLY valid JSON matching this EXACT format:
{
  "narrative": "A clear, actionable insight (2-3 sentences)",
  "insight_type": "pain_point",
  "priority": "high",
  "sentiment": "positive",
  "topics": ["topic1", "topic2"],
  "summary": "One sentence summary"
}

RULES:
- insight_type MUST be one of: "pain_point", "competitor_mention", "feature_request", "sentiment"
- priority MUST be one of: "high", "medium", "low"
- sentiment MUST be one of: "positive", "negative", "neutral"
- Return ONLY ONE insight object
- NO explanatory text before or after JSON
- NO markdown code blocks

Focus on:
- PAIN POINTS: Problems, frustrations, unmet needs
- COMPETITOR MENTIONS: Products/services discussed
- FEATURE REQUESTS: Desired capabilities
- SENTIMENT: Market sentiment and emotional tone`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", // Claude Haiku 4.5
        max_tokens: 1024,
        temperature: 0.3, // Use EITHER temperature OR top_p, not both
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract text content
      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Anthropic");
      }

      // Clean the response - remove markdown code blocks if present
      let jsonText = content.text.trim();
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
      
      // Parse JSON response
      const result = JSON.parse(jsonText);
      
      // Validate insight_type
      const validTypes = ["pain_point", "competitor_mention", "feature_request", "sentiment"];
      if (!validTypes.includes(result.insight_type)) {
        console.warn(`⚠️ Invalid insight_type: ${result.insight_type}, defaulting to sentiment`);
        result.insight_type = "sentiment";
      }
      
      // Validate priority
      const validPriorities = ["high", "medium", "low"];
      if (!validPriorities.includes(result.priority)) {
        console.warn(`⚠️ Invalid priority: ${result.priority}, defaulting to medium`);
        result.priority = "medium";
      }
      
      // Validate sentiment
      const validSentiments = ["positive", "negative", "neutral"];
      if (!validSentiments.includes(result.sentiment)) {
        console.warn(`⚠️ Invalid sentiment: ${result.sentiment}, defaulting to neutral`);
        result.sentiment = "neutral";
      }
      
      console.log(`✅ Generated insight: ${result.insight_type} (${result.priority})`);
      
      return result;
    } catch (error) {
      console.error("❌ Failed to generate insight:", error);
      
      // Return fallback insight
      return {
        narrative: `Marketing discussion in r/${args.postSubreddit}: ${args.postTitle}`,
        insight_type: "sentiment" as const,
        priority: "medium" as const,
        sentiment: "neutral" as const,
        topics: [args.postSubreddit],
        summary: args.postTitle.substring(0, 100),
      };
    }
  },
});
