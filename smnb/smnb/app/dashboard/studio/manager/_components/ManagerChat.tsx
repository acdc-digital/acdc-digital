"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ACDCChat } from "@/lib/services/sessionManager/ACDCChat";

interface ManagerChatProps {
  sessionId: Id<"sessions">;
}

export function ManagerChat({ sessionId }: ManagerChatProps) {
  return (
    <div className="flex flex-col h-full">
      {/* ACDC Chat Component */}
      <ACDCChat
        agentId="session-manager-agent"
        sessionId={sessionId}
        conversationId={`session-${sessionId}`}
        showSettings={true}
      />
    </div>
  );
}
