import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { api } from "../_generated/api";

// Add a completed story to history
export const addStory = mutation({
  args: {
    story_id: v.string(),
    narrative: v.string(),
    title: v.optional(v.string()),
    tone: v.union(
      v.literal("breaking"),
      v.literal("developing"), 
      v.literal("analysis"),
      v.literal("opinion"),
      v.literal("human-interest")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    agent_type: v.literal("host"),
    duration: v.number(),
    word_count: v.number(),
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    )),
    topics: v.optional(v.array(v.string())),
    summary: v.optional(v.string()),
    created_at: v.number(),
    completed_at: v.number(),
    session_id: v.string(), // ✅ REQUIRED - Link story to session (no longer optional)
    original_item: v.optional(v.object({
      title: v.string(),
      author: v.optional(v.string()), // Optional: subreddit reference posts don't have authors
      subreddit: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ✅ VALIDATE SESSION ID IS NOT EMPTY
    if (!args.session_id || args.session_id.trim() === '') {
      throw new Error('session_id is required and cannot be empty');
    }
    
    console.log(`💾 Creating story for session: ${args.session_id}`);
    
    const storyId = await ctx.db.insert("story_history", args);
    
    console.log(`✅ Story ${args.story_id} created and linked to session ${args.session_id}`);
    
    // 🔥 ENGINE: Emit story_created event
    try {
      // Extract concepts from narrative (simple keyword extraction)
      const concepts = args.narrative
        .toLowerCase()
        .match(/\b[a-z]{4,}\b/g) // Words 4+ chars
        ?.filter((word, index, arr) => arr.indexOf(word) === index) // Unique
        .slice(0, 20) || []; // Top 20
      
      await ctx.runMutation(api.engine.emitEvent.emitStoryCreated, {
        post_id: args.original_item?.url || args.story_id,
        story_id: args.story_id,
        session_id: args.session_id,
        subreddit: args.original_item?.subreddit,
        entities: [], // Could extract from metadata if available
        sentiment: args.sentiment === "positive" ? 0.8 : args.sentiment === "negative" ? -0.8 : 0,
        quality: 85, // Default quality for Host stories
        categories: args.topics,
        story_themes: args.topics || [],
        story_concepts: concepts,
        is_cross_post: false, // Could be enhanced based on metadata
      });
      console.log(`🔥 ENGINE: Story event emitted for ${args.story_id}`);
    } catch (error) {
      console.warn(`⚠️ ENGINE: Failed to emit story event:`, error);
      // Don't fail the story creation if Engine event fails
    }
    
    return storyId;
  },
});

// Get all stories (optionally filtered by session)
export const getStories = query({
  args: {
    limit: v.optional(v.number()),
    sessionId: v.optional(v.string()), // Filter by session ID
  },
  handler: async (ctx, args) => {
    if (args.sessionId) {
      // Filter by session ID - return ALL stories for this session
      const stories = await ctx.db
        .query("story_history")
        .withIndex("by_session_id", (q) => q.eq("session_id", args.sessionId))
        .order("desc")
        .collect(); // No limit - return ALL stories
      return stories;
    }
    
    // No session filter - return ALL stories (no limit)
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_completed_at")
      .order("desc")
      .collect(); // No limit - return ALL stories
    return stories;
  },
});

// Get recent stories within a time window (optionally filtered by session)
export const getRecentStories = query({
  args: {
    hours: v.optional(v.number()),
    limit: v.optional(v.number()),
    sessionId: v.optional(v.string()), // Filter by session ID
  },
  handler: async (ctx, args) => {
    const hoursAgo = args.hours || 24;
    const cutoffTime = Date.now() - (hoursAgo * 60 * 60 * 1000);
    
    if (args.sessionId) {
      // Filter by session ID AND time window - return ALL matching stories
      const stories = await ctx.db
        .query("story_history")
        .withIndex("by_session_id", (q) => q.eq("session_id", args.sessionId))
        .filter((q) => q.gte(q.field("completed_at"), cutoffTime))
        .order("desc")
        .collect(); // No limit - return ALL matching stories
      return stories;
    }
    
    // No session filter - return ALL recent stories (no limit)
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_completed_at")
      .filter((q) => q.gte(q.field("completed_at"), cutoffTime))
      .order("desc")
      .collect(); // No limit - return ALL matching stories
    
    return stories;
  },
});

// Get stories by session ID specifically
export const getStoriesBySession = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100; // Default to 100 most recent stories to prevent timeout
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.sessionId))
      .order("desc")
      .take(limit); // Use take() with limit to prevent timeout
    
    return stories;
  },
});
