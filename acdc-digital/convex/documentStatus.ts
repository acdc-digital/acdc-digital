import { query } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

// Check if a document is properly formatted and ready for BlockNote
export const checkDocumentReadiness = query({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.object({
    isReady: v.boolean(),
    hasContent: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Check if the document exists in our database
      const doc = await ctx.db.get(args.documentId);
      if (!doc) {
        return {
          isReady: false,
          hasContent: false,
          error: "Document not found"
        };
      }

      // Check if there's a ProseMirror document
      let prosemirrorDoc;
      try {
        prosemirrorDoc = await ctx.runQuery(components.prosemirrorSync.lib.getSnapshot, {
          id: args.documentId,
        });
      } catch {
        return {
          isReady: false,
          hasContent: false,
          error: "ProseMirror document not found"
        };
      }

      if (!prosemirrorDoc) {
        return {
          isReady: false,
          hasContent: false,
          error: "ProseMirror document is null"
        };
      }

      // Check if the document has valid content
      let parsedContent;
      try {
        if (!prosemirrorDoc.content) {
          return {
            isReady: false,
            hasContent: false,
            error: "Document content is null"
          };
        }

        parsedContent = JSON.parse(prosemirrorDoc.content);
        
        // Validate that it's an array of blocks
        if (!Array.isArray(parsedContent)) {
          return {
            isReady: false,
            hasContent: false,
            error: "Content is not an array of blocks"
          };
        }

        // Validate block structure
        for (const block of parsedContent) {
          if (!block.id || !block.type || !block.props || !Array.isArray(block.children)) {
            return {
              isReady: false,
              hasContent: true,
              error: "Invalid block structure detected"
            };
          }
        }

        return {
          isReady: true,
          hasContent: parsedContent.length > 0,
          error: undefined
        };
      } catch {
        return {
          isReady: false,
          hasContent: false,
          error: "Failed to parse document content"
        };
      }
    } catch (error) {
      return {
        isReady: false,
        hasContent: false,
        error: `Check failed: ${error}`
      };
    }
  },
});