import { v } from "convex/values";
import { query, mutation, internalQuery } from "../_generated/server";

/**
 * Internal query to get a single document by ID
 */
export const getDocument = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Create a new document record
 */
export const createDocument = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    fileUrl: v.string(),
    storageId: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    metadata: v.optional(v.string()),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      sessionId: args.sessionId,
      name: args.name,
      fileUrl: args.fileUrl,
      storageId: args.storageId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      status: "uploading",
      uploadedAt: now,
      metadata: args.metadata,
    });
  },
});

/**
 * Update document status and processing results
 */
export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    chunkCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: {
      status: "uploading" | "processing" | "ready" | "error";
      chunkCount?: number;
      errorMessage?: string;
      processedAt?: number;
    } = {
      status: args.status,
    };

    if (args.chunkCount !== undefined) {
      updates.chunkCount = args.chunkCount;
    }

    if (args.errorMessage !== undefined) {
      updates.errorMessage = args.errorMessage;
    }

    if (args.status === "ready" || args.status === "error") {
      updates.processedAt = now;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Get all documents for a session
 */
export const getDocumentsBySession = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("documents"),
    sessionId: v.string(),
    name: v.string(),
    fileUrl: v.string(),
    storageId: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    chunkCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    uploadedAt: v.number(),
    processedAt: v.optional(v.number()),
    metadata: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});

/**
 * Delete a document and its associated embeddings
 */
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete associated embeddings
    const embeddings = await ctx.db
      .query("embeddings")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const embedding of embeddings) {
      await ctx.db.delete(embedding._id);
    }

    // Delete the document record
    await ctx.db.delete(args.documentId);

    // Note: File deletion from storage should be handled separately
    // using ctx.storage.delete(document.storageId)
  },
});

/**
 * Get embedding chunks for a specific document
 */
export const getDocumentChunks = query({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.array(v.object({
    _id: v.id("embeddings"),
    chunkIndex: v.optional(v.number()),
    text: v.string(),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const embeddings = await ctx.db
      .query("embeddings")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();

    // Sort by chunkIndex if available
    embeddings.sort((a, b) => {
      if (a.chunkIndex === undefined) return 1;
      if (b.chunkIndex === undefined) return -1;
      return a.chunkIndex - b.chunkIndex;
    });

    return embeddings.map(e => ({
      _id: e._id,
      chunkIndex: e.chunkIndex,
      text: e.text,
      createdAt: e.createdAt,
    }));
  },
});
