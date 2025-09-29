// SESSION CHAT COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/Chat.tsx

/**
 * Main Chat Component for Session Manager
 * 
 * Provides the primary chat interface that can be embedded in different contexts
 * Uses the sessionChatService for LLM integration
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, User, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { sessionChatService, ChatMessage, ChatOptions } from './sessionChatService';

export interface ChatProps {
  className?: string;
  placeholder?: string;
  systemPrompt?: string;
  chatOptions?: ChatOptions;
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: string, usage?: { inputTokens: number; outputTokens: number; totalCost: number }) => void;
  disabled?: boolean;
  showSettings?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  settings: ChatOptions;
}

export function Chat({
  className,
  placeholder = "Type your message...",
  systemPrompt,
  chatOptions = {},
  onMessageSent,
  onResponseReceived,
  disabled = false,
  showSettings = false
}: ChatProps) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      model: 'claude-3-5-haiku-20241022',
      systemPrompt: systemPrompt || 'You are a helpful AI assistant in a conversational setting. Provide clear, informative, and engaging responses.',
      stream: false,
      ...chatOptions
    }
  });
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const addMessage = (message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const updateLastMessage = (content: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) => 
        index === prev.messages.length - 1 ? { ...msg, content } : msg
      )
    }));
  };

  const handleSend = async () => {
    if (!currentMessage.trim() || state.isLoading || disabled) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: Date.now()
    };

    // Add user message
    addMessage(userMessage);
    onMessageSent?.(userMessage.content);
    
    // Clear input and set loading
    setCurrentMessage("");
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Prepare conversation history
      const conversationHistory = [...state.messages, userMessage];

      if (state.settings.stream) {
        // Add placeholder assistant message for streaming
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        };
        addMessage(assistantMessage);

        // Start streaming
        await sessionChatService.sendStreamingMessage(
          conversationHistory,
          state.settings,
          // onChunk
          (chunk: string) => {
            updateLastMessage(state.messages[state.messages.length - 1]?.content + chunk || chunk);
          },
          // onComplete
          (fullText: string) => {
            updateLastMessage(fullText);
            onResponseReceived?.(fullText);
            setState(prev => ({ ...prev, isLoading: false }));
          },
          // onError
          (error: Error) => {
            console.error('Streaming error:', error);
            setState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: error.message 
            }));
          }
        );
      } else {
        // Non-streaming response
        const response = await sessionChatService.sendMessage(conversationHistory, state.settings);
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.content,
          timestamp: Date.now()
        };

        addMessage(assistantMessage);
        onResponseReceived?.(response.content, response.usage);
        setState(prev => ({ ...prev, isLoading: false }));
      }

    } catch (error) {
      console.error('Chat error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const updateSettings = (newSettings: Partial<ChatOptions>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const clearChat = () => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: undefined
    }));
  };

  return (
    <div className={cn("flex flex-col h-full bg-neutral-950", className)}>
      {/* Header with Settings */}
      {showSettings && (
        <div className="border-b border-neutral-800 p-4 bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-200">Chat Session</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </Button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettingsPanel && (
            <div className="mt-4 p-4 bg-neutral-800 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300">Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={state.settings.temperature}
                    onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                    className="w-full"
                    title="Temperature setting for response creativity"
                  />
                  <span className="text-xs text-neutral-500">{state.settings.temperature}</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300">Max Tokens</label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={state.settings.maxTokens}
                    onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                    className="w-full bg-neutral-700 text-white text-xs p-1 rounded"
                    title="Maximum tokens for response length"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-300">Streaming</label>
                <input
                  type="checkbox"
                  checked={state.settings.stream}
                  onChange={(e) => updateSettings({ stream: e.target.checked })}
                  className="ml-2"
                  title="Enable streaming responses"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 text-sm">
          Error: {state.error}
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {state.messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
            <p>Start a conversation with the AI assistant</p>
            <p className="text-sm mt-2">Using {state.settings.model} with temperature {state.settings.temperature}</p>
          </div>
        )}
        
        {state.messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-4",
              msg.role === "assistant" && "flex-row-reverse"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              msg.role === "user"
                ? "bg-cyan-400/10 border border-cyan-400/30"
                : "bg-purple-400/10 border border-purple-400/30"
            )}>
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-cyan-400" />
              ) : (
                <Bot className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <div className={cn(
              "flex-1 max-w-2xl",
              msg.role === "assistant" && "text-right"
            )}>
              <div className={cn(
                "inline-block px-4 py-2 rounded-lg",
                msg.role === "user"
                  ? "bg-neutral-900 text-white"
                  : "bg-purple-400/10 text-purple-100 border border-purple-400/20"
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.timestamp && (
                <p className="text-xs text-neutral-600 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-800 p-4 bg-neutral-900">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] max-h-[200px] bg-neutral-800 border-neutral-700 text-white resize-none"
            disabled={state.isLoading || disabled}
          />
          <Button
            onClick={handleSend}
            disabled={!currentMessage.trim() || state.isLoading || disabled}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium self-end"
          >
            {state.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
