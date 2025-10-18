/**
 * Centralized LLM Prompt Configuration
 * 
 * This file serves as the single source of truth for all LLM prompts,
 * model selections, and parameters across the SMNB project.
 * 
 * Usage:
 *   import { LLM_PROMPTS } from '@/lib/llm/prompts';
 *   const config = LLM_PROMPTS.SENTIMENT_ANALYSIS;
 *   // Use config.model, config.buildPrompt(), config.temperature, etc.
 */

import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ClaudeModel = 
  | "claude-3-5-sonnet-20241022"
  | "claude-haiku-4-5-20251001"
  | "claude-3-5-haiku-20241022"
  | "claude-3-haiku-20240307";

export interface LLMPromptConfig<TInput = any> {
  /** Unique identifier for this prompt */
  id: string;
  /** Human-readable description */
  description: string;
  /** Claude model to use */
  model: ClaudeModel;
  /** Maximum tokens to generate */
  maxTokens: number;
  /** Temperature (0-1, lower = more deterministic) */
  temperature: number;
  /** System prompt (optional) */
  systemPrompt?: string;
  /** Build the user prompt from input data */
  buildPrompt: (input: TInput) => string;
  /** Expected output format description */
  outputFormat?: string;
  /** Estimated cost per call (USD) */
  estimatedCost?: number;
}

// ============================================================================
// INPUT TYPE DEFINITIONS
// ============================================================================

export interface SentimentAnalysisInput {
  ticker: string;
  indexWeight: number;
  sentimentScore: number;
  baselineCalculation: number;
  performanceMultiplier: number;
  change24h: number;
}

export interface NewsSummaryInput {
  ticker: string;
  indexWeight: number;
  articles: Array<{
    title: string;
    description: string;
    publishedAt: string;
    source: string;
  }>;
}

export interface ContentGenerationInput {
  keywords: Array<{
    keyword: string;
    sentiment: number;
    confidence: number;
  }>;
  columnContext?: string;
  customInstructions?: string;
}

export interface HostNarrationInput {
  event: string;
  context: {
    ticker?: string;
    sentimentScore?: number;
    newsHeadline?: string;
    marketTrend?: string;
  };
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface EditorFormattingInput {
  content: string;
  format: "newsletter" | "analytical" | "enhancement";
  customInstructions?: string;
}

// ============================================================================
// PROMPT CONFIGURATIONS
// ============================================================================

/**
 * 1. SENTIMENT ANALYSIS
 * Generates 2-paragraph sentiment excerpts for stock tickers
 */
export const SENTIMENT_ANALYSIS: LLMPromptConfig<SentimentAnalysisInput> = {
  id: "sentiment-analysis",
  description: "Generate 2-paragraph sentiment analysis excerpts",
  model: "claude-haiku-4-5-20251001",
  maxTokens: 512,
  temperature: 0.7,
  estimatedCost: 0.0025,
  
  systemPrompt: `You are a financial analyst specializing in social media sentiment analysis. 
Your task is to analyze Reddit sentiment data and provide clear, data-driven insights about 
investor perception and community trends for specific stocks.`,

  buildPrompt: (input: SentimentAnalysisInput) => {
    const { ticker, indexWeight, sentimentScore, baselineCalculation, performanceMultiplier, change24h } = input;
    
    return `Analyze the following Reddit sentiment data for ${ticker}:

TICKER: ${ticker}
INDEX WEIGHT: ${indexWeight.toFixed(4)}
SENTIMENT SCORE: ${sentimentScore.toFixed(2)}
BASELINE CALCULATION: ${baselineCalculation.toFixed(2)}
PERFORMANCE MULTIPLIER: ${performanceMultiplier.toFixed(2)}x
24H CHANGE: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%

Generate a concise 2-paragraph analysis (100-150 words total):

PARAGRAPH 1 (50-75 words):
- Current sentiment level and what it indicates
- Community perception (bullish, bearish, neutral)
- 24-hour trend direction and significance

PARAGRAPH 2 (50-75 words):
- Key factors driving the sentiment
- Investor interest level and momentum
- Data-driven insights about community activity

Keep the tone professional but accessible. Focus on what the data reveals about investor behavior and community trends.`;
  },

  outputFormat: "Two paragraphs of plain text, 100-150 words total"
};

/**
 * 2. NEWS SUMMARY
 * Summarizes news articles and extracts sentiment scores
 */
export const NEWS_SUMMARY: LLMPromptConfig<NewsSummaryInput> = {
  id: "news-summary",
  description: "Summarize news articles and extract sentiment score",
  model: "claude-haiku-4-5-20251001",
  maxTokens: 512,
  temperature: 0.7,
  estimatedCost: 0.0025,

  systemPrompt: `You are a financial news analyst. Your task is to summarize recent news 
articles about stocks and extract an overall sentiment score. Be objective, data-driven, 
and focus on market-relevant information.`,

  buildPrompt: (input: NewsSummaryInput) => {
    const { ticker, indexWeight, articles } = input;
    
    const articlesList = articles.map((article, idx) => 
      `${idx + 1}. "${article.title}" (${article.source}, ${new Date(article.publishedAt).toLocaleDateString()})\n   ${article.description}`
    ).join('\n\n');

    return `Analyze the following news articles for ${ticker} (Index Weight: ${indexWeight.toFixed(4)}):

${articlesList}

TASK 1 - SENTIMENT SCORE:
Provide an overall sentiment score from 0-100 based on these articles:
- 0-30: Very bearish (major concerns, negative developments)
- 30-50: Bearish (some concerns, cautious outlook)
- 50: Neutral (balanced news, no clear direction)
- 50-70: Bullish (positive developments, optimistic outlook)
- 70-100: Very bullish (major breakthroughs, strong positive news)

Output the score on its own line: SENTIMENT_SCORE: [number]

TASK 2 - SUMMARY:
Write a concise 2-paragraph summary (120-150 words total):

PARAGRAPH 1 (60-75 words):
- Key developments and major announcements
- Most significant news items
- Timeline of recent events

PARAGRAPH 2 (60-75 words):
- Market implications and analyst perspectives
- Impact on company outlook
- Investor considerations

Keep the tone objective and fact-based. Focus on verifiable information from the articles.`;
  },

  outputFormat: "SENTIMENT_SCORE: [number]\n\n[Two paragraphs of summary text]"
};

/**
 * 3. CONTENT GENERATION
 * Generates synthetic Reddit posts and social media content
 */
export const CONTENT_GENERATION: LLMPromptConfig<ContentGenerationInput> = {
  id: "content-generation",
  description: "Generate synthetic social media posts",
  model: "claude-3-haiku-20240307",
  maxTokens: 400,
  temperature: 0.8,
  estimatedCost: 0.002,

  systemPrompt: `You are a creative writer specializing in generating realistic social media content. 
Create authentic-sounding posts that match the tone and style of real social media platforms.`,

  buildPrompt: (input: ContentGenerationInput) => {
    const { keywords, columnContext, customInstructions } = input;
    
    const keywordsList = keywords.map(k => 
      `- "${k.keyword}" (sentiment: ${k.sentiment.toFixed(2)}, confidence: ${k.confidence.toFixed(2)})`
    ).join('\n');

    return `Generate a realistic social media post based on the following keywords:

${keywordsList}

${columnContext ? `CONTEXT: ${columnContext}\n` : ''}
${customInstructions ? `INSTRUCTIONS: ${customInstructions}\n` : ''}

Create a post that:
1. Feels authentic and natural (not AI-generated)
2. Incorporates the keywords organically
3. Matches the sentiment level indicated
4. Is appropriate for the platform (Reddit/Twitter)
5. Includes realistic metadata (author, score estimate, platform)

Output format:
AUTHOR: [realistic username]
PLATFORM: [Reddit/Twitter]
ESTIMATED_SCORE: [number]
CONTENT: [the actual post text]`;
  },

  outputFormat: "AUTHOR, PLATFORM, ESTIMATED_SCORE, and CONTENT fields"
};

/**
 * 4. HOST NARRATION
 * Real-time market commentary and narration
 */
export const HOST_NARRATION: LLMPromptConfig<HostNarrationInput> = {
  id: "host-narration",
  description: "Generate real-time market commentary",
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 300,
  temperature: 0.8,
  estimatedCost: 0.015,

  systemPrompt: `You are an energetic and insightful market commentator. Your style is:
- Professional but conversational
- Data-driven with personality
- Clear and concise
- Engaging without being over-the-top
- Uses market terminology appropriately

Provide real-time commentary on market events, sentiment shifts, and trading activity.`,

  buildPrompt: (input: HostNarrationInput) => {
    const { event, context, conversationHistory } = input;
    
    let prompt = `EVENT: ${event}\n\n`;
    
    if (context.ticker) {
      prompt += `TICKER: ${context.ticker}\n`;
    }
    if (context.sentimentScore !== undefined) {
      prompt += `SENTIMENT: ${context.sentimentScore.toFixed(2)}\n`;
    }
    if (context.newsHeadline) {
      prompt += `NEWS: ${context.newsHeadline}\n`;
    }
    if (context.marketTrend) {
      prompt += `TREND: ${context.marketTrend}\n`;
    }

    prompt += `\nProvide a brief, engaging commentary (2-3 sentences, ~50 words) that:
1. Acknowledges the event/data
2. Provides context or insight
3. Maintains an upbeat, professional tone

Keep it conversational and natural. Avoid clichés.`;

    return prompt;
  },

  outputFormat: "2-3 sentences of natural commentary, ~50 words"
};

/**
 * 5. EDITOR FORMATTING (Newsletter)
 * Advanced content editing with text_editor tool
 */
export const EDITOR_FORMATTING: LLMPromptConfig<EditorFormattingInput> = {
  id: "editor-formatting",
  description: "Format and enhance content using AI text editor",
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 4000,
  temperature: 0.5,
  estimatedCost: 0.065,

  systemPrompt: `You are an expert content editor specializing in financial newsletters and reports. 
Your task is to format, structure, and enhance content while maintaining accuracy and readability.

You have access to the text_editor tool for making precise edits. Use it to:
- Structure content with proper markdown
- Add section headers and formatting
- Enhance clarity and flow
- Maintain professional tone`,

  buildPrompt: (input: EditorFormattingInput) => {
    const { content, format, customInstructions } = input;
    
    const formatInstructions: Record<typeof format, string> = {
      newsletter: `Format this content as a professional financial newsletter:
- Clear section headers (##)
- Bullet points for key insights
- Bold for important metrics
- Clean, scannable layout
- Professional but approachable tone`,
      
      analytical: `Format this as an analytical report:
- Executive summary at top
- Data-driven sections
- Tables for numerical data
- Clear conclusions
- Formal, precise language`,
      
      enhancement: `Enhance this content by:
- Improving clarity and flow
- Adding structure where needed
- Highlighting key points
- Maintaining the original message
- Polishing the language`
    };

    return `CONTENT TO FORMAT:
${content}

FORMAT TYPE: ${format}

${formatInstructions[format]}

${customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${customInstructions}` : ''}

Use the text_editor tool to make precise, structured edits. Ensure the output is well-formatted markdown.`;
  },

  outputFormat: "Formatted markdown content via text_editor tool"
};

// ============================================================================
// PROMPT REGISTRY
// ============================================================================

/**
 * Central registry of all LLM prompts
 * Import this object to access any prompt configuration
 */
export const LLM_PROMPTS = {
  SENTIMENT_ANALYSIS,
  NEWS_SUMMARY,
  CONTENT_GENERATION,
  HOST_NARRATION,
  EDITOR_FORMATTING,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a prompt configuration by ID
 */
export function getPromptConfig(id: string): LLMPromptConfig | undefined {
  return Object.values(LLM_PROMPTS).find(config => config.id === id);
}

/**
 * List all available prompt IDs
 */
export function listPromptIds(): string[] {
  return Object.values(LLM_PROMPTS).map(config => config.id);
}

/**
 * Get estimated total cost for multiple calls
 */
export function estimateTotalCost(calls: Array<{ promptId: string; count: number }>): number {
  return calls.reduce((total, { promptId, count }) => {
    const config = getPromptConfig(promptId);
    return total + (config?.estimatedCost || 0) * count;
  }, 0);
}

/**
 * Build Anthropic messages array from prompt config
 */
export function buildMessages<T>(
  config: LLMPromptConfig<T>,
  input: T
): MessageParam[] {
  return [
    {
      role: "user",
      content: config.buildPrompt(input),
    },
  ];
}

// ============================================================================
// USAGE EXAMPLES (for documentation)
// ============================================================================

/*

EXAMPLE 1: Sentiment Analysis
------------------------------
import { LLM_PROMPTS, buildMessages } from '@/lib/llm/prompts';

const config = LLM_PROMPTS.SENTIMENT_ANALYSIS;
const input = {
  ticker: "AAPL",
  indexWeight: 0.0856,
  sentimentScore: 75.5,
  baselineCalculation: 65.2,
  performanceMultiplier: 1.85,
  change24h: 2.3
};

const messages = buildMessages(config, input);
const response = await anthropic.messages.create({
  model: config.model,
  max_tokens: config.maxTokens,
  temperature: config.temperature,
  system: config.systemPrompt,
  messages,
});


EXAMPLE 2: News Summary
-----------------------
import { LLM_PROMPTS } from '@/lib/llm/prompts';

const config = LLM_PROMPTS.NEWS_SUMMARY;
const input = {
  ticker: "NVDA",
  indexWeight: 0.0723,
  articles: [
    {
      title: "NVIDIA announces new GPU architecture",
      description: "Company unveils breakthrough in AI processing...",
      publishedAt: "2025-10-15T10:30:00Z",
      source: "TechCrunch"
    }
  ]
};

// Use config.model, config.maxTokens, etc.


EXAMPLE 3: Cost Estimation
---------------------------
import { estimateTotalCost } from '@/lib/llm/prompts';

const estimatedCost = estimateTotalCost([
  { promptId: "sentiment-analysis", count: 100 },
  { promptId: "news-summary", count: 100 },
]);

console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);

*/
