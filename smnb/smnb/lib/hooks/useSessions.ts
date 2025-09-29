"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "./useAuth";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Hook for user-scoped session operations
 * Automatically handles authentication state and provides session management functions
 */
export function useSessions() {
  const { isAuthenticated, user } = useAuth();
  
  // Get user's sessions (only if authenticated)
  const sessions = useQuery(
    api.sessions.list,
    isAuthenticated ? {} : "skip"
  );
  
  // Session mutations
  const createSession = useMutation(api.sessions.create);
  const updateSession = useMutation(api.sessions.update);
  const deleteSession = useMutation(api.sessions.remove);
  const duplicateSession = useMutation(api.sessions.duplicate);
  
  // Helper functions
  const createNewSession = async (name?: string) => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to create session");
    }
    
    return await createSession({
      name: name || `Session ${new Date().toLocaleString()}`,
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
  };
  
  const renameSession = async (sessionId: Id<"sessions">, name: string) => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to update session");
    }
    
    return await updateSession({ id: sessionId, name });
  };
  
  const removeSession = async (sessionId: Id<"sessions">) => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to delete session");
    }
    
    return await deleteSession({ id: sessionId });
  };
  
  const cloneSession = async (sessionId: Id<"sessions">) => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to duplicate session");
    }
    
    return await duplicateSession({ id: sessionId });
  };
  
  return {
    // Data
    sessions: sessions || [],
    user,
    isAuthenticated,
    
    // Actions
    createSession: createNewSession,
    updateSession: renameSession,
    deleteSession: removeSession,
    duplicateSession: cloneSession,
    
    // State
    isLoading: sessions === undefined && isAuthenticated,
    hasError: sessions === null && isAuthenticated,
  };
}

/**
 * Hook for working with a specific session
 */
export function useSession(sessionId: Id<"sessions"> | null) {
  const { isAuthenticated } = useAuth();
  
  // Get session details
  const session = useQuery(
    api.sessions.get,
    sessionId && isAuthenticated ? { id: sessionId } : "skip"
  );
  
  // Get session messages
  const messages = useQuery(
    api.messages.list,
    sessionId && isAuthenticated ? { sessionId } : "skip"
  );
  
  // Message mutations
  const sendMessage = useMutation(api.messages.send);
  const updateSessionSettings = useMutation(api.sessions.updateSettings);
  
  const send = async (content: string, role: "user" | "assistant" = "user") => {
    if (!sessionId || !isAuthenticated) {
      throw new Error("Session ID required and must be authenticated");
    }
    
    return await sendMessage({
      sessionId,
      content,
      role
    });
  };
  
  const updateSettings = async (settings: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    controlMode: "hands-free" | "balanced" | "full-control";
  }) => {
    if (!sessionId || !isAuthenticated) {
      throw new Error("Session ID required and must be authenticated");
    }
    
    return await updateSessionSettings({
      id: sessionId,
      settings
    });
  };
  
  return {
    // Data
    session,
    messages: messages || [],
    
    // Actions
    sendMessage: send,
    updateSettings,
    
    // State
    isLoading: (session === undefined || messages === undefined) && isAuthenticated && sessionId,
    hasError: (session === null || messages === null) && isAuthenticated && sessionId,
    exists: !!session,
  };
}