// FEED STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/feedStore.ts

"use client";

import { create } from "zustand";

export interface FeedMessage {
  _id: string;
  date: string;
  createdAt: number;
  message: string;
  isStreaming?: boolean; // NEW: indicates if message is currently streaming
}

export type RightSidebarTab = "log" | "feed";

interface FeedState {
  feedMessages: FeedMessage[] | null;
  setFeedMessages: (messages: FeedMessage[] | null) => void;
  
  // NEW: streaming state
  streamingMessage: string | null;
  setStreamingMessage: (message: string | null) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  activeTab: RightSidebarTab;
  setActiveTab: (tab: RightSidebarTab) => void;

  // NEW: reset or "destructure" feed
  resetFeed: () => void;
  
  // NEW: update selected date while preserving the current active tab
  updateDatePreserveTab: (date: string | null) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feedMessages: null,
  setFeedMessages: (messages) => set({ feedMessages: messages }),
  
  // NEW: streaming state
  streamingMessage: null,
  setStreamingMessage: (message) => set({ streamingMessage: message }),
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  activeTab: "log",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Example function to clear feed & switch to "log" tab
  resetFeed: () => {
    set({
      feedMessages: null,
      activeTab: "log",
    });
  },
  
  // Update selected date without changing the active tab
  updateDatePreserveTab: (date) => {
    set({ selectedDate: date });
  },
}));