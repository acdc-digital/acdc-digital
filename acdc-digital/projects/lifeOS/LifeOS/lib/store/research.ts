// RESEARCH STORE - Shared UI state for research session selection and tab management
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/store/research.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ResearchTab {
  sessionId: string;
  title: string;
  query: string;
  isLoading?: boolean;
}

interface ResearchStore {
  // Tab management
  tabs: ResearchTab[];
  activeTabId: string | null;
  
  // Session selection (for sidebar)
  selectedSessionId: string | null;
  
  // Actions
  addTab: (sessionId: string, title: string, query: string) => void;
  closeTab: (sessionId: string) => void;
  setActiveTab: (sessionId: string) => void;
  updateTabLoading: (sessionId: string, isLoading: boolean) => void;
  updateTabDetails: (sessionId: string, title: string, query: string) => void;
  selectSession: (sessionId: string | null) => void;
}

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      selectedSessionId: null,
      
      // Actions
      addTab: (sessionId, title, query) => set((state) => {
        const existingTab = state.tabs.find(tab => tab.sessionId === sessionId);
        if (existingTab) {
          // Tab already exists, just make it active
          return { activeTabId: sessionId };
        }
        
        // Add new tab
        return {
          tabs: [...state.tabs, { sessionId, title, query }],
          activeTabId: sessionId
        };
      }),
      
      closeTab: (sessionId) => set((state) => {
        const newTabs = state.tabs.filter(tab => tab.sessionId !== sessionId);
        const wasActive = state.activeTabId === sessionId;
        
        return {
          tabs: newTabs,
          activeTabId: wasActive && newTabs.length > 0 ? newTabs[newTabs.length - 1].sessionId : 
                      wasActive ? null : state.activeTabId
        };
      }),
      
      setActiveTab: (sessionId) => set({ activeTabId: sessionId }),
      
      updateTabLoading: (sessionId, isLoading) => set((state) => ({
        tabs: state.tabs.map(tab => 
          tab.sessionId === sessionId ? { ...tab, isLoading } : tab
        )
      })),
      
      updateTabDetails: (sessionId, title, query) => set((state) => ({
        tabs: state.tabs.map(tab => 
          tab.sessionId === sessionId ? { ...tab, title, query } : tab
        )
      })),
      
      selectSession: (sessionId) => {
        set((state) => {
          // Only log if sessionId is actually changing
          if (state.selectedSessionId !== sessionId) {
            console.log('ResearchStore: selectSession called with', sessionId);
          }
          return { selectedSessionId: sessionId };
        });
      },
    }),
    {
      name: 'lifeos-research-storage',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);

export default useResearchStore;
