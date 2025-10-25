// ACDC CHAT COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/ACDCChat.tsx

/**
 * ACDC Framework Chat Component for Session Manager
 * 
 * Real-time streaming chat interface using ACDC Framework:
 * - Real-time streaming via SSE
 * - Tool execution display
 * - Natural language query understanding
 * - Analytics integration
 */

"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useACDCAgent } from "@/lib/hooks/useACDCAgent";
import type { ACDCMessage } from "@/lib/hooks/useACDCAgent";
import { ACDCChatMessage } from "./_components/ACDCChatMessage";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from "@/app/components/ai/conversation";
import {
  PromptInput,
  PromptInputTextarea,
} from "@/app/components/ai/prompt-input";
import { Suggestion } from "@/app/components/ai/suggestion";

export interface ACDCChatProps {
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

export function ACDCChat({
  className,
  placeholder = "Ask me about your session data, metrics, costs, or system health...",
  agentId = "session-manager",
  sessionId,
  conversationId,
  onMessageSent,
  onResponseReceived,
  disabled = false,
  showSettings = false
}: ACDCChatProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [showSettingsPanel] = useState(false);

  // Flash memory: Mutation to save messages to Convex (not used by useACDCAgent directly)
  // This is NOT needed since SessionManagerAgent already saves messages
  // But we keep it here as a reference in case we need frontend-side saving
  // const saveMessage = useMutation(api.nexus.sessionChats.create);

  // Use ACDC agent hook with flash memory callbacks
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
  } = useACDCAgent({
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
    // Flash memory callbacks - NOTE: Messages are already saved by SessionManagerAgent
    // These callbacks are optional placeholders for frontend-initiated saves if needed
    onMessageSent: (message: ACDCMessage) => {
      console.log('[ACDCChat] User message sent (already saved by agent):', message.content.substring(0, 50));
      // No need to save - SessionManagerAgent already saves user messages
    },
    onMessageReceived: (message: ACDCMessage) => {
      console.log('[ACDCChat] Assistant message received (already saved by agent):', message.content.substring(0, 50));
      // No need to save - SessionManagerAgent already saves assistant messages
    },
  });

  // DEBUG: Log component render with hook data
  console.log('[ACDCChat] Rendered:', {
    agentId,
    sessionId,
    conversationId,
    messageCount: messages.length,
    isStreaming
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isStreaming || disabled) return;

    const messageText = currentMessage.trim();
    
    // DEBUG: Log message send
    console.log('[ACDCChat] Sending message:', { messageText, agentId, sessionId });
    
    // Clear input immediately
    setCurrentMessage("");
    
    // Notify parent
    onMessageSent?.(messageText);

    // Send to ACDC agent
    try {
      await sendMessage(messageText);
      console.log('[ACDCChat] Message sent successfully');
    } catch (err) {
      console.error('[ACDCChat] Failed to send message:', err);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isStreaming || disabled) return;
    
    // Notify parent
    onMessageSent?.(suggestion);

    // Send to ACDC agent
    try {
      await sendMessage(suggestion);
      console.log('[ACDCChat] Suggestion sent successfully:', suggestion);
    } catch (err) {
      console.error('[ACDCChat] Failed to send suggestion:', err);
    }
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div className={cn("flex flex-col h-full bg-neutral-900", className)}>
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
      
      {/* Messages Area with Auto-Scroll */}
      <Conversation className="flex-1" initial="smooth" resize="smooth">
        <ConversationContent paddingSize="default">
          {messages.length === 0 && !isStreaming && (
            <div className="flex items-center justify-center pt-8">
              <div className="max-w-3xl w-full px-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Suggestion
                    suggestion="How are my data metrics for the week?"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-cyan-400 hover:bg-neutral-800 hover:border-cyan-400/50"
                  />
                  <Suggestion
                    suggestion="Show me token usage trends"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-purple-400 hover:bg-neutral-800 hover:border-purple-400/50"
                  />
                  <Suggestion
                    suggestion="What's the current AAPL stock price?"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-cyan-500 hover:bg-neutral-800 hover:border-cyan-500/50"
                  />
                  <Suggestion
                    suggestion="Show TSLA news and sentiment"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-pink-400 hover:bg-neutral-800 hover:border-pink-400/50"
                  />
                  <Suggestion
                    suggestion="Get company overview for MSFT"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-violet-400 hover:bg-neutral-800 hover:border-violet-400/50"
                  />
                  <Suggestion
                    suggestion="Analyze my engagement metrics"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-orange-400 hover:bg-neutral-800 hover:border-orange-400/50"
                  />
                  <Suggestion
                    suggestion="Compare this week to last week"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-blue-400 hover:bg-neutral-800 hover:border-blue-400/50"
                  />
                  <Suggestion
                    suggestion="Show me error rates"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-red-400 hover:bg-neutral-800 hover:border-red-400/50"
                  />
                  <Suggestion
                    suggestion="What are my peak usage times?"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800 hover:border-amber-400/50"
                  />
                  <Suggestion
                    suggestion="Summary of recent sessions"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-indigo-400 hover:bg-neutral-800 hover:border-indigo-400/50"
                  />
                  <Suggestion
                    suggestion="Show cost breakdown"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-emerald-400 hover:bg-neutral-800 hover:border-emerald-400/50"
                  />
                  <Suggestion
                    suggestion="Which tools are most used?"
                    onClick={handleSuggestionClick}
                    className="bg-neutral-900 border-neutral-800 text-pink-400 hover:bg-neutral-800 hover:border-pink-400/50"
                  />
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <ACDCChatMessage
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
        </ConversationContent>

        {/* Scroll to Bottom Button */}
        <ConversationScrollButton
          label="Scroll to latest message"
          showBadge={false}
        />
      </Conversation>

      {/* Input Area */}
      <div className="px-4 py-1 bg-neutral-900">
        <div className="max-w-4xl mx-auto">
          <PromptInput onSubmit={handleSend}>
            <PromptInputTextarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.currentTarget.value)}
              placeholder={placeholder}
              minHeight={100}
              maxHeight={240}
              className="bg-neutral-800 border-neutral-700 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isStreaming || disabled}
            />
          </PromptInput>
          {isStreaming && (
            <p className="text-xs text-neutral-500 text-center mt-4">
              Agent is processing your request...
            </p>
          )}
        </div>
      </div>

      {/* Footer with Settings */}
      {showSettings && (
        <div className="pl-5 pr-4 bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500">
                Your Chat: Powered by the Session Manager w/ 13 analytics & financial tools
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <Settings className="w-4 h-4" />
              </Button> */}
              <Button
                variant="ghost-minimal"
                size="xs"
                onClick={handleClearChat}
                className="p-1 pr-2 text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </Button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettingsPanel && (
            <div className="mt-4 p-4 bg-neutral-800 rounded-lg space-y-3">
              <div className="text-xs text-neutral-300 space-y-2">
                <div className="font-semibold text-neutral-200 mb-2">Session Analytics Tools:</div>
                <ul className="space-y-1 pl-4">
                  <li>📊 <span className="text-blue-400">Session Metrics</span> - Analyze session data and trends</li>
                  <li>🎫 <span className="text-green-400">Token Usage</span> - Track token consumption and projections</li>
                  <li>🔍 <span className="text-yellow-400">Message Search</span> - Find specific conversations</li>
                  <li>🟢 <span className="text-emerald-400">Active Sessions</span> - View current active sessions</li>
                  <li>👥 <span className="text-purple-400">Engagement Analysis</span> - Measure user engagement</li>
                  <li>💚 <span className="text-teal-400">System Health</span> - Check system status</li>
                  <li>💰 <span className="text-orange-400">Cost Analysis</span> - Review spending and costs</li>
                </ul>
                <div className="font-semibold text-neutral-200 mt-4 mb-2">Financial Market Tools (Alpha Vantage):</div>
                <ul className="space-y-1 pl-4">
                  <li>📈 <span className="text-cyan-400">Stock Quote</span> - Real-time stock prices and market data</li>
                  <li>🔎 <span className="text-indigo-400">Symbol Search</span> - Find ticker symbols by company name</li>
                  <li>📰 <span className="text-pink-400">Market News</span> - Latest news and sentiment analysis</li>
                  <li>🏢 <span className="text-violet-400">Company Info</span> - Company fundamentals and financial ratios</li>
                  <li>📉 <span className="text-rose-400">Technical Analysis</span> - Technical indicators (SMA, EMA, RSI, MACD)</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-neutral-700 text-neutral-400">
                  <strong>Tip:</strong> Just ask naturally! Try &ldquo;How are my metrics this week?&rdquo; or &ldquo;Show me token usage trends&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ACDCChat;
