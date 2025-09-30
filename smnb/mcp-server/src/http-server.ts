#!/usr/bin/env node

/**
 * SMNB HTTP MCP Server
 * 
 * Simplified HTTP server that exposes MCP tools for Claude's native connector
 * Provides direct REST endpoints for database analytics
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Lazy-initialize Convex client to avoid errors when CONVEX_URL is not set at import time
let convex: ConvexHttpClient | null = null;

function getConvex(): ConvexHttpClient {
  if (!convex) {
    const url = process.env.CONVEX_URL;
    if (!url) {
      throw new Error('CONVEX_URL environment variable is not set');
    }
    convex = new ConvexHttpClient(url);
  }
  return convex;
}

const app = express();
const port = parseInt(process.env.MCP_PORT || '3001');

// Configure middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    server: 'smnb-mcp-server', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// MCP Server Info endpoint (required by Claude MCP connector)
app.get('/mcp/server-info', (req: Request, res: Response) => {
  res.json({
    name: 'smnb-news-studio',
    version: '1.0.0',
    description: 'SMNB Session Manager analytics and data access',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false
    }
  });
});

// List available tools
app.get('/mcp/tools', (req: Request, res: Response) => {
  const tools = [
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

  res.json({ tools });
});

// Execute tool calls
app.post('/mcp/tools/:toolName', async (req: Request, res: Response) => {
  const { toolName } = req.params;
  const args = req.body;

  try {
    let result;

    switch (toolName) {
      case 'get_session_metrics':
        result = await getSessionMetrics(args);
        break;
      
      case 'get_token_usage':
        result = await getTokenUsage(args);
        break;
      
      case 'search_messages':
        result = await searchMessages(args);
        break;
      
      case 'get_active_sessions':
        result = await getActiveSessions(args);
        break;
      
      case 'analyze_engagement':
        result = await analyzeEngagement(args);
        break;
      
      case 'get_system_health':
        result = await getSystemHealth();
        break;
      
      case 'get_cost_breakdown':
        result = await getCostBreakdown(args);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown tool: ${toolName}`
        });
    }

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Root endpoint with server info
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'SMNB MCP Server',
    version: '1.0.0',
    description: 'Model Context Protocol server for SMNB Session Manager',
    endpoints: {
      health: '/health',
      serverInfo: '/mcp/server-info', 
      tools: '/mcp/tools',
      execute: '/mcp/tools/:toolName'
    },
    capabilities: ['analytics', 'session-management', 'token-tracking']
  });
});

// Tool implementation functions
async function getSessionMetrics(args: any) {
  try {
    console.log('Calling getSessionMetrics with args:', args);
    const result = await getConvex().query(api.analytics.queries.getSessionMetrics, {
      sessionId: args.sessionId,
      timeRange: args.timeRange || 'all',
    });
    console.log('getSessionMetrics result:', result);
    return result;
  } catch (error) {
    console.error('getSessionMetrics error:', error);
    throw new Error(`Session metrics unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getTokenUsage(args: any) {
  try {
    console.log('Calling getTokenUsage with args:', args);
    const usage = await getConvex().query(api.analytics.queries.getTokenUsage, {
      groupBy: args.groupBy || 'day',
      timeRange: args.timeRange || 'week',
    });

    const result = {
      period: args.timeRange || 'week',
      grouping: args.groupBy || 'day',
      totalTokens: usage.totalTokens || 0,
      totalCost: usage.totalCost || 0,
      breakdown: usage.breakdown || {},
      trends: usage.trends || {},
    };
    console.log('getTokenUsage result:', result);
    return result;
  } catch (error) {
    console.error('getTokenUsage error:', error);
    throw new Error(`Token usage data unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function searchMessages(args: any) {
  try {
    console.log('Calling searchMessages with args:', args);
    const result = await getConvex().query(api.analytics.queries.searchMessages, {
      query: args.query,
      sessionId: args.sessionId,
      limit: args.limit || 10,
    });
    console.log('searchMessages result:', result);
    return result;
  } catch (error) {
    console.error('searchMessages error:', error);
    throw new Error(`Message search unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getActiveSessions(args: any) {
  try {
    console.log('Calling getActiveSessions with args:', args);
    const result = await getConvex().query(api.analytics.queries.getActiveSessions, {
      includeDetails: args.includeDetails || false,
    });
    console.log('getActiveSessions result:', result);
    return result;
  } catch (error) {
    console.error('getActiveSessions error:', error);
    throw new Error(`Active sessions data unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function analyzeEngagement(args: any) {
  try {
    console.log('Calling analyzeEngagement with args:', args);
    const result = await getConvex().query(api.analytics.queries.analyzeEngagement, {
      metric: args.metric || 'messages',
      timeRange: args.timeRange || 'week',
    });
    console.log('analyzeEngagement result:', result);
    return result;
  } catch (error) {
    console.error('analyzeEngagement error:', error);
    throw new Error(`Engagement analysis unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getSystemHealth() {
  try {
    console.log('Calling getSystemHealth');
    const result = await getConvex().query(api.analytics.queries.getSystemHealth, {});
    console.log('getSystemHealth result:', result);
    return result;
  } catch (error) {
    console.error('getSystemHealth error:', error);
    throw new Error(`System health check unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getCostBreakdown(args: any) {
  try {
    console.log('Calling getCostBreakdown with args:', args);
    const result = await getConvex().query(api.analytics.queries.getCostBreakdown, {
      period: args.period || 'weekly',
    });
    console.log('getCostBreakdown result:', result);
    return result;
  } catch (error) {
    console.error('getCostBreakdown error:', error);
    throw new Error(`Cost breakdown unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Start the server (local development only)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 SMNB HTTP MCP Server running on http://localhost:${port}`);
    console.log('📡 Available endpoints:');
    console.log(`   GET  http://localhost:${port}/health`);
    console.log(`   GET  http://localhost:${port}/mcp/server-info`);
    console.log(`   GET  http://localhost:${port}/mcp/tools`);
    console.log(`   POST http://localhost:${port}/mcp/tools/:toolName`);
    console.log('✅ Ready for Claude MCP connector integration');
  });
}

// Export for Vercel serverless
export default app;