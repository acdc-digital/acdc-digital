// NEXUS CHAT COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/NexusChat.tsx

/**
 * Nexus-Powered Chat Component for Session Manager
 * 
 * Drop-in replacement for Chat.tsx using Nexus Framework with:
 * - Real-time streaming via SSE
 * - Tool execution display
 * - Natural language query understanding
 * - Analytics integration
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, Settings, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNexusAgent } from "@/lib/hooks/useNexusAgent";
import { NexusChatMessage } from "./_components/NexusChatMessage";
import { StreamingIndicator } from "./_components/StreamingIndicator";

export interface NexusChatProps {
  className?: string;
  placeholder?: string;
  agentId?: string;
  sessionId?: string;
  conversationId?: string;
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: string) => void;
  disabled?: boolean;
  showSettings?: boolean;
}

export function NexusChat({
  className,
  placeholder = "Ask me about your session data, metrics, costs, or system health...",
  agentId = "session-manager",
  sessionId,
  conversationId,
  onMessageSent,
  onResponseReceived,
  disabled = false,
  showSettings = false
}: NexusChatProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use Nexus agent hook
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
  } = useNexusAgent({
    agentId,
    sessionId,
    conversationId,
    onComplete: () => {
      // Notify parent when response is complete
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        onResponseReceived?.(lastMessage.content);
      }
    },
  });

  // DEBUG: Log component render with hook data
  console.log('[NexusChat] Rendered:', {
    agentId,
    sessionId,
    conversationId,
    messageCount: messages.length,
    isStreaming
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!currentMessage.trim() || isStreaming || disabled) return;

    const messageText = currentMessage.trim();
    
    // DEBUG: Log message send
    console.log('[NexusChat] Sending message:', { messageText, agentId, sessionId });
    
    // Clear input immediately
    setCurrentMessage("");
    
    // Notify parent
    onMessageSent?.(messageText);

    // Send to Nexus agent
    try {
      await sendMessage(messageText);
      console.log('[NexusChat] Message sent successfully');
    } catch (err) {
      console.error('[NexusChat] Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div className={cn("flex flex-col h-full bg-neutral-950", className)}>
      {/* Header with Settings */}
      {showSettings && (
        <div className="border-b border-neutral-800 p-4 bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-200">Nexus Chat</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Powered by SessionManagerAgent with 7 analytics tools
              </p>
            </div>
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
                onClick={handleClearChat}
                className="text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </Button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettingsPanel && (
            <div className="mt-4 p-4 bg-neutral-800 rounded-lg space-y-3">
              <div className="text-xs text-neutral-300 space-y-2">
                <div className="font-semibold text-neutral-200 mb-2">Available Tools:</div>
                <ul className="space-y-1 pl-4">
                  <li>📊 <span className="text-blue-400">Session Metrics</span> - Analyze session data and trends</li>
                  <li>🎫 <span className="text-green-400">Token Usage</span> - Track token consumption and projections</li>
                  <li>🔍 <span className="text-yellow-400">Message Search</span> - Find specific conversations</li>
                  <li>🟢 <span className="text-emerald-400">Active Sessions</span> - View current active sessions</li>
                  <li>👥 <span className="text-purple-400">Engagement Analysis</span> - Measure user engagement</li>
                  <li>💚 <span className="text-teal-400">System Health</span> - Check system status</li>
                  <li>💰 <span className="text-orange-400">Cost Analysis</span> - Review spending and costs</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-neutral-700 text-neutral-400">
                  <strong>Tip:</strong> Just ask naturally! Try &ldquo;How are my metrics this week?&rdquo; or &ldquo;Show me token usage trends&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-xs mt-0.5">{error.message}</div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center text-neutral-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
            <p className="text-lg font-medium text-neutral-400">Ask me anything about your sessions</p>
            <div className="mt-6 max-w-md mx-auto space-y-2 text-sm text-left">
              <p className="text-neutral-500 text-center mb-3">Try asking:</p>
              <div className="space-y-2">
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <p className="text-cyan-400">&ldquo;How are my data metrics for the week?&rdquo;</p>
                </div>
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <p className="text-purple-400">&ldquo;Show me token usage trends&rdquo;</p>
                </div>
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <p className="text-green-400">&ldquo;What&apos;s my current system health?&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <NexusChatMessage key={msg.id} message={msg} />
        ))}
        
        {/* Streaming Indicator */}
        {isStreaming && <StreamingIndicator />}
        
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
            className="min-h-[60px] max-h-[200px] bg-neutral-800 border-neutral-700 text-white resize-none focus:border-cyan-400/50 transition-colors"
            disabled={isStreaming || disabled}
          />
          <Button
            onClick={handleSend}
            disabled={!currentMessage.trim() || isStreaming || disabled}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium self-end disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isStreaming && (
          <p className="text-xs text-neutral-500 text-center mt-2">
            Agent is processing your request...
          </p>
        )}
      </div>
    </div>
  );
}

export default NexusChat;
