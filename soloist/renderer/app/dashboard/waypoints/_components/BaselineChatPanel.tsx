"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, User, Bot, Sparkles } from "lucide-react";

interface BaselineChatPanelProps {
  userId: Id<"users">;
  baselineAnswerId: Id<"baseline_answers"> | null;
  isGeneratingAnalysis: boolean;
}

export function BaselineChatPanel({
  userId,
  baselineAnswerId,
  isGeneratingAnalysis,
}: BaselineChatPanelProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(
    api.baselineChat.getChatMessages,
    baselineAnswerId ? { baselineAnswerId } : "skip"
  );

  const chatWithAnalysis = useAction(api.baselineChatActions.chatWithAnalysis);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !baselineAnswerId || isSending) return;

    const userMessage = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await chatWithAnalysis({
        userId,
        baselineAnswerId,
        userMessage,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#2d2d30] bg-[#252526] px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
          <h2 className="text-[13px] font-semibold text-white">AI Psychoanalysis</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!baselineAnswerId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585] space-y-2">
              <Bot className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-[13px]">Complete the baseline questionnaire to receive your analysis</p>
            </div>
          </div>
        ) : isGeneratingAnalysis ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585] space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-[#007acc]" />
              <p className="text-[13px]">Generating your personalized psychoanalysis...</p>
            </div>
          </div>
        ) : messages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#858585] space-y-2">
              <Bot className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-[13px]">No analysis yet. Try recomputing your baseline.</p>
            </div>
          </div>
        ) : (
          <>
            {messages?.map((msg: { _id: Id<"baseline_chats">; role: "user" | "assistant" | "system"; content: string; createdAt: number }) => (
              <div
                key={msg._id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#8b5cf6] flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-[#007acc] text-white"
                      : "bg-[#252526] text-[#cccccc] border border-[#2d2d30]"
                  }`}
                >
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[11px] opacity-50 mt-2 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#007acc] flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-[#2d2d30] bg-[#252526] p-4">
        <div className="flex gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              baselineAnswerId
                ? "Ask questions about your analysis..."
                : "Complete the questionnaire first..."
            }
            disabled={!baselineAnswerId || isSending || isGeneratingAnalysis}
            className="flex-1 min-h-[60px] max-h-[120px] bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md text-[13px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !baselineAnswerId || isSending || isGeneratingAnalysis}
            className="h-[60px] px-4 bg-[#007acc] hover:bg-[#005a9e] text-white border-none rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#007acc]/20"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[11px] text-[#858585] mt-2">
          Press <kbd className="px-1 py-0.5 bg-[#1e1e1e] border border-[#2d2d30] rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-[#1e1e1e] border border-[#2d2d30] rounded text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
