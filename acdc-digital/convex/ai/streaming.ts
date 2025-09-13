"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

// Types for streaming events based on Anthropic API documentation
export interface MessageStart {
  type: "message_start";
  message: {
    id: string;
    type: "message";
    role: "assistant";
    content: unknown[];
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
}

export interface ContentBlockStart {
  type: "content_block_start";
  index: number;
  content_block: {
    type: "text" | "tool_use" | "thinking";
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
    thinking?: string;
  };
}

export interface ContentBlockDelta {
  type: "content_block_delta";
  index: number;
  delta: {
    type: "text_delta" | "thinking_delta" | "input_json_delta" | "signature_delta";
    text?: string;
    thinking?: string;
    partial_json?: string;
    signature?: string;
  };
}

export interface ContentBlockStop {
  type: "content_block_stop";
  index: number;
}

export interface MessageDelta {
  type: "message_delta";
  delta: {
    stop_reason?: string;
    stop_sequence?: string | null;
  };
  usage?: {
    output_tokens: number;
  };
}

export interface MessageStop {
  type: "message_stop";
}

export interface PingEvent {
  type: "ping";
}

export interface ErrorEvent {
  type: "error";
  error: {
    type: string;
    message: string;
  };
}

export type StreamingEvent = 
  | MessageStart
  | ContentBlockStart
  | ContentBlockDelta
  | ContentBlockStop
  | MessageDelta
  | MessageStop
  | PingEvent
  | ErrorEvent;

// Stream chat completion with proper types
export const streamChatCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    enableThinking: v.optional(v.boolean()),
    maxTokens: v.optional(v.number()),
  },
  returns: v.object({
    messageId: v.string(),
    response: v.string(),
    reasoning: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Generate a unique message ID for this stream
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const streamConfig = {
      model: args.model || "claude-3-5-sonnet-20241022",
      max_tokens: args.maxTokens || 20000,
      messages: args.messages,
      stream: true,
      ...(args.systemPrompt && { system: args.systemPrompt }),
      ...(args.enableThinking && {
        thinking: {
          type: "enabled" as const,
          budget_tokens: 16000,
        }
      }),
    };

    try {
      // For now, let's accumulate the stream and return the result
      // Later we can implement true streaming via HTTP endpoints
      let fullResponse = "";
      let reasoning = "";
      
      const stream = await anthropic.messages.stream(streamConfig);
      
      for await (const event of stream) {
        if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta" && event.delta.text) {
            fullResponse += event.delta.text;
          } else if (event.delta.type === "thinking_delta" && event.delta.thinking) {
            reasoning += event.delta.thinking;
          }
        }
      }

      return {
        messageId,
        response: fullResponse,
        reasoning: reasoning || undefined,
      };
    } catch (error) {
      console.error("Anthropic streaming API error:", error);
      throw new Error(`Failed to create stream: ${error}`);
    }
  },
});