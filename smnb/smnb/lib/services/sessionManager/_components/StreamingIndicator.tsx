// STREAMING INDICATOR COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/_components/StreamingIndicator.tsx

/**
 * Visual indicator for active streaming
 */

"use client";

import { Bot, Loader2 } from "lucide-react";

export interface StreamingIndicatorProps {
  message?: string;
}

export function StreamingIndicator({ message = "AI is thinking..." }: StreamingIndicatorProps) {
  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-400/10 border border-purple-400/30">
        <Bot className="w-4 h-4 text-purple-400" />
      </div>

      {/* Indicator */}
      <div className="flex-1 max-w-3xl">
        <div className="inline-block px-4 py-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
          <div className="flex items-center gap-3">
            {/* Animated Dots */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms] [animation-duration:1s]" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms] [animation-duration:1s]" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms] [animation-duration:1s]" />
            </div>
            
            {/* Message */}
            <span className="text-sm text-purple-200">{message}</span>
            
            {/* Spinner */}
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamingIndicator;
