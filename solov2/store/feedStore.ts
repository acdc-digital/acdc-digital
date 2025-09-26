import { create } from 'zustand';

interface FeedState {
  selectedDate: string | null;
  activeTab: string;
  sidebarOpen: boolean;
  setSelectedDate: (date: string | null) => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  selectedDate: null,
  activeTab: 'feed',
  sidebarOpen: false,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));