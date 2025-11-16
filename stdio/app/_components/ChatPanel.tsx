"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 164)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm here to help! This is a simulated response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col shrink-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="text-[#858585] text-xs">
                Start a conversation with the AI assistant
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                    message.role === "user"
                      ? "bg-[#007acc] text-white"
                      : "bg-[#252526] text-[#cccccc] border border-[#2d2d2d]"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
                <div className="text-[10px] text-[#858585] mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[#2d2d2d] p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Toolbar */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded hover:bg-[#2d2d2d] p-0"
              title="Attach file"
            >
              <Paperclip className="w-3.5 h-3.5 text-[#858585]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded hover:bg-[#2d2d2d] p-0"
              title="Voice input"
            >
              <Mic className="w-3.5 h-3.5 text-[#858585]" />
            </Button>
          </div>

          {/* Input Field */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full min-h-[48px] max-h-[164px] resize-none bg-[#252526] text-[#cccccc] text-xs border border-[#2d2d2d] rounded px-3 py-2 pr-10 placeholder:text-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
              rows={1}
            />
            <Button
              type="submit"
              disabled={!input.trim()}
              variant="ghost"
              size="icon"
              className="absolute right-1 bottom-1 w-8 h-8 rounded hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed p-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5 text-[#007acc]" />
            </Button>
          </div>

          {/* Hint */}
          <div className="text-[10px] text-[#858585]">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
}
