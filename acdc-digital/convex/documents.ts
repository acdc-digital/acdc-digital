import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new collaborative document
export const createDocument = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create the document record
    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      description: args.description,
      createdBy: "anonymous", // TODO: Replace with actual user ID when auth is implemented
      createdAt: now,
      updatedAt: now,
    });

    // Don't initialize content here - let the editor do it
    // This prevents format conflicts
    
    return documentId;
  },
});

// Get a specific document
export const getDocument = query({
  args: { id: v.id("documents") },
  returns: v.union(
    v.object({
      _id: v.id("documents"),
      title: v.string(),
      description: v.optional(v.string()),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      searchableText: v.optional(v.string()),
      lastVersion: v.optional(v.number()),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List all documents
export const listDocuments = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("documents"),
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    searchableText: v.optional(v.string()),
    lastVersion: v.optional(v.number()),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("documents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

// Update document metadata
export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    if (Object.keys(updates).length === 0) {
      return;
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a document
export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // TODO: Also clean up the collaborative document data
    // This would require additional methods from the prosemirror sync component
    await ctx.db.delete(args.id);
  },
});

// Search documents by text content
export const searchDocuments = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("documents"),
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    searchableText: v.optional(v.string()),
    lastVersion: v.optional(v.number()),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    if (!args.query.trim()) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withSearchIndex("search_text", (q) =>
        q.search("searchableText", args.query)
      )
      .take(limit);
  },
});