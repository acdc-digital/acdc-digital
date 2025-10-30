/**
 * Demo Logs Store
 * Browser-based state management using Zustand + localStorage
 * Replaces Convex queries for daily logs in demo mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_DATA_2025, type DemoLogData } from '@/data/demoData2025';

// Debug: Log immediately on module load
console.log('[demoLogsStore MODULE] Imported DEMO_DATA_2025:', DEMO_DATA_2025?.length || 0, 'entries');
console.log('[demoLogsStore MODULE] First entry:', DEMO_DATA_2025?.[0]);

// Re-export type with cleaner name
export type DemoLog = DemoLogData;

export const DEMO_USER_ID = 'demo-user';

interface DemoLogsState {
  logs: DemoLog[];
  
  // Core operations
  getLogByDate: (date: string) => DemoLog | undefined;
  getAllLogs: () => DemoLog[];
  createLog: (date: string) => DemoLog;
  addEntry: (date: string, templateId: string, templateName: string, content: string) => void;
  updateEntry: (date: string, entryId: string, content: string) => void;
  deleteEntry: (date: string, entryId: string) => void;
  
  // Bulk operations
  clearAllLogs: () => void;
  seedDemoData: () => void;
}

// Helper to generate ID
const generateId = () => `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDemoLogsStore = create<DemoLogsState>()(
  persist(
    (set, get) => ({
      logs: [],

      getLogByDate: (date: string) => {
        return get().logs.find(log => log.date === date);
      },

      getAllLogs: () => {
        return get().logs;
      },

      createLog: (date: string) => {
        const existingLog = get().getLogByDate(date);
        if (existingLog) return existingLog;

        const newLog: DemoLog = {
          _id: generateId(),
          _creationTime: Date.now(),
          userId: DEMO_USER_ID,
          date,
          entries: [],
        };

        set(state => ({
          logs: [...state.logs, newLog],
        }));

        return newLog;
      },

      addEntry: (date: string, templateId: string, templateName: string, content: string) => {
        set(state => {
          const logIndex = state.logs.findIndex(log => log.date === date);
          
          if (logIndex === -1) {
            // Create new log with entry
            const newLog: DemoLog = {
              _id: generateId(),
              _creationTime: Date.now(),
              userId: DEMO_USER_ID,
              date,
              entries: [{
                id: generateId(),
                templateId,
                templateName,
                content,
                timestamp: Date.now(),
              }],
            };
            return { logs: [...state.logs, newLog] };
          }

          // Add entry to existing log
          const updatedLogs = [...state.logs];
          updatedLogs[logIndex] = {
            ...updatedLogs[logIndex],
            entries: [
              ...updatedLogs[logIndex].entries,
              {
                id: generateId(),
                templateId,
                templateName,
                content,
                timestamp: Date.now(),
              },
            ],
          };

          return { logs: updatedLogs };
        });
      },

      updateEntry: (date: string, entryId: string, content: string) => {
        set(state => {
          const logIndex = state.logs.findIndex(log => log.date === date);
          if (logIndex === -1) return state;

          const updatedLogs = [...state.logs];
          const entryIndex = updatedLogs[logIndex].entries.findIndex(e => e.id === entryId);
          
          if (entryIndex === -1) return state;

          updatedLogs[logIndex] = {
            ...updatedLogs[logIndex],
            entries: updatedLogs[logIndex].entries.map((entry, idx) =>
              idx === entryIndex ? { ...entry, content, timestamp: Date.now() } : entry
            ),
          };

          return { logs: updatedLogs };
        });
      },

      deleteEntry: (date: string, entryId: string) => {
        set(state => {
          const logIndex = state.logs.findIndex(log => log.date === date);
          if (logIndex === -1) return state;

          const updatedLogs = [...state.logs];
          updatedLogs[logIndex] = {
            ...updatedLogs[logIndex],
            entries: updatedLogs[logIndex].entries.filter(e => e.id !== entryId),
          };

          return { logs: updatedLogs };
        });
      },

      clearAllLogs: () => {
        set({ logs: [] });
      },

      seedDemoData: () => {
        // Load pre-generated static demo data for 2025
        console.log('[demoLogsStore] Loading static demo data...');
        console.log('[demoLogsStore] DEMO_DATA_2025 length:', DEMO_DATA_2025.length);
        console.log('[demoLogsStore] Sample data:', DEMO_DATA_2025.slice(0, 2));
        
        set({ logs: DEMO_DATA_2025 });
        
        const state = get();
        console.log('[demoLogsStore] Store logs length after set:', state.logs.length);
        console.log(`[demoLogsStore] ✅ Loaded ${DEMO_DATA_2025.length} demo logs for 2025`);
      },
    }),
    {
      name: 'demo-logs-storage',
      version: 2, // Bumped to force reload of new static data
    }
  )
);
