// TAB CONTEXT - Context for managing tabs and activity panel communication
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/context/TabContext.tsx

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Tab {
  id: string;
  title: string;
  type: 'file' | 'welcome' | 'settings' | 'calendar' | 'agent' | 'identity-guidelines' | 'editor' | 'kanban' | 'torus';
  filePath?: string;
  isDirty?: boolean;
  isPinned?: boolean;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string;
  setTabs: (tabs: Tab[]) => void;
  setActiveTabId: (id: string) => void;
  openTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function useTabContext() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
}

const initialTabs: Tab[] = [
  { id: 'welcome', title: 'Welcome', type: 'welcome', isPinned: true },
];

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>('welcome');

  const openTab = useCallback((tab: Tab) => {
    setTabs(currentTabs => {
      if (!currentTabs.find(t => t.id === tab.id)) {
        return [...currentTabs, tab];
      }
      return currentTabs;
    });
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(currentTabs => {
      if (currentTabs.length <= 1) return currentTabs;
      
      const tabToClose = currentTabs.find(tab => tab.id === tabId);
      if (tabToClose?.isPinned) return currentTabs; // Prevent closing pinned tabs
      
      const tabIndex = currentTabs.findIndex(tab => tab.id === tabId);
      const newTabs = currentTabs.filter(tab => tab.id !== tabId);
      
      // Update active tab if we're closing the active one
      setActiveTabId(currentActiveId => {
        if (currentActiveId === tabId) {
          const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
          return newTabs[newActiveIndex]?.id || '';
        }
        return currentActiveId;
      });
      
      return newTabs;
    });
  }, []);

  const value = {
    tabs,
    activeTabId,
    setTabs,
    setActiveTabId,
    openTab,
    closeTab,
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}