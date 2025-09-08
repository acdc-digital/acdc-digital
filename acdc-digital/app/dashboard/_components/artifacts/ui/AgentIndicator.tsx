"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, Bot } from "lucide-react";

interface AgentIndicatorProps {
  intent?: string;
  isProcessing: boolean;
  documentUpdated?: boolean;
  confidence?: number;
  reasoning?: string;
}

export function AgentIndicator({ 
  intent, 
  isProcessing, 
  documentUpdated,
  confidence,
  reasoning,
}: AgentIndicatorProps) {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (documentUpdated) {
      setShowUpdate(true);
      const timer = setTimeout(() => setShowUpdate(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [documentUpdated]);

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-950/20 px-3 py-2 rounded-lg border border-blue-800/30">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>AI Agent processing...</span>
        {intent && intent !== "general_chat" && (
          <span className="text-blue-300 text-xs">
            ({getIntentDescription(intent)})
          </span>
        )}
      </div>
    );
  }

  if (showUpdate) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm bg-green-950/20 px-3 py-2 rounded-lg border border-green-800/30 animate-fade-in">
        <CheckCircle className="w-4 h-4" />
        <span>Document updated by AI</span>
        {confidence && (
          <span className="text-green-300 text-xs">
            ({Math.round(confidence * 100)}% confidence)
          </span>
        )}
      </div>
    );
  }

  if (intent && intent !== "general_chat") {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-950/20 px-3 py-2 rounded-lg border border-yellow-800/30">
        <Bot className="w-4 h-4" />
        <span>AI detected: {getIntentDescription(intent)}</span>
        {reasoning && (
          <span className="text-yellow-300 text-xs ml-2" title={reasoning}>
            (hover for reasoning)
          </span>
        )}
      </div>
    );
  }

  return null;
}

function getIntentDescription(intent: string): string {
  const descriptions: Record<string, string> = {
    create_document: "Creating new content",
    edit_document: "Editing content", 
    append_content: "Adding content",
    replace_content: "Replacing content",
    format_content: "Formatting content",
    clear_document: "Clearing document",
    general_chat: "General conversation",
  };
  return descriptions[intent] || intent;
}