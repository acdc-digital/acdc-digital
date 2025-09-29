// SESSION CHAT AGENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/SessionChatAgent.ts

/**
 * Session Chat Agent - AURA Agent Framework Implementation
 * 
 * Follows ACDC Digital's existing agent architecture for consistent chat capabilities
 * Provides AI-powered conversational interface for session management contexts
 */

import { BaseAgent, AgentTool, AgentExecutionContext, AgentExecutionResult, ConvexMutations } from '../../agents/base';
import { sessionChatService } from './sessionChatService';
import { mcpClient } from './mcpClient';
import { nlpMcpParser } from './nlpMcpParser';

export interface SessionChatInput {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
  }>;
  sessionId?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export class SessionChatAgent extends BaseAgent {
  readonly id = 'session-chat-agent';
  readonly name = 'Session Chat Specialist';
  readonly description = 'AI-powered conversational assistant for session management and general chat interactions';
  readonly icon = '💬';
  readonly isPremium = false;

  readonly tools: AgentTool[] = [
    {
      command: '/chat',
      name: 'Chat Response',
      description: 'Generate intelligent conversational responses with context awareness',
      usage: '/chat <message>',
      examples: [
        '/chat Hello, how can you help me today?',
        '/chat What are the latest trends in AI?',
        '/chat Can you analyze this text for sentiment?'
      ]
    },
    {
      command: '/session-chat',
      name: 'Session-Aware Chat',
      description: 'Chat with session context and conversation history',
      usage: '/session-chat <message>',
      examples: [
        '/session-chat Continue our previous conversation',
        '/session-chat Remember what we discussed about the project?'
      ]
    },
    {
      command: '/analyze',
      name: 'Content Analysis',
      description: 'Analyze message content for sentiment, intent, and key topics',
      usage: '/analyze <text>',
      examples: [
        '/analyze This is a fantastic product and I love using it!',
        '/analyze The meeting went well but there are some concerns'
      ]
    },
    {
      command: '/metrics',
      name: 'Session Metrics',
      description: 'Get comprehensive session analytics and performance data',
      usage: '/metrics [timeRange]',
      examples: [
        '/metrics',
        '/metrics today',
        '/metrics week'
      ]
    },
    {
      command: '/token-usage',
      name: 'Token Usage Analytics',
      description: 'Analyze token usage, costs, and model performance',
      usage: '/token-usage [groupBy] [timeRange]',
      examples: [
        '/token-usage',
        '/token-usage model week',
        '/token-usage day today'
      ]
    },
    {
      command: '/search',
      name: 'Message Search',
      description: 'Search through chat messages and conversations',
      usage: '/search <query>',
      examples: [
        '/search optimization',
        '/search user feedback',
        '/search error handling'
      ]
    },
    {
      command: '/status',
      name: 'System Status',
      description: 'Check system health, active sessions, and performance',
      usage: '/status',
      examples: ['/status']
    },
    {
      command: '/costs',
      name: 'Cost Analysis',
      description: 'Get detailed cost breakdown and budget tracking',
      usage: '/costs [period]',
      examples: [
        '/costs',
        '/costs daily',
        '/costs monthly'
      ]
    },
    {
      command: '/help-chat',
      name: 'Chat Help',
      description: 'Get help and information about chat capabilities',
      usage: '/help-chat',
      examples: ['/help-chat']
    }
  ];

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      switch (tool.command) {
        case '/chat':
          return await this.handleChatResponse(input, mutations, context);
          
        case '/session-chat':
          return await this.handleSessionChat(input, mutations, context);
          
        case '/analyze':
          return await this.handleAnalyze(input, mutations, context);
          
        case '/metrics':
          return await this.handleMetrics(input, mutations, context);
          
        case '/token-usage':
          return await this.handleTokenUsage(input, mutations, context);
          
        case '/search':
          return await this.handleSearch(input, mutations, context);
          
        case '/status':
          return await this.handleStatus(input, mutations, context);
          
        case '/costs':
          return await this.handleCosts(input, mutations, context);
          
        case '/help-chat':
          return await this.handleHelp(input, mutations, context);
          
        default:
          return {
            success: false,
            message: `Unknown command: ${tool.command}`
          };
      }
    } catch (error) {
      console.error(`SessionChatAgent execution error:`, error);
      return {
        success: false,
        message: `Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleChatResponse(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse the input message
      const message = input.trim();
      if (!message) {
        return {
          success: false,
          message: 'Please provide a message to chat about.'
        };
      }

      // First, try to parse as MCP query using NLP
      const nlpResult = await nlpMcpParser.executeQuery(message, context?.sessionId);
      
      // If NLP parsing was successful and confident, return MCP result
      if (nlpResult.success && nlpResult.parsed && !nlpResult.parsed.fallbackToChat) {
        // Store the conversation if we have session context
        if (context?.sessionId) {
          try {
            await mutations.addChatMessage({
              role: 'user',
              content: message,
              sessionId: context.sessionId,
              userId: context.userId
            });
            
            await mutations.addChatMessage({
              role: 'assistant',
              content: nlpResult.formattedResponse!,
              sessionId: context.sessionId,
              userId: context.userId
            });
          } catch (error) {
            console.warn('Failed to store MCP chat messages:', error);
          }
        }

        return {
          success: true,
          message: nlpResult.formattedResponse!,
          data: {
            type: 'mcp_result',
            intent: nlpResult.parsed.intent,
            confidence: nlpResult.parsed.confidence,
            mcpTool: nlpResult.parsed.mcpTool,
            suggestedCommand: nlpResult.parsed.suggestedCommand,
            mcpData: nlpResult.mcpResult
          }
        };
      }

      // If MCP parsing suggested fallback or failed, use regular Claude chat
      // But include the NLP insight if available
      let systemPrompt = 'You are a helpful AI assistant in a session management context. Provide clear, informative, and engaging responses.';
      
      if (nlpResult.parsed && nlpResult.parsed.fallbackToChat) {
        systemPrompt += `\n\nNote: The user asked "${message}" which seems to be about ${nlpResult.parsed.intent} (confidence: ${(nlpResult.parsed.confidence * 100).toFixed(0)}%). If they're looking for specific data or metrics, suggest they try: ${nlpResult.parsed.suggestedCommand || 'a more specific command'}.`;
      }

      // Create a simple conversation with just the user message
      const messages = [
        { role: 'user' as const, content: message, timestamp: Date.now() }
      ];

      // Send to Claude for response
      const response = await sessionChatService.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt
      });

      // Store the conversation if we have a session context
      if (context?.sessionId) {
        try {
          await mutations.addChatMessage({
            role: 'user',
            content: message,
            sessionId: context.sessionId,
            userId: context.userId
          });
          
          await mutations.addChatMessage({
            role: 'assistant',
            content: response.content,
            sessionId: context.sessionId,
            userId: context.userId
          });
        } catch (error) {
          console.warn('Failed to store chat messages:', error);
        }
      }

      return {
        success: true,
        message: response.content,
        data: {
          type: 'chat_response',
          usage: response.usage,
          model: 'claude-3-5-haiku-20241022',
          tokens: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
          cost: response.usage?.totalCost,
          nlpInsight: nlpResult.parsed ? {
            intent: nlpResult.parsed.intent,
            confidence: nlpResult.parsed.confidence,
            suggestedCommand: nlpResult.parsed.suggestedCommand
          } : undefined
        }
      };

    } catch (error) {
      console.error('Chat response error:', error);
      return {
        success: false,
        message: `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleSessionChat(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // This would ideally fetch conversation history from the database
      // For now, we'll treat it like a regular chat with session awareness
      const message = input.trim();
      if (!message) {
        return {
          success: false,
          message: 'Please provide a message for session chat.'
        };
      }

      // First, try to parse as MCP query using NLP
      const nlpResult = await nlpMcpParser.executeQuery(message, context?.sessionId);
      
      // If NLP parsing was successful and confident, return MCP result
      if (nlpResult.success && nlpResult.parsed && !nlpResult.parsed.fallbackToChat) {
        // Store in session context
        if (context?.sessionId) {
          try {
            await mutations.addChatMessage({
              role: 'user',
              content: message,
              sessionId: context.sessionId,
              userId: context.userId
            });
            
            await mutations.addChatMessage({
              role: 'assistant',
              content: nlpResult.formattedResponse!,
              sessionId: context.sessionId,
              userId: context.userId
            });
          } catch (error) {
            console.warn('Failed to store session chat messages:', error);
          }
        }

        return {
          success: true,
          message: nlpResult.formattedResponse!,
          data: {
            type: 'mcp_result',
            sessionId: context?.sessionId,
            intent: nlpResult.parsed.intent,
            confidence: nlpResult.parsed.confidence,
            mcpTool: nlpResult.parsed.mcpTool,
            suggestedCommand: nlpResult.parsed.suggestedCommand,
            sessionAware: true,
            mcpData: nlpResult.mcpResult
          }
        };
      }

      // Enhanced system prompt for session awareness
      let sessionSystemPrompt = `You are a helpful AI assistant with session awareness. You are participating in an ongoing conversation within a session management context. 
      
      Provide clear, informative, and engaging responses while being aware that this is part of a longer conversation. Reference previous context when appropriate and maintain conversational continuity.`;

      if (nlpResult.parsed && nlpResult.parsed.fallbackToChat) {
        sessionSystemPrompt += `\n\nNote: The user asked "${message}" which seems to be about ${nlpResult.parsed.intent} (confidence: ${(nlpResult.parsed.confidence * 100).toFixed(0)}%). If they're looking for specific data or metrics, suggest they try: ${nlpResult.parsed.suggestedCommand || 'a more specific command'}.`;
      }

      const messages = [
        { role: 'user' as const, content: message, timestamp: Date.now() }
      ];

      const response = await sessionChatService.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 1200,
        systemPrompt: sessionSystemPrompt
      });

      // Store in session context
      if (context?.sessionId) {
        try {
          await mutations.addChatMessage({
            role: 'user',
            content: message,
            sessionId: context.sessionId,
            userId: context.userId
          });
          
          await mutations.addChatMessage({
            role: 'assistant',
            content: response.content,
            sessionId: context.sessionId,
            userId: context.userId
          });
        } catch (error) {
          console.warn('Failed to store session chat messages:', error);
        }
      }

      return {
        success: true,
        message: response.content,
        data: {
          type: 'session_chat',
          sessionId: context?.sessionId,
          usage: response.usage,
          model: 'claude-3-5-haiku-20241022',
          sessionAware: true,
          nlpInsight: nlpResult.parsed ? {
            intent: nlpResult.parsed.intent,
            confidence: nlpResult.parsed.confidence,
            suggestedCommand: nlpResult.parsed.suggestedCommand
          } : undefined
        }
      };

    } catch (error) {
      console.error('Session chat error:', error);
      return {
        success: false,
        message: `Session chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleAnalyze(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      const textToAnalyze = input.trim();
      if (!textToAnalyze) {
        return {
          success: false,
          message: 'Please provide text to analyze.'
        };
      }

      const analysisPrompt = `Analyze this text for sentiment, intent, and key topics: "${textToAnalyze}"

      Provide a structured analysis including:
      1. Sentiment (positive, negative, or neutral)
      2. Main intent or purpose
      3. Key topics and themes
      4. Emotional tone
      5. Any actionable insights`;

      const messages = [
        { role: 'user' as const, content: analysisPrompt }
      ];

      const response = await sessionChatService.sendMessage(messages, {
        temperature: 0.3,
        maxTokens: 800,
        systemPrompt: 'You are an expert content analyzer. Provide clear, structured analysis of text content.'
      });

      // Store analysis if in session context
      if (context?.sessionId) {
        try {
          await mutations.addChatMessage({
            role: 'user',
            content: `Analysis request: ${textToAnalyze}`,
            sessionId: context.sessionId,
            userId: context.userId,
            operation: {
              type: 'tool_executed',
              details: { tool: 'content_analysis', text_length: textToAnalyze.length }
            }
          });
          
          await mutations.addChatMessage({
            role: 'assistant',
            content: response.content,
            sessionId: context.sessionId,
            userId: context.userId
          });
        } catch (error) {
          console.warn('Failed to store analysis messages:', error);
        }
      }

      return {
        success: true,
        message: response.content,
        data: {
          analysisType: 'content_analysis',
          originalText: textToAnalyze,
          textLength: textToAnalyze.length,
          usage: response.usage
        }
      };

    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        message: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleMetrics(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse time range from input
      const timeRange = this.parseTimeRange(input) || 'all';
      
      const result = await mcpClient.getSessionMetrics({
        sessionId: context?.sessionId,
        timeRange,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.formattedMessage || 'Failed to retrieve session metrics'
        };
      }

      return {
        success: true,
        message: result.formattedMessage!,
        data: {
          tool: 'session_metrics',
          timeRange,
          rawData: result.data
        }
      };

    } catch (error) {
      console.error('Metrics error:', error);
      return {
        success: false,
        message: `Failed to retrieve metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleTokenUsage(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      const { groupBy, timeRange } = this.parseTokenUsageParams(input);
      
      const result = await mcpClient.getTokenUsage({
        groupBy,
        timeRange,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.formattedMessage || 'Failed to retrieve token usage data'
        };
      }

      return {
        success: true,
        message: result.formattedMessage!,
        data: {
          tool: 'token_usage',
          groupBy,
          timeRange,
          rawData: result.data
        }
      };

    } catch (error) {
      console.error('Token usage error:', error);
      return {
        success: false,
        message: `Failed to retrieve token usage: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleSearch(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      const query = input.trim();
      if (!query) {
        return {
          success: false,
          message: 'Please provide a search query. Example: /search optimization'
        };
      }

      const result = await mcpClient.searchMessages({
        query,
        sessionId: context?.sessionId,
        limit: 10,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.formattedMessage || `Failed to search for "${query}"`
        };
      }

      return {
        success: true,
        message: result.formattedMessage!,
        data: {
          tool: 'message_search',
          query,
          resultCount: Array.isArray(result.data) ? result.data.length : 0,
          rawData: result.data
        }
      };

    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleStatus(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Get both system health and active sessions
      const [healthResult, sessionsResult] = await Promise.all([
        mcpClient.getSystemHealth(),
        mcpClient.getActiveSessions(false)
      ]);

      let statusMessage = '';
      
      if (healthResult.success) {
        statusMessage += healthResult.formattedMessage + '\n\n';
      }
      
      if (sessionsResult.success) {
        statusMessage += sessionsResult.formattedMessage;
      }

      if (!healthResult.success && !sessionsResult.success) {
        return {
          success: false,
          message: 'Unable to retrieve system status at this time'
        };
      }

      return {
        success: true,
        message: statusMessage.trim(),
        data: {
          tool: 'system_status',
          health: healthResult.data,
          sessions: sessionsResult.data
        }
      };

    } catch (error) {
      console.error('Status error:', error);
      return {
        success: false,
        message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleCosts(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      const period = this.parsePeriod(input) || 'weekly';
      
      const result = await mcpClient.getCostBreakdown(period);

      if (!result.success) {
        return {
          success: false,
          message: result.formattedMessage || 'Failed to retrieve cost breakdown'
        };
      }

      return {
        success: true,
        message: result.formattedMessage!,
        data: {
          tool: 'cost_breakdown',
          period,
          rawData: result.data
        }
      };

    } catch (error) {
      console.error('Cost breakdown error:', error);
      return {
        success: false,
        message: `Cost analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Helper methods for parsing parameters
  private parseTimeRange(input: string): 'today' | 'week' | 'month' | 'all' | undefined {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('today')) return 'today';
    if (lowerInput.includes('week')) return 'week';
    if (lowerInput.includes('month')) return 'month';
    if (lowerInput.includes('all')) return 'all';
    return undefined;
  }

  private parseTokenUsageParams(input: string): {
    groupBy: 'session' | 'model' | 'day' | 'hour';
    timeRange: 'today' | 'week' | 'month' | 'all';
  } {
    const lowerInput = input.toLowerCase();
    
    let groupBy: 'session' | 'model' | 'day' | 'hour' = 'day';
    if (lowerInput.includes('session')) groupBy = 'session';
    if (lowerInput.includes('model')) groupBy = 'model';
    if (lowerInput.includes('hour')) groupBy = 'hour';
    
    let timeRange: 'today' | 'week' | 'month' | 'all' = 'week';
    if (lowerInput.includes('today')) timeRange = 'today';
    if (lowerInput.includes('month')) timeRange = 'month';
    if (lowerInput.includes('all')) timeRange = 'all';
    
    return { groupBy, timeRange };
  }

  private parsePeriod(input: string): 'daily' | 'weekly' | 'monthly' | undefined {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('daily')) return 'daily';
    if (lowerInput.includes('weekly')) return 'weekly';
    if (lowerInput.includes('monthly')) return 'monthly';
    return undefined;
  }

  private async handleHelp(
    _input: string,
    _mutations: ConvexMutations,
    _context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const helpText = `
🤖 **Session Manager - AI Command Center with Natural Language Understanding**

**Natural Language Queries** (NEW! 🚀):
Ask me questions naturally and I'll understand what data you need:
• "How are my data metrics for the week?"
• "Show me token usage for today"
• "Search for messages about optimization"
• "What's the system status?"
• "How much did I spend this month?"

**Explicit Commands:**
• \`/metrics [timeRange]\` - Session metrics and activity data
• \`/token-usage [groupBy] [timeRange]\` - Token usage and cost analysis
• \`/search <query>\` - Search through messages and conversations
• \`/status\` - System health and active sessions overview
• \`/costs [period]\` - Detailed cost breakdown and projections

**Chat Commands:**
• \`/chat <message>\` - AI chat with smart MCP integration
• \`/session-chat <message>\` - Session-aware conversation with NLP
• \`/analyze <text>\` - Content analysis and sentiment detection

**Time Ranges:** today, week, month, all
**Grouping Options:** session, model, day, hour
**Cost Periods:** daily, weekly, monthly

**Smart Examples:**
• "How did we perform this week?" → Session metrics
• "What are my costs?" → Cost breakdown
• "Find discussions about errors" → Message search
• "Is everything running okay?" → System status
• "Show me Claude usage" → Token usage by model

**Features:**
🧠 **Natural Language Understanding** - Ask questions naturally
✨ Real-time AI responses using Claude
📊 Comprehensive platform analytics with auto-detection
🔍 Intelligent message search with context awareness
💰 Cost tracking and optimization insights
🎯 Session-aware conversations with memory
🔒 Automatic conversation storage and analysis

**How it works:**
1. Type your question naturally (like "how are my metrics?")
2. I'll detect if you want data/analytics and fetch it automatically
3. If unclear, I'll suggest the right command or provide general help
4. All conversations are context-aware and remember your session

Your Session Manager now **understands natural language** and automatically provides the right data! 🚀📊
    `.trim();

    return {
      success: true,
      message: helpText,
      data: {
        helpType: 'chat_agent_help',
        availableCommands: this.tools.map(t => t.command),
        timestamp: new Date().toISOString()
      }
    };
  }

  // Override canExecute for custom permission logic
  canExecute(): boolean {
    // Session chat is available to all users
    return true;
  }

  // Enhanced metadata
  getMetadata() {
    return {
      ...super.getMetadata(),
      version: '2.0.0',
      capabilities: [
        'chat', 
        'session-awareness', 
        'content-analysis',
        'platform-analytics',
        'cost-tracking',
        'message-search',
        'system-monitoring'
      ],
      models: ['claude-3-5-haiku-20241022'],
      maxTokens: 4000,
      supportedLanguages: ['en'],
      features: {
        sessionPersistence: true,
        contextAware: true,
        contentAnalysis: true,
        realTimeResponse: true,
        platformAnalytics: true,
        costTracking: true,
        messageSearch: true,
        systemHealth: true,
        mcpIntegration: true
      },
      mcpTools: [
        'session_metrics',
        'token_usage', 
        'message_search',
        'system_health',
        'active_sessions',
        'cost_breakdown',
        'engagement_analysis'
      ]
    };
  }
}

// Export singleton instance for registry
export const sessionChatAgent = new SessionChatAgent();