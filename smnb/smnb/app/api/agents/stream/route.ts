// NEXUS STREAMING API ROUTE
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/api/agents/stream/route.ts

/**
 * Server-Sent Events (SSE) endpoint for Nexus agent streaming
 * 
 * Provides real-time streaming of agent responses using SSE protocol.
 * Handles tool execution coordination between Claude and Convex backend.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
 */

import { NextRequest } from 'next/server';
import { SessionManagerAgent } from '@/lib/agents/nexus/SessionManagerAgent';
import type { AgentChunk } from '@/lib/agents/nexus/types';

/**
 * POST handler for agent streaming requests
 * 
 * Expected request body:
 * {
 *   agentId: string;        // e.g., "session-manager-agent"
 *   message: string;        // User's natural language query
 *   conversationId?: string;
 *   sessionId?: string;     // Current session ID for context
 *   apiKey?: string;        // Optional Claude API key override
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message, conversationId, sessionId } = body;

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

    // Only session-manager-agent is supported for now
    if (agentId !== 'session-manager-agent') {
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

    // Create agent instance (uses environment variables)
    const agent = new SessionManagerAgent();

    console.log(`[NexusAPI] Starting stream for agent ${agentId}`);
    console.log(`[NexusAPI] Message: ${message.substring(0, 100)}...`);

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Build agent request
          const agentRequest = {
            agentId,
            input: message,
            context: { sessionId },
          };

          // Stream agent response
          for await (const chunk of agent.stream(agentRequest)) {
            const sseData = formatSSE(chunk);
            controller.enqueue(encoder.encode(sseData));

            // Log chunks for debugging
            if (chunk.type === 'tool_call') {
              console.log(`[NexusAPI] Tool call:`, chunk.data);
            } else if (chunk.type === 'content') {
              console.log(`[NexusAPI] Content chunk:`, 
                typeof chunk.data === 'string' ? chunk.data.substring(0, 50) : chunk.data);
            }
          }

          // Send completion metadata chunk
          const completeChunk: AgentChunk = {
            type: 'metadata',
            data: { status: 'complete', conversationId, sessionId },
            timestamp: Date.now(),
          };
          controller.enqueue(encoder.encode(formatSSE(completeChunk)));

          console.log(`[NexusAPI] Stream completed successfully`);
        } catch (error) {
          console.error('[NexusAPI] Stream error:', error);

          // Send error chunk
          const errorChunk: AgentChunk = {
            type: 'error',
            data: { 
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            },
            timestamp: Date.now(),
          };
          controller.enqueue(encoder.encode(formatSSE(errorChunk)));
        } finally {
          controller.close();
        }
      },
    });

    // Return SSE response with proper headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });

  } catch (error) {
    console.error('[NexusAPI] Request error:', error);
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
 * Format AgentChunk as Server-Sent Event
 * 
 * SSE format:
 * data: {"type":"text","content":"Hello"}\n\n
 */
function formatSSE(chunk: AgentChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
