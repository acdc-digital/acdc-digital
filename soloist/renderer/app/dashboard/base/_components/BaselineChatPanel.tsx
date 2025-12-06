"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { User, Bot, Sparkles, MessageCircle, Trash2, Loader2 } from "lucide-react";

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

  return (
    <div className="h-full flex flex-col bg-neutral-100 dark:bg-neutral-800 p-4">
      <div className="flex-1 flex flex-col border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden bg-neutral-200/50 dark:bg-neutral-700/30">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-4">
          {!baselineAnswerId ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-neutral-500 dark:text-neutral-400 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm max-w-[200px]">Complete the baseline questionnaire to discover your rhythm</p>
              </div>
            </div>
          ) : isGeneratingAnalysis ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-neutral-500 dark:text-neutral-400 space-y-4">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-500 dark:text-neutral-400" />
                  </div>
                </div>
                <p className="text-sm">Analyzing your patterns...</p>
              </div>
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-neutral-500 dark:text-neutral-400 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm max-w-[200px]">No analysis yet. Complete your baseline to begin.</p>
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
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-white dark:text-neutral-900" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg rounded-tr-none"
                        : "bg-transparent text-neutral-700 dark:text-neutral-300 border border-white/40 rounded-lg rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-xs mt-2 block ${msg.role === "user" ? "text-neutral-500 dark:text-neutral-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white dark:text-neutral-900" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Footer - Input Area (COMMENTED OUT) */}
      {/* <div className="flex-shrink-0 px-5 py-3 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-300 dark:border-neutral-600">
        <PromptInput
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="gap-2"
        >
          <div className="flex gap-2 items-end">
            <PromptInputTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                baselineAnswerId
                  ? "Ask about your patterns..."
                  : "Complete the questionnaire first..."
              }
              disabled={!baselineAnswerId || isSending || isGeneratingAnalysis}
              minHeight={48}
              maxHeight={120}
              className="flex-1 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-lg text-sm"
            />
            <PromptInputSubmit
              disabled={!message.trim() || !baselineAnswerId || isGeneratingAnalysis}
              status={isSending ? "submitted" : "ready"}
              className="h-12 w-12 shrink-0 border border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700/75 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-lg transition-all"
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Press <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-xs font-mono">Enter</kbd> to send
          </p>
        </PromptInput>
      </div> */}
      </div>
    </div>
  );
}
