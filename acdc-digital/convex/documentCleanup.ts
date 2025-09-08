import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

// Clean up and fix document format issues
export const cleanupDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    try {
      console.log(`Cleaning up document: ${args.documentId}`);
      
      // Delete any existing ProseMirror document to start fresh
      try {
        await ctx.runMutation(components.prosemirrorSync.lib.deleteDocument, {
          id: args.documentId,
        });
        console.log("Deleted existing ProseMirror document");
      } catch {
        console.log("No existing ProseMirror document to delete");
      }

      // Create a clean initial document with proper BlockNote format
      const cleanBlocks = [{
        id: `paragraph-${Date.now()}`,
        type: "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
          textAlignment: "left"
        },
        content: [{
          type: "text",
          text: "Document cleaned and ready for use!",
          styles: {}
        }],
        children: []
      }];

      // Submit the clean snapshot
      await ctx.runMutation(components.prosemirrorSync.lib.submitSnapshot, {
        id: args.documentId,
        content: JSON.stringify(cleanBlocks),
        version: 1,
      });

      console.log(`Document ${args.documentId} cleaned successfully`);
      return true;
    } catch (error) {
      console.error("Failed to cleanup document:", error);
      return false;
    }
  },
});

// Force reset all shared documents
export const resetAllSharedDocuments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("Resetting all shared documents...");
    
    // Find all system documents
    const systemDocs = await ctx.db
      .query("documents")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", "system"))
      .collect();

    for (const doc of systemDocs) {
      try {
        // Delete ProseMirror document
        await ctx.runMutation(components.prosemirrorSync.lib.deleteDocument, {
          id: doc._id,
        });
        console.log(`Deleted ProseMirror for document: ${doc._id}`);
      } catch {
        console.log(`No ProseMirror document found for: ${doc._id}`);
      }

      // Delete from documents table
      await ctx.db.delete(doc._id);
      console.log(`Deleted document: ${doc._id}`);
    }

    console.log("All shared documents reset");
  },
});