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
import { ANTHROPIC_MODELS } from '../../../../../.agents/anthropic.config';

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

      // ============================================================================
      // CONTEXT RETRIEVAL: Two-tier memory system
      // ============================================================================
      
      // TIER 1: Flash Memory - Recent conversation history (last 10 messages)
      const conversationHistory = await convex.query(api.nexus.sessionChats.getConversationHistory, {
        sessionId,
        limit: 10, // Flash memory: last 10 messages for immediate context
      });

      console.log(`[SessionManagerAgent] Retrieved ${conversationHistory.length} messages from flash memory`);

      // TIER 2: Vector Search - Semantic search across chat history + documents
      yield this.createChunk('thinking', '🔍 Searching vector knowledge base...');
      
      const contextRetrieval = await convex.action(api.nexus.actions.retrieveContext.default, {
        sessionId,
        query: userMessage,
        includeChatHistory: true, // Search past conversations
        includeDocuments: true, // Search uploaded documents
        globalDocuments: true, // Search ALL documents across all sessions (knowledge base)
        topK: 10, // Top 10 results from each source (increased from 5)
        minScore: 0.2, // Minimum similarity threshold (lowered from 0.3 for better recall)
      });

      console.log(`[SessionManagerAgent] Vector search found ${contextRetrieval.totalResults} relevant context items`);
      console.log(`[SessionManagerAgent] - Chat context: ${contextRetrieval.chatContext.length} items`);
      console.log(`[SessionManagerAgent] - Document context: ${contextRetrieval.documentContext.length} items`);
      
      // Log document context details for debugging
      if (contextRetrieval.documentContext.length > 0) {
        console.log(`[SessionManagerAgent] Document context details:`);
        contextRetrieval.documentContext.forEach((doc, i) => {
          console.log(`  ${i + 1}. [${doc.documentName}] Score: ${doc.score.toFixed(3)} - ${doc.text.substring(0, 100)}...`);
        });
      }      // Show what was found
      if (contextRetrieval.totalResults > 0) {
        const contextSummary = [];
        if (contextRetrieval.chatContext.length > 0) {
          contextSummary.push(`${contextRetrieval.chatContext.length} relevant conversation${contextRetrieval.chatContext.length > 1 ? 's' : ''}`);
        }
        if (contextRetrieval.documentContext.length > 0) {
          const uniqueDocs = new Set(contextRetrieval.documentContext.map(d => d.documentName).filter(Boolean));
          contextSummary.push(`${contextRetrieval.documentContext.length} chunk${contextRetrieval.documentContext.length > 1 ? 's' : ''} from ${uniqueDocs.size} document${uniqueDocs.size > 1 ? 's' : ''}`);
        }
        yield this.createChunk('thinking', `✅ Found ${contextSummary.join(' and ')}`);
      } else {
        yield this.createChunk('thinking', '📭 No relevant context found in knowledge base');
      }

      // Save user message to database
      const userMessageId = await convex.mutation(api.nexus.sessionChats.create, {
        sessionId,
        role: 'user',
        content: userMessage,
      });

      console.log('[SessionManagerAgent] Saved user message:', userMessageId);

      // Generate and save embedding for vector search (fire and forget)
      convex.action(api.nexus.actions.generateEmbeddings.default, {
        sessionId,
        messageId: String(userMessageId),
        texts: [userMessage],
      }).catch((e) => {
        console.warn('[SessionManagerAgent] Failed to generate embedding:', e);
      });

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

      // ============================================================================
      // Build messages array with conversation history for context
      // ============================================================================
      const messages: MessageParam[] = [
        // Include conversation history for flash memory (context awareness)
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        // Add current user message
        {
          role: 'user' as const,
          content: userMessage,
        }
      ];

      console.log(`[SessionManagerAgent] Sending ${messages.length} messages to Claude (${conversationHistory.length} history + 1 current)`);

      const response = await anthropic.messages.create({
        model: ANTHROPIC_MODELS.HAIKU_LATEST,
        max_tokens: 4096,
        temperature: 0.7,
        tools,
        messages,
        system: `You are a Session Manager AI assistant with access to powerful analytics tools and a comprehensive knowledge base.

CONTEXT RETRIEVAL SYSTEM:
You have access to two tiers of memory:

1. FLASH MEMORY (Immediate Context):
   - Last ${conversationHistory.length} messages from this conversation
   - Provides immediate conversational context
   - Already included in your message history

2. VECTOR KNOWLEDGE BASE (Semantic Search):
   - ${contextRetrieval.totalResults} relevant items retrieved for this query
   - CHAT HISTORY (${contextRetrieval.chatContext.length} items from THIS session):
${contextRetrieval.chatContext.map((item, i) =>
  `     ${i + 1}. [Score: ${item.score.toFixed(3)}] ${item.text.substring(0, 150)}...`
).join('\n') || '     (No relevant past conversations found)'}

   - GLOBAL KNOWLEDGE BASE (${contextRetrieval.documentContext.length} items from ALL uploaded documents):
${contextRetrieval.documentContext.map((item, i) =>
  `     ${i + 1}. [${item.documentName || 'Unknown'}] [Score: ${item.score.toFixed(3)}] ${item.text.substring(0, 150)}...`
).join('\n') || '     (No relevant documents found)'}

Use this retrieved context to provide more informed and accurate responses. The knowledge base is GLOBAL - documents uploaded by anyone are searchable across all sessions.

IMPORTANT GUIDELINES:
1. **ALWAYS check the retrieved context FIRST** before using tools or providing answers
2. When document context is available (ANY score > 0.3), **PRIORITIZE it over general knowledge**
3. **CITE SOURCES**: Always reference document names when using information from them: "According to [DocumentName]..."
4. Use tools to fetch real-time metrics/analytics data (sessions, costs, tokens, etc.)
5. **The knowledge base contains uploaded books and papers** - check for relevant content before answering
6. Provide clear, detailed explanations citing specific sections from documents when available
7. Use markdown formatting for better readability
8. If documents contain relevant information, quote key passages and provide page/section references if available

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

        // First pass: check if this turn has any tool use
        const hasTool = currentResponse.content.some(b => b.type === 'tool_use');

        // Process all blocks in current response
        for (let i = 0; i < currentResponse.content.length; i++) {
          const block = currentResponse.content[i];
          console.log('[SessionManagerAgent] Block type:', block.type, 'index:', i);
          
          if (block.type === 'text') {
            // Accumulate text content for database storage
            assistantContent += block.text;
            
            // Determine if this text is "thinking" or "content":
            // - If this turn has tools AND this text comes BEFORE any tool_use block = thinking
            // - Otherwise = content (final response)
            const toolUseIndex = currentResponse.content.findIndex(b => b.type === 'tool_use');
            const isBeforeToolUse = hasTool && toolUseIndex > i;
            
            if (isBeforeToolUse) {
              // Text before tools = thinking/planning
              console.log('[SessionManagerAgent] Yielding thinking content:', block.text.substring(0, 100));
              yield this.createChunk('thinking', block.text);
            } else {
              // Text after tools or no tools = final content
              console.log('[SessionManagerAgent] Yielding text content:', block.text.substring(0, 100));
              yield this.createContentChunk(block.text);
            }
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
            model: ANTHROPIC_MODELS.HAIKU_LATEST,
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
          model: ANTHROPIC_MODELS.HAIKU_LATEST,
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
