// SESSION MANAGER NEXUS AGENT - SMNB Implementation
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/nexus/SessionManagerAgent.ts

/**
 * SessionManagerAgent - Nexus Framework Implementation
 * 
 * AI-powered session analytics and management agent with direct database access
 * through Anthropic Tools API. Replaces legacy SessionChatAgent with streaming
 * support and standardized Nexus architecture.
 * 
 * Capabilities:
 * - Session metrics and analytics
 * - Token usage and cost tracking
 * - Message search and retrieval
 * - System health monitoring
 * - Real-time streaming responses
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { BaseNexusAgent } from './BaseNexusAgent';
import type { AgentRequest, AgentChunk, Tool } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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
          description: 'Analyze user engagement metrics including message volume, response times, and trends. Use for engagement analysis and user behavior insights.',
          input_schema: {
            type: 'object',
            properties: {
              metric: {
                type: 'string',
                enum: ['message_volume', 'response_time', 'session_duration', 'overall'],
                description: 'Specific engagement metric to analyze'
              },
              timeRange: {
                type: 'string',
                enum: ['today', 'week', 'month', 'all'],
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
      // Yield initial metadata
      yield this.createMetadataChunk({
        status: 'starting',
        agentId: this.id,
        agentName: this.name,
      });

      // Extract user message from request
      const userMessage = typeof request.input === 'string' 
        ? request.input 
        : (request.input as { message?: string })?.message || 'Help me with session management';

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

      let currentResponse = response;
      let continueConversation = true;
      const MAX_TURNS = 10; // Prevent infinite loops
      let turnCount = 0;

      while (continueConversation && turnCount < MAX_TURNS) {
        turnCount++;
        console.log('[SessionManagerAgent] Processing response turn', turnCount, 'blocks:', currentResponse.content.length);
        
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

            try {
              const toolResult = await this.executeTool(block.name, block.input, request.context);
              
              yield this.createToolCallChunk(block.name, block.input, toolResult);

              // Collect tool result for next turn
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(toolResult),
              });
            } catch (error) {
              yield this.createErrorChunk(
                error instanceof Error ? error.message : 'Tool execution failed'
              );
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify({ error: error instanceof Error ? error.message : 'Tool execution failed' }),
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

      yield this.createMetadataChunk({
        status: 'complete',
      });

    } catch (error) {
      console.error('SessionManagerAgent stream error:', error);
      yield this.createErrorChunk(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  // Tool handlers that will call Convex actions
  private async handleSessionMetrics(input: unknown): Promise<unknown> {
    // This will be replaced with actual Convex action call
    // For now, return placeholder that shows structure
    const { timeRange } = input as { timeRange: 'today' | 'week' | 'month' | 'all' };
    
    // TODO: Call Convex action
    // const result = await convex.action(api.nexusAgents.executeSessionMetrics, { timeRange });
    
    return {
      placeholder: true,
      message: `This will fetch session metrics for ${timeRange} from Convex`,
      timeRange,
    };
  }

  private async handleTokenUsage(input: unknown): Promise<unknown> {
    const { groupBy, timeRange } = input as {
      groupBy: 'session' | 'model' | 'day' | 'hour';
      timeRange: 'today' | 'week' | 'month' | 'all';
    };
    
    // TODO: Call Convex action
    return {
      placeholder: true,
      message: `This will fetch token usage grouped by ${groupBy} for ${timeRange} from Convex`,
      groupBy,
      timeRange,
    };
  }

  private async handleMessageSearch(input: unknown): Promise<unknown> {
    const { query, sessionId, limit = 10 } = input as {
      query: string;
      sessionId?: string;
      limit?: number;
    };
    
    // TODO: Call Convex action
    return {
      placeholder: true,
      message: `This will search for "${query}" in ${sessionId ? `session ${sessionId}` : 'all sessions'}`,
      query,
      sessionId,
      limit,
    };
  }

  private async handleActiveSessions(input: unknown): Promise<unknown> {
    const { includeDetails = false } = input as { includeDetails?: boolean };
    
    // TODO: Call Convex action
    return {
      placeholder: true,
      message: `This will fetch active sessions ${includeDetails ? 'with details' : 'summary only'}`,
      includeDetails,
    };
  }

  private async handleEngagement(input: unknown): Promise<unknown> {
    const { metric, timeRange } = input as {
      metric: 'message_volume' | 'response_time' | 'session_duration' | 'overall';
      timeRange: 'today' | 'week' | 'month' | 'all';
    };
    
    // TODO: Call Convex action
    return {
      placeholder: true,
      message: `This will analyze ${metric} engagement for ${timeRange}`,
      metric,
      timeRange,
    };
  }

  private async handleSystemHealth(): Promise<unknown> {
    // TODO: Call Convex action
    return {
      placeholder: true,
      message: 'This will check system health from Convex',
    };
  }

  private async handleCostBreakdown(input: unknown): Promise<unknown> {
    const { period } = input as { period: 'daily' | 'weekly' | 'monthly' };
    
    // TODO: Call Convex action
    return {
      placeholder: true,
      message: `This will fetch ${period} cost breakdown from Convex`,
      period,
    };
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
