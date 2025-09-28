// BROADCAST SESSION STORE
// /Users/matthewsimon/Projects/SMNB/smnb/lib/stores/broadcastSessionStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface BroadcastSession {
  id: string;
  startTime: number;
  endTime?: number;
  type: 'newsletter' | 'blog-post' | 'analysis' | 'general';
  isActive: boolean;
}

interface BroadcastSessionState {
  currentSession: BroadcastSession | null;
  sessionHistory: BroadcastSession[];
  totalBroadcastTime: number; // Total accumulated time across all sessions
}

interface BroadcastSessionActions {
  startBroadcastSession: (type?: BroadcastSession['type']) => void;
  endBroadcastSession: () => void;
  getCurrentSessionDuration: () => number;
  getTotalBroadcastTime: () => number;
  clearSessionHistory: () => void;
}

export type BroadcastSessionStore = BroadcastSessionState & BroadcastSessionActions;

export const useBroadcastSessionStore = create<BroadcastSessionStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    currentSession: null,
    sessionHistory: [],
    totalBroadcastTime: 0,

    // Actions
    startBroadcastSession: (type = 'general') => {
      const now = Date.now();
      const sessionId = `broadcast-${now}`;
      
      // End any existing session first
      const { currentSession } = get();
      if (currentSession?.isActive) {
        get().endBroadcastSession();
      }
      
      const newSession: BroadcastSession = {
        id: sessionId,
        startTime: now,
        type,
        isActive: true
      };
      
      set((state) => ({
        currentSession: newSession
      }));
      
      console.log(`🎙️ Broadcast session started: ${type} (${sessionId})`);
    },

    endBroadcastSession: () => {
      const { currentSession } = get();
      if (!currentSession?.isActive) return;
      
      const endTime = Date.now();
      const sessionDuration = endTime - currentSession.startTime;
      
      const completedSession: BroadcastSession = {
        ...currentSession,
        endTime,
        isActive: false
      };
      
      set((state) => ({
        currentSession: null,
        sessionHistory: [...state.sessionHistory, completedSession],
        totalBroadcastTime: state.totalBroadcastTime + sessionDuration
      }));
      
      console.log(`⏹️ Broadcast session ended: ${Math.round(sessionDuration / 1000)}s duration`);
    },

    getCurrentSessionDuration: () => {
      const { currentSession } = get();
      if (!currentSession?.isActive) return 0;
      return Date.now() - currentSession.startTime;
    },

    getTotalBroadcastTime: () => {
      const { currentSession, totalBroadcastTime } = get();
      const currentSessionTime = currentSession?.isActive 
        ? Date.now() - currentSession.startTime 
        : 0;
      return totalBroadcastTime + currentSessionTime;
    },

    clearSessionHistory: () => {
      set(() => ({
        sessionHistory: [],
        totalBroadcastTime: 0
      }));
      console.log('🗑️ Broadcast session history cleared');
    }
  }))
);

// Helper hooks for common use cases
export const useIsBroadcastActive = () => {
  return useBroadcastSessionStore(state => state.currentSession?.isActive ?? false);
};

export const useCurrentBroadcastDuration = () => {
  return useBroadcastSessionStore(state => state.getCurrentSessionDuration());
};

export const useTotalBroadcastTime = () => {
  return useBroadcastSessionStore(state => state.getTotalBroadcastTime());
};