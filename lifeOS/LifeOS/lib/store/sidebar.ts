// SIDEBAR STORE - Sidebar and panel state management
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/store/sidebar.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PanelType = 
  | 'notes' 
  | 'search-replace'
  | 'source-control'
  | 'calendar' 
  | 'agents-extensions'
  | 'books' 
  | 'todos'
  | 'health-fitness'
  | 'research'
  | 'database' 
  | 'terminal' 
  | 'trash' 
  | 'debug' 
  | 'account' 
  | 'settings';

interface SidebarState {
  // Panel state
  activePanel: PanelType;
  sidebarWidth: number;
  isCollapsed: boolean;
  
  // Actions
  setActivePanel: (panel: PanelType) => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // Initial state
      activePanel: 'notes',
      sidebarWidth: 320,
      isCollapsed: false,
      
      // Actions
      setActivePanel: (panel: PanelType) => set({ activePanel: panel }),
      
      setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
      
      toggleSidebar: () => set((state) => ({ 
        isCollapsed: !state.isCollapsed 
      })),
      
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'lifeos-sidebar-storage',
      partialize: (state) => ({
        activePanel: state.activePanel,
        sidebarWidth: state.sidebarWidth,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
