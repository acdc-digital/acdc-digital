// SESSION MANAGER NEXUS AGENT - SMNB Implementation
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/nexus/SessionManagerAgent.ts

/**
 * SessionManagerAgent - Nexus Framework Implementation
 *
 * AI-powered session analytics and management agent powered by MCP (Model Context Protocol)
 * server. Uses Anthropic Tools API with streaming support and standardized Nexus architecture.
 *
 * Analytics Flow:
 * - All analytics queries (metrics, tokens, search, etc.) → MCP Server → Convex Analytics
 * - Chat message storage (user/assistant messages) → Direct Convex mutations
 *
 * Capabilities:
 * - Session metrics and analytics (via MCP server)
 * - Token usage and cost tracking (via MCP server)
 * - Message search and retrieval (via MCP server)
 * - System health monitoring (via MCP server)
 * - Real-time streaming responses
 * - Chat history persistence (direct Convex)
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { BaseNexusAgent } from './BaseNexusAgent';
import type { AgentRequest, AgentChunk, Tool } from './types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Convex client ONLY for message storage (not analytics)
// All analytics queries now go through MCP server
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// MCP Server URL - can be localhost for dev or Vercel URL for production
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://mcp-server-i6h9k4z40-acdcdigitals-projects.vercel.app';

export class SessionManagerAgent extends BaseNexusAgent {
  readonly id = 'session-manager-agent';
  readonly name = 'Session Manager AI';
  readonly description = 'AI-powered session analytics and management with natural language understanding';
  readonly isPremium = false;
  readonly version = '2.0.0';

  protected getCapabilities(): string[] {
    return [
      'streaming',
      'tools',
      'session-analytics',
      'token-tracking',
      'cost-analysis',
      'message-search',
      'system-monitoring',
      'natural-language-queries'
    ];
  }

  protected defineTools(): Tool[] {
    return [
      {
        type: 'anthropic_tool',
        identifier: 'analyze_session_metrics',
        requiresPremium: false,
        schema: {
          name: 'analyze_session_metrics',
          description: 'Get comprehensive session metrics including total sessions, active sessions, activity patterns, and averages. Use this when users ask about session data, activity, or overall performance.',
          input_schema: {
            type: 'object',
            properties: {
              timeRange: {
                type: 'string',
                enum: ['today', 'week', 'month', 'all'],
                description: 'Time range for metrics analysis'
              }
            },
            required: ['timeRange']
          }
        },
        handler: this.handleSessionMetrics.bind(this),
      },
      {
        type: 'anthropic_tool',
        identifier: 'analyze_token_usage',
        requiresPremium: false,
        schema: {
          name: 'analyze_token_usage',
          description: 'Analyze token usage, costs, and model performance. Get breakdowns by session, model, time period. Use when users ask about tokens, costs, or API usage.',
          input_schema: {
            type: 'object',
            properties: {
              groupBy: {
                type: 'string',
                enum: ['session', 'model', 'day', 'hour'],
                description: 'How to group the usage data'
              },
              timeRange: {
                type: 'string',
                enum: ['today', 'week', 'month', 'all'],
                description: 'Time range for usage analysis'
              }
            },
            required: ['groupBy', 'timeRange']
          }
        },
        handler: this.handleTokenUsage.bind(this),
      },
      {
        type: 'anthropic_tool',
        identifier: 'search_session_messages',
        requiresPremium: false,
        schema: {
          name: 'search_session_messages',
          description: 'Search through chat messages and conversations using text queries. Returns relevant messages with context. Use when users want to find specific conversations or topics.',
          input_schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query text'
              },
              sessionId: {
                type: 'string',
                description: 'Optional: limit search to specific session'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)'
              }
            },
            required: ['query']
          }
        },
        handler: this.handleMessageSearch.bind(this),
      },
      {
        type: 'anthropic_tool',
        identifier: 'get_active_sessions',
        requiresPremium: false,
        schema: {
          name: 'get_active_sessions',
          description: 'Get list of currently active sessions with optional detailed information. Use when users ask about active users or current activity.',
          input_schema: {
            type: 'object',
            properties: {
              includeDetails: {
                type: 'boolean',
                description: 'Include detailed session information (default: false)'
              }
            }
          }
        },
        handler: this.handleActiveSessions.bind(this),
      },
      {
        type: 'anthropic_tool',
        identifier: 'analyze_engagement',
        requiresPremium: false,
        schema: {
          name: 'analyze_engagement',
          description: 'Analyze user engagement metrics including message volume, session duration, retention, and cost efficiency. Use for engagement analysis and user behavior insights.',
          input_schema: {
            type: 'object',
            properties: {
              metric: {
                type: 'string',
                enum: ['messages', 'duration', 'retention', 'cost_efficiency'],
                description: 'Specific engagement metric to analyze: messages (message volume), duration (session length), retention (user return rate), cost_efficiency (value per dollar)'
              },
              timeRange: {
                type: 'string',
                enum: ['today', 'week', 'month'],
                description: 'Time range for analysis'
              }
            },
            required: ['metric', 'timeRange']
          }
        },
        handler: this.handleEngagement.bind(this),
      },
      {
        type: 'anthropic_tool',
        identifier: 'check_system_health',
        requiresPremium: false,
        schema: {
          name: 'check_system_health',
          description: 'Get system health status, error rates, and operational alerts. Use when users ask if everything is working or about system status.',
          input_schema: {
            type: 'object',
            properties: {}
          }
        },
        handler: this.handleSystemHealth.bind(this),
      },
      {
        type: 'anthropic_tool',
        identifier: 'analyze_costs',
        requiresPremium: false,
        schema: {
          name: 'analyze_costs',
          description: 'Get detailed cost breakdown, spending trends, and budget projections. Use when users ask about costs, spending, or budget.',
          input_schema: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                enum: ['daily', 'weekly', 'monthly'],
                description: 'Reporting period for cost analysis'
              }
            },
            required: ['period']
          }
        },
        handler: this.handleCostBreakdown.bind(this),
      },
    ];
  }

  async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
    try {
      // Generate sessionId if not provided (for conversation grouping)
      const sessionId = request.context?.sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Yield initial metadata
      yield this.createMetadataChunk({
        status: 'starting',
        agentId: this.id,
        agentName: this.name,
        sessionId,
      });

      // Extract user message from request
      const userMessage = typeof request.input === 'string'
        ? request.input
        : (request.input as { message?: string })?.message || 'Help me with session management';
      
      // Save user message to database
      const userMessageId = await convex.mutation(api.nexus.sessionChats.create, {
        sessionId,
        role: 'user',
        content: userMessage,
      });
      
      console.log('[SessionManagerAgent] Saved user message:', userMessageId);

      // If specific tool requested, execute directly
      if (request.toolId) {
        yield this.createMetadataChunk({
          status: 'executing_tool',
          toolId: request.toolId,
        });

        const result = await this.executeTool(request.toolId, request.input, request.context);
        
        yield this.createToolCallChunk(request.toolId, request.input, result);

        // Format and yield the result as content
        const formatted = this.formatToolResult(request.toolId, result);
        yield this.createContentChunk(formatted);

        yield this.createMetadataChunk({
          status: 'complete',
        });
        return;
      }

      // Use Claude to determine which tool(s) to use based on natural language
      yield this.createMetadataChunk({
        status: 'understanding_request',
      });

      const tools = this.getTools().map(t => t.schema);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        tools,
        messages: [
          {
            role: 'user',
            content: userMessage,
          }
        ],
        system: `You are a Session Manager AI assistant with access to powerful analytics tools.

When users ask questions about their sessions, metrics, costs, or system status, use the available tools to fetch real data.

IMPORTANT GUIDELINES:
1. Always use tools to fetch real data when users ask questions about metrics, costs, usage, etc.
2. Provide clear, friendly explanations of the data
3. Use markdown formatting for better readability
4. Include relevant metrics and insights
5. Be proactive - if you see interesting patterns, mention them

Available tools:
- analyze_session_metrics: Session activity and performance
- analyze_token_usage: Token consumption and costs
- search_session_messages: Find specific conversations
- get_active_sessions: Current active users
- analyze_engagement: User engagement patterns
- check_system_health: System status and errors
- analyze_costs: Cost analysis and projections

Always try to help users understand their data and make informed decisions.`
      });

      // Process Claude's response with multi-turn tool support
      // Build conversation history for handling multiple tool calls
      const conversationMessages: MessageParam[] = [
        {
          role: 'user',
          content: userMessage,
        }
      ];

      // Track assistant response data for database storage
      let assistantContent = '';
      const toolCallsExecuted: Array<{
        toolName: string;
        toolInput: string;
        toolResult?: string;
        status: 'success' | 'error' | 'pending';
        executionTime?: number;
        errorMessage?: string;
      }> = [];
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      let currentResponse = response;
      let continueConversation = true;
      const MAX_TURNS = 10; // Prevent infinite loops
      let turnCount = 0;

      while (continueConversation && turnCount < MAX_TURNS) {
        turnCount++;
        console.log('[SessionManagerAgent] Processing response turn', turnCount, 'blocks:', currentResponse.content.length);
        
        // Track token usage from this turn
        if (currentResponse.usage) {
          totalInputTokens += currentResponse.usage.input_tokens || 0;
          totalOutputTokens += currentResponse.usage.output_tokens || 0;
        }
        
        // Add assistant response to conversation
        conversationMessages.push({
          role: 'assistant',
          content: currentResponse.content,
        });

        let hasToolUse = false;
        const toolResults: ToolResultBlockParam[] = [];

        // Process all blocks in current response
        for (const block of currentResponse.content) {
          console.log('[SessionManagerAgent] Block type:', block.type);
          
          if (block.type === 'text') {
            // Accumulate text content for database storage
            assistantContent += block.text;
            
            // Stream text content
            console.log('[SessionManagerAgent] Yielding text content:', block.text.substring(0, 100));
            yield this.createContentChunk(block.text);
          } else if (block.type === 'tool_use') {
            hasToolUse = true;
            
            // Execute tool
            yield this.createMetadataChunk({
              status: 'executing_tool',
              toolId: block.name,
            });

            const toolStartTime = Date.now();
            try {
              const toolResult = await this.executeTool(block.name, block.input, request.context);
              const executionTime = Date.now() - toolStartTime;
              
              // Track tool call for database
              toolCallsExecuted.push({
                toolName: block.name,
                toolInput: JSON.stringify(block.input),
                toolResult: JSON.stringify(toolResult),
                status: 'success',
                executionTime,
              });
              
              yield this.createToolCallChunk(block.name, block.input, toolResult);

              // Collect tool result for next turn
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(toolResult),
              });
            } catch (error) {
              const executionTime = Date.now() - toolStartTime;
              const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';
              
              // Track failed tool call
              toolCallsExecuted.push({
                toolName: block.name,
                toolInput: JSON.stringify(block.input),
                toolResult: undefined,
                status: 'error',
                executionTime,
                errorMessage,
              });
              
              yield this.createErrorChunk(errorMessage);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify({ error: errorMessage }),
              });
            }
          }
        }

        // If we had tool calls, continue the conversation
        if (hasToolUse && toolResults.length > 0) {
          conversationMessages.push({
            role: 'user',
            content: toolResults,
          });

          // Get next response from Claude
          currentResponse = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 4096,
            temperature: 0.7,
            tools,
            messages: conversationMessages,
            system: `You are a Session Manager AI assistant. Present the tool results in a clear, friendly way with markdown formatting.

FORMATTING GUIDELINES:
- Use **bold** for important numbers and metrics
- Use bullet points for lists
- Include emojis to make it engaging: 📊 📈 💰 ✅ ⚠️
- Highlight key insights and trends
- Keep explanations concise but informative
- When you have all the data you need, provide a comprehensive summary and STOP using tools`
          });
        } else {
          // No more tool calls, end conversation
          continueConversation = false;
        }
      }

      // Calculate cost based on Claude 3.5 Haiku pricing
      // Input: $0.80 per million tokens, Output: $4.00 per million tokens
      const inputCost = (totalInputTokens / 1_000_000) * 0.80;
      const outputCost = (totalOutputTokens / 1_000_000) * 4.00;
      const totalCost = inputCost + outputCost;
      
      // Save assistant message to database with all metadata
      const assistantMessageId = await convex.mutation(api.nexus.sessionChats.create, {
        sessionId,
        role: 'assistant',
        content: assistantContent,
        toolCalls: toolCallsExecuted.length > 0 ? toolCallsExecuted : undefined,
        tokenUsage: {
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          totalTokens: totalInputTokens + totalOutputTokens,
          estimatedCost: totalCost,
          model: 'claude-3-5-haiku-20241022',
        },
      });
      
      console.log('[SessionManagerAgent] Saved assistant message:', assistantMessageId, {
        contentLength: assistantContent.length,
        toolCalls: toolCallsExecuted.length,
        totalTokens: totalInputTokens + totalOutputTokens,
        cost: totalCost,
      });

      yield this.createMetadataChunk({
        status: 'complete',
        sessionId,
        messagesSaved: 2, // user + assistant
      });

    } catch (error) {
      console.error('SessionManagerAgent stream error:', error);
      yield this.createErrorChunk(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  // Tool handlers that call Convex database queries
  private async handleSessionMetrics(input: unknown): Promise<unknown> {
    try {
      const { timeRange } = input as { timeRange: 'today' | 'week' | 'month' | 'all' };
      
      // Call MCP server for session metrics
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_session_metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleSessionMetrics:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to fetch session metrics',
      };
    }
  }

  private async handleTokenUsage(input: unknown): Promise<unknown> {
    try {
      const { groupBy, timeRange } = input as {
        groupBy: 'session' | 'model' | 'day' | 'hour';
        timeRange: 'today' | 'week' | 'month' | 'all';
      };
      
      // Call MCP server for token usage
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_token_usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupBy, timeRange }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleTokenUsage:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to fetch token usage',
      };
    }
  }

  private async handleMessageSearch(input: unknown): Promise<unknown> {
    try {
      const { query, sessionId, limit = 10 } = input as {
        query: string;
        sessionId?: string;
        limit?: number;
      };
      
      // Call MCP server for message search
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/search_messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sessionId, limit }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleMessageSearch:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to search messages',
      };
    }
  }

  private async handleActiveSessions(input: unknown): Promise<unknown> {
    try {
      const { includeDetails = false } = input as { includeDetails?: boolean };
      
      // Call MCP server for active sessions
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_active_sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDetails }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleActiveSessions:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to fetch active sessions',
      };
    }
  }

  private async handleEngagement(input: unknown): Promise<unknown> {
    try {
      const { metric, timeRange } = input as {
        metric: 'messages' | 'duration' | 'retention' | 'cost_efficiency';
        timeRange: 'today' | 'week' | 'month';
      };
      
      // Call MCP server for engagement analysis
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/analyze_engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, timeRange }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleEngagement:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to analyze engagement',
      };
    }
  }

  private async handleSystemHealth(): Promise<unknown> {
    try {
      // Call MCP server for system health
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_system_health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleSystemHealth:', error);
      return {
        status: 'error',
        error: true,
        message: error instanceof Error ? error.message : 'Failed to check system health',
      };
    }
  }

  private async handleCostBreakdown(input: unknown): Promise<unknown> {
    try {
      const { period } = input as { period: 'daily' | 'weekly' | 'monthly' };
      
      // Call MCP server for cost breakdown
      const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_cost_breakdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'MCP server returned error');
      }
      
      return data.result;
    } catch (error) {
      console.error('[SessionManagerAgent] Error in handleCostBreakdown:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to fetch cost breakdown',
      };
    }
  }

  protected formatToolResult(toolId: string, result: unknown): string {
    // Enhanced formatting for different tool types
    if (typeof result === 'object' && result !== null) {
      const data = result as Record<string, unknown>;
      
      if (data.placeholder) {
        // Placeholder response
        return `\n\n📊 **Tool: ${toolId}**\n\n${data.message}\n\n*Note: This is a placeholder. Actual data will come from Convex once actions are implemented.*`;
      }
      
      // Format real data nicely
      return `\n\n📊 **${toolId} Results:**\n\n${JSON.stringify(result, null, 2)}`;
    }
    
    return String(result);
  }
}

// Export singleton instance
export const sessionManagerAgent = new SessionManagerAgent();
