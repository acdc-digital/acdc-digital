/**
 * MCP Client for Session Manager
 * 
 * Provides direct access to MCP server tools from within the Session Manager agent
 * Allows natural language queries to be translated into database queries
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  formattedMessage?: string;
}

export class MCPClient {
  private convex: ConvexHttpClient;

  constructor() {
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }

  /**
   * Get session metrics with natural language interface
   */
  async getSessionMetrics(params: {
    sessionId?: string;
    timeRange?: 'today' | 'week' | 'month' | 'all';
  }): Promise<MCPToolResult> {
    try {
      const metrics = await this.convex.query(api.analytics.getSessionMetrics, {
        sessionId: params.sessionId as any, // TODO: Proper Id<"sessions"> type conversion
        timeRange: params.timeRange || 'all',
      });

      const formatted = this.formatSessionMetrics(metrics);
      
      return {
        success: true,
        data: metrics,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: 'Unable to retrieve session metrics at this time.',
      };
    }
  }

  /**
   * Get token usage analytics
   */
  async getTokenUsage(params: {
    groupBy?: 'session' | 'model' | 'day' | 'hour';
    timeRange?: 'today' | 'week' | 'month' | 'all';
  }): Promise<MCPToolResult> {
    try {
      const usage = await this.convex.query(api.analytics.getTokenUsage, {
        groupBy: params.groupBy || 'day',
        timeRange: params.timeRange || 'week',
      });

      const formatted = this.formatTokenUsage(usage, params.timeRange || 'week');
      
      return {
        success: true,
        data: usage,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: 'Unable to retrieve token usage data at this time.',
      };
    }
  }

  /**
   * Search messages across sessions
   */
  async searchMessages(params: {
    query: string;
    sessionId?: string;
    limit?: number;
  }): Promise<MCPToolResult> {
    try {
      const results = await this.convex.query(api.analytics.searchMessages, {
        query: params.query,
        sessionId: params.sessionId as any, // TODO: Proper Id<"sessions"> type conversion
        limit: params.limit || 10,
      });

      const formatted = this.formatSearchResults(results, params.query);
      
      return {
        success: true,
        data: results,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: `Unable to search for "${params.query}" at this time.`,
      };
    }
  }

  /**
   * Get active sessions status
   */
  async getActiveSessions(includeDetails = false): Promise<MCPToolResult> {
    try {
      const sessions = await this.convex.query(api.analytics.getActiveSessions, {
        includeDetails,
      });

      const formatted = this.formatActiveSessions(sessions);
      
      return {
        success: true,
        data: sessions,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: 'Unable to retrieve active sessions at this time.',
      };
    }
  }

  /**
   * Analyze engagement metrics
   */
  async analyzeEngagement(params: {
    metric: 'messages' | 'duration' | 'retention' | 'cost_efficiency';
    timeRange: 'today' | 'week' | 'month';
  }): Promise<MCPToolResult> {
    try {
      const analysis = await this.convex.query(api.analytics.analyzeEngagement, {
        metric: params.metric,
        timeRange: params.timeRange,
      });

      const formatted = this.formatEngagementAnalysis(analysis);
      
      return {
        success: true,
        data: analysis,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: 'Unable to analyze engagement metrics at this time.',
      };
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<MCPToolResult> {
    try {
      const health = await this.convex.query(api.analytics.getSystemHealth, {});

      const formatted = this.formatSystemHealth(health);
      
      return {
        success: true,
        data: health,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: 'Unable to check system health at this time.',
      };
    }
  }

  /**
   * Get cost breakdown analysis
   */
  async getCostBreakdown(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<MCPToolResult> {
    try {
      const costs = await this.convex.query(api.analytics.getCostBreakdown, {
        period,
      });

      const formatted = this.formatCostBreakdown(costs);
      
      return {
        success: true,
        data: costs,
        formattedMessage: formatted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formattedMessage: 'Unable to retrieve cost breakdown at this time.',
      };
    }
  }

  // Formatting helpers for human-readable responses

  private formatSessionMetrics(metrics: any): string {
    const {
      totalSessions,
      activeSessions,
      pausedSessions,
      totalMessages,
      averageMessagesPerSession,
      mostActiveSession,
    } = metrics as any;

    return `📊 **Session Metrics Summary**

🎯 **Overview**: ${totalSessions} total sessions
• Active: ${activeSessions}
• Paused: ${pausedSessions}

💬 **Activity**: ${totalMessages} total messages
• Average per session: ${averageMessagesPerSession.toFixed(1)}

🏆 **Most Active**: ${mostActiveSession?.name || 'N/A'} (${mostActiveSession?.messageCount || 0} messages)`;
  }

  private formatTokenUsage(usage: any, timeRange: string): string {
    const {
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      successRate,
      topModels,
    } = usage as any;

    const costFormatted = totalCost.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    });

    return `💰 **Token Usage (${timeRange})**

📈 **Usage**: ${totalTokens.toLocaleString()} tokens
• Input: ${totalInputTokens.toLocaleString()}
• Output: ${totalOutputTokens.toLocaleString()}

💵 **Cost**: ${costFormatted}
✅ **Success Rate**: ${successRate.toFixed(1)}%

🤖 **Top Models**:
${topModels.slice(0, 3).map((m: any) => 
  `• ${m.model}: ${m.tokens.toLocaleString()} tokens ($${m.cost.toFixed(4)})`
).join('\n')}`;
  }

  private formatSearchResults(results: any[], query: string): string {
    if (results.length === 0) {
      return `🔍 No results found for "${query}"`;
    }

    const resultText = results.slice(0, 5).map((r: any, i: number) => 
      `${i + 1}. **${r.sessionName}** (${new Date(r.timestamp).toLocaleDateString()})
   "${r.content.substring(0, 100)}${r.content.length > 100 ? '...' : ''}"`
    ).join('\n\n');

    return `🔍 **Search Results for "${query}"** (${results.length} found)

${resultText}

${results.length > 5 ? `\n...and ${results.length - 5} more results` : ''}`;
  }

  private formatActiveSessions(sessions: any[]): string {
    if (sessions.length === 0) {
      return '📱 No active sessions currently running';
    }

    const sessionList = sessions.slice(0, 10).map((s: any) => 
      `• **${s.name}** (${s.messageCount} messages) - Last active: ${new Date(s.lastActivity).toLocaleTimeString()}`
    ).join('\n');

    return `📱 **Active Sessions** (${sessions.length} total)

${sessionList}

${sessions.length > 10 ? `\n...and ${sessions.length - 10} more sessions` : ''}`;
  }

  private formatEngagementAnalysis(analysis: any): string {
    const { metric, current, previous, changePercent, trend, insights } = analysis;
    
    const change = changePercent > 0 ? '📈' : changePercent < 0 ? '📉' : '➡️';
    const changeText = changePercent > 0 ? '+' : '';

    return `📊 **${metric.charAt(0).toUpperCase() + metric.slice(1)} Analysis**

📈 **Current**: ${current.toLocaleString()}
📊 **Previous**: ${previous.toLocaleString()}
${change} **Change**: ${changeText}${changePercent.toFixed(1)}% (${trend})

💡 **Insights**:
${insights.map((insight: string) => `• ${insight}`).join('\n')}`;
  }

  private formatSystemHealth(health: any): string {
    const { status, activeSessions, systemLoad, health: components, alerts } = health;

    const statusEmoji = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';

    return `${statusEmoji} **System Health: ${status.toUpperCase()}**

🎯 **Active Sessions**: ${activeSessions}
📊 **System Load**:
• Messages: ${systemLoad.messages}
• Token Usage: ${systemLoad.tokenUsage.toLocaleString()}
• Errors: ${systemLoad.errors}

🔧 **Components**:
• Database: ${components.database}
• API: ${components.api}
• Chat: ${components.chat}

${alerts.length > 0 ? `\n⚠️ **Alerts**:\n${alerts.map((alert: string) => `• ${alert}`).join('\n')}` : ''}`;
  }

  private formatCostBreakdown(costs: any): string {
    const { totalCost, breakdown, projections, recommendations } = costs;

    const costFormatted = totalCost.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    });

    return `💰 **Cost Breakdown** (${costs.period})

💵 **Total Cost**: ${costFormatted}

📊 **Breakdown**:
• Chat: $${breakdown.chat.toFixed(4)} (${((breakdown.chat / totalCost) * 100).toFixed(1)}%)
• Generation: $${breakdown.generation.toFixed(4)} (${((breakdown.generation / totalCost) * 100).toFixed(1)}%)
• Analysis: $${breakdown.analysis.toFixed(4)} (${((breakdown.analysis / totalCost) * 100).toFixed(1)}%)

📈 **Projections**:
• Daily: $${projections.daily.toFixed(4)}
• Weekly: $${projections.weekly.toFixed(4)}
• Monthly: $${projections.monthly.toFixed(4)}

💡 **Recommendations**:
${recommendations.map((rec: string) => `• ${rec}`).join('\n')}`;
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();