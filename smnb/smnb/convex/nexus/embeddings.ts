import { v } from "convex/values";
import { query, mutation, internalQuery } from "../_generated/server";

// Utility: cosine similarity between two number arrays
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export const createEmbedding = mutation({
  args: {
    sessionId: v.string(),
    sourceType: v.union(v.literal("chat"), v.literal("document")),
    messageId: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
    chunkIndex: v.optional(v.number()),
    text: v.string(),
    vector: v.array(v.number()),
    model: v.string(),
    metadata: v.optional(v.string()),
  },
  returns: v.id("embeddings"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("embeddings", {
      sessionId: args.sessionId,
      sourceType: args.sourceType,
      messageId: args.messageId,
      documentId: args.documentId,
      chunkIndex: args.chunkIndex,
      text: args.text,
      vector: args.vector,
      model: args.model,
      metadata: args.metadata,
      createdAt: now,
    });
  },
});

export const queryEmbeddingsBySession = query({
  args: {
    sessionId: v.string(),
    sourceType: v.optional(v.union(v.literal("chat"), v.literal("document"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("embeddings"),
    sessionId: v.string(),
    sourceType: v.optional(v.union(v.literal("chat"), v.literal("document"))),
    messageId: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
    chunkIndex: v.optional(v.number()),
    text: v.string(),
    vector: v.array(v.number()),
    model: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const { sessionId, sourceType, limit = 50 } = args;
    
    const results = await ctx.db
      .query("embeddings")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .collect();
    
    // Filter by sourceType if provided
    const filtered = sourceType
      ? results.filter(e => e.sourceType === sourceType)
      : results;
    
    return filtered.slice(0, limit);
  },
});

// Simple search: fetch session embeddings and return top K by cosine similarity
export const searchEmbeddings = internalQuery({
  args: {
    sessionId: v.string(),
    queryVector: v.array(v.number()),
    sourceType: v.optional(v.union(v.literal("chat"), v.literal("document"))),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sessionId, queryVector, sourceType, topK = 5 } = args;

    // Fetch all embeddings for this session
    let query = ctx.db.query("embeddings")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId));

    const allEmbeddings = await query.collect();

    // Filter by sourceType if provided
    const embeddings = sourceType
      ? allEmbeddings.filter(e => e.sourceType === sourceType)
      : allEmbeddings;

    // Compute cosine similarity for each embedding
    const scored = embeddings.map((row) => ({
      row,
      score: cosineSimilarity(queryVector, row.vector),
    }));

    // Sort by score (descending) and take top K
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topK).map(s => ({
      _id: s.row._id,
      sessionId: s.row.sessionId,
      sourceType: s.row.sourceType,
      messageId: s.row.messageId,
      documentId: s.row.documentId,
      chunkIndex: s.row.chunkIndex,
      text: s.row.text,
      vector: s.row.vector,
      model: s.row.model,
      score: s.score,
      createdAt: s.row.createdAt,
    }));

    return top;
  },
});

// Global document search: search across ALL document embeddings (not session-scoped)
export const searchDocumentsGlobal = internalQuery({
  args: {
    queryVector: v.array(v.number()),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { queryVector, topK = 5 } = args;

    // Fetch ALL document embeddings across all sessions
    const allEmbeddings = await ctx.db
      .query("embeddings")
      .collect();

    // Filter to only document embeddings
    const documentEmbeddings = allEmbeddings.filter(e => e.sourceType === "document");

    console.log(`[searchDocumentsGlobal] Found ${documentEmbeddings.length} total document embeddings`);

    // Compute cosine similarity for each embedding
    const scored = documentEmbeddings.map((row) => ({
      row,
      score: cosineSimilarity(queryVector, row.vector),
    }));

    // Sort by score (descending) and take top K
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topK).map(s => ({
      _id: s.row._id,
      sessionId: s.row.sessionId,
      sourceType: s.row.sourceType,
      messageId: s.row.messageId,
      documentId: s.row.documentId,
      chunkIndex: s.row.chunkIndex,
      text: s.row.text,
      vector: s.row.vector,
      model: s.row.model,
      score: s.score,
      createdAt: s.row.createdAt,
    }));

    return top;
  },
});
