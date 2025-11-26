// RESEARCH CONVEX FUNCTIONS - Database operations for research sessions
// /Users/matthewsimon/Projects/LifeOS/LifeOS/convex/research.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new research session
export const createResearchSession = mutation({
  args: {
    sessionId: v.string(),
    originalQuery: v.string(),
    generatedTitle: v.string(),
    complexity: v.union(v.literal("simple"), v.literal("medium"), v.literal("complex")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, originalQuery, generatedTitle, complexity, userId = "anonymous" }) => {
    const now = Date.now();
    
    return await ctx.db.insert("researchSessions", {
      userId,
      sessionId,
      originalQuery,
      generatedTitle,
      complexity,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });
  },
});

// Update research session with results
export const updateResearchSession = mutation({
  args: {
    sessionId: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("researching"), v.literal("completed"), v.literal("failed"))),
    summary: v.optional(v.string()),
    canvas: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    citations: v.optional(v.array(v.object({
      title: v.string(),
      url: v.optional(v.string()),
      sourceType: v.union(
        v.literal("web"),
        v.literal("academic"),
        v.literal("document"),
        v.literal("internal"),
        v.literal("disclosure"),
        v.literal("news"),
        v.literal("reference"),
        v.literal("other")
      ),
      snippet: v.optional(v.string()),
      confidence: v.number(),
      dateAccessed: v.number(),
    }))),
    confidence: v.optional(v.number()),
    tokensUsed: v.optional(v.number()),
    timeElapsed: v.optional(v.number()),
    researchPlan: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...updates } = args;
    
    // Find the research session
    const session = await ctx.db
      .query("researchSessions")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .first();
    
    if (!session) {
      throw new Error(`Research session ${sessionId} not found`);
    }

    // Update with provided fields
    return await ctx.db.patch(session._id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update canvas with copywriter agent enhancement
export const updateCanvasWithCopywriter = mutation({
  args: {
    sessionId: v.string(),
    followUpQuery: v.string(),
    newResearchSummary: v.string(),
    newKeyPoints: v.optional(v.array(v.string())),
    newCitations: v.optional(v.array(v.object({
      title: v.string(),
      url: v.optional(v.string()),
      sourceType: v.union(
        v.literal("web"),
        v.literal("academic"),
        v.literal("document"),
        v.literal("internal"),
        v.literal("disclosure"),
        v.literal("news"),
        v.literal("reference"),
        v.literal("other")
      ),
      snippet: v.optional(v.string()),
      confidence: v.number(),
      dateAccessed: v.number(),
    }))),
    enhancedCanvas: v.string(), // The copywriter agent's output
    integrationNotes: v.optional(v.string()),
  },
  handler: async (ctx, { 
    sessionId, 
    followUpQuery, 
    newResearchSummary, 
    newKeyPoints, 
    newCitations,
    enhancedCanvas,
    integrationNotes
  }) => {
    // Find the research session
    const session = await ctx.db
      .query("researchSessions")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .first();
    
    if (!session) {
      throw new Error(`Research session ${sessionId} not found`);
    }

    // Merge key points and citations
    const mergedKeyPoints = [
      ...(session.keyPoints || []),
      ...(newKeyPoints || [])
    ];

    const mergedCitations = [
      ...(session.citations || []),
      ...(newCitations || [])
    ];

    // Update the session with copywriter's enhanced canvas
    return await ctx.db.patch(session._id, {
      summary: newResearchSummary, // Latest discrete response
      canvas: enhancedCanvas, // Copywriter agent's enhanced version
      keyPoints: mergedKeyPoints,
      citations: mergedCitations,
      updatedAt: Date.now(),
    });
  },
});

// Update canvas with follow-up research (intelligent integration)
export const updateCanvas = mutation({
  args: {
    sessionId: v.string(),
    followUpQuery: v.string(),
    newResearchSummary: v.string(),
    newKeyPoints: v.optional(v.array(v.string())),
    newCitations: v.optional(v.array(v.object({
      title: v.string(),
      url: v.optional(v.string()),
      sourceType: v.union(
        v.literal("web"),
        v.literal("academic"),
        v.literal("document"),
        v.literal("internal"),
        v.literal("disclosure"),
        v.literal("news"),
        v.literal("reference"),
        v.literal("other")
      ),
      snippet: v.optional(v.string()),
      confidence: v.number(),
      dateAccessed: v.number(),
    }))),
  },
  handler: async (ctx, { sessionId, followUpQuery, newResearchSummary, newKeyPoints, newCitations }) => {
    // Find the research session
    const session = await ctx.db
      .query("researchSessions")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .first();
    
    if (!session) {
      throw new Error(`Research session ${sessionId} not found`);
    }

    // Build the canvas intelligently
    const currentCanvas = session.canvas || session.summary || '';
    
    // Create an integrated canvas that weaves new research into existing content
    const updatedCanvas = currentCanvas ? 
      `${currentCanvas}

## ${followUpQuery}

${newResearchSummary}` : 
      newResearchSummary;

    // Merge key points and citations
    const mergedKeyPoints = [
      ...(session.keyPoints || []),
      ...(newKeyPoints || [])
    ];

    const mergedCitations = [
      ...(session.citations || []),
      ...(newCitations || [])
    ];

    // Update the session
    return await ctx.db.patch(session._id, {
      summary: newResearchSummary, // Latest discrete response
      canvas: updatedCanvas, // Continuous master document
      keyPoints: mergedKeyPoints,
      citations: mergedCitations,
      updatedAt: Date.now(),
    });
  },
});

// Get research sessions for a user (most recent first)
export const getUserResearchSessions = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("completed"), v.literal("failed"), v.literal("all"))),
  },
  handler: async (ctx, { userId = "anonymous", limit = 50, status = "all" }) => {
    let query = ctx.db
      .query("researchSessions")
      .filter((q) => q.and(
        q.eq(q.field("userId"), userId),
        q.neq(q.field("isDeleted"), true)
      ));

    // Filter by status if specified
    if (status !== "all") {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }

    return await query
      .order("desc")
      .take(limit);
  },
});

// Get a specific research session by sessionId
export const getResearchSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("researchSessions")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .first();
  },
});

// Get recent research sessions for context-aware canvas building
export const getRecentResearchSessions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    excludeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, limit = 5, excludeSessionId }) => {
    let query = ctx.db
      .query("researchSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .filter((q) => q.eq(q.field("status"), "completed"));

    // Exclude specific session if provided
    if (excludeSessionId) {
      query = query.filter((q) => q.neq(q.field("sessionId"), excludeSessionId));
    }

    return await query
      .order("desc")
      .take(limit);
  },
});

// Get research sessions by status
export const getResearchSessionsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("researching"), v.literal("completed"), v.literal("failed")),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, userId = "anonymous", limit = 20 }) => {
    return await ctx.db
      .query("researchSessions")
      .filter((q) => q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("status"), status),
        q.neq(q.field("isDeleted"), true)
      ))
      .order("desc")
      .take(limit);
  },
});

// Delete a research session (soft delete)
export const deleteResearchSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId = "anonymous" }) => {
    const session = await ctx.db
      .query("researchSessions")
      .filter((q) => q.and(
        q.eq(q.field("sessionId"), sessionId),
        q.eq(q.field("userId"), userId)
      ))
      .first();

    if (!session) {
      throw new Error(`Research session ${sessionId} not found`);
    }

    return await ctx.db.patch(session._id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});

// Get research session statistics for a user
export const getUserResearchStats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId = "anonymous" }) => {
    const sessions = await ctx.db
      .query("researchSessions")
      .filter((q) => q.and(
        q.eq(q.field("userId"), userId),
        q.neq(q.field("isDeleted"), true)
      ))
      .collect();

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === "completed").length;
    const failedSessions = sessions.filter(s => s.status === "failed").length;
    const totalTokens = sessions.reduce((sum, s) => sum + (s.tokensUsed || 0), 0);
    const averageTime = sessions.filter(s => s.timeElapsed).length > 0 
      ? sessions.reduce((sum, s) => sum + (s.timeElapsed || 0), 0) / sessions.filter(s => s.timeElapsed).length
      : 0;

    return {
      totalSessions,
      completedSessions,
      failedSessions,
      successRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
      totalTokens,
      averageTime,
    };
  },
});
