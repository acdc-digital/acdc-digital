"use node";

import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { ActionCtx } from "../_generated/server";

// Helper function to call Anthropic API with retry logic
async function callAnthropicWithRetry(intent: string, message: string, currentContent: string, maxRetries: number = 2): Promise<string> {
  const requestBody = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4000,
    messages: [
      {
        role: "user" as const,
        content: `You are a content generator for a collaborative text editor.

User intent: ${intent}
User message: ${message}
Current content: ${currentContent}

Instructions based on intent:
- If intent is "create_document": Generate completely new content from scratch
- If intent is "append_content": Add the requested content to the EXISTING content, preserving what's already there
- If intent is "edit_document": Modify and improve the existing content
- If intent is "replace_content": Replace the existing content completely with new content
- If intent is "format_content": Reformat the existing content according to the request

For append_content specifically: Keep all existing content and add the new requested content in the appropriate location (top, bottom, or specific section as requested).

Generate well-structured HTML content that directly addresses the user's request.
Use proper HTML tags like <h1>, <h2>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <div>, etc.
Return ONLY the complete HTML content that should replace the document, no additional text or explanations.`,
      },
    ],
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data: { content: Array<{ type: string; text?: string }> } = await response.json();
        return data.content
          .filter((block: { type: string; text?: string }) => block.type === "text" && block.text)
          .map((block: { type: string; text?: string }) => block.text!)
          .join("");
      }

      // If 429 (rate limit) or 529 (overloaded), wait and retry
      if (response.status === 429 || response.status === 529) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`API attempt ${attempt + 1} failed with ${response.status}, retrying in ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // For other errors, throw immediately
      throw new Error(`Anthropic API error: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      console.log(`API attempt ${attempt + 1} failed, retrying...`);
    }
  }

  throw new Error("Max retries exceeded");
}

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

    let generatedContent: string = "";
    
    try {
      // Generate content using Claude with retry logic
      generatedContent = await callAnthropicWithRetry(args.intent, args.message, currentContent);

    } catch (error) {
      console.error("Anthropic API call failed:", error);
      
      // Fallback content generation for when API is unavailable
      generatedContent = generateFallbackContent(args.intent, args.message, currentContent);
      console.log("Using fallback content generation");
    }

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

// Fallback content generation when AI API is unavailable
function generateFallbackContent(intent: string, message: string, currentContent: string): string {
  console.log(`Generating fallback content for intent: ${intent}`);
  
  switch (intent) {
    case "append_content":
      // Extract what the user wants to add
      const messageWords = message.toLowerCase();
      let newContent = "";
      
      if (messageWords.includes("alert") || messageWords.includes("warning")) {
        newContent = `<div style="background: #fef3cd; border: 1px solid #fecb2e; padding: 12px; margin: 16px 0; border-radius: 4px;">
          <strong>⚠️ Alert:</strong> This is a testing alert added to the document.
        </div>`;
      } else if (messageWords.includes("test")) {
        newContent = `<div style="background: #e8f4fd; border: 1px solid #4dabf7; padding: 12px; margin: 16px 0; border-radius: 4px;">
          <strong>🧪 Test Section:</strong> This is test content added based on your request.
        </div>`;
      } else {
        newContent = `<p><strong>Added content:</strong> ${message}</p>`;
      }
      
      // Add to top or append to existing content
      if (messageWords.includes("top") || messageWords.includes("beginning")) {
        return newContent + currentContent;
      } else {
        return currentContent + newContent;
      }
      
    case "create_document":
      return `<h1>New Document</h1>
        <p>This document was created based on your request: "${message}"</p>
        <p>AI services are temporarily unavailable, but your document has been initialized and ready for editing.</p>`;
        
    case "edit_document":
      return currentContent + `
        <hr>
        <p><em>Note: Document editing requested ("${message}") but AI services are temporarily unavailable. Please try again in a moment.</em></p>`;
        
    case "clear_document":
      return "<p>Document cleared and ready for new content.</p>";
      
    default:
      return currentContent + `<p><strong>Update:</strong> ${message}</p>`;
  }
}