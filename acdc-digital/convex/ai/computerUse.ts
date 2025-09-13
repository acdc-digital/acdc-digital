"use node";

import { action, ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";

// Computer use streaming types
export interface ComputerUseStreamEvent {
  type: "message_start" | "content_block_start" | "content_block_delta" | "content_block_stop" | "message_stop";
  data: {
    messageId?: string;
    index?: number;
    delta?: {
      type: "text_delta" | "input_json_delta";
      text?: string;
      partial_json?: string;
    };
    content_block?: {
      type: "text" | "tool_use";
      name?: string;
    };
  };
}

export interface ComputerUseToolCall {
  action: "screenshot" | "click" | "type" | "scroll" | "key";
  coordinate?: [number, number];
  text?: string;
}

// Stream computer use action with real-time tool execution
export const streamComputerUse = action({
  args: {
    prompt: v.string(),
    documentId: v.id("documents"),
    contentType: v.union(
      v.literal("newsletter"),
      v.literal("blog"),
      v.literal("analysis"),
      v.literal("social"),
      v.literal("context")
    ),
    currentContent: v.optional(v.string()),
    displayWidth: v.optional(v.number()),
    displayHeight: v.optional(v.number()),
  },
  returns: v.object({
    messageId: v.string(),
    finalContent: v.string(),
    toolCalls: v.array(v.any()),
    transformationSteps: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create a unique message ID for this computer use session
    let messageId = `computer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Build the system prompt for content transformation
    const systemPrompt = `You are a content transformation specialist with computer use capabilities.

TASK: Transform the existing content for ${args.contentType} format while preserving the original information.

CURRENT CONTENT:
${args.currentContent || "No existing content"}

TRANSFORMATION GOAL:
${getTransformationGoal(args.contentType)}

IMPORTANT RULES:
1. Preserve all key information from the original content
2. Apply format-specific styling and structure
3. Make incremental changes that can be streamed
4. Use computer tools to interact with the editor interface
5. Keep content visible throughout the transformation

Use computer use tools to:
- Take screenshots to see current state
- Click on editor elements
- Type transformed content
- Navigate through content sections`;

    const stream = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: args.prompt,
      }],
      tools: [{
        type: "custom" as const,
        name: "computer",
        description: "Computer use tool for interacting with the interface",
        input_schema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["screenshot", "click", "type", "scroll", "key"] },
            coordinate: { type: "array", items: { type: "number" } },
            text: { type: "string" }
          },
          required: ["action"]
        }
      }],
    }, {
      headers: {
        'anthropic-beta': 'computer-use-2024-10-22'
      }
    });

    // Accumulate streaming data
    let finalContent = args.currentContent || "";
    const toolCalls: Array<{ type: string; name: string; input: Record<string, unknown> }> = [];
    const transformationSteps: string[] = [];
    let currentToolCall: { type: string; name: string; input: Record<string, unknown> } | null = null;
    let accumulatedJson = "";

    for await (const event of stream) {
      // Handle streaming events
      switch (event.type) {
        case "message_start":
          console.log("Computer use stream started:", event.message.id);
          messageId = event.message.id;
          break;

        case "content_block_start":
          if (event.content_block.type === "tool_use") {
            console.log(`Tool called: ${event.content_block.name}`);
            currentToolCall = {
              type: event.content_block.type,
              name: event.content_block.name,
              input: {},
            };
            accumulatedJson = "";
          }
          break;

        case "content_block_delta":
          if (event.delta.type === "text_delta" && event.delta.text) {
            // Handle text responses (thinking/explanation)
            transformationSteps.push(event.delta.text);
          } else if (event.delta.type === "input_json_delta" && event.delta.partial_json) {
            // Accumulate tool input JSON
            accumulatedJson += event.delta.partial_json;
          }
          break;

        case "content_block_stop":
          if (currentToolCall) {
            try {
              // Parse complete tool call JSON
              currentToolCall.input = JSON.parse(accumulatedJson);
              toolCalls.push(currentToolCall);
              
              // Execute computer use tool call
              const result = await executeComputerUseToolCall(ctx, currentToolCall, args.documentId);
              if (result.contentUpdate) {
                finalContent = result.contentUpdate;
              }
              
            } catch (error) {
              console.error("Error parsing tool call JSON:", error);
            }
            currentToolCall = null;
            accumulatedJson = "";
          }
          break;

        case "message_stop":
          console.log("Computer use stream completed");
          break;
      }
    }

    return {
      messageId,
      finalContent,
      toolCalls,
      transformationSteps,
    };
  },
});

// Execute computer use tool calls
async function executeComputerUseToolCall(
  ctx: ActionCtx,
  toolCall: { input: Record<string, unknown> },
  documentId: Id<"documents">
) {
  const { action, coordinate, text } = toolCall.input;
  
  console.log(`Executing computer use action: ${action}`, toolCall.input);
  
  switch (action) {
    case "screenshot":
      // In a real implementation, this would capture the current screen
      return { success: true, description: "Screenshot taken" };
      
    case "click":
      // Simulate clicking on editor elements
      if (coordinate) {
        console.log(`Clicking at coordinates: ${coordinate}`);
      }
      return { success: true, description: `Clicked at ${coordinate}` };
      
    case "type":
      // Update document content incrementally
      if (typeof text === "string") {
        // In real implementation, this would update the document via mutation
        console.log(`Typing text: ${text.substring(0, 50)}...`);
        const updatedContent = await updateDocumentContent(ctx, documentId, text);
        return { success: true, description: "Text typed", contentUpdate: updatedContent };
      }
      return { success: false, description: "No text provided" };
      
    case "scroll":
      console.log("Scrolling in editor");
      return { success: true, description: "Scrolled" };
      
    case "key":
      console.log(`Key pressed: ${text}`);
      return { success: true, description: `Key pressed: ${text}` };
      
    default:
      return { success: false, description: `Unknown action: ${action}` };
  }
}

// Update document content incrementally
async function updateDocumentContent(
  ctx: ActionCtx,
  documentId: Id<"documents">,
  newContent: string
) {
  // Update the document directly in the database
  await ctx.runMutation(api.sharedDocument.updateDocumentContent, {
    documentId: documentId,
    content: newContent,
  });
  
  return newContent;
}

// Get transformation goals for different content types
function getTransformationGoal(contentType: string): string {
  switch (contentType) {
    case "newsletter":
      return `Transform to newsletter format with:
- Engaging subject line
- Personal greeting
- Scannable sections with headers
- Clear call-to-action
- Newsletter-style formatting`;
      
    case "blog":
      return `Transform to blog post format with:
- SEO-optimized title
- Introduction hook
- Structured headings and subheadings
- Engaging narrative flow
- Conclusion with takeaways`;
      
    case "analysis":
      return `Transform to analytical format with:
- Executive summary
- Data-driven insights
- Clear methodology
- Evidence-based conclusions
- Actionable recommendations`;
      
    case "social":
      return `Transform to social media format with:
- Platform-specific optimization
- Engaging hooks
- Hashtag strategy
- Visual content suggestions
- Community engagement elements`;
      
    case "context":
      return `Transform to contextual format with:
- Background information
- Key stakeholders
- Timeline and milestones
- Dependencies and relationships
- Strategic implications`;
      
    default:
      return "Transform content while preserving key information and improving clarity";
  }
}