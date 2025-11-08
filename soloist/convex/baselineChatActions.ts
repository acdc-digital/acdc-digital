"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate initial psychoanalysis summary from baseline answers
 */
export const generateBaselineAnalysis = action({
  args: {
    userId: v.id("users"),
    baselineAnswerId: v.id("baseline_answers"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Fetch baseline answers
    const baselineAnswers = await ctx.runQuery(internal.baselineChat.getBaselineAnswers, {
      baselineAnswerId: args.baselineAnswerId,
    });

    if (!baselineAnswers) {
      throw new Error("Baseline answers not found");
    }

    // Fetch computed baseline scores
    const baseline = await ctx.runQuery(internal.baseline.getLatestBaseline, {
      userId: args.userId,
    });

    // Construct psychoanalysis prompt
    const prompt = buildAnalysisPrompt(baselineAnswers, baseline?.scores);

    // Call Claude Haiku
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const analysis = message.content[0].type === "text" ? message.content[0].text : "";

    // Track usage
    await ctx.runMutation(internal.baselineChat.trackAnthropicUsage, {
      userId: args.userId,
      feature: "baseline_analysis",
      model: "claude-3-5-haiku-20241022",
      promptTokens: message.usage.input_tokens,
      completionTokens: message.usage.output_tokens,
    });

    // Store analysis as assistant message
    await ctx.runMutation(api.baselineChat.addChatMessage, {
      userId: args.userId,
      baselineAnswerId: args.baselineAnswerId,
      role: "assistant",
      content: analysis,
    });

    return analysis;
  },
});

/**
 * Chat with AI about baseline analysis
 */
export const chatWithAnalysis = action({
  args: {
    userId: v.id("users"),
    baselineAnswerId: v.id("baseline_answers"),
    userMessage: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Store user message
    await ctx.runMutation(api.baselineChat.addChatMessage, {
      userId: args.userId,
      baselineAnswerId: args.baselineAnswerId,
      role: "user",
      content: args.userMessage,
    });

    // Get last 4 messages for context
    const recentMessages = await ctx.runQuery(api.baselineChat.getRecentMessages, {
      baselineAnswerId: args.baselineAnswerId,
      limit: 4,
    });

    // Get baseline answers for context
    const baselineAnswers = await ctx.runQuery(internal.baselineChat.getBaselineAnswers, {
      baselineAnswerId: args.baselineAnswerId,
    });

    // Build conversation with context
    const messages: Anthropic.MessageParam[] = recentMessages.map((msg: { role: "user" | "assistant" | "system"; content: string }) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // Add current message
    messages.push({
      role: "user",
      content: args.userMessage,
    });

    // Call Claude with conversation history
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1500,
      system: buildChatSystemPrompt(baselineAnswers),
      messages,
    });

    const assistantMessage = response.content[0].type === "text" ? response.content[0].text : "";

    // Track usage
    await ctx.runMutation(internal.baselineChat.trackAnthropicUsage, {
      userId: args.userId,
      feature: "baseline_chat",
      model: "claude-3-5-haiku-20241022",
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
    });

    // Store assistant response
    await ctx.runMutation(api.baselineChat.addChatMessage, {
      userId: args.userId,
      baselineAnswerId: args.baselineAnswerId,
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  },
});

/**
 * Build psychoanalysis prompt for initial summary
 */
function buildAnalysisPrompt(answers: any, scores?: any): string {
  return `You are an empathetic AI psychoanalyst providing personalized insights based on a user's baseline self-analysis questionnaire. Your role is to generate a warm, conversational summary that helps them understand their psychological patterns.

**User's Baseline Answers:**

**Emotional Landscape:**
- Emotional Frequency: ${answers.emotionalFrequency || "Not provided"}
- Stress Recovery Time: ${answers.stressRecovery || "Not provided"}
- Typical Mood: ${answers.typicalMood || "Not provided"}
- Emotional Awareness: ${answers.emotionalAwareness || "Not provided"}
- Good Day Description: ${answers.goodDayDescription || "Not provided"}

**Cognitive Patterns:**
- Decision Style: ${answers.decisionStyle || "Not provided"}
- Overthinking Tendency: ${answers.overthinking || "Not provided"}
- Reaction to Setback: ${answers.reactionToSetback || "Not provided"}

**Motivation & Focus:**
- Motivation Type: ${answers.motivationType || "Not provided"}
- Focus Trigger: ${answers.focusTrigger || "Not provided"}
- Success Definition: ${answers.successDefinition || "Not provided"}

**Behavioral Rhythms:**
- Routine Consistency: ${answers.consistency || "Not provided"}
- Reflection Frequency: ${answers.reflectionFrequency || "Not provided"}
- Reset Strategy: ${answers.resetStrategy || "Not provided"}

**Social & Self-Perception:**
- Social Energy Level: ${answers.socialLevel || "Not provided"}
- Recharge Method: ${answers.rechargeMethod || "Not provided"}
- Self-Understanding: ${answers.selfUnderstanding || "Not provided"}
- Self-Improvement Focus: ${answers.selfImprovementFocus || "Not provided"}

${scores ? `**Computed Baseline Scores:**
- Baseline Index: ${scores.baseline_index}/100
- Emotional Stability: ${scores.emotional_stability}/100
- Cognitive Rationality: ${scores.cognitive_rationality}/100
- Resilience: ${scores.resilience}/100
- Confidence: ${scores.confidence}%` : ""}

**Instructions:**
Write a personalized, conversational psychoanalysis summary (400-600 words) that:
1. Acknowledges their unique psychological profile with warmth
2. Identifies key patterns across emotional, cognitive, and behavioral dimensions
3. Highlights strengths and areas for growth
4. Provides 2-3 actionable insights they can reflect on
5. Uses accessible language—avoid clinical jargon
6. Feels like a conversation with a supportive psychologist, not an academic report

Start with a friendly greeting that references something specific from their answers.`;
}

/**
 * Build system prompt for ongoing chat
 */
function buildChatSystemPrompt(answers?: any): string {
  return `You are an empathetic AI psychologist assistant helping a user understand their psychological baseline profile. You have access to their self-analysis questionnaire responses and should reference them naturally in conversation.

**Context about the user:**
${answers ? `
- Emotional patterns: ${answers.emotionalFrequency}, ${answers.typicalMood}
- Stress recovery: ${answers.stressRecovery}
- Decision style: ${answers.decisionStyle}
- Motivation: ${answers.motivationType}
- Social preference: ${answers.socialLevel}, recharges via ${answers.rechargeMethod}
- Self-improvement focus: ${answers.selfImprovementFocus}
` : "No baseline data available yet."}

**Your role:**
- Be warm, conversational, and supportive
- Answer questions about their psychological patterns
- Provide insights based on their specific answers
- Suggest practical techniques when relevant
- Keep responses concise (2-4 paragraphs unless asked for more detail)
- Reference their actual answers when relevant to build trust

**Tone:** Professional yet friendly, like a skilled therapist in a comfortable session.`;
}
