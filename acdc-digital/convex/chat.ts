"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

export const streamChat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    model: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    try {
      const response = await anthropic.messages.create({
        model: args.model || "claude-3-5-haiku-latest", // Updated to latest Claude 3.5 Haiku
        max_tokens: 4096,
        messages: args.messages,
        stream: false, // We'll handle streaming on the client side for now
      });

      // Extract the text content from the response
      const textContent = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => {
          if (block.type === "text") {
            return block.text;
          }
          return "";
        })
        .join("");

      return textContent;
    } catch (error) {
      console.error("Anthropic API error:", error);
      throw new Error(`Failed to get response from Anthropic API: ${error}`);
    }
  },
});

// Simple chat completion without streaming for easier implementation
export const getChatCompletion = action({
  args: {
    message: v.string(),
    context: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }))),
  },
  returns: v.object({
    content: v.string(),
    reasoning: v.optional(v.string()),
    sources: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
    }))),
  }),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const messages = [
      ...(args.context || []),
      { role: "user" as const, content: args.message },
    ];

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest", // Updated to latest Claude 3.5 Haiku
        max_tokens: 4096,
        messages,
        system: `You are a helpful AI assistant in a collaborative coding environment. 
        
When responding:
1. Be concise but thorough
2. Include step-by-step reasoning when helpful
3. Suggest relevant sources/documentation when applicable
4. Focus on practical, actionable advice

If the user asks about creating components, generating code, or building interfaces, provide specific technical guidance.`,
      });

      const textContent = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => {
          if (block.type === "text") {
            return block.text;
          }
          return "";
        })
        .join("");

      // Simple parsing to extract reasoning and sources
      let reasoning = "";
      const sources: Array<{ title: string; url: string }> = [];
      
      // Look for reasoning patterns
      const reasoningMatch = textContent.match(/(?:Let me think|Here's my reasoning|Step by step):(.*?)(?:\n\n|\n(?=[A-Z]))/s);
      if (reasoningMatch) {
        reasoning = reasoningMatch[1].trim();
      }

      // Look for source patterns (basic implementation)
      const sourceMatches = textContent.match(/https?:\/\/[^\s]+/g);
      if (sourceMatches) {
        sourceMatches.forEach((url: string) => {
          sources.push({
            title: new URL(url).hostname,
            url,
          });
        });
      }

      return {
        content: textContent,
        reasoning: reasoning || undefined,
        sources: sources.length > 0 ? sources : undefined,
      };
    } catch (error) {
      console.error("Anthropic API error:", error);
      throw new Error(`Failed to get response from Anthropic API: ${error}`);
    }
  },
});