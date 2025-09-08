"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../_generated/api";

// Define the return type for the process user message action
type ProcessUserMessageResult = {
  response: string;
  intent: string;
  documentUpdated: boolean;
  confidence?: number;
  reasoning?: string;
};

export const processUserMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
    documentId: v.id("documents"),
  },
  returns: v.object({
    response: v.string(),
    intent: v.string(),
    documentUpdated: v.boolean(),
    confidence: v.optional(v.number()),
    reasoning: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<ProcessUserMessageResult> => {
    try {
      // Step 1: Get recent conversation context
      const rawContext = await ctx.runQuery(api.chatMessages.getRecentMessages, {
        sessionId: args.sessionId,
        limit: 5,
      });

      // Filter context to only include user and assistant messages
      const context = rawContext.filter(msg => 
        msg.role === "user" || msg.role === "assistant"
      ) as Array<{ role: "user" | "assistant"; content: string; }>;

      // Step 2: Analyze intent  
      const intentResult: {
        intent: string;
        confidence?: number;
        reasoning?: string;
      } = await ctx.runAction(internal.agents.intents.classifyIntent, {
        message: args.message,
        context,
      });

      // Step 3: Execute appropriate tools based on intent
      let response = "";
      let documentUpdated = false;

      console.log(`Processing intent: ${intentResult.intent} for document: ${args.documentId}`);
      console.log(`Intent confidence: ${intentResult.confidence}, reasoning: ${intentResult.reasoning}`);

      switch (intentResult.intent) {
        case "create_document":
        case "edit_document":
        case "append_content":
        case "replace_content":
        case "format_content":
          console.log(`Executing editor tool for intent: ${intentResult.intent}`);
          const result = await ctx.runAction(internal.agents.tools.executeEditorTool, {
            intent: intentResult.intent,
            message: args.message,
            documentId: args.documentId,
          });
          console.log(`Editor tool completed. Updated: ${result.documentUpdated}`);
          response = result.response;
          documentUpdated = result.documentUpdated;
          break;
        
        case "clear_document":
          const clearResult = await ctx.runAction(internal.agents.tools.clearDocument, {
            documentId: args.documentId,
          });
          response = clearResult.response;
          documentUpdated = clearResult.documentUpdated;
          break;
        
        default:
          // Regular chat response - convert context format for chat API
          const chatContext = context.map(msg => ({ 
            role: msg.role, 
            content: msg.content 
          }));
          response = await ctx.runAction(api.chat.getChatCompletion, {
            message: args.message,
            context: chatContext,
          }).then(result => result.content);
      }

      // Step 4: Save the interaction
      await ctx.runMutation(api.chatMessages.create, {
        sessionId: args.sessionId,
        role: "user",
        content: args.message,
      });

      await ctx.runMutation(api.chatMessages.create, {
        sessionId: args.sessionId,
        role: "assistant",
        content: response,
      });

      return { 
        response, 
        intent: intentResult.intent, 
        documentUpdated,
        confidence: intentResult.confidence,
        reasoning: intentResult.reasoning,
      };
    } catch (error) {
      console.error("Agent orchestrator error:", error);
      
      // Check if it's an API overload error
      const errorMessage = error instanceof Error ? error.message : String(error);
      let fallbackResponse = "";
      
      if (errorMessage.includes("API_OVERLOADED") || errorMessage.includes("529")) {
        fallbackResponse = "AI services are temporarily overloaded. I've processed your request with a fallback system. Please try again in a moment for full AI assistance.";
      } else {
        fallbackResponse = `I encountered an error processing your request: ${errorMessage}. Please try again.`;
      }
      
      await ctx.runMutation(api.chatMessages.create, {
        sessionId: args.sessionId,
        role: "user", 
        content: args.message,
      });

      await ctx.runMutation(api.chatMessages.create, {
        sessionId: args.sessionId,
        role: "assistant",
        content: fallbackResponse,
      });

      return {
        response: fallbackResponse,
        intent: "general_chat",
        documentUpdated: false,
      };
    }
  },
});

// Helper function to generate session IDs
export const generateSessionId = action({
  args: {},
  returns: v.string(),
  handler: async () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
});