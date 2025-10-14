/**
 * FEDS Document Management - Vector-enabled document corpus
 * 
 * Provides CRUD operations and vector search capabilities for the FEDS
 * (Federal/Expert Document System) corpus used by the session manager.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// ============================================================================
// Validators
// ============================================================================

const documentTypeValidator = v.union(
  v.literal("statistic"),
  v.literal("report"),
  v.literal("guideline"),
  v.literal("policy"),
  v.literal("fact")
);

const verificationStatusValidator = v.union(
  v.literal("verified"),
  v.literal("pending"),
  v.literal("draft")
);

// ============================================================================
// Mutations - Document Creation & Management
// ============================================================================

/**
 * Create a new FEDS document with embedding
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    documentType: documentTypeValidator,
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    embedding: v.array(v.number()),
    embeddingModel: v.string(),
    relevanceScore: v.optional(v.number()),
    verificationStatus: verificationStatusValidator,
  },
  returns: v.id("feds_documents"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("feds_documents", {
      title: args.title,
      content: args.content,
      summary: args.summary,
      documentType: args.documentType,
      category: args.category,
      tags: args.tags,
      source: args.source,
      embedding: args.embedding,
      embeddingModel: args.embeddingModel,
      relevanceScore: args.relevanceScore,
      verificationStatus: args.verificationStatus,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
    });
  },
});

/**
 * Update an existing FEDS document
 */
export const update = mutation({
  args: {
    documentId: v.id("feds_documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    summary: v.optional(v.string()),
    documentType: v.optional(documentTypeValidator),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    embedding: v.optional(v.array(v.number())),
    embeddingModel: v.optional(v.string()),
    relevanceScore: v.optional(v.number()),
    verificationStatus: v.optional(verificationStatusValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    
    await ctx.db.patch(documentId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a FEDS document
 */
export const deleteDocument = mutation({
  args: {
    documentId: v.id("feds_documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId);
  },
});

/**
 * Internal mutation to track document access
 */
export const trackAccess = internalMutation({
  args: {
    documentId: v.id("feds_documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (doc) {
      await ctx.db.patch(args.documentId, {
        lastAccessedAt: Date.now(),
        accessCount: (doc.accessCount || 0) + 1,
      });
    }
  },
});

// ============================================================================
// Queries - Document Retrieval
// ============================================================================

/**
 * Get a single document by ID
 */
export const get = query({
  args: {
    documentId: v.id("feds_documents"),
  },
  returns: v.union(
    v.object({
      _id: v.id("feds_documents"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      summary: v.optional(v.string()),
      documentType: documentTypeValidator,
      category: v.string(),
      tags: v.array(v.string()),
      source: v.optional(v.string()),
      embedding: v.array(v.number()),
      embeddingModel: v.string(),
      relevanceScore: v.optional(v.number()),
      verificationStatus: verificationStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
      lastAccessedAt: v.optional(v.number()),
      accessCount: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * List documents with optional filters
 */
export const list = query({
  args: {
    category: v.optional(v.string()),
    documentType: v.optional(documentTypeValidator),
    verificationStatus: v.optional(verificationStatusValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("feds_documents"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    documentType: documentTypeValidator,
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    embedding: v.array(v.number()),
    embeddingModel: v.string(),
    relevanceScore: v.optional(v.number()),
    verificationStatus: verificationStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
    lastAccessedAt: v.optional(v.number()),
    accessCount: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    let query = ctx.db.query("feds_documents");
    
    // Apply filters using indexes
    if (args.category) {
      query = query.withIndex("by_category", (q) => q.eq("category", args.category));
    } else if (args.documentType) {
      query = query.withIndex("by_type", (q) => q.eq("documentType", args.documentType));
    } else if (args.verificationStatus) {
      query = query.withIndex("by_verification", (q) => 
        q.eq("verificationStatus", args.verificationStatus)
      );
    }
    
    const limit = args.limit || 50;
    return await query.take(limit);
  },
});

/**
 * Full-text search across documents
 */
export const search = query({
  args: {
    searchQuery: v.string(),
    category: v.optional(v.string()),
    documentType: v.optional(documentTypeValidator),
    verificationStatus: v.optional(verificationStatusValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("feds_documents"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    documentType: documentTypeValidator,
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    relevanceScore: v.optional(v.number()),
    verificationStatus: verificationStatusValidator,
    createdAt: v.number(),
    _score: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let searchQuery = ctx.db
      .query("feds_documents")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", args.searchQuery);
        
        if (args.category) {
          search = search.eq("category", args.category);
        }
        if (args.documentType) {
          search = search.eq("documentType", args.documentType);
        }
        if (args.verificationStatus) {
          search = search.eq("verificationStatus", args.verificationStatus);
        }
        
        return search;
      });
    
    const results = await searchQuery.take(limit);
    
    // Map results with search score
    type SearchResult = typeof results[number] & { _score: number };
    return (results as SearchResult[]).map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      title: r.title,
      content: r.content,
      summary: r.summary,
      documentType: r.documentType,
      category: r.category,
      tags: r.tags,
      source: r.source,
      relevanceScore: r.relevanceScore,
      verificationStatus: r.verificationStatus,
      createdAt: r.createdAt,
      _score: r._score,
    }));
  },
});

/**
 * Vector search - find semantically similar documents
 */
export const vectorSearch = query({
  args: {
    embedding: v.array(v.number()),
    category: v.optional(v.string()),
    documentType: v.optional(documentTypeValidator),
    verificationStatus: v.optional(verificationStatusValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("feds_documents"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    documentType: documentTypeValidator,
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    relevanceScore: v.optional(v.number()),
    verificationStatus: verificationStatusValidator,
    createdAt: v.number(),
    _score: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let vectorQuery = ctx.db
      .query("feds_documents")
      .withIndex("by_embedding", (q) => {
        let search = q.vector(args.embedding);
        
        if (args.category) {
          search = search.eq("category", args.category);
        }
        if (args.documentType) {
          search = search.eq("documentType", args.documentType);
        }
        if (args.verificationStatus) {
          search = search.eq("verificationStatus", args.verificationStatus);
        }
        
        return search;
      });
    
    const results = await vectorQuery.take(limit);
    
    // Map results with similarity score
    type VectorSearchResult = typeof results[number] & { _score: number };
    return (results as VectorSearchResult[]).map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      title: r.title,
      content: r.content,
      summary: r.summary,
      documentType: r.documentType,
      category: r.category,
      tags: r.tags,
      source: r.source,
      relevanceScore: r.relevanceScore,
      verificationStatus: r.verificationStatus,
      createdAt: r.createdAt,
      _score: r._score,
    }));
  },
});

/**
 * Get document statistics
 */
export const getStats = query({
  args: {},
  returns: v.object({
    totalDocuments: v.number(),
    byCategory: v.array(v.object({
      category: v.string(),
      count: v.number(),
    })),
    byType: v.array(v.object({
      type: documentTypeValidator,
      count: v.number(),
    })),
    byVerification: v.object({
      verified: v.number(),
      pending: v.number(),
      draft: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const allDocs = await ctx.db.query("feds_documents").collect();
    
    // Group by category
    const categoryMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const verificationCounts = { verified: 0, pending: 0, draft: 0 };
    
    for (const doc of allDocs) {
      // Count by category
      categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
      
      // Count by type
      typeMap.set(doc.documentType, (typeMap.get(doc.documentType) || 0) + 1);
      
      // Count by verification
      verificationCounts[doc.verificationStatus]++;
    }
    
    return {
      totalDocuments: allDocs.length,
      byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      })),
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({
        type: type as Doc<"feds_documents">["documentType"],
        count,
      })),
      byVerification: verificationCounts,
    };
  },
});
