import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Simple streaming endpoint that returns a response immediately
// For true streaming, we'll use the frontend to directly call the streaming action
http.route({
  path: "/stream",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Parse request body
      const body = await request.json();
      const { messages, model, systemPrompt, enableThinking, maxTokens } = body;

      // Call the streaming action which will accumulate and return the response
      const result = await ctx.runAction(api.ai.streaming.streamChatCompletion, {
        messages: messages || [],
        model,
        systemPrompt,
        enableThinking,
        maxTokens,
      });

      // Return the complete response
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (error) {
      console.error("Failed to process stream:", error);
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error" 
        }), 
        { 
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }
  }),
});

// Handle preflight requests for CORS
http.route({
  path: "/stream",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;