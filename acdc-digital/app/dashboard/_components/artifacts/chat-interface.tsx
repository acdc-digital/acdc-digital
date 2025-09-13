"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, RotateCcw, Copy, RefreshCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AgentStatus } from "./ui/AgentStatus";
import { Actions, Action } from "@/components/ai/actions";
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import { TaskWithState, TaskItem, TaskItemFile } from "@/components/ai/task";
import { parseThinkingToTasks } from "@/lib/task-parser";
import { useStreaming } from "@/lib/streaming";
import type { AgentState, AgentIntent } from "./agent/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  reasoning?: string;
  sources?: Array<{ title: string; url: string }>;
  isStreaming?: boolean;
  // Agent-specific metadata
  intent?: string;
  documentUpdated?: boolean;
  confidence?: number;
}

interface ChatInterfaceProps {
  className?: string;
  documentId?: Id<"documents">; // For agent integration
}

const models = [
  { id: "claude-3-7-sonnet-latest", name: "Claude 3.7 Sonnet", provider: "Anthropic" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "Anthropic" },
  { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "Anthropic" },
];

export function ChatInterface({ className, documentId }: ChatInterfaceProps) {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [expandedSources, setExpandedSources] = useState<string | null>(null);
  const [useStreamingMode, setUseStreamingMode] = useState(true);
  
  // Agent state 
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [agentState, setAgentState] = useState<AgentState>({
    isProcessing: false,
    currentIntent: undefined,
    lastDocumentUpdate: false,
    confidence: 0,
    reasoning: "",
    error: undefined
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get shared document ID if not provided
  const sharedDocumentId = useQuery(api.sharedDocument.getSharedDocument);
  const getOrCreateSharedDocument = useMutation(api.sharedDocument.getOrCreateSharedDocument);
  const effectiveDocumentId = documentId || sharedDocumentId;
  
  // Hook for calling the agent orchestrator
  const processMessage = useAction(api.agents.orchestrator.processUserMessage);
  
  // Fallback to regular chat if no document ID available
  const getChatCompletion = useAction(api.chat.getChatCompletion);
  
  // Streaming functionality
  const streaming = useStreaming();
  const streamChatCompletion = useAction(api.ai.streaming.streamChatCompletion);

  // Helper function for smooth scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll to bottom when messages change or when streaming
  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Handle streaming message completion
  useEffect(() => {
    if (streaming.currentMessage && streaming.currentMessage.status === 'completed') {
      // Convert streaming message to regular message format
      const completedMessage: Message = {
        id: streaming.currentMessage.id,
        role: "assistant",
        content: streaming.currentMessage.content
          .filter(block => block.type === "text")
          .map(block => block.content)
          .join(""),
        timestamp: streaming.currentMessage.timestamp,
        reasoning: streaming.currentMessage.reasoning,
        isStreaming: false,
      };

      setMessages(prev => [...prev, completedMessage]);
      setIsStreaming(false);
    }
  }, [streaming.currentMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Scroll to bottom immediately after adding user message
    setTimeout(() => scrollToBottom(), 0);

    // Update agent state
    setAgentState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (useStreamingMode) {
        // Use streaming mode for real-time responses with agent orchestrator
        // Ensure we have a document ID for agent processing
        let finalDocumentId = effectiveDocumentId;
        if (!finalDocumentId) {
          finalDocumentId = await getOrCreateSharedDocument();
        }

        if (finalDocumentId) {
          // Use agent orchestrator for document-aware processing
          const result = await processMessage({
            message: userMessage.content,
            sessionId,
            documentId: finalDocumentId,
          });

          // Simulate streaming with the result from agent orchestrator
          const context = messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

          const streamConfig = {
            messages: [...context, { role: "user" as "user" | "assistant", content: userMessage.content }],
            model: selectedModel.id,
            enableThinking: true,
            maxTokens: 20000,
          };

          await streaming.startStream({
            ...streamConfig,
            streamingAction: async () => ({
              messageId: `msg_${Date.now()}`,
              response: result.response,
              reasoning: result.reasoning,
            }),
          });

          // Update agent state with orchestrator results
          setAgentState(prev => ({
            ...prev,
            currentIntent: result.intent as AgentIntent,
            lastDocumentUpdate: result.documentUpdated,
            confidence: result.confidence || 0,
            reasoning: result.reasoning || "",
          }));

        } else {
          // Fallback to regular streaming if no document available
          const context = messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

          const streamConfig = {
            messages: [...context, { role: "user" as "user" | "assistant", content: userMessage.content }],
            model: selectedModel.id,
            enableThinking: true,
            maxTokens: 20000,
          };

          const result = await streamChatCompletion(streamConfig);
          
          // Simulate streaming with the result
          await streaming.startStream({
            ...streamConfig,
            streamingAction: async () => result,
          });
        }

      } else {
        // Use traditional non-streaming mode
        // Ensure we have a document ID for agent processing
        let finalDocumentId = effectiveDocumentId;
        if (!finalDocumentId) {
          // Create the shared document if it doesn't exist
          finalDocumentId = await getOrCreateSharedDocument();
        }

        if (finalDocumentId) {
          // Use agent orchestrator for document-aware processing
          const result = await processMessage({
            message: userMessage.content,
            sessionId,
            documentId: finalDocumentId,
          });

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: result.response,
            timestamp: new Date(),
            intent: result.intent,
            documentUpdated: result.documentUpdated,
            confidence: result.confidence,
            reasoning: result.reasoning,
            isStreaming: false,
          };

          setMessages(prev => [...prev, assistantMessage]);
          
          // Update agent state
          setAgentState(prev => ({
            ...prev,
            currentIntent: result.intent as AgentIntent,
            lastDocumentUpdate: result.documentUpdated,
            confidence: result.confidence || 0,
            reasoning: result.reasoning || "",
          }));

        } else {
          // Fallback to regular chat
          const context = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

          const response = await getChatCompletion({
            message: userMessage.content,
            context,
          });

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.content,
            timestamp: new Date(),
            reasoning: response.reasoning,
            sources: response.sources,
            isStreaming: false,
          };

          setMessages(prev => [...prev, assistantMessage]);
        }
        
        setIsStreaming(false);
      }
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your request. Please make sure your API key is configured correctly and try again.",
        timestamp: new Date(),
        isStreaming: false,
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
    } finally {
      // Update agent state
      setAgentState(prev => ({ ...prev, isProcessing: false }));
    }
  };



  const clearConversation = () => {
    setMessages([]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('Failed to copy text: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const regenerateMessage = async (messageIndex: number) => {
    if (messageIndex <= 0 || isStreaming) return;
    
    // Get the user message that prompted this assistant response
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;

    // Remove all messages from this point forward
    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);
    setIsStreaming(true);

    // Update agent state
    setAgentState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Ensure we have a document ID for agent processing
      let finalDocumentId = effectiveDocumentId;
      if (!finalDocumentId) {
        finalDocumentId = await getOrCreateSharedDocument();
      }

      if (finalDocumentId) {
        // Use agent orchestrator for document-aware processing
        const result = await processMessage({
          message: userMessage.content,
          sessionId,
          documentId: finalDocumentId,
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
          intent: result.intent,
          documentUpdated: result.documentUpdated,
          confidence: result.confidence,
          reasoning: result.reasoning,
          isStreaming: false,
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Update agent state
        setAgentState(prev => ({
          ...prev,
          currentIntent: result.intent as AgentIntent,
          lastDocumentUpdate: result.documentUpdated,
          confidence: result.confidence || 0,
          reasoning: result.reasoning || "",
        }));

      } else {
        // Fallback to regular chat
        const context = newMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await getChatCompletion({
          message: userMessage.content,
          context,
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          reasoning: response.reasoning,
          sources: response.sources,
          isStreaming: false,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (error) {
      console.error("Error regenerating response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error while regenerating the response. Please try again.",
        timestamp: new Date(),
        isStreaming: false,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setAgentState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-[#1e1e1e]", className)}>
      {/* Minimal top controls - only show when needed */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        {/* Streaming toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUseStreamingMode(!useStreamingMode)}
          className={cn(
            "text-xs px-2 py-1 h-6",
            useStreamingMode
              ? "text-blue-400 hover:text-blue-300 bg-blue-400/10"
              : "text-[#666] hover:text-[#999]"
          )}
        >
          {useStreamingMode ? "Stream" : "Batch"}
        </Button>
        {/* Model Selector - minimal */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="text-[#666] hover:text-[#999] text-xs px-2 py-1 h-6"
          >
            {selectedModel.name.split(' ')[0]}
            <ChevronDown className="h-2 w-2 ml-1" />
          </Button>
          
          {showModelDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-[#2d2d30] border border-[#3e3e42] rounded-md shadow-lg min-w-[180px] z-20">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3e3e42] first:rounded-t-md last:rounded-b-md"
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-[10px] text-[#858585]">{model.provider}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Clear Button - minimal */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          className="text-[#666] hover:text-[#999] px-2 py-1 h-6"
          disabled={messages.length === 0}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 pt-8" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-[#666] py-16">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-[#333] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#666]" />
            </div>
            <div className="text-sm text-[#888] mb-4">How can I help you today?</div>
            <div className="flex flex-col gap-1 max-w-[200px] mx-auto">
              {[
                "Create a component",
                "Help with TypeScript",
                "Design patterns",
                "Debug an issue"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs text-[#888] hover:text-[#ccc] hover:bg-[#2a2a2a] rounded-md transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {message.role === "assistant" && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-[#888]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Task Progress - if reasoning present */}
                    {message.reasoning && (() => {
                      const tasks = parseThinkingToTasks(message.reasoning);
                      return tasks.map((task, index) => (
                        <TaskWithState
                          key={`${message.id}-task-${index}`}
                          title={task.title}
                          defaultOpen={index === 0} // Open first task by default
                          className="mb-2"
                        >
                          {task.items.map((item, itemIndex) => (
                            <TaskItem key={itemIndex} completed={item.completed}>
                              {item.type === "file" && item.file ? (
                                <span>
                                  {item.text.replace(item.file.name, "").trim()}{" "}
                                  <TaskItemFile>{item.file.name}</TaskItemFile>
                                </span>
                              ) : (
                                item.text
                              )}
                            </TaskItem>
                          ))}
                        </TaskWithState>
                      ));
                    })()}
                    
                    <div className="text-sm text-[#ccc] leading-relaxed">
                      <Response parseIncompleteMarkdown={message.isStreaming}>
                        {message.content}
                      </Response>
                      {message.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-[#666] ml-1 animate-pulse" />
                      )}
                    </div>

                    {/* Action buttons for assistant messages */}
                    {!message.isStreaming && (
                      <Actions className="mt-2">
                        <Action
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="size-4" />
                        </Action>
                        <Action
                          onClick={() => regenerateMessage(messages.indexOf(message))}
                          disabled={isStreaming}
                        >
                          <RefreshCcw className="size-4" />
                        </Action>
                        <Action
                          onClick={() => {/* TODO: Implement feedback */}}
                        >
                          <ThumbsUp className="size-4" />
                        </Action>
                        <Action
                          onClick={() => {/* TODO: Implement feedback */}}
                        >
                          <ThumbsDown className="size-4" />
                        </Action>
                      </Actions>
                    )}
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                        <button
                          onClick={() => setExpandedSources(
                            expandedSources === message.id ? null : message.id
                          )}
                          className="flex items-center gap-1 text-xs text-[#666] hover:text-[#888] transition-colors"
                        >
                          <ChevronDown className={cn(
                            "h-3 w-3 transition-transform",
                            expandedSources === message.id ? "rotate-180" : ""
                          )} />
                          {message.sources.length} sources
                        </button>
                        
                        {expandedSources === message.id && (
                          <div className="mt-1 space-y-0.5">
                            {message.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-400 hover:text-blue-300 hover:underline pl-4"
                              >
                                {source.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {message.role === "user" && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 min-w-0 flex justify-end">
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2 max-w-[85%]">
                      <div className="text-sm text-[#ccc] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs font-medium text-blue-300">U</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Streaming message */}
        {streaming.isStreaming && streaming.currentMessage && (
          <div className="group mt-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center mt-0.5 flex-shrink-0">
                <Sparkles className="h-3 w-3 text-[#888] animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Task Progress - if reasoning present */}
                {streaming.currentMessage.reasoning && (() => {
                  const tasks = parseThinkingToTasks(streaming.currentMessage.reasoning);
                  return tasks.map((task, index) => (
                    <TaskWithState
                      key={`streaming-task-${index}`}
                      title={`${task.title} (in progress)`}
                      defaultOpen={true}
                      className="mb-2"
                    >
                      {task.items.map((item, itemIndex) => (
                        <TaskItem key={itemIndex} completed={false}>
                          {item.type === "file" && item.file ? (
                            <span>
                              {item.text.replace(item.file.name, "").trim()}{" "}
                              <TaskItemFile>{item.file.name}</TaskItemFile>
                            </span>
                          ) : (
                            item.text
                          )}
                        </TaskItem>
                      ))}
                    </TaskWithState>
                  ));
                })()}
                
                <div className="text-sm text-[#ccc] leading-relaxed">
                  <Response parseIncompleteMarkdown={true}>
                    {streaming.currentMessage.content
                      .filter(block => block.type === "text")
                      .map(block => block.content)
                      .join("")}
                  </Response>
                  <span className="inline-block w-1.5 h-4 bg-[#666] ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming error display */}
        {streaming.error && (
          <div className="group mt-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-900/30 border border-red-500/50 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-xs text-red-400">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-red-400 leading-relaxed">
                  Streaming failed: {streaming.error}
                </div>
                <button
                  onClick={() => {
                    // Clear error and try again
                    streaming.stopStream();
                  }}
                  className="mt-2 text-xs text-[#666] hover:text-[#888] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basic loading state for non-streaming */}
        {isStreaming && !streaming.isStreaming && (
          <div className="flex items-start gap-3 mt-4">
            <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-[#666] rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex gap-1 py-2">
                <span className="w-1 h-1 bg-[#666] rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-[#666] rounded-full animate-bounce delay-100" />
                <span className="w-1 h-1 bg-[#666] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#3e3e42] p-4">
        {/* Agent Status */}
        {effectiveDocumentId && (
          <div className="mb-3">
            <AgentStatus 
              isActive={agentState.isProcessing || agentState.currentIntent !== undefined}
              className="justify-center"
            />
          </div>
        )}
        
        <PromptInput onSubmit={handleSubmit}>
          <div className="relative bg-[#252526] border border-[#3e3e42] rounded-xl px-4 py-3 pr-12 focus-within:border-blue-500">
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isStreaming}
              minHeight={48}
              maxHeight={120}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <PromptInputSubmit
                disabled={!input.trim() || isStreaming}
                status={isStreaming ? "streaming" : "ready"}
              />
            </div>
          </div>
        </PromptInput>
        
        <p className="text-xs text-[#858585] mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}