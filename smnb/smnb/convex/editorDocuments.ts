// CONVEX EDITOR DOCUMENTS
// /Users/matthewsimon/Projects/SMNB/smnb/convex/editorDocuments.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Content type for the editor documents
export type ContentType = "blog" | "newsletter" | "analysis" | "social" | "context";

// Get editor document by story ID
export const getEditorDocument = query({
  args: { storyId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", (q) => q.eq("story_id", args.storyId))
      .first();
    
    return doc;
  },
});

// Create or update editor document with specific content type
export const updateEditorContent = mutation({
  args: {
    storyId: v.string(),
    contentType: v.union(
      v.literal("blog"),
      v.literal("newsletter"), 
      v.literal("analysis"),
      v.literal("social"),
      v.literal("context")
    ),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { storyId, contentType, content } = args;
    const now = Date.now();
    
    // Check if document already exists
    const existingDoc = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", (q) => q.eq("story_id", storyId))
      .first();
    
    if (existingDoc) {
      // Update existing document
      const updates: any = {
        updated_at: now,
      };
      
      // Set content field based on type
      switch (contentType) {
        case "blog":
          updates.blog_content = content;
          updates.blog_generated_at = now;
          break;
        case "newsletter":
          updates.newsletter_content = content;
          updates.newsletter_generated_at = now;
          break;
        case "analysis":
          updates.analysis_content = content;
          updates.analysis_generated_at = now;
          break;
        case "social":
          updates.social_content = content;
          updates.social_generated_at = now;
          break;
        case "context":
          updates.context_content = content;
          updates.context_generated_at = now;
          break;
      }
      
      await ctx.db.patch(existingDoc._id, updates);
      return existingDoc._id;
    } else {
      // Create new document
      const newDoc: any = {
        story_id: storyId,
        created_at: now,
        updated_at: now,
      };
      
      // Set content field based on type
      switch (contentType) {
        case "blog":
          newDoc.blog_content = content;
          newDoc.blog_generated_at = now;
          break;
        case "newsletter":
          newDoc.newsletter_content = content;
          newDoc.newsletter_generated_at = now;
          break;
        case "analysis":
          newDoc.analysis_content = content;
          newDoc.analysis_generated_at = now;
          break;
        case "social":
          newDoc.social_content = content;
          newDoc.social_generated_at = now;
          break;
        case "context":
          newDoc.context_content = content;
          newDoc.context_generated_at = now;
          break;
      }
      
      return await ctx.db.insert("editor_documents", newDoc);
    }
  },
});

// Check if specific content type already exists for a story
export const hasContent = query({
  args: {
    storyId: v.string(),
    contentType: v.union(
      v.literal("blog"),
      v.literal("newsletter"),
      v.literal("analysis"),
      v.literal("social"),
      v.literal("context")
    ),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", (q) => q.eq("story_id", args.storyId))
      .first();
    
    if (!doc) return false;
    
    switch (args.contentType) {
      case "blog":
        return !!doc.blog_content;
      case "newsletter":
        return !!doc.newsletter_content;
      case "analysis":
        return !!doc.analysis_content;
      case "social":
        return !!doc.social_content;
      case "context":
        return !!doc.context_content;
      default:
        return false;
    }
  },
});

// Get specific content type for a story
export const getContent = query({
  args: {
    storyId: v.string(),
    contentType: v.union(
      v.literal("blog"),
      v.literal("newsletter"),
      v.literal("analysis"),
      v.literal("social"),
      v.literal("context")
    ),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", (q) => q.eq("story_id", args.storyId))
      .first();
    
    if (!doc) return null;
    
    switch (args.contentType) {
      case "blog":
        return doc.blog_content || null;
      case "newsletter":
        return doc.newsletter_content || null;
      case "analysis":
        return doc.analysis_content || null;
      case "social":
        return doc.social_content || null;
      case "context":
        return doc.context_content || null;
      default:
        return null;
    }
  },
});

// Delete editor document for a story
export const deleteEditorDocument = mutation({
  args: { storyId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", (q) => q.eq("story_id", args.storyId))
      .first();
    
    if (doc) {
      await ctx.db.delete(doc._id);
      return true;
    }
    
    return false;
  },
});

// List all editor documents (for debugging/admin)
export const listAllEditorDocuments = query({
  handler: async (ctx) => {
    return await ctx.db.query("editor_documents").collect();
  },
});