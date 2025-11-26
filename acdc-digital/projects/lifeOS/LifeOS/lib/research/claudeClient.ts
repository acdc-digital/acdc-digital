// CLAUDE API CLIENT - Anthropic Claude API integration with tool use
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/research/claudeClient.ts

import { ResearchTool } from './types';

export interface ClaudeToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface ClaudeResponse {
  content: string;
  toolCalls?: ClaudeToolCall[];
  tokensUsed: number;
  stopReason?: string;
}

export interface ClaudeConfig {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export class ClaudeClient {
  private apiKey: string;
  private defaultConfig: ClaudeConfig;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.apiKey = apiKey;
    this.defaultConfig = {
      maxTokens: 4000,
      temperature: 0.1,
      model: 'claude-3-5-sonnet-20241022',
    };
  }

  /**
   * Basic Claude API call without tools
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    config: ClaudeConfig = {}
  ): Promise<ClaudeResponse> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model || this.defaultConfig.model,
          max_tokens: config.maxTokens || this.defaultConfig.maxTokens,
          temperature: config.temperature || this.defaultConfig.temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ] as AnthropicMessage[],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract text content from response
      const textContent = data.content
        .filter((content: { type: string }) => content.type === 'text')
        .map((content: { text: string }) => content.text)
        .join('\n');

      return {
        content: textContent,
        tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        stopReason: data.stop_reason,
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API call failed: ${error}`);
    }
  }

  /**
   * Claude API call with tool use capabilities
   */
  async chatWithTools(
    systemPrompt: string,
    userPrompt: string,
    tools: ResearchTool[],
    config: ClaudeConfig = {}
  ): Promise<ClaudeResponse> {
    try {
      // Convert our tool definitions to Claude's format
      const claudeTools: AnthropicTool[] = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model || this.defaultConfig.model,
          max_tokens: config.maxTokens || this.defaultConfig.maxTokens,
          temperature: config.temperature || this.defaultConfig.temperature,
          system: systemPrompt,
          tools: claudeTools,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ] as AnthropicMessage[],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Extract text content
      const textContent = data.content
        .filter((content: { type: string }) => content.type === 'text')
        .map((content: { text: string }) => content.text)
        .join('\n');

      // Extract tool calls
      const toolCalls: ClaudeToolCall[] = data.content
        .filter((content: { type: string }) => content.type === 'tool_use')
        .map((content: { name: string; input: Record<string, unknown> }) => ({
          name: content.name,
          input: content.input,
        }));

      return {
        content: textContent,
        toolCalls,
        tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        stopReason: data.stop_reason,
      };
    } catch (error) {
      console.error('Claude API with tools error:', error);
      throw new Error(`Claude API with tools failed: ${error}`);
    }
  }

  /**
   * Stream chat response (basic implementation)
   */
  async *streamChat(
    systemPrompt: string,
    userPrompt: string,
    config: ClaudeConfig = {}
  ): AsyncGenerator<string, void, unknown> {
    // For now, use regular chat and yield the full response
    // TODO: Implement actual streaming when needed
    try {
      const response = await this.chat(systemPrompt, userPrompt, config);
      yield response.content;
    } catch (error) {
      console.error('Claude streaming error:', error);
      throw new Error(`Claude streaming failed: ${error}`);
    }
  }
}
