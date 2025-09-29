"use client";

import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  X
} from "lucide-react";

interface Session {
  _id: Id<"sessions">;
  name: string;
  status: "active" | "paused" | "archived";
  lastActive: string;
  settings: {
    controlMode: "hands-free" | "balanced" | "full-control";
    model: string;
  };
}

interface SessionListProps {
  sessions: Session[];
  selectedId: Id<"sessions"> | null;
  onSelect: (id: Id<"sessions">) => void;
}

export function SessionList({ sessions, selectedId, onSelect }: SessionListProps) {
  const deleteSession = useMutation(api.sessions.remove);







  return (
    <div className="flex-1 overflow-y-auto">
      {sessions.length === 0 ? (
        <div className="p-0 text-center">
          <p className="text-xs text-neutral-600">No sessions yet</p>
        </div>
      ) : (
        <div className="py-0">
          {sessions.map((session) => {
            return (
              <div
                key={session._id}
                onClick={() => onSelect(session._id)}
                className={cn(
                  "group relative px-3 py-2 cursor-pointer transition-all",
                  "hover:bg-[#2d2d2d]",
                  selectedId === session._id && 
                  "bg-[#2d2d2d] border-r-1 border-r-[#007acc]"
                )}
              >
                <div className="flex items-center gap-2">
                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-200 truncate">
                      {session.name}
                    </p>
                    <p className="text-xs text-neutral-600 truncate">
                      {session.settings.model}
                    </p>
                  </div>
                  
                  {/* Delete Button */}
                  <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        
                        // Check if this is the last session
                        if (sessions.length <= 1) {
                          alert("Cannot delete the last session. You must have at least one session active.");
                          return;
                        }
                        
                        if (confirm("Delete this session? This cannot be undone.")) {
                          try {
                            await deleteSession({ id: session._id });
                          } catch (error) {
                            alert(error instanceof Error ? error.message : "Failed to delete session");
                          }
                        }
                      }}
                      disabled={sessions.length <= 1}
                      className={`p-1 rounded transition-colors ${
                        sessions.length <= 1 
                          ? "cursor-not-allowed text-neutral-700" 
                          : "hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                      }`}
                      aria-label="Delete session"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}