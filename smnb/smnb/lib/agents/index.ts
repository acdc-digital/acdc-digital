// AGENT SYSTEM - SMNB Project
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/index.ts

/**
 * SMNB Nexus Agent System
 * 
 * Central exports for the Nexus streaming agent framework.
 * Legacy AURA-pattern system has been removed.
 */

// Export Nexus base class and types
export { BaseNexusAgent } from "./nexus/BaseNexusAgent";
export type {
  AgentRequest,
  AgentChunk,
  AgentChunkType,
  AgentResponse,
  Tool,
  ToolType,
  ToolHandler,
  AnthropicToolSchema,
  ExecutionContext,
  AgentMetadata,
} from "./nexus/types";

// Export concrete agents
export { SessionManagerAgent } from "./nexus/SessionManagerAgent";

console.log('🤖 SMNB Nexus Agent System loaded');