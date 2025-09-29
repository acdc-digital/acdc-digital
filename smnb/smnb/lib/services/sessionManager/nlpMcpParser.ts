/**
 * NLP-MCP Parser
 * 
 * Intelligently parses natural language queries and routes them to appropriate MCP tools
 * Handles intent recognition, parameter extraction, and command mapping
 */

import { mcpClient } from './mcpClient';

export interface ParsedQuery {
  intent: string;
  confidence: number;
  mcpTool?: string;
  parameters: Record<string, any>;
  suggestedCommand?: string;
  fallbackToChat?: boolean;
  explanation?: string;
}

export interface NLPResult {
  success: boolean;
  parsed?: ParsedQuery;
  error?: string;
  mcpResult?: any;
  formattedResponse?: string;
}

export class NLPMCPParser {
  private intentPatterns = {
    // Session Metrics Patterns - Enhanced to catch "data metrics", "platform metrics", etc.
    session_metrics: [
      /(?:how are|what are|show me|get|check).*(?:session|sessions).*(?:metrics?|stats?|data|performance|activity)/i,
      /(?:how are|what are|show me|get|check).*(?:data|platform|my|our).*(?:metrics?|stats?|performance|activity)/i,
      /(?:metrics?|stats?|data).*(?:session|sessions)/i,
      /(?:metrics?|stats?|data).*(?:for the|this|past).*(?:week|month|day)/i,
      /(?:session|sessions).*(?:overview|summary|report)/i,
      /(?:active|total|current).*sessions/i,
      /how many.*sessions/i,
      /session.*(?:analytics|performance)/i,
      /(?:data|platform|system).*(?:metrics?|analytics|performance).*(?:week|month|day|today)/i,
      /(?:weekly|monthly|daily).*(?:metrics?|data|stats?|performance)/i
    ],

    // Token Usage Patterns  
    token_usage: [
      /(?:token|tokens).*(?:usage|used|consumption|spend|spending|cost|costs)/i,
      /(?:how much|what|show).*(?:tokens?|cost|costs|spending)/i,
      /(?:usage|cost|costs).*(?:token|tokens)/i,
      /api.*(?:usage|cost|costs)/i,
      /(?:claude|openai|ai).*(?:usage|cost|costs)/i,
      /(?:monthly|weekly|daily).*(?:usage|cost|costs|spend)/i
    ],

    // Search Patterns
    message_search: [
      /(?:search|find|look for).*(?:message|messages|conversation|chat)/i,
      /(?:find|search).*(?:about|for|containing)/i,
      /(?:message|messages).*(?:about|containing|with)/i,
      /(?:conversation|chat).*(?:history|search)/i,
      /what.*(?:said|discussed|talked about)/i,
      /(?:search|find).*(?:keyword|term|phrase)/i
    ],

    // System Status Patterns
    system_status: [
      /(?:system|platform).*(?:status|health|performance)/i,
      /(?:health|status).*(?:check|report|overview)/i,
      /(?:how is|how's).*(?:system|platform|everything)/i,
      /(?:active|current).*(?:sessions|users)/i,
      /is.*(?:working|running|operational)/i,
      /(?:system|platform).*(?:running|operational|up)/i,
      /any.*(?:issues|problems|errors)/i
    ],

    // Cost Analysis Patterns
    cost_analysis: [
      /(?:cost|costs|spending|budget).*(?:breakdown|analysis|report)/i,
      /(?:how much|what).*(?:spent|spending|cost|costs)/i,
      /(?:monthly|weekly|daily).*(?:cost|costs|budget|spending)/i,
      /(?:budget|spending).*(?:overview|summary|report)/i,
      /(?:cost|costs).*(?:this|last).*(?:week|month|day)/i,
      /(?:expense|expenses).*(?:report|breakdown)/i
    ],

    // Engagement Analysis Patterns
    engagement_analysis: [
      /(?:engagement|activity).*(?:metrics?|stats?|analysis)/i,
      /(?:user|users).*(?:engagement|activity|behavior)/i,
      /(?:how are|what are).*(?:users|people).*(?:engaging|active)/i,
      /(?:retention|activity).*(?:rate|stats?)/i,
      /(?:performance|engagement).*(?:trends?|patterns?)/i
    ]
  };

  private timeRangePatterns = {
    today: /today|this day/i,
    week: /(?:this )?week|weekly|past week|last week/i,
    month: /(?:this )?month|monthly|past month|last month/i,
    all: /all time|everything|total|overall/i
  };

  private groupByPatterns = {
    session: /by session|per session|session wise/i,
    model: /by model|per model|model wise|(?:claude|gpt|openai)/i,
    day: /by day|daily|per day/i,
    hour: /by hour|hourly|per hour/i
  };

  private periodPatterns = {
    daily: /daily|per day|day by day/i,
    weekly: /weekly|per week|week by week/i,
    monthly: /monthly|per month|month by month/i
  };

  /**
   * Parse natural language query and determine intent
   */
  async parseQuery(query: string): Promise<ParsedQuery> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check for explicit commands first
    if (normalizedQuery.startsWith('/')) {
      return this.parseExplicitCommand(normalizedQuery);
    }

    // Analyze intent using pattern matching
    const intentAnalysis = this.analyzeIntent(normalizedQuery);
    
    // Extract parameters based on intent
    const parameters = this.extractParameters(normalizedQuery, intentAnalysis.intent);
    
    return {
      intent: intentAnalysis.intent,
      confidence: intentAnalysis.confidence,
      mcpTool: this.mapIntentToTool(intentAnalysis.intent),
      parameters,
      suggestedCommand: this.generateSuggestedCommand(intentAnalysis.intent, parameters),
      fallbackToChat: intentAnalysis.confidence < 0.6,
      explanation: this.generateExplanation(intentAnalysis.intent, parameters)
    };
  }

  /**
   * Execute parsed query using appropriate MCP tool
   */
  async executeQuery(query: string, sessionId?: string): Promise<NLPResult> {
    try {
      const parsed = await this.parseQuery(query);
      
      if (parsed.fallbackToChat) {
        return {
          success: true,
          parsed,
          formattedResponse: `I understand you're asking about "${query}", but I'm not completely sure what specific data you need. You can try:\n\n• \`/metrics week\` for session metrics\n• \`/token-usage\` for cost analysis\n• \`/status\` for system health\n• \`/search <term>\` to find messages\n\nOr ask me a more specific question!`
        };
      }

      let mcpResult;
      
      switch (parsed.mcpTool) {
        case 'session_metrics':
          mcpResult = await mcpClient.getSessionMetrics({
            sessionId,
            timeRange: parsed.parameters.timeRange || 'week'
          });
          break;
          
        case 'token_usage':
          mcpResult = await mcpClient.getTokenUsage({
            groupBy: parsed.parameters.groupBy || 'day',
            timeRange: parsed.parameters.timeRange || 'week'
          });
          break;
          
        case 'message_search':
          if (!parsed.parameters.searchTerm) {
            return {
              success: false,
              error: 'Search term not found in query',
              formattedResponse: 'Please specify what you want to search for. Example: "search for optimization" or "find messages about errors"'
            };
          }
          mcpResult = await mcpClient.searchMessages({
            query: parsed.parameters.searchTerm,
            sessionId,
            limit: 10
          });
          break;
          
        case 'system_status':
          mcpResult = await mcpClient.getSystemHealth();
          const sessionsResult = await mcpClient.getActiveSessions(false);
          
          let statusMessage = '';
          if (mcpResult.success) statusMessage += mcpResult.formattedMessage + '\n\n';
          if (sessionsResult.success) statusMessage += sessionsResult.formattedMessage;
          
          return {
            success: true,
            parsed,
            mcpResult: { health: mcpResult.data, sessions: sessionsResult.data },
            formattedResponse: statusMessage.trim()
          };
          
        case 'cost_analysis':
          mcpResult = await mcpClient.getCostBreakdown(
            parsed.parameters.period || 'weekly'
          );
          break;
          
        case 'engagement_analysis':
          mcpResult = await mcpClient.analyzeEngagement({
            metric: parsed.parameters.metric || 'messages',
            timeRange: parsed.parameters.timeRange || 'week'
          });
          break;
          
        default:
          return {
            success: false,
            error: `Unknown MCP tool: ${parsed.mcpTool}`,
            formattedResponse: 'I couldn\'t determine what specific data you\'re looking for. Try using specific commands like `/metrics`, `/token-usage`, or `/status`.'
          };
      }

      return {
        success: mcpResult.success,
        parsed,
        mcpResult: mcpResult.data,
        formattedResponse: mcpResult.formattedMessage || 'Data retrieved successfully',
        error: mcpResult.success ? undefined : mcpResult.error
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedResponse: 'Sorry, I encountered an error processing your request. Please try again or use a specific command.'
      };
    }
  }

  private parseExplicitCommand(command: string): ParsedQuery {
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1).join(' ');

    const commandMap: Record<string, string> = {
      '/metrics': 'session_metrics',
      '/token-usage': 'token_usage', 
      '/search': 'message_search',
      '/status': 'system_status',
      '/costs': 'cost_analysis'
    };

    const intent = commandMap[cmd] || 'unknown';
    const parameters = this.extractParameters(args, intent);

    return {
      intent,
      confidence: 1.0,
      mcpTool: this.mapIntentToTool(intent),
      parameters,
      suggestedCommand: command,
      fallbackToChat: false,
      explanation: `Explicit command: ${cmd}`
    };
  }

  private analyzeIntent(query: string): { intent: string; confidence: number } {
    let bestMatch = { intent: 'unknown', confidence: 0 };

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      let maxConfidence = 0;
      
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          // Calculate confidence based on pattern specificity and keywords
          const keywordMatches = this.countKeywordMatches(query, intent);
          const confidence = Math.min(0.7 + (keywordMatches * 0.1), 0.95);
          maxConfidence = Math.max(maxConfidence, confidence);
        }
      }
      
      if (maxConfidence > bestMatch.confidence) {
        bestMatch = { intent, confidence: maxConfidence };
      }
    }

    return bestMatch;
  }

  private countKeywordMatches(query: string, intent: string): number {
    const keywords: Record<string, string[]> = {
      session_metrics: ['session', 'metrics', 'stats', 'activity', 'performance'],
      token_usage: ['token', 'usage', 'cost', 'spend', 'api', 'claude'],
      message_search: ['search', 'find', 'message', 'conversation', 'chat'],
      system_status: ['status', 'health', 'system', 'running', 'operational'],
      cost_analysis: ['cost', 'budget', 'spending', 'expense', 'breakdown'],
      engagement_analysis: ['engagement', 'activity', 'users', 'behavior', 'retention']
    };

    const intentKeywords = keywords[intent] || [];
    return intentKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    ).length;
  }

  private extractParameters(query: string, intent: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract time range
    for (const [range, pattern] of Object.entries(this.timeRangePatterns)) {
      if (pattern.test(query)) {
        params.timeRange = range;
        break;
      }
    }

    // Extract groupBy for token usage
    if (intent === 'token_usage') {
      for (const [groupBy, pattern] of Object.entries(this.groupByPatterns)) {
        if (pattern.test(query)) {
          params.groupBy = groupBy;
          break;
        }
      }
    }

    // Extract period for cost analysis
    if (intent === 'cost_analysis') {
      for (const [period, pattern] of Object.entries(this.periodPatterns)) {
        if (pattern.test(query)) {
          params.period = period;
          break;
        }
      }
    }

    // Extract search term for message search
    if (intent === 'message_search') {
      const searchMatches = [
        /(?:search|find|look for).*["']([^"']+)["']/i,
        /(?:search|find|look for).*(?:about|for|containing)\s+([^.!?]+)/i,
        /(?:search|find)\s+([^.!?]+)/i
      ];

      for (const pattern of searchMatches) {
        const match = query.match(pattern);
        if (match && match[1]) {
          params.searchTerm = match[1].trim();
          break;
        }
      }

      // Fallback: extract quoted terms or last significant words
      if (!params.searchTerm) {
        const quotedMatch = query.match(/["']([^"']+)["']/);
        if (quotedMatch) {
          params.searchTerm = quotedMatch[1];
        } else {
          // Extract words after common search indicators
          const words = query.split(' ');
          const searchIndex = words.findIndex(word => 
            ['search', 'find', 'about', 'for', 'containing'].includes(word.toLowerCase())
          );
          if (searchIndex >= 0 && searchIndex < words.length - 1) {
            params.searchTerm = words.slice(searchIndex + 1).join(' ').replace(/[.!?]$/, '');
          }
        }
      }
    }

    // Extract engagement metric
    if (intent === 'engagement_analysis') {
      const metricPatterns = {
        messages: /message|messages|chat|conversation/i,
        duration: /duration|time|length/i,
        retention: /retention|return|comeback/i,
        cost_efficiency: /efficiency|cost.*effect|value/i
      };

      for (const [metric, pattern] of Object.entries(metricPatterns)) {
        if (pattern.test(query)) {
          params.metric = metric;
          break;
        }
      }
    }

    return params;
  }

  private mapIntentToTool(intent: string): string {
    const mapping: Record<string, string> = {
      session_metrics: 'session_metrics',
      token_usage: 'token_usage',
      message_search: 'message_search', 
      system_status: 'system_status',
      cost_analysis: 'cost_analysis',
      engagement_analysis: 'engagement_analysis'
    };

    return mapping[intent] || 'unknown';
  }

  private generateSuggestedCommand(intent: string, parameters: Record<string, any>): string {
    const baseCommands: Record<string, string> = {
      session_metrics: '/metrics',
      token_usage: '/token-usage',
      message_search: '/search',
      system_status: '/status',
      cost_analysis: '/costs',
      engagement_analysis: '/analyze'
    };

    let command = baseCommands[intent] || '/help-chat';

    // Add parameters to command
    if (intent === 'session_metrics' && parameters.timeRange) {
      command += ` ${parameters.timeRange}`;
    }
    
    if (intent === 'token_usage') {
      if (parameters.groupBy) command += ` ${parameters.groupBy}`;
      if (parameters.timeRange) command += ` ${parameters.timeRange}`;
    }
    
    if (intent === 'message_search' && parameters.searchTerm) {
      command += ` ${parameters.searchTerm}`;
    }
    
    if (intent === 'cost_analysis' && parameters.period) {
      command += ` ${parameters.period}`;
    }

    return command;
  }

  private generateExplanation(intent: string, parameters: Record<string, any>): string {
    const explanations: Record<string, string> = {
      session_metrics: `Getting session metrics${parameters.timeRange ? ` for ${parameters.timeRange}` : ''}`,
      token_usage: `Analyzing token usage${parameters.groupBy ? ` grouped by ${parameters.groupBy}` : ''}${parameters.timeRange ? ` for ${parameters.timeRange}` : ''}`,
      message_search: `Searching for messages${parameters.searchTerm ? ` containing "${parameters.searchTerm}"` : ''}`,
      system_status: 'Checking system health and active sessions',
      cost_analysis: `Getting cost breakdown${parameters.period ? ` for ${parameters.period} period` : ''}`,
      engagement_analysis: `Analyzing engagement${parameters.metric ? ` for ${parameters.metric}` : ''}${parameters.timeRange ? ` over ${parameters.timeRange}` : ''}`
    };

    return explanations[intent] || 'Processing your request';
  }

  /**
   * Get available intents and example queries
   */
  getAvailableIntents(): Record<string, string[]> {
    return {
      session_metrics: [
        'How are my sessions performing this week?',
        'How are my data metrics for the week?',
        'Show me session metrics for today',
        'What are the current session stats?',
        'What are my platform metrics?'
      ],
      token_usage: [
        'How much have I spent on tokens this month?',
        'Show me token usage by model',
        'What are my API costs for today?'
      ],
      message_search: [
        'Search for messages about optimization',
        'Find conversations containing errors',
        'Look for discussions about performance'
      ],
      system_status: [
        'How is the system running?',
        'Check system health',
        'Are there any active sessions?'
      ],
      cost_analysis: [
        'Show me the cost breakdown for this month',
        'What are my weekly expenses?',
        'How much am I spending daily?'
      ],
      engagement_analysis: [
        'How are users engaging this week?',
        'Show me retention stats',
        'What are the activity patterns?'
      ]
    };
  }

  /**
   * Test pattern matching for debugging
   */
  testPatternMatching(query: string): Array<{ intent: string; matches: boolean; confidence: number }> {
    const results: Array<{ intent: string; matches: boolean; confidence: number }> = [];
    const normalizedQuery = query.toLowerCase().trim();
    
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      let matches = false;
      let maxConfidence = 0;
      
      for (const pattern of patterns) {
        if (pattern.test(normalizedQuery)) {
          matches = true;
          const keywordMatches = this.countKeywordMatches(normalizedQuery, intent);
          const confidence = Math.min(0.7 + (keywordMatches * 0.1), 0.95);
          maxConfidence = Math.max(maxConfidence, confidence);
        }
      }
      
      results.push({
        intent,
        matches,
        confidence: maxConfidence
      });
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

// Export singleton instance
export const nlpMcpParser = new NLPMCPParser();