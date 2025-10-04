// useGrapesAgent Hook - React hook for Grapes Orchestrator streaming
// Adapted from SMNB's useNexusAgent

import { useState, useCallback, useRef } from 'react';
import type { AgentChunk } from '@/lib/agents/nexus/types';

export interface GrapesAgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolCalls?: Array<{
    toolId: string;
    input: unknown;
    result?: unknown;
  }>;
}

export interface GrapesAgentState {
  messages: GrapesAgentMessage[];
  isStreaming: boolean;
  error: string | null;
  currentResponse: string;
}

export interface GrapesAgentRequest {
  message: string;
  screenshot?: string;
  shapeCoordinates?: Array<{
    type: string;
    color: string;
    coordinates: Array<{ lat: number; lng: number }>;
  }>;
}

export function useGrapesAgent() {
  const [state, setState] = useState<GrapesAgentState>({
    messages: [],
    isStreaming: false,
    error: null,
    currentResponse: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageIdRef = useRef<string>('');

  /**
   * Send message to agent and stream response
   */
  const sendMessage = useCallback(async (request: GrapesAgentRequest) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Generate message IDs
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    currentMessageIdRef.current = assistantMessageId;

    // Add user message
    const userMessage: GrapesAgentMessage = {
      id: userMessageId,
      role: 'user',
      content: request.message,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isStreaming: true,
      error: null,
      currentResponse: '',
    }));

    try {
      // Start SSE connection
      const response = await fetch('/api/agents/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'grapes-orchestrator',
          message: request.message,
          screenshot: request.screenshot,
          shapeCoordinates: request.shapeCoordinates,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';
      const toolCalls: Array<{ toolId: string; input: unknown; result?: unknown }> = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[useGrapesAgent] Stream complete');
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = line.slice(6);
              const chunk: AgentChunk = JSON.parse(data);

              console.log('[useGrapesAgent] Received chunk:', chunk.type);

              switch (chunk.type) {
                case 'content':
                  // Accumulate content
                  const content = typeof chunk.data === 'string' ? chunk.data : '';
                  accumulatedContent += content;
                  
                  // Update current response
                  setState(prev => ({
                    ...prev,
                    currentResponse: accumulatedContent,
                  }));
                  break;

                case 'tool_call':
                  // Store tool call
                  if (typeof chunk.data === 'object' && chunk.data !== null) {
                    const toolData = chunk.data as { toolId: string; input: unknown; result?: unknown };
                    toolCalls.push(toolData);
                    console.log('[useGrapesAgent] Tool call:', toolData.toolId);
                  }
                  break;

                case 'error':
                  // Handle error - extract message from Anthropic error format
                  let errorMsg = 'Unknown error';
                  if (typeof chunk.data === 'string') {
                    try {
                      const errorData = JSON.parse(chunk.data);
                      if (errorData.error?.message) {
                        errorMsg = errorData.error.message;
                      } else {
                        errorMsg = chunk.data;
                      }
                    } catch {
                      errorMsg = chunk.data;
                    }
                  } else if (typeof chunk.data === 'object' && chunk.data !== null) {
                    const errorObj = chunk.data as { error?: { message?: string }; message?: string };
                    errorMsg = errorObj.error?.message || errorObj.message || JSON.stringify(chunk.data);
                  }
                  
                  console.error('[useGrapesAgent] Error:', errorMsg);
                  setState(prev => ({
                    ...prev,
                    error: errorMsg,
                    isStreaming: false,
                  }));
                  break;

                case 'complete':
                  // Stream complete
                  console.log('[useGrapesAgent] Stream marked complete');
                  break;

                case 'metadata':
                  // Handle metadata if needed
                  console.log('[useGrapesAgent] Metadata:', chunk.data);
                  break;
              }
            } catch (err) {
              console.error('[useGrapesAgent] Failed to parse chunk:', err);
            }
          }
        }
      }

      // Add assistant message
      const assistantMessage: GrapesAgentMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: accumulatedContent,
        timestamp: Date.now(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isStreaming: false,
        currentResponse: '',
      }));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[useGrapesAgent] Stream aborted');
        return;
      }

      console.error('[useGrapesAgent] Stream error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isStreaming: false,
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Cancel current streaming request
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isStreaming: false,
      error: null,
      currentResponse: '',
    });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    cancelStream,
    clearMessages,
    clearError,
  };
}
