import { query, mutation } from "../_generated/server";
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
    startTime: v.optional(v.number()),
    totalDuration: v.optional(v.number()),
    lastActiveTime: v.optional(v.number()),
    // Broadcast fields
    broadcastState: v.optional(v.union(
      v.literal("idle"),
      v.literal("initializing"),
      v.literal("ready"),
      v.literal("starting"),
      v.literal("live"),
      v.literal("stopping"),
      v.literal("error")
    )),
    isLive: v.optional(v.boolean()),
    hostActive: v.optional(v.boolean()),
    producerActive: v.optional(v.boolean()),
    liveFeedActive: v.optional(v.boolean()),
    broadcastStartedAt: v.optional(v.number()),
    broadcastStoppedAt: v.optional(v.number()),
    broadcastDuration: v.optional(v.number()),
    broadcastError: v.optional(v.string()),
    lastBroadcastSync: v.optional(v.number()),
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
      startTime: v.optional(v.number()),
      totalDuration: v.optional(v.number()),
      lastActiveTime: v.optional(v.number()),
      // Broadcast fields
      broadcastState: v.optional(v.union(
        v.literal("idle"),
        v.literal("initializing"),
        v.literal("ready"),
        v.literal("starting"),
        v.literal("live"),
        v.literal("stopping"),
        v.literal("error")
      )),
      isLive: v.optional(v.boolean()),
      hostActive: v.optional(v.boolean()),
      producerActive: v.optional(v.boolean()),
      liveFeedActive: v.optional(v.boolean()),
      broadcastStartedAt: v.optional(v.number()),
      broadcastStoppedAt: v.optional(v.number()),
      broadcastDuration: v.optional(v.number()),
      broadcastError: v.optional(v.string()),
      lastBroadcastSync: v.optional(v.number()),
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

// Start session timer (when user opens/activates a session)
export const startSessionTimer = mutation({
  args: { id: v.id("sessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

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

    const now = Date.now();
    await ctx.db.patch(args.id, {
      startTime: now,
      lastActiveTime: now,
    });
    return null;
  },
});

// Update session duration (called periodically from client)
export const updateSessionDuration = mutation({
  args: {
    id: v.id("sessions"),
    additionalMilliseconds: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

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

    const currentDuration = session.totalDuration ?? 0;
    await ctx.db.patch(args.id, {
      totalDuration: currentDuration + args.additionalMilliseconds,
      lastActiveTime: Date.now(),
    });
    return null;
  },
});

// Pause session timer (when user switches to another session)
export const pauseSessionTimer = mutation({
  args: {
    id: v.id("sessions"),
    finalDuration: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

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
      totalDuration: args.finalDuration,
      lastActiveTime: Date.now(),
    });
    return null;
  },
});

// Update broadcast state (called by orchestrator)
export const updateBroadcastState = mutation({
  args: {
    id: v.id("sessions"),
    broadcastState: v.union(
      v.literal("idle"),
      v.literal("initializing"),
      v.literal("ready"),
      v.literal("starting"),
      v.literal("live"),
      v.literal("stopping"),
      v.literal("error")
    ),
    isLive: v.boolean(),
    hostActive: v.boolean(),
    producerActive: v.boolean(),
    liveFeedActive: v.boolean(),
    broadcastError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

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

    const now = Date.now();
    const updates: {
      broadcastState: typeof args.broadcastState;
      isLive: boolean;
      hostActive: boolean;
      producerActive: boolean;
      liveFeedActive: boolean;
      lastBroadcastSync: number;
      broadcastStartedAt?: number;
      broadcastStoppedAt?: number;
      broadcastDuration?: number;
      broadcastError?: string;
    } = {
      broadcastState: args.broadcastState,
      isLive: args.isLive,
      hostActive: args.hostActive,
      producerActive: args.producerActive,
      liveFeedActive: args.liveFeedActive,
      lastBroadcastSync: now,
    };

    // Track broadcast start/stop times
    if (args.broadcastState === 'live' && !session.broadcastStartedAt) {
      updates.broadcastStartedAt = now;
    }

    if (args.broadcastState === 'idle' && session.broadcastStartedAt) {
      updates.broadcastStoppedAt = now;
      updates.broadcastDuration = now - session.broadcastStartedAt;
    }

    // Update error message if provided
    if (args.broadcastError !== undefined) {
      updates.broadcastError = args.broadcastError;
    }

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

// Get broadcast state for a session
export const getBroadcastState = query({
  args: { id: v.id("sessions") },
  returns: v.union(
    v.object({
      broadcastState: v.union(
        v.literal("idle"),
        v.literal("initializing"),
        v.literal("ready"),
        v.literal("starting"),
        v.literal("live"),
        v.literal("stopping"),
        v.literal("error")
      ),
      isLive: v.boolean(),
      hostActive: v.boolean(),
      producerActive: v.boolean(),
      liveFeedActive: v.boolean(),
      broadcastStartedAt: v.optional(v.number()),
      broadcastStoppedAt: v.optional(v.number()),
      broadcastDuration: v.optional(v.number()),
      broadcastError: v.optional(v.string()),
      lastBroadcastSync: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return null;
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) {
      return null;
    }

    return {
      broadcastState: session.broadcastState ?? 'idle',
      isLive: session.isLive ?? false,
      hostActive: session.hostActive ?? false,
      producerActive: session.producerActive ?? false,
      liveFeedActive: session.liveFeedActive ?? false,
      broadcastStartedAt: session.broadcastStartedAt,
      broadcastStoppedAt: session.broadcastStoppedAt,
      broadcastDuration: session.broadcastDuration,
      broadcastError: session.broadcastError,
      lastBroadcastSync: session.lastBroadcastSync,
    };
  },
});

// Get session statistics (story count, token usage, cost)
export const getSessionStats = query({
  args: { id: v.id("sessions") },
  returns: v.union(
    v.object({
      storyCount: v.number(),
      totalTokens: v.number(),
      inputTokens: v.number(),
      outputTokens: v.number(),
      totalCost: v.number(),
      avgStoryLength: v.number(),
      lastStoryAt: v.union(v.number(), v.null()),
      firstStoryAt: v.union(v.number(), v.null()),
      totalDuration: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return null;
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) {
      return null;
    }

    // Convert session ID to string for comparison (schema uses v.string() for session_id)
    const sessionIdString = args.id;

    // Count stories for this session
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_session_id", q => q.eq("session_id", sessionIdString))
      .collect();

    // Calculate story metrics
    const storyCount = stories.length;
    const totalStoryLength = stories.reduce((sum, story) => sum + (story.narrative?.length ?? 0), 0);
    const avgStoryLength = storyCount > 0 ? Math.round(totalStoryLength / storyCount) : 0;
    
    // Get first and last story timestamps
    const firstStoryAt = stories.length > 0 
      ? Math.min(...stories.map(s => s._creationTime)) 
      : null;
    const lastStoryAt = stories.length > 0 
      ? Math.max(...stories.map(s => s._creationTime)) 
      : null;

    // Sum tokens and costs for this session
    const tokenRecords = await ctx.db
      .query("token_usage")
      .withIndex("by_session_id", q => q.eq("session_id", sessionIdString))
      .collect();

    const totalTokens = tokenRecords.reduce((sum, record) => sum + record.total_tokens, 0);
    const inputTokens = tokenRecords.reduce((sum, record) => sum + record.input_tokens, 0);
    const outputTokens = tokenRecords.reduce((sum, record) => sum + record.output_tokens, 0);
    const totalCost = tokenRecords.reduce((sum, record) => sum + record.estimated_cost, 0);

    return {
      storyCount,
      totalTokens,
      inputTokens,
      outputTokens,
      totalCost,
      avgStoryLength,
      lastStoryAt,
      firstStoryAt,
      totalDuration: session.totalDuration ?? 0,
    };
  },
});