// USE BROADCAST SYNC HOOK
// /Users/matthewsimon/Projects/SMNB/smnb/lib/hooks/useBroadcastSync.ts

/**
 * Convex Sync Hook for Broadcast Orchestrator
 * 
 * Provides automatic synchronization between the client-side broadcast orchestrator
 * and the Convex backend sessions table.
 * 
 * Usage in dashboard layout:
 * ```tsx
 * useBroadcastSync({
 *   sessionId: selectedSessionId,
 *   enabled: true,
 *   syncInterval: 5000, // Sync every 5 seconds
 * });
 * ```
 */

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBroadcastOrchestrator, useBroadcastState } from '@/lib/stores/orchestrator/broadcastOrchestrator';
import { Id } from '@/convex/_generated/dataModel';

interface UseBroadcastSyncOptions {
  /** Convex session ID to sync with */
  sessionId: Id<'sessions'> | null;
  /** Whether sync is enabled */
  enabled?: boolean;
  /** Sync interval in milliseconds (default: 5000) */
  syncInterval?: number;
  /** Whether to sync on state change (default: true) */
  syncOnStateChange?: boolean;
}

/**
 * Hook to automatically sync broadcast state with Convex backend
 */
export function useBroadcastSync(options: UseBroadcastSyncOptions) {
  const {
    sessionId,
    enabled = true,
    syncInterval = 5000,
    syncOnStateChange = true,
  } = options;

  const orchestrator = useBroadcastOrchestrator();
  const broadcastState = useBroadcastState();
  const updateBroadcast = useMutation(api.users.sessions.updateBroadcastState);
  
  const lastSyncRef = useRef<number>(0);
  const lastStateRef = useRef<string>(broadcastState);

  // Sync function (wrapped in useCallback to prevent recreating on every render)
  const sync = async () => {
    if (!enabled || !sessionId) return;

    const syncData = orchestrator.getSyncData();
    if (!syncData) return;

    try {
      await updateBroadcast({
        id: sessionId,
        broadcastState: syncData.broadcastState,
        isLive: syncData.isLive,
        hostActive: syncData.hostActive,
        producerActive: syncData.producerActive,
        liveFeedActive: syncData.liveFeedActive,
        broadcastError: syncData.broadcastError,
      });

      lastSyncRef.current = Date.now();
      console.log('🔄 Synced broadcast state to Convex:', syncData.broadcastState);
    } catch (error) {
      console.error('❌ Failed to sync broadcast state:', error);
    }
  };

  // Sync on state change
  useEffect(() => {
    if (!syncOnStateChange || !enabled || !sessionId) return;

    // Only sync if state actually changed
    if (lastStateRef.current !== broadcastState) {
      lastStateRef.current = broadcastState;
      void sync(); // Fire and forget
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastState, syncOnStateChange, enabled, sessionId]);

  // Periodic sync
  useEffect(() => {
    if (!enabled || !syncInterval || !sessionId) return;

    const interval = setInterval(() => {
      void sync(); // Fire and forget
    }, syncInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, syncInterval, sessionId]);

  return {
    sync,
    lastSync: lastSyncRef.current,
  };
}
