// DASHBOARD CONTEXT
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/DashboardContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PanelType } from './activityBar/ActivityBar';

interface DashboardContextType {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<PanelType>("landmark");

  const handleSetActivePanel = (panel: PanelType) => {
    console.log('🔄 Dashboard Context: Panel changing from', activePanel, 'to', panel);
    console.log('⚡ All panels pre-loaded - switching instantly');
    setActivePanel(panel);
  };

  return (
    <DashboardContext.Provider value={{ activePanel, setActivePanel: handleSetActivePanel }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}