import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new chat message
export const create = mutation({
  args: {
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
    
    return messageId;
  },
});

// Get chat messages for a session
export const getBySession = query({
  args: { sessionId: v.string() },
  returns: v.array(v.object({
    _id: v.id("chatMessages"),
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
    
    return messages;
  },
});

// Clear all messages for a session
export const clearSession = mutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

// Get recent messages for context (useful for AI)
export const getRecentMessages = query({
  args: { 
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);
    
    // Return in chronological order (oldest first) for AI context
    return messages
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  },
});