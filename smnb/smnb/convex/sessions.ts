// SESSIONS - Convex functions for session management
// /Users/matthewsimon/Projects/SMNB/smnb/convex/sessions.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const sessionSettingsValidator = v.object({
  model: v.string(),
  temperature: v.number(),
  maxTokens: v.number(),
  topP: v.number(),
  frequencyPenalty: v.number(),
  presencePenalty: v.number(),
  controlMode: v.union(
    v.literal("hands-free"),
    v.literal("balanced"),
    v.literal("full-control")
  ),
});

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("sessions"),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    lastActive: v.string(),
    settings: sessionSettingsValidator,
    _creationTime: v.number(),
  })),
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").collect();
    return sessions.map(session => ({
      ...session,
      lastActive: new Date(session.last_active).toISOString(),
    }));
  },
});

export const get = query({
  args: { id: v.id("sessions") },
  returns: v.union(
    v.object({
      _id: v.id("sessions"),
      name: v.string(),
      status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
      settings: sessionSettingsValidator,
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    settings: sessionSettingsValidator,
  },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("sessions", {
      name: args.name,
      status: "active",
      settings: args.settings,
      created_at: now,
      updated_at: now,
      last_active: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("sessions"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      name: args.name,
      updated_at: now,
      last_active: now,
    });
  },
});

export const updateSettings = mutation({
  args: {
    id: v.id("sessions"),
    settings: sessionSettingsValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      settings: args.settings,
      updated_at: now,
      last_active: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("sessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete all messages in this session first
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Then delete the session
    await ctx.db.delete(args.id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("sessions") },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) {
      throw new Error("Session not found");
    }
    
    const now = Date.now();
    return await ctx.db.insert("sessions", {
      name: `${session.name} (Copy)`,
      status: "active",
      settings: session.settings,
      created_at: now,
      updated_at: now,
      last_active: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("sessions"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.status,
      updated_at: now,
      last_active: now,
    });
  },
});