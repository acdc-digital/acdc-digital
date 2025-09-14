// DASHBOARD STORE - Global state management for dashboard tabs and navigation
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/store/dashboard.ts

import { create } from 'zustand';

export interface DashboardTab {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  isDirty?: boolean;
  canClose?: boolean;
}

interface DashboardStore {
  tabs: DashboardTab[];
  activeTabId: string;
  setTabs: (tabs: DashboardTab[]) => void;
  setActiveTabId: (tabId: string) => void;
  addTab: (tab: DashboardTab) => void;
  closeTab: (tabId: string) => void;
  addRunningTab: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  tabs: [],
  activeTabId: '',
  
  setTabs: (tabs) => set({ tabs }),
  
  setActiveTabId: (activeTabId) => set({ activeTabId }),
  
  addTab: (tab) => set((state) => ({
    tabs: [...state.tabs, tab],
    activeTabId: tab.id
  })),
  
  closeTab: (tabId) => set((state) => {
    const newTabs = state.tabs.filter(tab => tab.id !== tabId);
    let newActiveTabId = state.activeTabId;
    
    if (state.activeTabId === tabId && newTabs.length > 0) {
      newActiveTabId = newTabs[newTabs.length - 1].id;
    }
    
    return {
      tabs: newTabs,
      activeTabId: newActiveTabId
    };
  }),
  
  addRunningTab: () => {
    const newTabId = `running-${Date.now()}`;
    const newTab: DashboardTab = {
      id: newTabId,
      title: 'Running Dashboard',
      content: 'running',
      icon: null, // Will be handled by renderTabIcon in Dashboard component
      canClose: true
    };
    
    get().addTab(newTab);
  }
}));
