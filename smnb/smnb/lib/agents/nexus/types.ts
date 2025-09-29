// NEXUS FRAMEWORK TYPES - SMNB Implementation
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/nexus/types.ts

/**
 * Core types for Nexus Agentic Framework in SMNB
 * Based on ACDC Digital's standardized agent architecture
 */

import type { Id } from "../../../convex/_generated/dataModel";

/**
 * Execution context for agent operations
 */
export interface ExecutionContext {
  sessionId?: string;
  userId?: string | Id<"users">;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Agent request structure
 */
export interface AgentRequest {
  agentId: string;
  toolId?: string;
  input: unknown;
  context?: ExecutionContext;
}

/**
 * Streaming chunk types
 */
export type AgentChunkType = 'content' | 'tool_call' | 'metadata' | 'error';

/**
 * Streaming chunk structure
 */
export interface AgentChunk {
  type: AgentChunkType;
  data: unknown;
  timestamp: number;
}

/**
 * Agent response (for non-streaming)
 */
export interface AgentResponse {
  success: boolean;
  content?: string;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Tool types supported by Nexus
 */
export type ToolType = 'command' | 'anthropic_tool' | 'hybrid';

/**
 * Tool handler function signature
 */
export type ToolHandler = (input: unknown, context?: ExecutionContext) => Promise<unknown>;

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
 * Tool definition
 */
export interface Tool {
  type: ToolType;
  identifier: string;
  schema: AnthropicToolSchema;
  handler: ToolHandler;
  requiresPremium: boolean;
}

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
  tools: string[];
}
