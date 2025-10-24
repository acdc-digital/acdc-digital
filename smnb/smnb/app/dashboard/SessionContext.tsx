/**
 * SESSION CONTEXT
 * Global session state management for dashboard
 * 
 * This context provides:
 * - Persistent session selection across panel switches
 * - Session creation/deletion handlers
 * - Session list caching
 * - localStorage persistence
 * 
 * Session-aware panels (SessionManager, Chat, etc.) consume this context
 * Session-agnostic panels (Landmark, WelcomeTab) ignore it
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';

type ControlMode = "hands-free" | "balanced" | "full-control";

interface SessionContextType {
  // Current selected session
  selectedSessionId: Id<"sessions"> | null;
  setSelectedSessionId: (id: Id<"sessions"> | null) => void;
  
  // Session list
  sessions: Doc<"sessions">[] | undefined;
  isLoadingSessions: boolean;
  
  // Actions
  createSession: (args: {
    name: string;
    settings: {
      model: string;
      temperature: number;
      maxTokens: number;
      topP: number;
      frequencyPenalty: number;
      presencePenalty: number;
      controlMode: ControlMode;
    };
  }) => Promise<Id<"sessions">>;
  
  deleteSession: (id: Id<"sessions">) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'smnb_global_session_id';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"sessions"> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication state from Clerk
  const { isLoaded, isSignedIn } = useUser();

  // Only query sessions if user is authenticated
  const sessions = useQuery(
    api.users.sessions.list,
    isLoaded && isSignedIn ? {} : "skip"
  );
  const isLoadingSessions = sessions === undefined;

  // Mutations
  const createSessionMutation = useMutation(api.users.sessions.create);
  const removeSessionMutation = useMutation(api.users.sessions.remove);

  // ========================================================================
  // INITIALIZATION - Restore session from localStorage
  // ========================================================================
  useEffect(() => {
    // Only initialize if user is authenticated
    if (!isLoaded || !isSignedIn || isInitialized) return;

    try {
      const persistedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (persistedSessionId) {
        console.log(`💾 SESSION CONTEXT: Restoring session: ${persistedSessionId}`);
        setSelectedSessionId(persistedSessionId as Id<"sessions">);
      }
    } catch (error) {
      console.error('❌ SESSION CONTEXT: Failed to restore session:', error);
    }

    setIsInitialized(true);
  }, [isLoaded, isSignedIn, isInitialized]);

  // ========================================================================
  // PERSISTENCE - Save session to localStorage when changed
  // ========================================================================
  useEffect(() => {
    if (!isInitialized) return;

    if (selectedSessionId) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, selectedSessionId);
        console.log(`💾 SESSION CONTEXT: Persisted session: ${selectedSessionId}`);
      } catch (error) {
        console.error('❌ SESSION CONTEXT: Failed to persist session:', error);
      }
    } else {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        console.log('💾 SESSION CONTEXT: Cleared persisted session');
      } catch (error) {
        console.error('❌ SESSION CONTEXT: Failed to clear session:', error);
      }
    }
  }, [selectedSessionId, isInitialized]);

  // ========================================================================
  // AUTO-SELECT - Select first session if none selected
  // ========================================================================
  useEffect(() => {
    // Only auto-select if user is authenticated
    if (!isLoaded || !isSignedIn || !isInitialized || !sessions) return;

    // If we have a selected session, validate it still exists
    if (selectedSessionId) {
      const sessionExists = sessions.some(s => s._id === selectedSessionId);
      if (!sessionExists) {
        console.log('⚠️ SESSION CONTEXT: Selected session no longer exists');
        if (sessions.length > 0) {
          console.log(`📺 SESSION CONTEXT: Auto-selecting first session: ${sessions[0]._id}`);
          setSelectedSessionId(sessions[0]._id);
        } else {
          setSelectedSessionId(null);
        }
      }
      return;
    }

    // No session selected - auto-select first if available
    if (sessions.length > 0) {
      console.log(`📺 SESSION CONTEXT: Auto-selecting first session: ${sessions[0]._id}`);
      setSelectedSessionId(sessions[0]._id);
    }
  }, [sessions, selectedSessionId, isInitialized, isLoaded, isSignedIn]);

  // ========================================================================
  // ACTIONS
  // ========================================================================
  const createSession = async (args: {
    name: string;
    settings: {
      model: string;
      temperature: number;
      maxTokens: number;
      topP: number;
      frequencyPenalty: number;
      presencePenalty: number;
      controlMode: ControlMode;
    };
  }): Promise<Id<"sessions">> => {
    const id = await createSessionMutation(args);
    setSelectedSessionId(id);
    return id;
  };

  const deleteSession = async (id: Id<"sessions">): Promise<void> => {
    await removeSessionMutation({ id });
    
    // If we deleted the selected session, clear selection
    if (id === selectedSessionId) {
      setSelectedSessionId(null);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        selectedSessionId,
        setSelectedSessionId,
        sessions,
        isLoadingSessions,
        createSession,
        deleteSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

/**
 * Hook for panels that don't need session state
 * Returns null safely without throwing error
 */
export function useOptionalSession() {
  try {
    return useContext(SessionContext);
  } catch {
    return null;
  }
}
