"use node";

import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { ActionCtx } from "../_generated/server";

export const executeEditorTool = internalAction({
  args: {
    documentId: v.id("documents"),
    intent: v.string(),
    message: v.string(), // Changed from prompt to message to match orchestrator
  },
  returns: v.object({
    response: v.string(),
    documentUpdated: v.boolean(),
    content: v.string(),
  }),
  handler: async (ctx: ActionCtx, args): Promise<{
    response: string;
    documentUpdated: boolean;
    content: string;
  }> => {
    console.log(`executeEditorTool called with intent: ${args.intent}, documentId: ${args.documentId}`);

    // Get current document content for context
    const currentDoc = await ctx.runQuery(api.sharedDocument.getDocumentContent, {
      documentId: args.documentId,
    });
    const currentContent: string = currentDoc?.content || "No existing content";

    // Generate content using Claude
    const response: Response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `You are a content generator for a collaborative text editor. 
            
User intent: ${args.intent}
User message: ${args.message}
Current content: ${currentContent}

Generate well-structured HTML content that directly addresses the user's request. 
Use proper HTML tags like <h1>, <h2>, <p>, <ul>, <ol>, <li>, <strong>, <em>, etc.
Make the content comprehensive and useful.
Return ONLY the HTML content, no additional text or explanations.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data: { content: Array<{ type: string; text?: string }> } = await response.json();
    const generatedContent: string = data.content
      .filter((block: { type: string; text?: string }) => block.type === "text" && block.text)
      .map((block: { type: string; text?: string }) => block.text!)
      .join("");

    console.log(`Generated content length: ${generatedContent.length}`);
    console.log(`Generated content preview: ${generatedContent.substring(0, 200)}...`);

    // Update the document directly in the database
    try {
      await ctx.runMutation(api.sharedDocument.updateDocumentContent, {
        documentId: args.documentId,
        content: generatedContent,
      });

      console.log(`Document updated successfully in database`);
      
      // Verify the update by reading it back
      const updatedDoc = await ctx.runQuery(api.sharedDocument.getDocumentContent, {
        documentId: args.documentId,
      });
      console.log(`Verified update - document content length: ${updatedDoc?.content?.length || 0}`);
      
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }

    return {
      response: `I've ${getActionDescription(args.intent)} the document as requested.`,
      documentUpdated: true,
      content: generatedContent,
    };
  },
});

// Clear document content
export const clearDocument = internalAction({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.object({
    response: v.string(),
    documentUpdated: v.boolean(),
  }),
  handler: async (ctx: ActionCtx, args) => {
    console.log(`Clearing document: ${args.documentId}`);

    try {
      await ctx.runMutation(api.sharedDocument.updateDocumentContent, {
        documentId: args.documentId,
        content: '<p>Document cleared.</p>',
      });

      console.log(`Document cleared successfully`);

      return {
        response: "Document has been cleared.",
        documentUpdated: true,
      };
    } catch (error) {
      console.error(`Error clearing document:`, error);
      throw error;
    }
  },
});

// Helper function to describe the action taken
function getActionDescription(intent: string): string {
  switch (intent.toLowerCase()) {
    case "create":
    case "write":
    case "generate":
      return "created content for";
    case "edit":
    case "modify":
    case "update":
      return "updated";
    case "enhance":
    case "improve":
      return "enhanced";
    case "format":
    case "structure":
      return "formatted";
    default:
      return "updated";
  }
}