import React from 'react';

// Frontend streaming types and utilities
export interface StreamingMessage {
  id: string;
  role: "user" | "assistant";
  content: ContentBlock[];
  status: "streaming" | "completed" | "error";
  reasoning?: string;
  timestamp: Date;
}

export interface ContentBlock {
  type: "text" | "thinking" | "tool_use";
  index: number;
  content: string;
  isComplete: boolean;
}

export interface StreamingState {
  isStreaming: boolean;
  currentMessage: StreamingMessage | null;
  error: string | null;
}

// Server-sent event types matching Anthropic API
export interface StreamEvent {
  type: string;
  data: unknown;
}

export interface StreamEventHandlers {
  onMessageStart?: (data: { message: { id: string; model: string } }) => void;
  onContentBlockStart?: (data: { index: number; content_block: { type: string } }) => void;
  onContentBlockDelta?: (data: { 
    index: number; 
    delta: { 
      type: "text_delta" | "thinking_delta" | "input_json_delta"; 
      text?: string;
      thinking?: string;
      partial_json?: string;
    } 
  }) => void;
  onContentBlockStop?: (data: { index: number }) => void;
  onMessageDelta?: (data: { delta: { stop_reason?: string } }) => void;
  onMessageStop?: () => void;
  onError?: (error: { message: string }) => void;
  onPing?: () => void;
}

// Utility class for handling streaming connections
export class StreamingClient {
  private eventSource: EventSource | null = null;
  private handlers: StreamEventHandlers = {};
  private baseUrl: string;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Start streaming with message configuration
  // For now, this will simulate streaming by calling the action and processing the result
  async startStream(config: {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    model?: string;
    systemPrompt?: string;
    enableThinking?: boolean;
    maxTokens?: number;
    streamingAction?: (streamConfig: {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      model?: string;
      systemPrompt?: string;
      enableThinking?: boolean;
      maxTokens?: number;
    }) => Promise<{ messageId: string; response: string; reasoning?: string }>;
  }): Promise<string> {
    // Close any existing connection
    this.close();

    try {
      if (config.streamingAction) {
        // Use the provided Convex action for streaming
        const result = await this.retryWithBackoff(async () => {
          return await config.streamingAction!(config);
        });
        
        // Reset retry count on success
        this.retryCount = 0;
        
        // Simulate streaming events
        this.simulateStreamingEvents(result);
        
        return result.messageId;
      } else {
        // Fallback to HTTP endpoint (kept for compatibility)
        const streamUrl = `${this.baseUrl}/stream`;
        
        const result = await this.retryWithBackoff(async () => {
          const response = await fetch(streamUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return await response.json();
        });

        this.simulateStreamingEvents(result);
        
        return result.messageId || `stream_${Date.now()}`;
      }
    } catch (error) {
      this.handleError(error instanceof Error ? error.message : 'Failed to start stream');
      throw error;
    }
  }

  // Simulate streaming events from a complete response
  private simulateStreamingEvents(result: { messageId: string; response: string; reasoning?: string }) {
    // Simulate message start
    this.handleEvent({
      type: 'message_start',
      message: { id: result.messageId, model: "claude-3-5-sonnet" }
    });

    let reasoningDelay = 0;

    // Simulate reasoning if present
    if (result.reasoning) {
      this.handleEvent({
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'thinking' }
      });

      // Stream reasoning in chunks
      const reasoningChunks = this.chunkText(result.reasoning, 50);
      reasoningChunks.forEach((chunk, i) => {
        setTimeout(() => {
          this.handleEvent({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'thinking_delta', thinking: chunk }
          });
        }, i * 100);
      });

      reasoningDelay = reasoningChunks.length * 100;
      setTimeout(() => {
        this.handleEvent({
          type: 'content_block_stop',
          index: 0
        });
      }, reasoningDelay);
    }

    // Simulate text response
    const textIndex = result.reasoning ? 1 : 0;
    setTimeout(() => {
      this.handleEvent({
        type: 'content_block_start',
        index: textIndex,
        content_block: { type: 'text' }
      });

      // Stream response in chunks
      const responseChunks = this.chunkText(result.response, 20);
      responseChunks.forEach((chunk, i) => {
        setTimeout(() => {
          this.handleEvent({
            type: 'content_block_delta',
            index: textIndex,
            delta: { type: 'text_delta', text: chunk }
          });
        }, i * 50);
      });

      setTimeout(() => {
        this.handleEvent({
          type: 'content_block_stop',
          index: textIndex
        });

        this.handleEvent({
          type: 'message_stop'
        });
      }, responseChunks.length * 50);
    }, result.reasoning ? reasoningDelay + 200 : 100);
  }

  // Helper to chunk text for simulated streaming
  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Set event handlers
  setHandlers(handlers: StreamEventHandlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Handle individual events
  private handleEvent(event: { type: string; [key: string]: unknown }) {
    switch (event.type) {
      case 'message_start':
        if (this.hasMessage(event)) {
          this.handlers.onMessageStart?.(event);
        }
        break;
      case 'content_block_start':
        if (this.hasContentBlockStart(event)) {
          this.handlers.onContentBlockStart?.(event);
        }
        break;
      case 'content_block_delta':
        if (this.hasContentBlockDelta(event)) {
          this.handlers.onContentBlockDelta?.(event);
        }
        break;
      case 'content_block_stop':
        if (this.hasIndex(event)) {
          this.handlers.onContentBlockStop?.(event);
        }
        break;
      case 'message_delta':
        if (this.hasMessageDelta(event)) {
          this.handlers.onMessageDelta?.(event);
        }
        break;
      case 'message_stop':
        this.handlers.onMessageStop?.();
        break;
      case 'ping':
        this.handlers.onPing?.();
        break;
      case 'error':
        if (this.hasError(event)) {
          this.handlers.onError?.(event.error);
        }
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
  }

  // Type guards
  private hasMessage(event: unknown): event is { message: { id: string; model: string } } {
    return typeof event === 'object' && event !== null && 'message' in event;
  }

  private hasContentBlockStart(event: unknown): event is { index: number; content_block: { type: string } } {
    return typeof event === 'object' && event !== null && 'index' in event && 'content_block' in event;
  }

  private hasContentBlockDelta(event: unknown): event is { 
    index: number; 
    delta: { 
      type: "text_delta" | "thinking_delta" | "input_json_delta"; 
      text?: string;
      thinking?: string;
      partial_json?: string;
    } 
  } {
    return typeof event === 'object' && event !== null && 'index' in event && 'delta' in event;
  }

  private hasIndex(event: unknown): event is { index: number } {
    return typeof event === 'object' && event !== null && 'index' in event;
  }

  private hasMessageDelta(event: unknown): event is { delta: { stop_reason?: string } } {
    return typeof event === 'object' && event !== null && 'delta' in event;
  }

  private hasError(event: unknown): event is { error: { message: string } } {
    return typeof event === 'object' && event !== null && 'error' in event;
  }

  private handleError(message: string) {
    this.handlers.onError?.({ message });
  }

  // Retry with exponential backoff
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Retry attempt ${attempt + 1}/${this.maxRetries + 1} failed, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Close the streaming connection
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.retryCount = 0;
  }
}

// Hook for using streaming in React components
export function useStreaming() {
  const [streamingState, setStreamingState] = React.useState<StreamingState>({
    isStreaming: false,
    currentMessage: null,
    error: null,
  });

  const streamingClient = React.useRef<StreamingClient | null>(null);

  React.useEffect(() => {
    // Initialize streaming client with Convex URL
    streamingClient.current = new StreamingClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    return () => {
      streamingClient.current?.close();
    };
  }, []);

  const startStream = React.useCallback(async (config: {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    model?: string;
    systemPrompt?: string;
    enableThinking?: boolean;
    maxTokens?: number;
    streamingAction?: (streamConfig: {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      model?: string;
      systemPrompt?: string;
      enableThinking?: boolean;
      maxTokens?: number;
    }) => Promise<{ messageId: string; response: string; reasoning?: string }>;
  }) => {
    if (!streamingClient.current) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize message state
    const newMessage: StreamingMessage = {
      id: messageId,
      role: "assistant",
      content: [],
      status: "streaming",
      timestamp: new Date(),
    };

    setStreamingState({
      isStreaming: true,
      currentMessage: newMessage,
      error: null,
    });

    // Set up event handlers
    streamingClient.current.setHandlers({
      onContentBlockStart: (data) => {
        setStreamingState(prev => {
          if (!prev.currentMessage) return prev;
          
          const newBlock: ContentBlock = {
            type: data.content_block.type as "text" | "thinking" | "tool_use",
            index: data.index,
            content: "",
            isComplete: false,
          };

          return {
            ...prev,
            currentMessage: {
              ...prev.currentMessage,
              content: [...prev.currentMessage.content, newBlock],
            },
          };
        });
      },

      onContentBlockDelta: (data) => {
        setStreamingState(prev => {
          if (!prev.currentMessage) return prev;

          const updatedContent = prev.currentMessage.content.map((block) => {
            if (block.index === data.index) {
              if (data.delta.type === "text_delta" && data.delta.text) {
                return { ...block, content: block.content + data.delta.text };
              } else if (data.delta.type === "thinking_delta" && data.delta.thinking) {
                return { ...block, content: block.content + data.delta.thinking };
              }
            }
            return block;
          });

          // Update reasoning if it's a thinking delta
          let reasoning = prev.currentMessage.reasoning;
          if (data.delta.type === "thinking_delta" && data.delta.thinking) {
            reasoning = (reasoning || "") + data.delta.thinking;
          }

          return {
            ...prev,
            currentMessage: {
              ...prev.currentMessage,
              content: updatedContent,
              reasoning,
            },
          };
        });
      },

      onContentBlockStop: (data) => {
        setStreamingState(prev => {
          if (!prev.currentMessage) return prev;

          const updatedContent = prev.currentMessage.content.map(block => 
            block.index === data.index ? { ...block, isComplete: true } : block
          );

          return {
            ...prev,
            currentMessage: {
              ...prev.currentMessage,
              content: updatedContent,
            },
          };
        });
      },

      onMessageStop: () => {
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          currentMessage: prev.currentMessage ? {
            ...prev.currentMessage,
            status: "completed",
          } : null,
        }));
      },

      onError: (error) => {
        console.error('Streaming error:', error);
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          error: error.message,
          currentMessage: prev.currentMessage ? {
            ...prev.currentMessage,
            status: "error",
          } : null,
        }));
      },
    });

    try {
      await streamingClient.current.startStream(config);
    } catch (error) {
      console.error('Failed to start stream:', error);
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : "Failed to start stream",
        currentMessage: prev.currentMessage ? {
          ...prev.currentMessage,
          status: "error",
        } : null,
      }));
    }
  }, []);

  const stopStream = React.useCallback(() => {
    streamingClient.current?.close();
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  return {
    ...streamingState,
    startStream,
    stopStream,
  };
}

