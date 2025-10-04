// NEXUS AGENT TYPES - Grapes Implementation
// Adapted from SMNB Nexus Framework

import type Anthropic from '@anthropic-ai/sdk';

/**
 * Agent chunk types for streaming responses
 */
export type AgentChunkType = 'content' | 'tool_call' | 'metadata' | 'error' | 'complete';

/**
 * Individual chunk in agent stream
 */
export interface AgentChunk {
  type: AgentChunkType;
  data: unknown;
  timestamp?: number;
}

/**
 * Agent request with input and context
 */
export interface AgentRequest {
  agentId: string;
  input: string | object;
  context?: ExecutionContext;
  conversationHistory?: ConversationMessage[];
}

/**
 * Complete agent response (non-streaming)
 */
export interface AgentResponse {
  success: boolean;
  content?: string;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Execution context for agents
 */
export interface ExecutionContext {
  sessionId?: string;
  userId?: string;
  isPremium?: boolean;
  convex?: unknown; // Convex client instance
  screenshot?: string; // Base64 screenshot for vision
  shapeCoordinates?: Array<{
    type: string;
    color: string;
    coordinates: Array<{ lat: number; lng: number }>;
  }>;
  [key: string]: unknown;
}

/**
 * Conversation message for history
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * Tool definition for Nexus agents
 */
export interface Tool {
  type: 'anthropic_tool' | 'command' | 'hybrid';
  identifier: string;
  requiresPremium: boolean;
  schema: AnthropicToolSchema;
  handler: ToolHandler;
}

/**
 * Anthropic tool schema
 */
export interface AnthropicToolSchema {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Tool handler function
 */
export type ToolHandler = (
  input: unknown,
  context?: ExecutionContext
) => Promise<unknown>;

/**
 * Agent metadata
 */
export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  isPremium: boolean;
  capabilities: string[];
}
