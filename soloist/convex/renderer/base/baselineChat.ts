import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Add message to chat history
 */
export const addChatMessage = mutation({
  args: {
    userId: v.id("users"),
    baselineAnswerId: v.id("baseline_answers"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  returns: v.id("baseline_chats"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("baseline_chats", {
      userId: args.userId,
      baselineAnswerId: args.baselineAnswerId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get all chat messages for a baseline
 */
export const getChatMessages = query({
  args: {
    baselineAnswerId: v.id("baseline_answers"),
  },
  returns: v.array(
    v.object({
      _id: v.id("baseline_chats"),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("baseline_chats")
      .withIndex("by_baselineAnswerId", (q) => q.eq("baselineAnswerId", args.baselineAnswerId))
      .order("asc")
      .collect();

    return messages.map((msg) => ({
      _id: msg._id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  },
});

/**
 * Get recent messages (for context window)
 */
export const getRecentMessages = query({
  args: {
    baselineAnswerId: v.id("baseline_answers"),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("baseline_chats")
      .withIndex("by_baselineAnswerId", (q) => q.eq("baselineAnswerId", args.baselineAnswerId))
      .order("desc")
      .take(args.limit);

    return messages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  },
});

/**
 * Internal: Get baseline answers (for actions)
 */
export const getBaselineAnswers = internalQuery({
  args: {
    baselineAnswerId: v.id("baseline_answers"),
  },
  returns: v.union(
    v.object({
      _id: v.id("baseline_answers"),
      _creationTime: v.number(),
      userId: v.id("users"),
      emotionalFrequency: v.optional(v.string()),
      stressRecovery: v.optional(v.string()),
      typicalMood: v.optional(v.string()),
      emotionalAwareness: v.optional(v.string()),
      goodDayDescription: v.optional(v.string()),
      decisionStyle: v.optional(v.string()),
      overthinking: v.optional(v.string()),
      reactionToSetback: v.optional(v.string()),
      motivationType: v.optional(v.string()),
      focusTrigger: v.optional(v.string()),
      successDefinition: v.optional(v.string()),
      consistency: v.optional(v.string()),
      reflectionFrequency: v.optional(v.string()),
      resetStrategy: v.optional(v.string()),
      socialLevel: v.optional(v.string()),
      rechargeMethod: v.optional(v.string()),
      selfUnderstanding: v.optional(v.string()),
      selfImprovementFocus: v.optional(v.string()),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.baselineAnswerId);
  },
});

/**
 * Internal: Track Anthropic usage
 */
export const trackAnthropicUsage = internalMutation({
  args: {
    userId: v.id("users"),
    feature: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const totalTokens = args.promptTokens + args.completionTokens;

    // Claude 3.5 Haiku pricing: $1.00 per 1M input tokens, $5.00 per 1M output tokens
    const inputCost = (args.promptTokens / 1_000_000) * 1.00;
    const outputCost = (args.completionTokens / 1_000_000) * 5.00;
    const totalCost = (inputCost + outputCost) * 100; // Store in cents

    // Get user's authId for the anthropicUsage table
    const user = await ctx.db.get(args.userId);
    if (!user || !user.authId) {
      throw new Error("User not found or missing authId");
    }

    await ctx.db.insert("anthropicUsage", {
      userId: user.authId,
      feature: args.feature,
      model: args.model,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens,
      cost: totalCost,
      createdAt: Date.now(),
    });

    return null;
  },
});
