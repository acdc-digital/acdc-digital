"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/app/components/ui/button";
import { Plus, Pencil, Check, X, Sparkles } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { ManagerSessionList } from "./_components/ManagerSessionList";
import { ManagerChat } from "./_components/ManagerChat";
import { useSession } from "../../SessionContext";

interface SessionManagerProps {
  isActive?: boolean;
}

export function SessionManager({ isActive = true }: SessionManagerProps) {
  // Use global session context instead of local state
  const {
    selectedSessionId,
    setSelectedSessionId,
    sessions,
    createSession: createSessionGlobal,
  } = useSession();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const selectedSession = useQuery(
    api.users.sessions.get,
    isActive && selectedSessionId ? { id: selectedSessionId } : "skip"
  );
  const updateSession = useMutation(api.users.sessions.update);

  // Sync edited title when session changes
  useEffect(() => {
    if (selectedSession) {
      setEditedTitle(selectedSession.name);
    }
  }, [selectedSession]);

  const handleSessionSelect = (id: Id<"sessions">) => {
    setSelectedSessionId(id);
    setIsEditingTitle(false);
  };

  const handleCreateSession = async () => {
    await createSessionGlobal({
      name: `Session ${new Date().toLocaleString()}`,
      settings: {
        model: "claude-3-5-haiku-20241022",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0,
        controlMode: "balanced"
      }
    });
  };

  const handleStartEditTitle = () => {
    if (selectedSession) {
      setEditedTitle(selectedSession.name);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = async () => {
    if (selectedSessionId && editedTitle.trim() && editedTitle !== selectedSession?.name) {
      await updateSession({
        id: selectedSessionId,
        name: editedTitle.trim(),
      });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    if (selectedSession) {
      setEditedTitle(selectedSession.name);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEditTitle();
    }
  };

  return (
    <div className="flex h-full w-full bg-black">
      {/* Left Sidebar - Session List */}
          <div className="w-64 bg-[#191919] border-r border-neutral-800 flex flex-col">
            {/* Header */}
            <div className="p-2.5 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-0">
                <div className="flex items-center gap-2">
                  <span className="pl-1 text-sm font-light text-muted-foreground font-sans">CHAT SESSIONS</span>
                </div>
                <Button
                  onClick={handleCreateSession}
                  size="sm"
                  className="h-6 w-6 p-0 bg-[#191919] hover:bg-[#3d3d3d] rounded transition-colors border border-muted-foreground/70 text-muted-foreground/70 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto">
              <ManagerSessionList
                sessions={sessions || []}
                selectedId={selectedSessionId}
                onSelect={handleSessionSelect}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                {/* Header with Editable Title */}
                <div className="h-11 border-b border-neutral-800 bg-[#191919]">
                  <div className="px-4 h-full flex items-center justify-between gap-4">
                    {/* Editable Title */}
                    {isEditingTitle ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={handleTitleKeyDown}
                          className="bg-neutral-800 border-neutral-700 text-white text-sm focus-visible:ring-cyan-400/50 h-7"
                          autoFocus
                          onFocus={(e) => e.target.select()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveTitle}
                          className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-7 px-2"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEditTitle}
                          className="text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800 h-7 px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-2 group">
                        <h2 className="text-sm font-medium text-white">{selectedSession.name}</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleStartEditTitle}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-cyan-400 hover:bg-cyan-400/10 h-7 px-2"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-[#191919] overflow-hidden">
                  <ManagerChat sessionId={selectedSessionId} />
                </div>
              </>
            ) : (
              /* Loading State */
              <div className="flex-1 flex items-center justify-center bg-[#191919]">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-neutral-400">Loading session...</p>
                </div>
              </div>
            )}
          </div>
    </div>
  );
}
