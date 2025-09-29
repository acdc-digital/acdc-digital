// AGENT SYSTEM - SMNB Project
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/index.ts

/**
 * SMNB Agent System
 * 
 * Central export and initialization for all SMNB agents
 */

// Export base classes and interfaces
export { BaseAgent } from "./base";
export type { 
  AgentTool, 
  AgentExecutionContext, 
  AgentExecutionResult, 
  ConvexMutations,
  AgentSystemState,
  AgentActivationState
} from "./base";

// Export registry
export { SMNBAgentRegistry, smnbAgentRegistry } from "./registry";

// Export individual agents
export { SessionChatAgent, sessionChatAgent } from "../services/sessionManager/SessionChatAgent";

// Initialize registry with available agents
import { smnbAgentRegistry } from "./registry";
import { sessionChatAgent } from "../services/sessionManager/SessionChatAgent";

// Register all agents on module load
smnbAgentRegistry.register(sessionChatAgent);

console.log('🤖 SMNB Agent System initialized with agents:', smnbAgentRegistry.getAllAgents().map(a => a.name));