"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";

interface SessionDetailsProps {
  session: {
    _id: Id<"sessions">;
    name: string;
    status: "active" | "paused" | "archived";
    settings: {
      controlMode: "hands-free" | "balanced" | "full-control";
      model: string;
    };
  };
}

export function SessionDetails({ session }: SessionDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session.name);
  const updateSession = useMutation(api.users.sessions.update);

  const handleSave = async () => {
    await updateSession({
      id: session._id,
      name,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(session.name);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              onBlur={handleSave}
              className="h-8 bg-[#191919] border-none text-white px-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="text-sm font-medium text-white hover:text-cyan-400 transition-colors text-left"
            >
              {session.name}
            </button>
            <Button
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 bg-transparent hover:bg-neutral-800 text-neutral-400"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}