// ACDC AGENT REACT HOOK
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/hooks/useACDCAgent.ts

/**
 * React hook for consuming ACDC agent streams via SSE
 * 
 * Provides real-time streaming interface for agent interactions with:
 * - Automatic SSE connection management
 * - Chunk accumulation and state updates
 * - Tool execution tracking
 * - Error handling and retry logic
 */

import { useState, useCallback, useRef } from 'react';
import type { AgentChunk } from '@/lib/agents/nexus/types';

export interface ACDCMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string; // AI reasoning/thinking process
  timestamp: number;
  toolCalls?: Array<{
    name: string;
    input: unknown;
    result?: unknown;
  }>;
  metadata?: Record<string, unknown>;
}

export interface UseACDCAgentOptions {
  agentId: string;
  sessionId?: string;
  conversationId?: string;
  onChunk?: (chunk: AgentChunk) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  // Flash memory: Callbacks to save messages to Convex for conversation history
  onMessageSent?: (message: ACDCMessage) => void;
  onMessageReceived?: (message: ACDCMessage) => void;
}

export interface UseACDCAgentReturn {
  messages: ACDCMessage[];
  isStreaming: boolean;
  error: Error | null;
  currentChunk: AgentChunk | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook for interacting with ACDC agents via streaming API
 * 
 * @example
 * ```tsx
 * const { messages, isStreaming, sendMessage } = useACDCAgent({
 *   agentId: 'session-manager-agent',
 *   sessionId: currentSessionId,
 * });
 * 
 * // Send a query
 * await sendMessage('How are my data metrics for the week?');
 * ```
 */
export function useACDCAgent(options: UseACDCAgentOptions): UseACDCAgentReturn {
  const {
    agentId,
    sessionId,
    conversationId,
    onChunk,
    onError,
    onComplete,
    onMessageSent,
    onMessageReceived,
  } = options;

  const [messages, setMessages] = useState<ACDCMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentChunk, setCurrentChunk] = useState<AgentChunk | null>(null);
  
  // Track current message being built
  const currentMessageRef = useRef<ACDCMessage | null>(null);
  const lastUserMessageRef = useRef<string>('');

  /**
   * Process individual chunks and update state
   */
  const processChunk = useCallback(async (chunk: AgentChunk): Promise<void> => {
    console.log('[useACDCAgent] Processing chunk:', chunk.type, chunk.data);
    if (!currentMessageRef.current) {
      console.log('[useACDCAgent] No current message ref, skipping');
      return;
    }

    switch (chunk.type) {
      case 'thinking':
        // Append thinking content
        if (typeof chunk.data === 'string') {
          console.log('[useACDCAgent] Appending thinking:', chunk.data.substring(0, 50));
          if (!currentMessageRef.current.thinking) {
            currentMessageRef.current.thinking = '';
          }
          currentMessageRef.current.thinking += chunk.data;
          console.log('[useACDCAgent] Total thinking length now:', currentMessageRef.current.thinking.length);
          
          // Update messages with new reference to trigger re-render
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && currentMessageRef.current) {
              updated[lastIndex] = { ...currentMessageRef.current };
              console.log('[useACDCAgent] Updated message thinking:', updated[lastIndex].thinking?.substring(0, 50));
            }
            return updated;
          });
        }
        break;

      case 'content':
        // Append text content
        if (typeof chunk.data === 'string') {
          console.log('[useACDCAgent] Appending content:', chunk.data.substring(0, 50));
          currentMessageRef.current.content += chunk.data;
          console.log('[useACDCAgent] Total content length now:', currentMessageRef.current.content.length);
          
          // Update messages with new reference to trigger re-render
          // CRITICAL: Copy from the ref, not from the old state, since ref has the updated content
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && currentMessageRef.current) {
              // Create a new message object from the ref (which has the updated content)
              updated[lastIndex] = { ...currentMessageRef.current };
              console.log('[useACDCAgent] Updated message content:', updated[lastIndex].content.substring(0, 50));
            }
            return updated;
          });
        }
        break;

      case 'tool_call':
        // Track tool execution
        if (chunk.data && typeof chunk.data === 'object' && 'name' in chunk.data) {
          const toolCall = chunk.data as { name: string; input: unknown; result?: unknown };
          
          if (!currentMessageRef.current.toolCalls) {
            currentMessageRef.current.toolCalls = [];
          }
          
          currentMessageRef.current.toolCalls.push(toolCall);
          
          // Update messages with new reference to trigger re-render
          // CRITICAL: Copy from the ref, not from the old state
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && currentMessageRef.current) {
              // Create a new message object from the ref (which has the updated toolCalls)
              updated[lastIndex] = { ...currentMessageRef.current };
            }
            return updated;
          });
        }
        break;

      case 'metadata':
        // Store metadata
        if (chunk.data && typeof chunk.data === 'object') {
          currentMessageRef.current.metadata = {
            ...currentMessageRef.current.metadata,
            ...(chunk.data as Record<string, unknown>),
          };
          
          // Update messages with new reference to trigger re-render
          // CRITICAL: Copy from the ref, not from the old state
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && currentMessageRef.current) {
              // Create a new message object from the ref
              updated[lastIndex] = { ...currentMessageRef.current };
            }
            return updated;
          });
          
          // Check for completion status
          if ('status' in chunk.data && chunk.data.status === 'complete') {
            console.log('[useACDCAgent] Conversation complete');
          }
        }
        break;

      case 'error':
        // Handle error chunks
        const errorMessage = typeof chunk.data === 'object' && chunk.data && 'message' in chunk.data
          ? String(chunk.data.message)
          : 'An error occurred';
        
        const error = new Error(errorMessage);
        setError(error);
        onError?.(error);
        break;
    }
  }, [onError]);

  /**
   * Send a message to the agent and stream the response
   */
  const sendMessage = useCallback(async (message: string) => {
    if (isStreaming) {
      console.warn('[useACDCAgent] Already streaming, ignoring new message');
      return;
    }

    setError(null);
    setIsStreaming(true);
    lastUserMessageRef.current = message;

    // Add user message
    const userMessage: ACDCMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Flash memory: Save user message to Convex
    onMessageSent?.(userMessage);

    // Initialize assistant message
    const assistantMessage: ACDCMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      toolCalls: [],
    };

    currentMessageRef.current = assistantMessage;
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // DEBUG: Log API call
      console.log('[useACDCAgent] Making API request:', {
        agentId,
        message: message.substring(0, 50),
        sessionId,
        conversationId
      });

      // Make SSE request
      const response = await fetch('/api/agents/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          message,
          sessionId,
          conversationId,
        }),
      });

      console.log('[useACDCAgent] API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[useACDCAgent] API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[useACDCAgent] Stream complete');
          // CRITICAL: Do final state sync to capture any remaining content in ref
          if (currentMessageRef.current) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0 && currentMessageRef.current) {
                updated[lastIndex] = { ...currentMessageRef.current };
                console.log('[useACDCAgent] Final state sync - content length:', updated[lastIndex].content?.length || 0);
              }
              return updated;
            });

            // Flash memory: Save assistant message to Convex
            onMessageReceived?.(currentMessageRef.current);
          }
          break;
        }

        // Decode and buffer chunks
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete message in buffer

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) {
            continue;
          }

          try {
            const dataStr = line.substring(6); // Remove "data: " prefix
            const chunk = JSON.parse(dataStr) as AgentChunk;
            
            // DEBUG: Log each chunk
            console.log('[useACDCAgent] Received chunk:', chunk.type, chunk);
            
            setCurrentChunk(chunk);
            onChunk?.(chunk);

            // Process chunk based on type
            await processChunk(chunk);

          } catch (parseError) {
            console.error('[useACDCAgent] Failed to parse chunk:', parseError);
          }
        }
      }

      onComplete?.();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('[useACDCAgent] Stream error:', error);
      setError(error);
      onError?.(error);
    } finally {
      setIsStreaming(false);
      currentMessageRef.current = null;
    }
  }, [agentId, sessionId, conversationId, isStreaming, onChunk, onError, onComplete, onMessageSent, onMessageReceived, processChunk]);

  /**
   * Clear all messages and reset state
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentChunk(null);
    currentMessageRef.current = null;
  }, []);

  /**
   * Retry the last message
   */
  const retry = useCallback(async () => {
    if (lastUserMessageRef.current) {
      // Remove last two messages (user + incomplete assistant)
      setMessages((prev) => prev.slice(0, -2));
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  return {
    messages,
    isStreaming,
    error,
    currentChunk,
    sendMessage,
    clearMessages,
    retry,
  };
}
