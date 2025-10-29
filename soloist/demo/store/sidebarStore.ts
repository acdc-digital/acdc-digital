// SIDEBAR STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/sidebarStore.ts

"use client";

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type View = "dashboard" | "soloist" | "testing";

interface SidebarState {
  currentView: View;
  setView: (view: View) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      setView: (currentView) => set({ currentView }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);