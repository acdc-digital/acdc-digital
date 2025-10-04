"use client";

import { Id } from "@/convex/_generated/dataModel";
import { NexusChat } from "@/lib/services/sessionManager/NexusChat";

interface SessionChatProps {
  sessionId: Id<"sessions">;
}

export function SessionChat({ sessionId }: SessionChatProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Nexus Chat Component */}
      <NexusChat
        agentId="session-manager-agent"
        sessionId={sessionId}
        conversationId={`session-${sessionId}`}
        showSettings={true}
      />
    </div>
  );
}