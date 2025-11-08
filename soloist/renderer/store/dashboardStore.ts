import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TagColors = 
  | "red" 
  | "green" 
  | "blue" 
  | "yellow" 
  | "purple" 
  | "pink" 
  | "orange" 
  | "cyan" 
  | "indigo";

export type Tag = {
  id: string;
  name: string;
  color: TagColors;
};

export interface DashboardState {
  // Date & Time Selection
  selectedYear: number;
  selectedDate: string;
  
  // Tag Management
  availableTags: Tag[];
  selectedTags: Tag[];
  
  // Legend & Filter States
  selectedLegend: string | null;
  
  // Template Management
  showTemplates: boolean;
  isCreatingNewTemplate: boolean;
  
  // Subscription Management
  refreshSubscription: number;
  
  // Actions
  setSelectedYear: (year: number) => void;
  setSelectedDate: (date: string) => void;
  setAvailableTags: (tags: Tag[]) => void;
  setSelectedTags: (tags: Tag[]) => void;
  toggleTag: (tag: Tag) => void;
  setSelectedLegend: (legend: string | null) => void;
  setShowTemplates: (show: boolean) => void;
  setIsCreatingNewTemplate: (creating: boolean) => void;
  triggerRefresh: () => void;
  resetFilters: () => void;
  resetDashboard: () => void;
}

const getDefaultDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getDefaultYear = (): number => {
  return new Date().getFullYear();
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedYear: getDefaultYear(),
      selectedDate: getDefaultDate(),
      availableTags: [],
      selectedTags: [],
      selectedLegend: null,
      showTemplates: false,
      isCreatingNewTemplate: false,
      refreshSubscription: 0,

      // Actions
      setSelectedYear: (year: number) => {
        set({ selectedYear: year });
      },

      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },

      setAvailableTags: (tags: Tag[]) => {
        set({ availableTags: tags });
      },

      setSelectedTags: (tags: Tag[]) => {
        set({ selectedTags: tags });
      },

      toggleTag: (tag: Tag) => {
        const { selectedTags } = get();
        const newTags = selectedTags.find((t) => t.id === tag.id)
          ? selectedTags.filter((t) => t.id !== tag.id)
          : [...selectedTags, tag];
        set({ selectedTags: newTags });
      },

      setSelectedLegend: (legend: string | null) => {
        set({ selectedLegend: legend });
      },

      setShowTemplates: (show: boolean) => {
        set({ showTemplates: show });
      },

      setIsCreatingNewTemplate: (creating: boolean) => {
        set({ isCreatingNewTemplate: creating });
      },

      triggerRefresh: () => {
        set((state) => ({ refreshSubscription: state.refreshSubscription + 1 }));
      },

      resetFilters: () => {
        set({
          selectedTags: [],
          selectedLegend: null,
        });
      },

      resetDashboard: () => {
        set({
          selectedYear: getDefaultYear(),
          selectedDate: getDefaultDate(),
          availableTags: [],
          selectedTags: [],
          selectedLegend: null,
          showTemplates: false,
          isCreatingNewTemplate: false,
          refreshSubscription: 0,
        });
      },
    }),
    {
      name: 'soloist-dashboard-storage',
      partialize: (state) => ({
        selectedYear: state.selectedYear,
        selectedDate: state.selectedDate,
        selectedTags: state.selectedTags,
        selectedLegend: state.selectedLegend,
        showTemplates: state.showTemplates,
        // Don't persist: isCreatingNewTemplate, refreshSubscription, availableTags
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useSelectedYear = () => useDashboardStore((state) => state.selectedYear);
export const useSelectedDate = () => useDashboardStore((state) => state.selectedDate);
export const useAvailableTags = () => useDashboardStore((state) => state.availableTags);
export const useSelectedTags = () => useDashboardStore((state) => state.selectedTags);
export const useSelectedLegend = () => useDashboardStore((state) => state.selectedLegend);
export const useShowTemplates = () => useDashboardStore((state) => state.showTemplates);
export const useIsCreatingNewTemplate = () => useDashboardStore((state) => state.isCreatingNewTemplate);
export const useRefreshSubscription = () => useDashboardStore((state) => state.refreshSubscription);

// Action hooks
export const useDashboardActions = () => useDashboardStore((state) => ({
  setSelectedYear: state.setSelectedYear,
  setSelectedDate: state.setSelectedDate,
  setAvailableTags: state.setAvailableTags,
  setSelectedTags: state.setSelectedTags,
  toggleTag: state.toggleTag,
  setSelectedLegend: state.setSelectedLegend,
  setShowTemplates: state.setShowTemplates,
  setIsCreatingNewTemplate: state.setIsCreatingNewTemplate,
  triggerRefresh: state.triggerRefresh,
  resetFilters: state.resetFilters,
  resetDashboard: state.resetDashboard,
}));
