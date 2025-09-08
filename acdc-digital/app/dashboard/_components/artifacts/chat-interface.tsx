"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AgentIndicator } from "./ui/AgentIndicator";
import { AgentStatus } from "./ui/AgentStatus";
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
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<string | null>(null);
  
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Update agent state
    setAgentState(prev => ({ ...prev, isProcessing: true }));

    try {
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
    } finally {
      setIsStreaming(false);
      // Update agent state
      setAgentState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className={cn("h-full flex flex-col bg-[#1e1e1e]", className)}>
      {/* Header */}
      <div className="border-b border-[#3e3e42] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-[#cccccc]">AI Assistant</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Agent Indicator */}
          {effectiveDocumentId && (
            <AgentIndicator 
              isProcessing={agentState.isProcessing}
              intent={agentState.currentIntent}
              documentUpdated={agentState.lastDocumentUpdate}
              confidence={agentState.confidence}
              reasoning={agentState.reasoning}
            />
          )}
          
          {/* Model Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="text-[#858585] hover:text-[#cccccc] flex items-center gap-2"
            >
              {selectedModel.name}
              <ChevronDown className="h-3 w-3" />
            </Button>
            
            {showModelDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-[#2d2d30] border border-[#3e3e42] rounded-lg shadow-lg min-w-[200px] z-10">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#3e3e42] first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-[#858585]">{model.provider}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="text-[#858585] hover:text-[#cccccc]"
            disabled={messages.length === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-[#858585] py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500/50" />
            <h4 className="text-lg font-medium mb-2">Start a conversation</h4>
            <p className="text-sm">
              Ask me anything about development, design, or get help with your projects
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                "Create a React component for me",
                "Help me build a landing page", 
                "Explain how to use TypeScript",
                "Design a user interface"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 text-xs bg-[#3e3e42] text-[#cccccc] rounded-full hover:bg-[#454545] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] space-y-2",
              message.role === "user" 
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3" 
                : "bg-[#252526] text-[#cccccc] rounded-2xl rounded-tl-md px-4 py-3"
            )}>
              {/* Reasoning Section */}
              {message.reasoning && message.role === "assistant" && (
                <div className="mb-3">
                  <button
                    onClick={() => setExpandedReasoning(
                      expandedReasoning === message.id ? null : message.id
                    )}
                    className="flex items-center gap-2 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
                  >
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      expandedReasoning === message.id ? "rotate-180" : ""
                    )} />
                    Reasoning
                  </button>
                  
                  {(expandedReasoning === message.id || message.isStreaming) && (
                    <div className="mt-2 p-3 bg-[#1e1e1e] rounded-lg border border-[#3e3e42]">
                      <p className="text-xs text-[#858585] italic">{message.reasoning}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Message Content */}
              <div className="whitespace-pre-wrap">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                )}
              </div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && !message.isStreaming && (
                <div className="mt-3 pt-3 border-t border-[#3e3e42]">
                  <button
                    onClick={() => setExpandedSources(
                      expandedSources === message.id ? null : message.id
                    )}
                    className="flex items-center gap-2 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
                  >
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      expandedSources === message.id ? "rotate-180" : ""
                    )} />
                    Used {message.sources.length} sources
                  </button>
                  
                  {expandedSources === message.id && (
                    <div className="mt-2 space-y-1">
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-[#858585] mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[#3e3e42] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-[#cccccc]">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <div className="bg-[#252526] rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#858585] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#858585] rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-[#858585] rounded-full animate-bounce delay-200" />
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
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="w-full bg-[#252526] text-[#cccccc] rounded-xl px-4 py-3 pr-12 
                       border border-[#3e3e42] focus:border-blue-500 focus:outline-none 
                       resize-none min-h-[48px] max-h-[120px]"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isStreaming}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        <p className="text-xs text-[#858585] mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}