// SESSION DETAILS - Session header with name editing and status
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/sessions/_components/SessionDetails.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const updateSession = useMutation(api.sessions.update);

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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
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
              className="h-8 w-8 p-0 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={handleCancel}
              className="h-8 w-8 p-0 bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-white">{session.name}</h1>
            <Button 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0 bg-transparent hover:bg-neutral-800 text-neutral-400"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="border-cyan-400/30 text-cyan-400"
        >
          {session.settings.controlMode}
        </Badge>
        <Badge 
          variant="outline" 
          className={session.status === "active" 
            ? "border-green-400/30 text-green-400" 
            : "border-yellow-400/30 text-yellow-400"
          }
        >
          {session.status}
        </Badge>
      </div>
    </div>
  );
}