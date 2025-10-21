// REDDIT FEED
// /Users/matthewsimon/Projects/SMNB/smnb/convex/redditFeed.ts

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Store live feed posts with additional metadata
export const storeLiveFeedPosts = mutation({
  args: {
    posts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      author: v.optional(v.string()),
      subreddit: v.optional(v.string()),
      url: v.string(),
      permalink: v.string(),
      score: v.optional(v.number()), // Optional: some posts may not have score
      num_comments: v.optional(v.number()), // Optional: some posts may not have comment count
      created_utc: v.number(),
      thumbnail: v.string(),
      selftext: v.string(),
      is_video: v.boolean(),
      domain: v.string(),
      upvote_ratio: v.number(),
      over_18: v.boolean(),
      attributesJson: v.optional(v.string()),
      source: v.string(), // e.g. "technology/hot", "all/rising"
      addedAt: v.number(),
      batchId: v.string(), // unique ID for each batch fetch
    })),
  batchId: v.string(),
  },
  handler: async (ctx, args) => {
    // Debug: log incoming payload details to help diagnose cases where requested === 0
    // Removed verbose logging for cleaner development experience
    // Append new batch posts (do not delete previous batches). Skip posts that
    // already exist by Reddit ID to avoid duplicate entries when the same posts
    // are fetched multiple times across batches.
    // Collect recent posts and build a set of existing Reddit IDs to avoid duplicates.
    // Take returns an array of documents directly; no .collect() needed here.
    // Efficient pre-check: query for any existing posts with the candidate ids
    const candidateIds = args.posts.map(p => p.id);

    // Query for existing by id using a filter of or(eq(id, x), ...)
    const existingMatchesQuery = ctx.db.query('live_feed_posts');
    // Build a set of existing ids by scanning recent documents where id matches any candidate
    let recentMatches: Array<Record<string, unknown>> = [];
    if (candidateIds.length > 0) {
      recentMatches = await existingMatchesQuery
        .filter((q) => q.or(...candidateIds.map(id => q.eq(q.field('id'), id))))
        .take(1000);
    }

    const existingIds = new Set(recentMatches.map((p) => String(p['id'])));

    // Silent operation - only log errors if they occur

    const toInsert = args.posts.filter(p => !existingIds.has(p.id));

    const insertPromises = toInsert.map((post) => ctx.db.insert("live_feed_posts", post));
    const results = await Promise.all(insertPromises);

    // Return the exact inserted IDs so the client can deterministically know what persisted
    // ctx.db.insert returns the new document id (string) in the Convex runtime.
    // Map results to strings and filter out any non-string values.
    const insertedIds = (results as unknown[])
      .filter((r): r is string => typeof r === 'string')
      .map(r => r);

    return {
      requested: args.posts.length,
      inserted: results.length,
      skipped: args.posts.length - results.length,
      insertedIds,
      // Helpful for debugging: which candidate ids we considered already existing
      existingIds: Array.from(existingIds),
      existingMatchesCount: recentMatches.length,
    };
  },
});

// Get current live feed posts
export const getLiveFeedPosts = query({
  args: {
    limit: v.optional(v.number()),
    batchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.batchId) {
      // Get posts from specific batch
      return await ctx.db
        .query("live_feed_posts")
        .filter((q) => q.eq(q.field("batchId"), args.batchId!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      // Get most recent posts ordered by addedAt descending
      return await ctx.db
        .query("live_feed_posts")
        .withIndex("by_addedAt")
        .order("desc")
        .take(args.limit || 50);
    }
  },
});

// Note: Editor document functions removed - editor functionality has been removed

// Host Sessions Functions
export const createHostSession = mutation({
  args: {
    session_id: v.string(),
    title: v.optional(v.string()),
    personality: v.string(),
    verbosity: v.string(),
    context_window: v.number(),
    update_frequency: v.number(),
    session_metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if session already exists
    const existing = await ctx.db
      .query("host_sessions")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    if (existing) {
      console.log(`♻️ Host session ${args.session_id} already exists, returning existing session`);
      return existing._id;
    }

    // Create new session
    const sessionId = await ctx.db.insert("host_sessions", {
      session_id: args.session_id,
      title: args.title || `Host Session - ${new Date().toLocaleString()}`,
      status: "active" as const,
      created_at: Date.now(),
      personality: args.personality,
      verbosity: args.verbosity,
      context_window: args.context_window,
      update_frequency: args.update_frequency,
      total_narrations: 0,
      total_words: 0,
      total_duration: 0,
      items_processed: 0,
      session_metadata: args.session_metadata,
    });

    // Create corresponding host document for this session
    await ctx.db.insert("host_documents", {
      session_id: args.session_id,
      content_text: "",
      word_count: 0,
      character_count: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
      source_posts: [],
    });

    console.log(`🎙️ Created host session: ${args.session_id}`);
    return sessionId;
  },
});

export const endHostSession = mutation({
  args: {
    session_id: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("host_sessions")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    if (!session) {
      throw new Error(`Host session ${args.session_id} not found`);
    }

    if (session.status === "ended") {
      console.log(`⚠️ Host session ${args.session_id} already ended`);
      return session._id;
    }

    // Calculate total session duration
    const duration = Math.floor((Date.now() - session.created_at) / 1000);

    await ctx.db.patch(session._id, {
      status: "ended" as const,
      ended_at: Date.now(),
      total_duration: duration,
    });

    console.log(`🎙️ Ended host session: ${args.session_id} (duration: ${duration}s)`);
    return session._id;
  },
});

export const updateHostSessionContent = mutation({
  args: {
    session_id: v.string(),
    content_text: v.string(),
    current_narration_id: v.optional(v.string()),
    narration_type: v.optional(v.union(
      v.literal("breaking"),
      v.literal("developing"),
      v.literal("analysis"),
      v.literal("summary"),
      v.literal("commentary")
    )),
    tone: v.optional(v.union(
      v.literal("urgent"),
      v.literal("informative"),
      v.literal("conversational"),
      v.literal("dramatic")
    )),
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    source_posts: v.optional(v.array(v.string())),
    generation_metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the host document for this session
    const hostDoc = await ctx.db
      .query("host_documents")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    if (!hostDoc) {
      throw new Error(`Host document not found for session ${args.session_id}`);
    }

    // Calculate word and character counts
    const wordCount = args.content_text.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = args.content_text.length;

    // Update the host document
    const updates: Record<string, unknown> = {
      content_text: args.content_text,
      word_count: wordCount,
      character_count: characterCount,
      updated_at: Date.now(),
    };

    if (args.current_narration_id) updates.current_narration_id = args.current_narration_id;
    if (args.narration_type) updates.last_narration_type = args.narration_type;
    if (args.tone) updates.last_tone = args.tone;
    if (args.priority) updates.last_priority = args.priority;
    if (args.source_posts) updates.source_posts = args.source_posts;
    if (args.generation_metadata) updates.generation_metadata = args.generation_metadata;

    try {
      await ctx.db.patch(hostDoc._id, updates);
      console.log(`📝 Updated host session content: ${args.session_id} (${wordCount} words)`);
    } catch (error) {
      // Log OCC conflicts as warnings instead of errors - they're expected under high concurrency
      if (error instanceof Error && error.message.includes('OptimisticConcurrencyControlFailure')) {
        console.warn(`⚠️ Concurrent update on host document ${hostDoc._id} - update may have been applied by another call`);
        // Don't throw - OCC failures are acceptable in high-concurrency scenarios
        // The other concurrent operation likely succeeded with similar data
      } else {
        throw error;
      }
    }
    
    return hostDoc._id;
  },
});

export const incrementHostSessionStats = mutation({
  args: {
    session_id: v.string(),
    narrations_increment: v.optional(v.number()),
    words_increment: v.optional(v.number()),
    items_increment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("host_sessions")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    if (!session) {
      throw new Error(`Host session ${args.session_id} not found`);
    }

    const updates: Record<string, unknown> = {};

    if (args.narrations_increment) {
      updates.total_narrations = session.total_narrations + args.narrations_increment;
    }
    if (args.words_increment) {
      updates.total_words = session.total_words + args.words_increment;
    }
    if (args.items_increment) {
      updates.items_processed = session.items_processed + args.items_increment;
    }

    await ctx.db.patch(session._id, updates);

    return session._id;
  },
});

export const getHostSession = query({
  args: {
    session_id: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("host_sessions")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    return session;
  },
});

export const getHostSessionWithContent = query({
  args: {
    session_id: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("host_sessions")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    if (!session) {
      return null;
    }

    const hostDoc = await ctx.db
      .query("host_documents")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    return {
      session,
      content: hostDoc,
    };
  },
});

export const listHostSessions = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("ended"), v.literal("archived"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("host_sessions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit || 10);
    } else {
      return await ctx.db
        .query("host_sessions")
        .order("desc")
        .take(args.limit || 10);
    }
  },
});

export const getActiveHostSession = query({
  args: {},
  handler: async (ctx) => {
    const activeSessions = await ctx.db
      .query("host_sessions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(1);

    return activeSessions[0] || null;
  },
});

// Host Documents Functions (Legacy - deprecated in favor of session-based approach)
// These functions are kept for backward compatibility only

// Migration function to convert legacy host documents to session-based structure
export const migrateHostDocumentsToSessions = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Starting migration of host documents to session-based structure...');
    
    // Get all host documents that don't have a session_id
    const legacyDocs = await ctx.db
      .query("host_documents")
      .filter((q) => q.eq(q.field("session_id"), undefined))
      .collect();
    
    console.log(`📄 Found ${legacyDocs.length} legacy host documents to migrate`);
    
    let migratedCount = 0;
    let sessionCount = 0;
    
    for (const doc of legacyDocs) {
      try {
        // Create a session for this document if it has meaningful content
        if (doc.content_text && doc.content_text.trim().length > 0) {
          const sessionId = `legacy-session-${doc.document_id || Date.now()}`;
          
          // Create the session
          await ctx.db.insert("host_sessions", {
            session_id: sessionId,
            title: doc.title || `Legacy Session - ${new Date(doc.created_at).toLocaleString()}`,
            status: "ended" as const, // Mark legacy sessions as ended
            created_at: doc.created_at,
            ended_at: doc.updated_at,
            personality: "professional", // Default personality
            verbosity: "medium", // Default verbosity
            context_window: 5, // Default context window
            update_frequency: 2000, // Default update frequency
            total_narrations: 1, // Assume 1 narration per legacy document
            total_words: doc.word_count || 0,
            total_duration: Math.floor((doc.updated_at - doc.created_at) / 1000),
            items_processed: 1,
            session_metadata: JSON.stringify({
              migrated_from: doc.document_id,
              legacy_document: true,
              original_status: doc.status
            })
          });
          
          sessionCount++;
          
          // Update the document to reference the session
          await ctx.db.patch(doc._id, {
            session_id: sessionId,
            last_narration_type: doc.narration_type,
            last_tone: doc.tone,
            last_priority: doc.priority
          });
          
          migratedCount++;
          console.log(`✅ Migrated document ${doc.document_id} to session ${sessionId}`);
        } else {
          // Delete empty documents
          await ctx.db.delete(doc._id);
          console.log(`🗑️ Deleted empty document ${doc.document_id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate document ${doc.document_id}:`, error);
      }
    }
    
    console.log(`✅ Migration completed: ${migratedCount} documents migrated, ${sessionCount} sessions created`);
    
    return {
      totalLegacyDocs: legacyDocs.length,
      migratedDocs: migratedCount,
      sessionsCreated: sessionCount
    };
  },
});

export const getHostDocumentBySession = query({
  args: {
    session_id: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("host_documents")
      .withIndex("by_session_id", (q) => q.eq("session_id", args.session_id))
      .first();

    return document;
  },
});

export const listHostDocuments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("host_documents")
      .order("desc")
      .take(args.limit || 10);

    return documents;
  },
});

// Legacy function for backward compatibility (will be removed when hostAgentService is updated)
export const updateHostDocument = mutation({
  args: {
    document_id: v.string(),
    title: v.optional(v.string()),
    content_text: v.optional(v.string()),
    content_json: v.optional(v.string()),
    generated_by_agent: v.optional(v.boolean()),
    narration_type: v.optional(v.union(
      v.literal("breaking"),
      v.literal("developing"),
      v.literal("analysis"),
      v.literal("summary"),
      v.literal("commentary")
    )),
    tone: v.optional(v.union(
      v.literal("urgent"),
      v.literal("informative"),
      v.literal("conversational"),
      v.literal("dramatic")
    )),
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    source_posts: v.optional(v.array(v.string())),
    generation_metadata: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // For legacy compatibility, create a temporary session for this document
    const sessionId = `legacy-${args.document_id}`;
    
    // Check if session exists
    const existingSession = await ctx.db
      .query("host_sessions")
      .withIndex("by_session_id", (q) => q.eq("session_id", sessionId))
      .first();
    
    if (!existingSession) {
      // Create a session for this legacy document
      await ctx.db.insert("host_sessions", {
        session_id: sessionId,
        title: args.title || "Legacy Host Session",
        status: "active" as const,
        created_at: Date.now(),
        personality: "professional",
        verbosity: "medium",
        context_window: 5,
        update_frequency: 2000,
        total_narrations: 1,
        total_words: args.content_text?.split(/\s+/).filter(word => word.length > 0).length || 0,
        total_duration: 0,
        items_processed: 1,
        session_metadata: JSON.stringify({
          legacy_document_id: args.document_id,
          migration_type: "legacy_compatibility"
        })
      });
    }
    
    // Update or create the host document
    const existingDoc = await ctx.db
      .query("host_documents")
      .withIndex("by_session_id", (q) => q.eq("session_id", sessionId))
      .first();
    
    const contentText = args.content_text || "";
    const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = contentText.length;
    
    if (!existingDoc) {
      const id = await ctx.db.insert("host_documents", {
        session_id: sessionId,
        content_text: contentText,
        content_json: args.content_json || "{}",
        word_count: wordCount,
        character_count: characterCount,
        created_at: Date.now(),
        updated_at: Date.now(),
        last_narration_type: args.narration_type,
        last_tone: args.tone,
        last_priority: args.priority,
        source_posts: args.source_posts,
        generation_metadata: args.generation_metadata,
        // Legacy fields
        document_id: args.document_id,
        title: args.title,
        version: 1,
        status: "draft" as const,
        generated_by_agent: args.generated_by_agent || false,
        narration_type: args.narration_type,
        tone: args.tone,
        priority: args.priority,
      });
      
      console.log(`📺 Created legacy host document: ${args.document_id}`);
      return id;
    } else {
      await ctx.db.patch(existingDoc._id, {
        content_text: contentText,
        word_count: wordCount,
        character_count: characterCount,
        updated_at: Date.now(),
        last_narration_type: args.narration_type,
        last_tone: args.tone,
        last_priority: args.priority,
        source_posts: args.source_posts,
        generation_metadata: args.generation_metadata,
        // Legacy fields
        title: args.title,
        version: (existingDoc.version || 1) + 1,
        generated_by_agent: args.generated_by_agent,
        narration_type: args.narration_type,
        tone: args.tone,
        priority: args.priority,
      });
      
      console.log(`🎙️ Updated legacy host document: ${args.document_id}`);
      return existingDoc._id;
    }
  },
});
