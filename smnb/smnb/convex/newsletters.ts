/**
 * Newsletter Functions - Working with existing editor_documents table
 * Provides newsletter-specific queries and operations for content stored in editor_documents
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Save or update newsletter content in editor_documents
export const saveNewsletter = mutation({
  args: {
    storyId: v.string(),
    newsletter_content: v.string(),
    metadata: v.object({
      // Accept but ignore extra metadata fields for now
      title: v.string(),
      summary: v.string(),
      tags: v.array(v.string()),
      sentiment: v.string(),
      priority: v.union(v.string(), v.number()),
      date: v.string(),
    }),
  },
  returns: v.id("editor_documents"),
  handler: async (ctx, args) => {
    // Try to find existing document by storyId
    const existing = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", q => q.eq("story_id", args.storyId))
      .first();

    const now = Date.now();
    if (existing) {
      // Update existing document
      await ctx.db.patch(existing._id, {
        newsletter_content: args.newsletter_content,
        newsletter_generated_at: now,
        updated_at: now,
      });
      console.log(`💾 Updated existing newsletter for story: ${args.storyId}`);
      return existing._id;
    } else {
      // Insert new document
      const docId = await ctx.db.insert("editor_documents", {
        story_id: args.storyId,
        newsletter_content: args.newsletter_content,
        newsletter_generated_at: now,
        created_at: now,
        updated_at: now,
      });
      console.log(`💾 Created new newsletter for story: ${args.storyId}`);
      return docId;
    }
  },
});

// Get newsletter content by story ID from editor_documents
export const getNewsletterByStoryId = query({
  args: { storyId: v.string() },
  returns: v.union(v.null(), v.object({
    _id: v.id("editor_documents"),
    _creationTime: v.number(),
    story_id: v.string(),
    newsletter_content: v.optional(v.string()),
    newsletter_generated_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })),
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", q => q.eq("story_id", args.storyId))
      .first();
    
    // Only return if it has newsletter content
    if (document && document.newsletter_content) {
      console.log(`📰 Found existing newsletter for story: ${args.storyId}`);
      return document;
    }
    
    console.log(`📰 No newsletter found for story: ${args.storyId}`);
    return null;
  },
});

// Get all recent newsletters
export const getLatestNewsletters = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("editor_documents"),
    _creationTime: v.number(),
    story_id: v.string(),
    newsletter_content: v.string(),
    newsletter_generated_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("editor_documents")
      .order("desc")
      .take(args.limit || 20);
    
    // Filter to only documents with newsletter content
    const newsletters = documents
      .filter(doc => doc.newsletter_content && doc.newsletter_content.length > 0)
      .map(doc => ({
        ...doc,
        newsletter_content: doc.newsletter_content!
      }));
    
    console.log(`📋 Retrieved ${newsletters.length} newsletters`);
    return newsletters;
  },
});

// Track newsletter views (simple increment in editor_documents)
export const incrementNewsletterViews = mutation({
  args: { 
    storyId: v.string() 
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", q => q.eq("story_id", args.storyId))
      .first();
    
    if (document && document.newsletter_content) {
      // Update the updated_at timestamp to track viewing
      await ctx.db.patch(document._id, {
        updated_at: Date.now()
      });
      
      console.log(`� Newsletter view tracked for story: ${args.storyId}`);
    }
  },
});

// Get newsletter statistics
export const getNewsletterStats = query({
  args: {},
  returns: v.object({
    totalNewsletters: v.number(),
    recentNewsletters: v.number(),
    averageLength: v.number(),
    mostRecentGeneration: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    // Get all documents with newsletter content
    const allDocuments = await ctx.db.query("editor_documents").collect();
    
    const newsletters = allDocuments.filter(doc => 
      doc.newsletter_content && doc.newsletter_content.length > 0
    );
    
    const totalNewsletters = newsletters.length;
    const recentNewsletters = newsletters.filter(doc => 
      doc.newsletter_generated_at && 
      (Date.now() - doc.newsletter_generated_at) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
    ).length;
    
    const averageLength = newsletters.length > 0 
      ? Math.round(newsletters.reduce((sum, doc) => sum + (doc.newsletter_content?.length || 0), 0) / newsletters.length)
      : 0;
    
    const mostRecentGeneration = Math.max(
      ...newsletters.map(doc => doc.newsletter_generated_at || 0)
    );

    return {
      totalNewsletters,
      recentNewsletters,
      averageLength,
      mostRecentGeneration: mostRecentGeneration > 0 ? mostRecentGeneration : undefined,
    };
  },
});

// Newsletter functions are exported individually above
// No default export needed for Convex functions