"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Check, X, LogIn, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ManagerSessionList } from "./_components/ManagerSessionList";
import { ManagerChat } from "./_components/ManagerChat";
import { useCachedQuery } from "@/lib/context/CacheContext";

export function SessionManager() {
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"sessions"> | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Use cached query for instant tab switching
  const sessions = useCachedQuery<typeof api.users.sessions.list._returnType>(
    'sessions-list',
    api.users.sessions.list,
    isAuthenticated ? {} : { skip: true }
  );
  const createSession = useMutation(api.users.sessions.create);
  const selectedSession = useQuery(
    api.users.sessions.get,
    selectedSessionId && isAuthenticated ? { id: selectedSessionId } : "skip"
  );
  const updateSession = useMutation(api.users.sessions.update);

  // ========================================================================
  // SESSION PERSISTENCE - Restore from localStorage on mount
  // ========================================================================
  useEffect(() => {
    if (!isAuthenticated || selectedSessionId) return;
    
    try {
      const persistedSessionId = localStorage.getItem('smnb_session_manager_last_session');
      if (persistedSessionId) {
        console.log(`💾 SESSION MANAGER: Restoring persisted session: ${persistedSessionId}`);
        setSelectedSessionId(persistedSessionId as Id<"sessions">);
      }
    } catch (error) {
      console.error('❌ Failed to restore session from localStorage:', error);
    }
  }, [isAuthenticated, selectedSessionId]);

  // ========================================================================
  // SYNC SELECTED SESSION - Save to localStorage
  // ========================================================================
  useEffect(() => {
    if (!selectedSessionId) return;
    
    try {
      localStorage.setItem('smnb_session_manager_last_session', selectedSessionId);
    } catch (error) {
      console.error('❌ Failed to persist session:', error);
    }
  }, [selectedSessionId]);

  // Auto-select first session if none selected
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionId) {
      console.log(`📺 SESSION MANAGER: Auto-selecting first session: ${sessions[0]._id}`);
      setSelectedSessionId(sessions[0]._id);
    }
  }, [sessions, selectedSessionId]);

  // If the selected session no longer exists, select the first available session
  useEffect(() => {
    if (sessions && selectedSessionId) {
      const sessionExists = sessions.some(session => session._id === selectedSessionId);
      if (!sessionExists) {
        console.log(`📺 SESSION MANAGER: Selected session deleted or no longer exists`);
        
        try {
          localStorage.removeItem('smnb_session_manager_last_session');
        } catch (error) {
          console.error('❌ Failed to clear invalid session from localStorage:', error);
        }
        
        if (sessions.length > 0) {
          console.log(`📺 SESSION MANAGER: Switching to first available session: ${sessions[0]._id}`);
          setSelectedSessionId(sessions[0]._id);
        } else {
          setSelectedSessionId(null);
        }
      }
    }
  }, [sessions, selectedSessionId]);

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
    const id = await createSession({
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
    
    setSelectedSessionId(id);
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
      {/* Handle unauthenticated state */}
      {!isAuthenticated ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center max-w-md">
            <LogIn className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to continue</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Access your AI chat sessions and manage conversations
            </p>
            <SignInButton mode="modal">
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
                Sign in with Clerk
              </Button>
            </SignInButton>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
