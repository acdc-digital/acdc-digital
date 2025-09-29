// NEXUS BASE AGENT - SMNB Implementation
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/agents/nexus/BaseNexusAgent.ts

/**
 * BaseNexusAgent - Abstract base class for all Nexus agents in SMNB
 * 
 * Implements ACDC Digital's Nexus Agentic Framework with:
 * - Streaming-first architecture
 * - Tool-based integration using Anthropic Tools API
 * - Unified agent interface
 * - Premium gating support
 */

import type {
  AgentRequest,
  AgentResponse,
  AgentChunk,
  AgentChunkType,
  Tool,
  ExecutionContext,
  AgentMetadata
} from './types';

export abstract class BaseNexusAgent {
  /**
   * Unique identifier for the agent
   */
  abstract readonly id: string;

  /**
   * Display name for the agent
   */
  abstract readonly name: string;

  /**
   * Description of agent capabilities
   */
  abstract readonly description: string;

  /**
   * Whether this agent requires premium subscription
   */
  abstract readonly isPremium: boolean;

  /**
   * Agent version
   */
  readonly version: string = '1.0.0';

  /**
   * Registered tools for this agent
   */
  private _tools?: Tool[];

  /**
   * Stream execution with real-time chunks
   * 
   * @param request - Agent request with input and context
   * @returns AsyncIterable of AgentChunks for streaming responses
   */
  abstract stream(request: AgentRequest): AsyncIterable<AgentChunk>;

  /**
   * Execute agent in batch mode (non-streaming)
   * Default implementation collects all chunks from stream()
   * 
   * @param request - Agent request with input and context
   * @returns Promise resolving to complete AgentResponse
   */
  async execute(request: AgentRequest): Promise<AgentResponse> {
    try {
      let content = '';
      let data: unknown = null;
      const metadata: Record<string, unknown> = {};

      for await (const chunk of this.stream(request)) {
        switch (chunk.type) {
          case 'content':
            content += typeof chunk.data === 'string' ? chunk.data : '';
            break;
          case 'tool_call':
            // Store tool call results
            if (!data) data = [];
            if (Array.isArray(data)) {
              data.push(chunk.data);
            }
            break;
          case 'metadata':
            Object.assign(metadata, chunk.data);
            break;
          case 'error':
            return {
              success: false,
              error: typeof chunk.data === 'string' ? chunk.data : 'Unknown error',
              metadata
            };
        }
      }

      return {
        success: true,
        content: content || undefined,
        data,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get tool by identifier
   * 
   * @param identifier - Tool identifier string
   * @returns Tool if found, undefined otherwise
   */
  getTool(identifier: string): Tool | undefined {
    return this.getTools().find(tool => tool.identifier === identifier);
  }

  /**
   * Get all tools registered for this agent
   * Lazy initialization pattern
   * 
   * @returns Array of Tool definitions
   */
  getTools(): Tool[] {
    if (!this._tools) {
      this._tools = this.defineTools();
    }
    return this._tools;
  }

  /**
   * Check if agent can execute in current context
   * Override for custom permission logic
   * 
   * @param _context - Execution context with user/session info (unused in base implementation)
   * @returns boolean indicating if execution is allowed
   */
  canExecute(_context?: ExecutionContext): boolean {
    // Base implementation: premium agents require premium context flag
    if (this.isPremium) {
      // In real implementation, check user subscription status
      // For now, allow all (override in subclasses for actual premium checks)
      return true;
    }
    return true;
  }

  /**
   * Get agent metadata for registry and UI
   * 
   * @returns AgentMetadata object
   */
  getMetadata(): AgentMetadata {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      isPremium: this.isPremium,
      capabilities: this.getCapabilities(),
      tools: this.getTools().map(t => t.identifier),
    };
  }

  /**
   * Get list of agent capabilities (override in subclasses)
   * 
   * @returns Array of capability strings
   */
  protected getCapabilities(): string[] {
    return ['streaming', 'tools'];
  }

  /**
   * Define tools for this agent
   * Must be implemented by subclasses
   * 
   * @returns Array of Tool definitions
   */
  protected abstract defineTools(): Tool[];

  /**
   * Create a properly formatted AgentChunk
   * Helper method for consistent chunk creation
   * 
   * @param type - Chunk type
   * @param data - Chunk data payload
   * @returns Formatted AgentChunk
   */
  protected createChunk(type: AgentChunkType, data: unknown): AgentChunk {
    return {
      type,
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Helper to create content chunks (most common type)
   * 
   * @param content - Text content to stream
   * @returns Content AgentChunk
   */
  protected createContentChunk(content: string): AgentChunk {
    return this.createChunk('content', content);
  }

  /**
   * Helper to create tool call chunks
   * 
   * @param toolId - Tool identifier
   * @param input - Tool input parameters
   * @param result - Tool execution result
   * @returns Tool call AgentChunk
   */
  protected createToolCallChunk(toolId: string, input: unknown, result?: unknown): AgentChunk {
    return this.createChunk('tool_call', {
      toolId,
      input,
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Helper to create metadata chunks
   * 
   * @param metadata - Metadata object
   * @returns Metadata AgentChunk
   */
  protected createMetadataChunk(metadata: Record<string, unknown>): AgentChunk {
    return this.createChunk('metadata', metadata);
  }

  /**
   * Helper to create error chunks
   * 
   * @param error - Error message or Error object
   * @returns Error AgentChunk
   */
  protected createErrorChunk(error: string | Error): AgentChunk {
    const message = typeof error === 'string' ? error : error.message;
    return this.createChunk('error', {
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Execute a tool by identifier with proper error handling
   * 
   * @param toolId - Tool identifier
   * @param input - Tool input parameters
   * @param context - Execution context
   * @returns Tool execution result
   */
  protected async executeTool(
    toolId: string,
    input: unknown,
    context?: ExecutionContext
  ): Promise<unknown> {
    const tool = this.getTool(toolId);
    
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    if (tool.requiresPremium && !this.canExecute(context)) {
      throw new Error(`Premium subscription required for tool: ${toolId}`);
    }

    try {
      return await tool.handler(input, context);
    } catch (error) {
      console.error(`Tool execution failed: ${toolId}`, error);
      throw error;
    }
  }

  /**
   * Format tool result as human-readable text
   * Override in subclasses for custom formatting
   * 
   * @param toolId - Tool identifier
   * @param result - Tool execution result
   * @returns Formatted string
   */
  protected formatToolResult(toolId: string, result: unknown): string {
    // Base implementation: JSON stringify with pretty printing
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result, null, 2);
  }
}
