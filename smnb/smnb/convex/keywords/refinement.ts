// KEYWORD REFINEMENT WITH LLM
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/keywords/refinement.ts

"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Claude 3.5 Haiku pricing (as of 2025)
const HAIKU_INPUT_COST = 0.80 / 1_000_000;  // $0.80 per million input tokens
const HAIKU_OUTPUT_COST = 4.00 / 1_000_000; // $4.00 per million output tokens

/**
 * Refine raw keywords using Claude 3.5 Haiku to make them contextually meaningful
 */
export const refineKeywords = action({
  args: {
    keywords: v.array(v.object({
      term: v.string(),
      count: v.number(),
      sources: v.array(v.string()),
      relatedTickers: v.array(v.string()),
      category: v.string(),
    })),
  },
  returns: v.object({
    refinedKeywords: v.array(v.object({
      original: v.string(),
      refined: v.string(),
      count: v.number(),
      sources: v.array(v.string()),
      relatedTickers: v.array(v.string()),
      category: v.string(),
    })),
    cost: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
  }),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Group keywords by category for batch processing
    const keywordsByCategory: Record<string, typeof args.keywords> = {
      sector: [],
      topic: [],
    };

    args.keywords.forEach(kw => {
      if (keywordsByCategory[kw.category]) {
        keywordsByCategory[kw.category].push(kw);
      }
    });

    // Build refinement prompt
    const prompt = buildRefinementPrompt(keywordsByCategory);

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent naming
        messages: [{
          role: "user",
          content: prompt,
        }],
      });

      // Calculate costs
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const cost = (inputTokens * HAIKU_INPUT_COST) + (outputTokens * HAIKU_OUTPUT_COST);

      // Log usage to cost tracking
      await ctx.runMutation(internal.analytics.costTracking.logModelUsage, {
        model: "claude-3-5-haiku-20241022",
        inputTokens,
        outputTokens,
        cost,
        purpose: "keyword-refinement",
        metadata: { keywordCount: args.keywords.length },
      });

      // Parse response
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error("No text content in response");
      }

      const refinements = parseRefinementResponse(textContent.text);
      
      // Map refinements back to keywords
      const refinedKeywords = args.keywords.map(kw => {
        const refined = refinements[kw.term] || kw.term;
        return {
          original: kw.term,
          refined: refined.trim(),
          count: kw.count,
          sources: kw.sources,
          relatedTickers: kw.relatedTickers,
          category: kw.category,
        };
      });

      return {
        refinedKeywords,
        cost,
        inputTokens,
        outputTokens,
      };

    } catch (error) {
      console.error("❌ Keyword refinement failed:", error);
      // Return original keywords on failure
      return {
        refinedKeywords: args.keywords.map(kw => ({
          original: kw.term,
          refined: kw.term,
          count: kw.count,
          sources: kw.sources,
          relatedTickers: kw.relatedTickers,
          category: kw.category,
        })),
        cost: 0,
        inputTokens: 0,
        outputTokens: 0,
      };
    }
  },
});

interface KeywordData {
  term: string;
  count: number;
  sources: string[];
  relatedTickers: string[];
  category: string;
}

function buildRefinementPrompt(keywordsByCategory: Record<string, KeywordData[]>): string {
  return `You are a financial keyword analyst. Transform raw extracted keywords into clear, meaningful terms for NASDAQ-100 trading analysis.

**Context:**
- Keywords extracted from Reddit discussions about stocks, trading, and market sentiment
- Used for building search queries and market intelligence
- Should be concise, clear, and professionally phrased

**Task:**
Refine each keyword to be more meaningful while preserving its core concept. Fix grammar, remove noise, and make terms professional.

**Rules:**
1. Keep sector keywords as-is (they're already clean)
2. Transform topic keywords to be clear and professional
3. Convert phrases like "without-doubt" → "market confidence", "worst-pirate" → "market manipulation", "ever heard" → "unprecedented"
4. Keep financial terms professional: "earnings report", "price target", "market rally"
5. Remove redundant words and fix grammar
6. If a keyword is already good, keep it unchanged
7. Max 4 words per refined keyword

**Format:**
Return ONLY a JSON object mapping original → refined keywords:
\`\`\`json
{
  "original-keyword": "refined keyword",
  "another-term": "improved term"
}
\`\`\`

${keywordsByCategory.sector.length > 0 ? `**Sectors (keep as-is):**
${keywordsByCategory.sector.map(k => `- ${k.term} (${k.relatedTickers.slice(0, 3).join(', ')})`).join('\n')}
` : ''}

**Topics to refine:**
${keywordsByCategory.topic.map(k => `- "${k.term}" (${k.count} mentions, sources: ${k.sources.slice(0, 2).join(', ')}, tickers: ${k.relatedTickers.slice(0, 3).join(', ')})`).join('\n')}

Return the JSON mapping now:`;
}

function parseRefinementResponse(response: string): Record<string, string> {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", response);
      return {};
    }
    
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);
    
    return parsed;
  } catch (error) {
    console.error("Failed to parse refinement response:", error);
    return {};
  }
}
