"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";

interface SessionDetailsProps {
  session: {
    _id: any;
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

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 bg-neutral-900 border-neutral-700 text-white"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0 bg-neutral-700 hover:bg-neutral-800 text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium text-white">
              {session.name}
            </h1>
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
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