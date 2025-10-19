// ACDC CHAT MESSAGE COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/_components/ACDCChatMessage.tsx

/**
 * Enhanced Chat Message Component for ACDC Framework
 * 
 * Displays messages with tool execution details and expandable results
 */

"use client";

import { useState } from "react";
import { User, Bot, ChevronDown, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ACDCMessage } from "@/lib/hooks/useACDCAgent";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";
import { Response } from "@/components/ai/response";

export interface ACDCChatMessageProps {
  message: ACDCMessage;
  className?: string;
  isStreaming?: boolean; // For reasoning auto-open/close
}

// Tool name to display label and icon mapping
const TOOL_INFO: Record<string, { label: string; icon: string; color: string }> = {
  analyze_session_metrics: { label: 'Session Metrics', icon: '📊', color: 'bg-blue-500/10 text-blue-400 border-blue-400/30' },
  analyze_token_usage: { label: 'Token Usage', icon: '🎫', color: 'bg-green-500/10 text-green-400 border-green-400/30' },
  search_session_messages: { label: 'Message Search', icon: '🔍', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30' },
  get_active_sessions: { label: 'Active Sessions', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30' },
  analyze_engagement: { label: 'Engagement Analysis', icon: '👥', color: 'bg-purple-500/10 text-purple-400 border-purple-400/30' },
  check_system_health: { label: 'System Health', icon: '💚', color: 'bg-teal-500/10 text-teal-400 border-teal-400/30' },
  analyze_costs: { label: 'Cost Analysis', icon: '💰', color: 'bg-orange-500/10 text-orange-400 border-orange-400/30' },
};

// Helper to format tool input/result data
const formatValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

export function ACDCChatMessage({ message, className, isStreaming = false }: ACDCChatMessageProps) {
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());

  // Debug: Log the actual message content length
  console.log('[ACDCChatMessage] Rendering message:', {
    role: message.role,
    contentLength: message.content?.length || 0,
    contentPreview: message.content?.substring(0, 100) || '',
    thinkingLength: message.thinking?.length || 0,
    toolCallCount: message.toolCalls?.length || 0,
  });

  const toggleTool = (index: number) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={cn("flex gap-4", message.role === "user" && "flex-row-reverse", className)}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        message.role === "user"
          ? "bg-cyan-400/10 border border-cyan-400/30"
          : "bg-purple-400/10 border border-purple-400/30"
      )}>
        {message.role === "user" ? (
          <User className="w-4 h-4 text-cyan-400" />
        ) : (
          <Bot className="w-4 h-4 text-purple-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-3xl space-y-2",
        message.role === "user" && "text-right"
      )}>
        {/* Reasoning/Thinking Block (if present) */}
        {message.thinking && message.role === "assistant" && (
          <Reasoning
            isStreaming={isStreaming && !message.content}
            defaultOpen={false}
            className="inline-block max-w-full text-left"
          >
            <ReasoningTrigger />
            <ReasoningContent>
              <Response parseIncompleteMarkdown={isStreaming && !message.content}>
                {message.thinking}
              </Response>
            </ReasoningContent>
          </Reasoning>
        )}

        {/* Main Text */}
        {message.content && (
          <div className={cn(
            "inline-block px-4 py-3 rounded-lg",
            message.role === "user"
              ? "bg-neutral-900 text-white border border-neutral-800"
              : "bg-purple-400/10 text-purple-100 border border-purple-400/20"
          )}>
            <Response
              parseIncompleteMarkdown={isStreaming}
              className="text-sm"
            >
              {message.content}
            </Response>

            {/* Tool Executions */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-400/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Activity className="w-3 h-3" />
                  <span>Tools Used ({message.toolCalls.length})</span>
                </div>
                
                {message.toolCalls.map((tool, idx) => {
                  const toolInfo = TOOL_INFO[tool.name] || {
                    label: tool.name,
                    icon: '🔧',
                    color: 'bg-gray-500/10 text-gray-400 border-gray-400/30'
                  };
                  const isExpanded = expandedTools.has(idx);

                  return (
                    <div key={idx} className={cn(
                      "rounded-lg border overflow-hidden transition-all",
                      toolInfo.color
                    )}>
                      {/* Tool Header */}
                      <button
                        onClick={() => toggleTool(idx)}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span>{toolInfo.icon}</span>
                          <span className="font-medium">{toolInfo.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {/* Tool Details (Expandable) */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-3 text-xs">
                          {/* Input */}
                          <div>
                            <div className="font-semibold mb-1 text-neutral-300">Input:</div>
                            <pre className="bg-black/30 rounded p-2 overflow-x-auto text-neutral-300 font-mono">
                              <code>{formatValue(tool.input)}</code>
                            </pre>
                          </div>

                          {/* Result */}
                          {tool.result && (
                            <div>
                              <div className="font-semibold mb-1 text-neutral-300">Result:</div>
                              <pre className="bg-black/30 rounded p-2 overflow-x-auto text-neutral-300 font-mono max-h-64">
                                <code>{formatValue(tool.result as string)}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-xs text-neutral-600 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default ACDCChatMessage;
