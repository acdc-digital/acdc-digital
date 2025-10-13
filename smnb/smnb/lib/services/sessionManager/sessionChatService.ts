// SESSION CHAT SERVICE
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/sessionChatService.ts

/**
 * ⚠️ DEPRECATED - DO NOT USE ⚠️
 * 
 * This file has been replaced by SessionManagerAgent with full Nexus Framework integration.
 * 
 * Migration Path:
 * - Use: SessionManagerAgent (lib/agents/nexus/SessionManagerAgent.ts)
 * - UI: NexusChat (lib/services/sessionManager/NexusChat.tsx)
 * - Hook: useNexusAgent (lib/hooks/useNexusAgent.ts)
 * 
 * Why deprecated:
 * - No tool calling support
 * - Incompatible MCP integration approach
 * - Limited to simple Q&A (no analytics access)
 * - Doesn't follow Nexus Framework patterns
 * 
 * See: lib/services/sessionManager/MIGRATION.md for details
 * 
 * @deprecated Use SessionManagerAgent instead
 */

/**
 * Session Chat Service (LEGACY)
 * 
 * Handles LLM interactions for session-based chat conversations
 * Integrates with our existing Claude API infrastructure
 */

import { tokenCountingService } from '../core/tokenCountingService';
import { ANTHROPIC_MODELS } from '../../../../../.agents/anthropic.config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  metadata?: {
    model: string;
    temperature: number;
    responseTime: number;
    mcpEnabled?: boolean;
  };
}

export class SessionChatService {
  private apiEndpoint: string;
  private defaultOptions: ChatOptions;

  constructor(apiEndpoint: string = '/api/claude', defaultOptions: ChatOptions = {}) {
    this.apiEndpoint = apiEndpoint;
    this.defaultOptions = {
      temperature: 0.7,
      maxTokens: 1000,
      model: ANTHROPIC_MODELS.HAIKU_LATEST,
      systemPrompt: 'You are a helpful AI assistant in a conversational setting. Provide clear, informative, and engaging responses.',
      stream: false,
      ...defaultOptions
    };
    
    console.log('✅ Session Chat service initialized');
  }

  /**
   * Send a chat message and get a response with MCP integration
   */
  async sendMessage(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      console.log(`💬 Sending chat message with ${messages.length} messages...`);

      // Count input tokens
      const inputTokens = await this.countInputTokens(messages, mergedOptions);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: this.formatMessagesForClaude(messages),
          options: {
            systemPrompt: mergedOptions.systemPrompt,
            temperature: mergedOptions.temperature,
            maxTokens: mergedOptions.maxTokens,
            model: mergedOptions.model,
          },
          enableMCP: true // Enable MCP integration for database access
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (data.success) {
        // Count output tokens and calculate cost
        const outputTokens = data.usage?.output_tokens || tokenCountingService.estimateOutputTokens(data.text);
        const totalCost = this.calculateCost(inputTokens, outputTokens);

        // Record usage metrics
        tokenCountingService.recordUsage({
          requestId,
          model: mergedOptions.model!,
          action: 'generate',
          inputTokens,
          outputTokens,
          requestType: 'editor',
          duration: responseTime,
          success: true
        });

        console.log(`✅ Chat response generated: ${data.text.substring(0, 50)}... (${inputTokens}→${outputTokens} tokens, ${responseTime}ms, MCP: ${data.mcp_enabled})`);

        return {
          content: data.text,
          usage: {
            inputTokens,
            outputTokens,
            totalCost
          },
          metadata: {
            model: data.model || mergedOptions.model!,
            temperature: mergedOptions.temperature!,
            responseTime,
            mcpEnabled: data.mcp_enabled
          }
        };
      } else {
        throw new Error(data.error || 'Chat generation failed');
      }

    } catch (error) {
      console.error('❌ Chat API error:', error);
      
      // Record failed request
      tokenCountingService.recordUsage({
        requestId,
        model: mergedOptions.model!,
        action: 'generate',
        inputTokens: 0,
        outputTokens: 0,
        requestType: 'editor',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Send a streaming chat message with MCP integration
   */
  async sendStreamingMessage(
    messages: ChatMessage[],
    options: ChatOptions = {},
    onChunk?: (chunk: string) => void,
    onComplete?: (fullText: string) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    const startTime = Date.now();
    const requestId = `chat-stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      console.log(`💬 Starting streaming chat with ${messages.length} messages...`);

      // Count input tokens
      const inputTokens = await this.countInputTokens(messages, mergedOptions);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stream',
          messages: this.formatMessagesForClaude(messages),
          options: {
            systemPrompt: mergedOptions.systemPrompt,
            temperature: mergedOptions.temperature,
            maxTokens: mergedOptions.maxTokens,
            model: mergedOptions.model,
          },
          enableMCP: true // Enable MCP integration for database access
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader');
      }

      let fullText = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk' && data.text) {
                fullText += data.text;
                onChunk?.(data.text);
              } else if (data.type === 'complete') {
                console.log('✅ Streaming chat completed');
                
                // Record token usage for completed stream
                const outputTokens = tokenCountingService.estimateOutputTokens(fullText);
                const responseTime = Date.now() - startTime;
                
                tokenCountingService.recordUsage({
                  requestId,
                  model: mergedOptions.model!,
                  action: 'stream',
                  inputTokens,
                  outputTokens,
                  requestType: 'editor',
                  duration: responseTime,
                  success: true
                });
                
                console.log(`🎯 Chat stream completed: ${fullText.length} chars (${inputTokens}→${outputTokens} tokens, ${responseTime}ms)`);
                onComplete?.(fullText);
                return fullText;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }

      return fullText;

    } catch (error) {
      console.error('❌ Chat streaming failed:', error);
      
      // Record failed streaming request
      tokenCountingService.recordUsage({
        requestId,
        model: mergedOptions.model!,
        action: 'stream',
        inputTokens: 0,
        outputTokens: 0,
        requestType: 'editor',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      throw err;
    }
  }

  /**
   * Test connection to the chat service
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing chat service connection...');
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Chat connection test failed:', errorData.error);
        return false;
      }

      const data = await response.json();
      const success = data.success === true;
      
      if (success) {
        console.log('✅ Chat service connection test passed');
      } else {
        console.log('⚠️ Chat service connection test unclear');
      }
      
      return success;

    } catch (error) {
      console.error('❌ Chat service connection test failed:', error);
      return false;
    }
  }

  // Private helper methods

  private formatMessagesForClaude(messages: ChatMessage[]): ChatMessage[] {
    // Convert to Claude API format, preserving all messages including system
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.timestamp && { timestamp: msg.timestamp })
    }));
  }

  private async countInputTokens(messages: ChatMessage[], options: ChatOptions): Promise<number> {
    try {
      // Filter out system messages for token counting and convert format
      const formattedMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      
      return await tokenCountingService.countInputTokens({
        model: options.model!,
        system: options.systemPrompt || '',
        messages: formattedMessages
      });
    } catch (error) {
      console.warn('❌ Token counting failed, using estimate:', error);
      const totalText = messages.map(m => m.content).join(' ') + (options.systemPrompt || '');
      return tokenCountingService.estimateTokens(totalText);
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Haiku pricing (as of 2024)
    const INPUT_COST_PER_TOKEN = 0.00000025;  // $0.25 per 1M tokens
    const OUTPUT_COST_PER_TOKEN = 0.00000125; // $1.25 per 1M tokens
    
    return (inputTokens * INPUT_COST_PER_TOKEN) + (outputTokens * OUTPUT_COST_PER_TOKEN);
  }

  // Utility methods

  public getDefaultOptions(): ChatOptions {
    return { ...this.defaultOptions };
  }

  public updateDefaultOptions(options: Partial<ChatOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    console.log('⚙️ Updated default chat options:', this.defaultOptions);
  }
}

// Export singleton instance
export const sessionChatService = new SessionChatService();
export default sessionChatService;