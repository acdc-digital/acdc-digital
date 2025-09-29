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
    userId: v.id("users"),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    lastActive: v.string(),
    settings: sessionSettingsValidator,
    _creationTime: v.number(),
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    return sessions.map(session => ({
      ...session,
      lastActive: new Date(session._creationTime).toISOString(),
    }));
  },
});

export const get = query({
  args: { id: v.id("sessions") },
  returns: v.union(
    v.object({
      _id: v.id("sessions"),
      userId: v.id("users"),
      name: v.string(),
      status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
      settings: sessionSettingsValidator,
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) {
      return null;
    }
    return session;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    settings: sessionSettingsValidator,
  },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found. Please make sure you're properly signed in.");
    }

    return await ctx.db.insert("sessions", {
      userId: user._id,
      name: args.name,
      status: "active",
      settings: args.settings,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found or access denied");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
    });
    return null;
  },
});

export const updateSettings = mutation({
  args: {
    id: v.id("sessions"),
    settings: sessionSettingsValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found or access denied");
    }

    await ctx.db.patch(args.id, {
      settings: args.settings,
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("sessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found or access denied");
    }

    // Check if this is the user's last session
    const allUserSessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .collect();

    if (allUserSessions.length <= 1) {
      throw new Error("Cannot delete the last remaining session. Users must have at least one session.");
    }

    await ctx.db.delete(args.id);
    // Also delete associated messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sessionId", q => q.eq("sessionId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    return null;
  },
});

export const duplicate = mutation({
  args: { id: v.id("sessions") },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    const original = await ctx.db.get(args.id);
    if (!original || original.userId !== user._id) {
      throw new Error("Session not found or access denied");
    }

    return await ctx.db.insert("sessions", {
      userId: user._id,
      name: `${original.name} (Copy)`,
      status: "paused",
      settings: original.settings,
    });
  },
});

// Get session count for current user
export const getSessionCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      return 0;
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .collect();
    
    return sessions.length;
  },
});