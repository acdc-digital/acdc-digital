#!/usr/bin/env node

/**
 * SMNB MCP Server (HTTP Transport)
 * 
 * Provides Model Context Protocol access to SMNB news studio database
 * Uses HTTP transport for Claude's native MCP connector integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

class SMNBMCPServer {
  private server: Server;
  private app: express.Application;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.MCP_PORT || '3001');
    this.app = express();
    
    // Configure Express middleware
    this.app.use(cors());
    this.app.use(express.json());
    
    this.server = new Server(
      {
        name: 'smnb-news-studio',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        server: 'smnb-mcp-server', 
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    // MCP tools endpoint
    this.app.post('/mcp/tools', async (req, res) => {
      try {
        const tools = await this.server.request(
          { method: 'tools/list' },
          ListToolsRequestSchema
        );
        res.json(tools);
      } catch (error) {
        console.error('Error listing tools:', error);
        res.status(500).json({ 
          error: 'Failed to list tools',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // MCP call endpoint
    this.app.post('/mcp/call', async (req, res) => {
      try {
        const { name, arguments: args } = req.body;
        
        const result = await this.server.request(
          { 
            method: 'tools/call',
            params: { name, arguments: args }
          },
          CallToolRequestSchema
        );
        
        res.json(result);
      } catch (error) {
        console.error('Error calling tool:', error);
        res.status(500).json({ 
          error: 'Failed to call tool',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Root endpoint with server info
    this.app.get('/', (req, res) => {
      res.json({
        name: 'SMNB MCP Server',
        version: '1.0.0',
        description: 'Model Context Protocol server for SMNB Session Manager',
        endpoints: {
          health: '/health',
          tools: '/mcp/tools',
          call: '/mcp/call'
        },
        capabilities: ['analytics', 'session-management', 'token-tracking']
      });
    });
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'get_session_metrics',
          description: 'Get comprehensive metrics for sessions including activity, duration, and engagement',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: {
                type: 'string',
                description: 'Optional specific session ID to analyze',
              },
              timeRange: {
                type: 'string',
                description: 'Time range for metrics: today, week, month, all',
                enum: ['today', 'week', 'month', 'all'],
              },
            },
          },
        },
        {
          name: 'get_token_usage',
          description: 'Analyze token usage and costs across the platform',
          inputSchema: {
            type: 'object',
            properties: {
              groupBy: {
                type: 'string',
                description: 'Group results by: session, model, day, hour',
                enum: ['session', 'model', 'day', 'hour'],
              },
              timeRange: {
                type: 'string',
                description: 'Time range: today, week, month, all',
                enum: ['today', 'week', 'month', 'all'],
              },
            },
          },
        },
        {
          name: 'search_messages',
          description: 'Search through chat messages and conversations',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query text',
              },
              sessionId: {
                type: 'string',
                description: 'Optional session ID to limit search scope',
              },
              limit: {
                type: 'number',
                description: 'Maximum results to return (default 10)',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_active_sessions',
          description: 'Get currently active sessions and their status',
          inputSchema: {
            type: 'object',
            properties: {
              includeDetails: {
                type: 'boolean',
                description: 'Include detailed metrics for each session',
              },
            },
          },
        },
        {
          name: 'analyze_engagement',
          description: 'Analyze user engagement patterns and trends',
          inputSchema: {
            type: 'object',
            properties: {
              metric: {
                type: 'string',
                description: 'Engagement metric to analyze',
                enum: ['messages', 'duration', 'retention', 'cost_efficiency'],
              },
              timeRange: {
                type: 'string',
                description: 'Time range for analysis',
                enum: ['today', 'week', 'month'],
              },
            },
          },
        },
        {
          name: 'get_system_health',
          description: 'Check overall system health and performance metrics',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_cost_breakdown',
          description: 'Detailed cost analysis and budget tracking',
          inputSchema: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                description: 'Period for cost analysis',
                enum: ['daily', 'weekly', 'monthly'],
              },
            },
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_session_metrics':
            return await this.getSessionMetrics(args);
          
          case 'get_token_usage':
            return await this.getTokenUsage(args);
          
          case 'search_messages':
            return await this.searchMessages(args);
          
          case 'get_active_sessions':
            return await this.getActiveSessions(args);
          
          case 'analyze_engagement':
            return await this.analyzeEngagement(args);
          
          case 'get_system_health':
            return await this.getSystemHealth();
          
          case 'get_cost_breakdown':
            return await this.getCostBreakdown(args);
          
          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async getSessionMetrics(args: any) {
    try {
      // This will call a Convex function we'll create
      const metrics = await convex.query(api.analytics.queries.getSessionMetrics, {
        sessionId: args.sessionId,
        timeRange: args.timeRange || 'all',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(metrics, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Session metrics temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async getTokenUsage(args: any) {
    try {
      const usage = await convex.query(api.analytics.queries.getTokenUsage, {
        groupBy: args.groupBy || 'day',
        timeRange: args.timeRange || 'week',
      });

      // Format the response for better readability
      const summary = {
        period: args.timeRange || 'week',
        grouping: args.groupBy || 'day',
        totalTokens: usage.totalTokens || 0,
        totalCost: usage.totalCost || 0,
        breakdown: usage.breakdown || {},
        trends: usage.trends || {},
      };

      return {
        content: [
          {
            type: 'text',
            text: `Token Usage Analysis:\n\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Token usage data temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async searchMessages(args: any) {
    try {
      const results = await convex.query(api.analytics.queries.searchMessages, {
        query: args.query,
        sessionId: args.sessionId,
        limit: args.limit || 10,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Message Search Results for "${args.query}":\n\n${JSON.stringify(results, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Message search temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async getActiveSessions(args: any) {
    try {
      const sessions = await convex.query(api.analytics.queries.getActiveSessions, {
        includeDetails: args.includeDetails || false,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Active Sessions:\n\n${JSON.stringify(sessions, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Active sessions data temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async analyzeEngagement(args: any) {
    try {
      const analysis = await convex.query(api.analytics.queries.analyzeEngagement, {
        metric: args.metric || 'messages',
        timeRange: args.timeRange || 'week',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Engagement Analysis (${args.metric}):\n\n${JSON.stringify(analysis, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Engagement analysis temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async getSystemHealth() {
    try {
      const health = await convex.query(api.analytics.queries.getSystemHealth, {});

      return {
        content: [
          {
            type: 'text',
            text: `System Health Report:\n\n${JSON.stringify(health, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `System health check temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async getCostBreakdown(args: any) {
    try {
      const costs = await convex.query(api.analytics.queries.getCostBreakdown, {
        period: args.period || 'weekly',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Cost Breakdown (${args.period || 'weekly'}):\n\n${JSON.stringify(costs, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Cost breakdown temporarily unavailable. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  async run() {
    try {
      this.app.listen(this.port, () => {
        console.error(`🚀 SMNB MCP Server running on http://localhost:${this.port}`);
        console.error('📡 Available endpoints:');
        console.error(`   GET  http://localhost:${this.port}/health`);
        console.error(`   POST http://localhost:${this.port}/mcp/tools`);
        console.error(`   POST http://localhost:${this.port}/mcp/call`);
        console.error('✅ Ready for Claude MCP connector integration');
      });
    } catch (error) {
      console.error('❌ Failed to start SMNB MCP Server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new SMNBMCPServer();
server.run();