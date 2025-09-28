// SESSION CHAT - Chat interface for AI conversations
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/sessions/_components/SessionChat.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionChatProps {
  sessionId: Id<"sessions">;
}

export function SessionChat({ sessionId }: SessionChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.messages.list, { sessionId });
  const sendMessage = useMutation(api.messages.send);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      await sendMessage({
        sessionId,
        content: message,
        role: "user",
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages?.map((msg) => (
          <div 
            key={msg._id} 
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
              <p className="text-xs text-neutral-600 mt-1">
                {new Date(msg._creationTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-800 p-4 bg-neutral-950/50">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-[200px] bg-neutral-900 border-neutral-700 text-white resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium self-end"
          >
            {isLoading ? (
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