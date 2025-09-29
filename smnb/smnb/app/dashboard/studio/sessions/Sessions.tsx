"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SessionList } from "./_components/SessionList";
import { SessionDetails } from "./_components/SessionDetails";
import { SessionChat } from "./_components/SessionChat";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, FileText, LogIn, Sparkles } from "lucide-react";

export function Sessions() {
  const { isLoading, isAuthenticated } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"sessions"> | null>(null);

  const sessions = useQuery(api.sessions.list, isAuthenticated ? {} : "skip");
  const createSession = useMutation(api.sessions.create);
  const selectedSession = useQuery(
    api.sessions.get,
    selectedSessionId && isAuthenticated ? { id: selectedSessionId } : "skip"
  );

  // Auto-select the first session when sessions are loaded
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0]._id);
    }
  }, [sessions, selectedSessionId]);

  // If the selected session no longer exists, select the first available session
  useEffect(() => {
    if (sessions && selectedSessionId) {
      const sessionExists = sessions.some(session => session._id === selectedSessionId);
      if (!sessionExists && sessions.length > 0) {
        setSelectedSessionId(sessions[0]._id);
      }
    }
  }, [sessions, selectedSessionId]);

  const handleCreateSession = async () => {
    const id = await createSession({
      name: `Session ${new Date().toLocaleString()}`,
      settings: {
        model: "claude-3-sonnet",
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



  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-neutral-400">Loading session manager...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center max-w-md">
          <LogIn className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to continue</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Access your AI sessions and manage your conversations securely
          </p>
          <SignInButton mode="modal">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
              Sign in with Clerk
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-black">
      {/* Left Sidebar - Narrow Session Selector */}
      <div className="w-64 bg-[#191919] border-r border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-2.5 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-0">
            <div className="flex items-center gap-2">
              <span className="pl-1 text-sm font-light text-muted-foreground font-sans">SESSIONS</span>
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

        {/* Session List - Compact */}
        <div className="flex-1 overflow-y-auto">
          <SessionList
            sessions={sessions || []}
            selectedId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
        </div>
      </div>

      {/* Main Content Area - Uses Full Remaining Space */}
      <div className="flex-1 flex">
        {selectedSession ? (
          <>
            {/* Center Panel - Chat/Primary Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Session Header Bar */}
              <div className="h-10.25 bg-[#191919] border-b border-neutral-800 flex items-center px-4">
                <div className="flex-1 flex items-center gap-4">
                  <SessionDetails session={selectedSession} />
                </div>
              </div>

              {/* Main Content Area - Always Chat */}
              <div className="flex-1 bg-[#191919] overflow-hidden">
                <SessionChat sessionId={selectedSessionId!} />
              </div>
            </div>

            {/* Right Sidebar - Unified Design */}
            <div className="w-105 bg-[#191919] border-l border-neutral-800 flex flex-col">
              {/* Unified Content Panel */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                  {/* Session Overview Section */}
                  <div className="px-4 pt-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Session Overview
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-neutral-500">Model</span>
                          <Settings2 className="w-3 h-3 text-neutral-600" />
                        </div>
                        <p className="text-sm text-neutral-200 font-mono">
                          {selectedSession.settings.model}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1 capitalize">
                          {selectedSession.settings.controlMode} mode
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="px-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                        <p className="text-xs text-neutral-500 mb-1">Messages</p>
                        <p className="text-lg font-mono text-neutral-200">0</p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                        <p className="text-xs text-neutral-500 mb-1">Tokens</p>
                        <p className="text-lg font-mono text-neutral-200">0</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Session Duration</p>
                      <p className="text-sm font-mono text-neutral-200">00:00:00</p>
                    </div>
                  </div>

                  {/* Model Parameters - Collapsible */}
                  <div className="px-4">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 hover:text-neutral-300 transition-colors">
                        <span>Parameters</span>
                        <Settings2 className="w-3 h-3 group-open:rotate-45 transition-transform" />
                      </summary>
                      <div className="space-y-3 mt-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-neutral-500">Temperature</label>
                            <span className="text-xs font-mono text-cyan-400">
                              {selectedSession.settings.temperature}
                            </span>
                          </div>
                          <div className="h-1 bg-neutral-800 rounded-full">
                            <div className="h-1 bg-cyan-400/50 rounded-full w-3/4" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-neutral-500">Max Tokens</label>
                            <span className="text-xs font-mono text-cyan-400">
                              {selectedSession.settings.maxTokens}
                            </span>
                          </div>
                          <div className="h-1 bg-neutral-800 rounded-full">
                            <div className="h-1 bg-cyan-400/50 rounded-full w-1/2" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-neutral-500">Top P</label>
                            <span className="text-xs font-mono text-cyan-400">
                              {selectedSession.settings.topP}
                            </span>
                          </div>
                          <div className="h-1 bg-neutral-800 rounded-full">
                            <div className="h-1 bg-cyan-400/50 rounded-full w-full" />
                          </div>
                        </div>

                        <button className="w-full mt-3 text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30">
                          Advanced Settings →
                        </button>
                      </div>
                    </details>
                  </div>

                  {/* Context Management */}
                  <div className="px-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Context
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800 border-dashed">
                        <div className="flex items-center justify-center">
                          <FileText className="w-4 h-4 text-neutral-600 mr-2" />
                          <p className="text-xs text-neutral-500">No context files</p>
                        </div>
                      </div>
                      <button className="w-full text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30 flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" />
                        Add Context
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions - Full Width Separator */}
                <div className="border-t border-neutral-800 px-4 py-4 mt-6">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30">
                      Export
                    </button>
                    <button className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-cyan-400/30">
                      Clone
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Loading State - Should be very brief since we auto-select first session */
          <div className="flex-1 flex items-center justify-center bg-black">
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
