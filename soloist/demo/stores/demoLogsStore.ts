/**
 * Demo Logs Store
 * Browser-based state management using Zustand + localStorage
 * Replaces Convex queries for daily logs in demo mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DemoLog {
  _id: string;
  _creationTime: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  entries: {
    id: string;
    templateId: string;
    templateName: string;
    content: string;
    timestamp: number;
  }[];
}

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

// Demo user constant
export const DEMO_USER_ID = 'demo-user';

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
        const today = new Date();
        const demoLogs: DemoLog[] = [];

        // Generate logs for the past 30 days
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          // Skip some days randomly to make it realistic
          if (Math.random() > 0.7) continue;

          demoLogs.push({
            _id: generateId(),
            _creationTime: date.getTime(),
            userId: DEMO_USER_ID,
            date: dateStr,
            entries: [
              {
                id: generateId(),
                templateId: 'morning-routine',
                templateName: 'Morning Routine',
                content: `Today's morning routine:\n- Meditation: 15 minutes\n- Exercise: 30 minute run\n- Breakfast: Oatmeal with berries`,
                timestamp: date.getTime(),
              },
              {
                id: generateId(),
                templateId: 'work-focus',
                templateName: 'Work Focus',
                content: `Key priorities:\n1. Complete project proposal\n2. Team standup at 10am\n3. Code review for new feature`,
                timestamp: date.getTime() + 3600000,
              },
              {
                id: generateId(),
                templateId: 'evening-reflection',
                templateName: 'Evening Reflection',
                content: `Today's wins:\n- Finished proposal ahead of schedule\n- Had a productive 1-on-1 with manager\n- Made progress on side project`,
                timestamp: date.getTime() + 43200000,
              },
            ],
          });
        }

        set({ logs: demoLogs });
      },
    }),
    {
      name: 'demo-logs-storage',
      version: 1,
    }
  )
);
