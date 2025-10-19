"use client";

import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface ManagerSessionListProps {
  sessions: Array<{
    _id: Id<"sessions">;
    name: string;
    status: "active" | "paused" | "archived";
    updatedAt?: number;
  }>;
  selectedId: Id<"sessions"> | null;
  onSelect: (id: Id<"sessions">) => void;
}

export function ManagerSessionList({ sessions, selectedId, onSelect }: ManagerSessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
        <p className="text-xs text-neutral-500">No chat sessions</p>
        <p className="text-xs text-neutral-600 mt-1">Create one to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-800">
      {sessions.map((session) => {
        const isSelected = session._id === selectedId;
        
        return (
          <button
            key={session._id}
            onClick={() => onSelect(session._id)}
            className={cn(
              "w-full px-3 py-2.5 text-left hover:bg-neutral-800/50 transition-colors",
              isSelected && "bg-neutral-800 border-l-2 border-cyan-400"
            )}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className={cn(
                "w-4 h-4 flex-shrink-0",
                isSelected ? "text-cyan-400" : "text-neutral-500"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  isSelected ? "text-white" : "text-neutral-300"
                )}>
                  {session.name}
                </p>
                {session.updatedAt && (
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
