// NEXUS BASE AGENT - Grapes Implementation
// Adapted from SMNB Nexus Framework for Grapes map analysis

import type {
  AgentRequest,
  AgentResponse,
  AgentChunk,
  Tool,
  ExecutionContext,
  AgentMetadata
} from './types';

/**
 * BaseNexusAgent - Abstract base class for all Nexus agents in Grapes
 * 
 * Implements ACDC Digital's Nexus Agentic Framework with:
 * - Streaming-first architecture
 * - Tool-based integration using Anthropic Tools API
 * - Unified agent interface
 * - Screenshot/vision integration support
 */
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
   */
  getTool(identifier: string): Tool | undefined {
    return this.getTools().find(tool => tool.identifier === identifier);
  }

  /**
   * Get all tools registered for this agent
   * Lazy initialization pattern
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
   */
  canExecute(_context?: ExecutionContext): boolean {
    if (this.isPremium) {
      return true; // Override in subclasses for actual premium checks
    }
    return true;
  }

  /**
   * Get agent metadata
   */
  getMetadata(): AgentMetadata {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      isPremium: this.isPremium,
      capabilities: this.getCapabilities(),
    };
  }

  /**
   * Define tools for this agent (lazy initialization)
   * Must be implemented by subclasses
   */
  protected abstract defineTools(): Tool[];

  /**
   * Get agent capabilities list
   * Override in subclasses to specify capabilities
   */
  protected getCapabilities(): string[] {
    return ['streaming', 'tools'];
  }

  /**
   * Helper: Create content chunk
   */
  protected createContentChunk(content: string): AgentChunk {
    return {
      type: 'content',
      data: content,
      timestamp: Date.now(),
    };
  }

  /**
   * Helper: Create tool call chunk
   */
  protected createToolCallChunk(
    toolId: string,
    input: unknown,
    result?: unknown
  ): AgentChunk {
    return {
      type: 'tool_call',
      data: { toolId, input, result },
      timestamp: Date.now(),
    };
  }

  /**
   * Helper: Create metadata chunk
   */
  protected createMetadataChunk(data: Record<string, unknown>): AgentChunk {
    return {
      type: 'metadata',
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Helper: Create error chunk
   */
  protected createErrorChunk(error: string | Error): AgentChunk {
    return {
      type: 'error',
      data: error instanceof Error ? error.message : error,
      timestamp: Date.now(),
    };
  }

  /**
   * Helper: Create completion chunk
   */
  protected createCompleteChunk(metadata?: Record<string, unknown>): AgentChunk {
    return {
      type: 'complete',
      data: metadata || {},
      timestamp: Date.now(),
    };
  }
}
