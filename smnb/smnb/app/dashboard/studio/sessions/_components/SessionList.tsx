// SESSION LIST - List of sessions with management actions
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/sessions/_components/SessionList.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Copy,
  Play,
  Pause,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const duplicateSession = useMutation(api.sessions.duplicate);

  const getStatusIcon = (status: Session["status"]) => {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3 text-green-400" />;
      case "paused":
        return <Pause className="w-3 h-3 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getControlModeColor = (mode: Session["settings"]["controlMode"]) => {
    switch (mode) {
      case "hands-free":
        return "text-green-400";
      case "balanced":
        return "text-cyan-400";
      case "full-control":
        return "text-purple-400";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {sessions.map((session) => (
        <div 
          key={session._id} 
          onClick={() => onSelect(session._id)}
          className={cn(
            "group relative px-4 py-3 cursor-pointer transition-all",
            "border-b border-neutral-800/50",
            "hover:bg-neutral-900/50",
            selectedId === session._id && "bg-cyan-400/5 border-l-2 border-l-cyan-400"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(session.status)}
                <h3 className="text-sm font-medium text-white truncate">
                  {session.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <span className={cn("font-medium", getControlModeColor(session.settings.controlMode))}>
                  {session.settings.controlMode}
                </span>
                <span className="text-neutral-500">
                  {session.settings.model}
                </span>
              </div>
              
              <p className="text-xs text-neutral-600 mt-1">
                {new Date(session.lastActive).toLocaleDateString()}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-neutral-400 hover:text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800">
                <DropdownMenuItem className="text-neutral-200 hover:text-white hover:bg-neutral-800">
                  <Edit2 className="w-3 h-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-neutral-200 hover:text-white hover:bg-neutral-800"
                  onClick={() => duplicateSession({ id: session._id })}
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem 
                  className="text-red-400 hover:text-red-300 hover:bg-neutral-800"
                  onClick={() => deleteSession({ id: session._id })}
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}