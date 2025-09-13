"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

export const classifyIntent = internalAction({
  args: {
    message: v.string(),
    context: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  returns: v.object({
    intent: v.string(),
    confidence: v.number(),
    reasoning: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are an intent classifier for a collaborative document editor.
    Classify the user's message into one of these intents:
    
    - create_document: User wants to create new content from scratch (e.g., "Write me a guide", "Create a document about", "Generate content for")
    - edit_document: User wants to modify existing content (e.g., "Make this more formal", "Fix the grammar", "Improve the writing", "Update the content")
    - append_content: User wants to add content somewhere in the document (e.g., "Add a section about", "Include information on", "Put alerts at the top", "Insert a paragraph")
    - replace_content: User wants to completely replace content (e.g., "Replace this with", "Rewrite everything", "Start over with")
    - format_content: User wants to change formatting/structure (e.g., "Format this as bullet points", "Make this into a table", "Add headings")
    - clear_document: User wants to clear/reset the document (e.g., "Clear the document", "Delete everything", "Start fresh")
    - general_chat: General conversation, no document action needed (e.g., "How are you?", "What's the weather?", "Tell me a joke")

    IMPORTANT: If the user mentions modifying, adding to, or changing ANY part of "our guide", "the document", "this content", etc., it should be classified as a document editing intent, NOT general_chat.

    Respond with a JSON object containing:
    {
      "intent": "intent_name",
      "confidence": 0.95,
      "reasoning": "Brief explanation of why this intent was chosen"
    }

    Examples:
    "Write me a guide for ordering at Subway" -> {"intent": "create_document", "confidence": 0.98, "reasoning": "User explicitly asks to write/create new content"}
    "Add a section about payment methods" -> {"intent": "append_content", "confidence": 0.95, "reasoning": "User wants to add content to existing document"}
    "Put testing alerts at the top of our guide" -> {"intent": "append_content", "confidence": 0.97, "reasoning": "User wants to add content (alerts) to the existing guide"}
    "Make this more formal" -> {"intent": "edit_document", "confidence": 0.92, "reasoning": "User wants to modify existing content style"}
    "Format this as bullet points" -> {"intent": "format_content", "confidence": 0.96, "reasoning": "User wants to change formatting structure"}
    "How's the weather?" -> {"intent": "general_chat", "confidence": 0.99, "reasoning": "General conversation unrelated to document editing"}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          ...args.context.slice(-3), // Only last 3 messages for context
          { role: "user", content: args.message }
        ],
      });

      const responseText = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { text: string }).text)
        .join("");

      // Parse JSON response - extract JSON from the response text
      try {
        // Try to find JSON object in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON object found in response");
        }
        
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || "general_chat",
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning,
        };
      } catch (parseError) {
        console.error("Failed to parse intent classification response:", parseError);
        console.error("Raw response text:", responseText);
        
        // Fallback: simple keyword matching
        const message = args.message.toLowerCase();
        if (message.includes("write") || message.includes("create") || message.includes("generate")) {
          return { intent: "create_document", confidence: 0.7 };
        } else if (message.includes("add") || message.includes("append") || message.includes("include") || message.includes("put") || message.includes("insert")) {
          return { intent: "append_content", confidence: 0.7 };
        } else if (message.includes("edit") || message.includes("modify") || message.includes("change") || message.includes("update") || message.includes("alter")) {
          return { intent: "edit_document", confidence: 0.7 };
        } else if (message.includes("format") || message.includes("bullet") || message.includes("heading") || message.includes("style")) {
          return { intent: "format_content", confidence: 0.7 };
        } else if (message.includes("clear") || message.includes("delete") || message.includes("remove") || message.includes("erase")) {
          return { intent: "clear_document", confidence: 0.7 };
        } else {
          return { intent: "general_chat", confidence: 0.8 };
        }
      }
    } catch (error) {
      console.error("Anthropic API error in intent classification:", error);
      throw new Error(`Failed to classify intent: ${error}`);
    }
  },
});