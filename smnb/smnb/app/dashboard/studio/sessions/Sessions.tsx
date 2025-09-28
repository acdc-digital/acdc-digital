// SESSIONS - Session Manager main component
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/sessions/Sessions.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SessionList } from "./_components/SessionList";
import { SessionDetails } from "./_components/SessionDetails";
import { SessionChat } from "./_components/SessionChat";
import { ModelParameters } from "./_components/ModelParameters";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sessions() {
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"sessions"> | null>(null);
  
  const sessions = useQuery(api.sessions.list);
  const selectedSession = useQuery(
    api.sessions.get,
    selectedSessionId ? { id: selectedSessionId } : "skip"
  );
  const createSession = useMutation(api.sessions.create);

  const handleCreateSession = async () => {
    const id = await createSession({
      name: `Session ${new Date().toLocaleString()}`,
      settings: {
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0,
        controlMode: "balanced" // hands-free, balanced, full-control
      }
    });
    setSelectedSessionId(id);
  };

  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Sidebar - Session List */}
      <div className="w-80 border-r border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Sessions</h2>
            </div>
            <Button
              onClick={handleCreateSession}
              size="sm"
              className="bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border-cyan-400/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Session List */}
        {sessions && (
          <SessionList
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Session Header */}
            <div className="p-4 border-b border-neutral-800">
              <SessionDetails session={selectedSession} />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                <SessionChat sessionId={selectedSessionId!} />
              </div>

              {/* Right Sidebar - Model Parameters */}
              <div className="w-96 border-l border-neutral-800 p-4 overflow-y-auto">
                <ModelParameters
                  sessionId={selectedSessionId}
                  settings={selectedSession.settings}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Archive className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-neutral-400 mb-2">
                No Session Selected
              </h3>
              <p className="text-neutral-600 mb-6">
                Create a new session or select an existing one to start chatting with AI
              </p>
              <Button
                onClick={handleCreateSession}
                className="bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}