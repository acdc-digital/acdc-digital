"use client";

import { Id } from "@/convex/_generated/dataModel";
import { NexusChat } from "@/lib/services/sessionManager/NexusChat";
import { MessageSquare } from "lucide-react";

interface SessionChatProps {
  sessionId: Id<"sessions">;
}

export function SessionChat({ sessionId }: SessionChatProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Session Analytics Assistant</h3>
            <p className="text-xs text-neutral-500">
              Powered by Nexus Framework • SessionManagerAgent with 7 Analytics Tools
            </p>
          </div>
        </div>
      </div>

      {/* Nexus Chat Component */}
      <div className="flex-1 overflow-hidden">
        <NexusChat
          agentId="session-manager-agent"
          sessionId={sessionId}
          conversationId={`session-${sessionId}`}
          showSettings={true}
        />
      </div>
    </div>
  );
}