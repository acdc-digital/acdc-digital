// CHAT MESSAGE COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/_components/ChatMessage.tsx

/**
 * Individual Chat Message Component
 * 
 * Renders a single message in the chat conversation
 */

"use client";

import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  className?: string;
}

export function ChatMessage({ role, content, timestamp, className }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-4", role === "assistant" && "flex-row-reverse", className)}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        role === "user"
          ? "bg-cyan-400/10 border border-cyan-400/30"
          : "bg-purple-400/10 border border-purple-400/30"
      )}>
        {role === "user" ? (
          <User className="w-4 h-4 text-cyan-400" />
        ) : (
          <Bot className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <div className={cn(
        "flex-1 max-w-2xl",
        role === "assistant" && "text-right"
      )}>
        <div className={cn(
          "inline-block px-4 py-2 rounded-lg",
          role === "user"
            ? "bg-neutral-900 text-white"
            : "bg-purple-400/10 text-purple-100 border border-purple-400/20"
        )}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        {timestamp && (
          <p className="text-xs text-neutral-600 mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;