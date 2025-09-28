// MESSAGES - Convex functions for session messages
// /Users/matthewsimon/Projects/SMNB/smnb/convex/messages.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { sessionId: v.id("sessions") },
  returns: v.array(v.object({
    _id: v.id("messages"),
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    tokens: v.optional(v.number()),
    model: v.optional(v.string()),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const send = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    tokens: v.optional(v.number()),
    model: v.optional(v.string()),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    // Update session last_active time
    const now = Date.now();
    await ctx.db.patch(args.sessionId, {
      last_active: now,
      updated_at: now,
    });
    
    // Create the message
    return await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      tokens: args.tokens,
      model: args.model,
      created_at: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clear = mutation({
  args: { sessionId: v.id("sessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});