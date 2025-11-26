// NEXUS STREAMING API ROUTE - Grapes Implementation
// Server-Sent Events (SSE) endpoint for Grapes agent streaming

import { NextRequest } from 'next/server';
import { GrapesOrchestratorAgent } from '@/lib/agents/nexus/GrapesOrchestratorAgent';
import type { AgentChunk } from '@/lib/agents/nexus/types';

/**
 * POST handler for agent streaming requests
 * 
 * Expected request body:
 * {
 *   agentId: string;              // e.g., "grapes-orchestrator"
 *   message: string;              // User's natural language query
 *   screenshot?: string;          // Base64 encoded screenshot
 *   shapeCoordinates?: Array<{    // Shape data from map
 *     type: string;
 *     color: string;
 *     coordinates: Array<{ lat: number; lng: number }>;
 *   }>;
 *   conversationHistory?: Array<{ // Optional conversation context
 *     role: string;
 *     content: string;
 *   }>;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message, screenshot, shapeCoordinates, conversationHistory } = body;

    // Validate required fields
    if (!agentId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId and message' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Only grapes-orchestrator is supported for now
    if (agentId !== 'grapes-orchestrator') {
      return new Response(
        JSON.stringify({ error: `Unknown agent: ${agentId}` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create agent instance
    const agent = new GrapesOrchestratorAgent();

    console.log(`[GrapesAPI] Starting stream for agent ${agentId}`);
    console.log(`[GrapesAPI] Message: ${message.substring(0, 100)}...`);
    console.log(`[GrapesAPI] Has screenshot: ${!!screenshot}`);
    console.log(`[GrapesAPI] Shape coordinates: ${shapeCoordinates?.length || 0} shapes`);

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Build agent request
          const agentRequest = {
            agentId,
            input: message,
            context: {
              screenshot,
              shapeCoordinates,
            },
            conversationHistory,
          };

          // Stream agent response
          for await (const chunk of agent.stream(agentRequest)) {
            const sseData = formatSSE(chunk);
            controller.enqueue(encoder.encode(sseData));

            // Log chunks for debugging
            if (chunk.type === 'tool_call') {
              console.log(`[GrapesAPI] Tool call:`, chunk.data);
            } else if (chunk.type === 'content') {
              const preview = typeof chunk.data === 'string' ? chunk.data.substring(0, 50) : chunk.data;
              console.log(`[GrapesAPI] Content chunk:`, preview);
            } else if (chunk.type === 'error') {
              console.error(`[GrapesAPI] Error chunk:`, chunk.data);
            }
          }

          // Send completion metadata chunk
          const completeChunk: AgentChunk = {
            type: 'complete',
            data: { timestamp: Date.now() },
          };
          controller.enqueue(encoder.encode(formatSSE(completeChunk)));

          // Close the stream
          controller.close();
          console.log(`[GrapesAPI] Stream completed successfully`);

        } catch (error) {
          console.error('[GrapesAPI] Stream error:', error);
          
          // Send error chunk
          const errorChunk: AgentChunk = {
            type: 'error',
            data: error instanceof Error ? error.message : 'Unknown error occurred',
          };
          controller.enqueue(encoder.encode(formatSSE(errorChunk)));
          
          // Close with error
          controller.error(error);
        }
      },

      cancel() {
        console.log('[GrapesAPI] Stream cancelled by client');
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[GrapesAPI] Request error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Format chunk as Server-Sent Events message
 */
function formatSSE(chunk: AgentChunk): string {
  const data = JSON.stringify(chunk);
  return `data: ${data}\n\n`;
}
