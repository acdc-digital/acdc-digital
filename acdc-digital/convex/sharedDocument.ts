import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create the shared dashboard document
export const getOrCreateSharedDocument = mutation({
  args: {},
  returns: v.id("documents"),
  handler: async (ctx) => {
    // Look for existing shared document
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", "system"))
      .filter((q) => q.eq(q.field("title"), "Dashboard Shared Document"))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create the shared document if it doesn't exist
    const now = Date.now();
    const initialContent = '<p>Welcome to your collaborative document! Use the chat to have AI generate content here.</p>';
    
    const documentId = await ctx.db.insert("documents", {
      title: "Dashboard Shared Document",
      content: initialContent,
      description: "Shared collaborative document for the dashboard",
      createdBy: "system",
      createdAt: now,
      updatedAt: now,
      searchableText: "Welcome to your collaborative document! Use the chat to have AI generate content here.",
      isSystemGenerated: true,
    });

    console.log(`Created shared dashboard document: ${documentId}`);
    return documentId;
  },
});

// Get the shared document (read-only)
export const getSharedDocument = query({
  args: {},
  returns: v.union(v.id("documents"), v.null()),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", "system"))
      .filter((q) => q.eq(q.field("title"), "Dashboard Shared Document"))
      .first();

    return existing?._id || null;
  },
});

// Get document content
export const getDocumentContent = query({
  args: { documentId: v.id("documents") },
  returns: v.union(v.object({
    content: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  }), v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return null;
    
    return {
      content: doc.content || '<p>No content yet.</p>',
      title: doc.title,
      updatedAt: doc.updatedAt,
    };
  },
});

// Update document content
export const updateDocumentContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    // Extract plain text for search
    const searchableText = args.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    await ctx.db.patch(args.documentId, {
      content: args.content,
      searchableText,
      updatedAt: Date.now(),
    });

    console.log(`Updated document content: ${args.documentId}`);
  },
});

// Utility to reset the shared document (for debugging)
export const resetSharedDocument = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find and delete existing shared document
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", "system"))
      .filter((q) => q.eq(q.field("title"), "Dashboard Shared Document"))
      .first();

    if (existing) {
      // Delete from documents table
      await ctx.db.delete(existing._id);
      console.log("Deleted shared document from database");
    }
  },
});