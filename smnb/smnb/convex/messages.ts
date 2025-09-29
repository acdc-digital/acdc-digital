import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const list = query({
  args: { sessionId: v.id("sessions") },
  returns: v.array(v.object({
    _id: v.id("messages"),
    sessionId: v.id("sessions"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", q => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    // Create user message
    const messageId = await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      content: args.content,
      role: args.role,
    });

    // If this is a user message, schedule AI response generation
    if (args.role === "user") {
      try {
        // Get recent conversation history for context
        const recentMessages = await ctx.db
          .query("messages")
          .withIndex("by_sessionId", q => q.eq("sessionId", args.sessionId))
          .order("desc")
          .take(10);

        const conversationHistory = recentMessages
          .reverse()
          .slice(0, -1) // Remove the message we just inserted
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));

        // Schedule the AI response generation action
        await ctx.scheduler.runAfter(0, api.chatAgent.generateAIResponse, {
          sessionId: args.sessionId,
          userMessage: args.content,
          conversationHistory
        });

      } catch (error) {
        console.error("Error scheduling AI response generation:", error);
        // Create fallback response immediately
        await ctx.db.insert("messages", {
          sessionId: args.sessionId,
          content: "I'm experiencing some technical difficulties. Please try again in a moment. You can use commands like /chat, /analyze, or /help-chat to interact with me.",
          role: "assistant",
        });
      }
    }

    return messageId;
  },
});

// Helper mutation to insert assistant messages (called by the action)
export const insertAssistantMessage = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      content: args.content,
      role: "assistant",
    });
  },
});

// Helper mutation to log token usage
export const logTokenUsage = mutation({
  args: {
    requestId: v.string(),
    model: v.string(),
    action: v.union(v.literal("generate"), v.literal("stream"), v.literal("analyze"), v.literal("test")),
    inputTokens: v.number(),
    outputTokens: v.number(),
    estimatedCost: v.number(),
    sessionId: v.optional(v.string()),
    duration: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  returns: v.id("token_usage"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("token_usage", {
      request_id: args.requestId,
      timestamp: Date.now(),
      model: args.model,
      action: args.action,
      input_tokens: args.inputTokens,
      output_tokens: args.outputTokens,
      total_tokens: args.inputTokens + args.outputTokens,
      estimated_cost: args.estimatedCost,
      request_type: "producer", // Chat is considered producer type
      duration: args.duration,
      success: args.success,
      error_message: args.errorMessage,
      session_id: args.sessionId,
      has_tools: false, // Chat doesn't use tools currently
    });
  },
});