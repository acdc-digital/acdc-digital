// AGENT BASE CLASSES - SMNB Project
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/base.ts

/**
 * SMNB Agent Base Classes and Interfaces
 * 
 * Following AURA agent pattern for consistent architecture across ACDC Digital projects
 */

import type { Id } from "../../convex/_generated/dataModel";

export interface AgentTool {
  command: string;
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
}

export interface AgentExecutionContext {
  sessionId?: string;
  userId?: string | Id<"users">;
  projectId?: string; // Generic project ID for SMNB context
}

export interface ConvexMutations {
  // Chat message mutations
  addChatMessage: (args: {
    role: "user" | "assistant" | "system" | "terminal" | "thinking";
    content: string;
    sessionId?: string;
    userId?: string | Id<"users">;
    operation?: {
      type: "file_created" | "project_created" | "tool_executed" | "error" | "campaign_created";
      details?: Record<string, unknown>;
    };
    interactiveComponent?: {
      type: "project_selector" | "file_name_input" | "file_type_selector" | "file_selector" | "edit_instructions_input" | "multi_file_selector" | "url_input";
      data?: Record<string, unknown>;
      status: "pending" | "completed" | "cancelled";
      result?: Record<string, unknown>;
    };
  }) => Promise<Id<"messages">>;
  
  updateChatMessage: (args: {
    id: Id<"messages">;
    content?: string;
    interactiveComponent?: {
      type: "project_selector" | "file_name_input" | "file_type_selector" | "file_selector" | "edit_instructions_input" | "multi_file_selector" | "url_input";
      data?: Record<string, unknown>;
      status: "pending" | "completed" | "cancelled";
      result?: Record<string, unknown>;
    };
  }) => Promise<void>;

  // Session mutations (using SMNB sessions table)
  createSession?: (args: {
    name?: string;
    userId?: string | Id<"users">;
  }) => Promise<Id<"sessions">>;

  updateSession?: (args: {
    id: Id<"sessions">;
    name?: string;
    lastActive?: number;
  }) => Promise<void>;

  // General purpose mutations
  updateAgentProgress?: (args: {
    sessionId: string;
    agentType: string;
    percentage: number;
    status: string;
    isComplete: boolean;
  }) => Promise<void>;
}

export interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  requiresUserInput?: boolean;
  interactiveComponent?: {
    type: string;
    data?: Record<string, unknown>;
  };
}

export abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly isPremium: boolean;
  abstract readonly tools: AgentTool[];

  /**
   * Execute a tool with the given input and context
   */
  abstract execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult>;

  /**
   * Get tool by command string
   */
  getTool(command: string): AgentTool | undefined {
    return this.tools.find(tool => tool.command === command);
  }

  /**
   * Validate if agent can execute in current context
   */
  canExecute(): boolean {
    // Base implementation - always allow execution
    return true;
  }

  /**
   * Get agent metadata for UI display
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      isPremium: this.isPremium,
      toolCount: this.tools.length,
      tools: this.tools,
    };
  }
}

export interface AgentActivationState {
  agentId: string;
  isActive: boolean;
  activatedAt: number;
}

export interface AgentSystemState {
  activeAgents: string[];
  agentActivations: Record<string, AgentActivationState>;
  lastExecutedTool?: {
    agentId: string;
    tool: string;
    timestamp: number;
  };
}