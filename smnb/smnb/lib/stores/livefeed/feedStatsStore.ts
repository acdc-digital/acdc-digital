/**
 * Live Feed Stats Store - Zustand
 * Manages display of producer stats in the live feed sidebar
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface FeedStats {
  searchesPerformed: number;
  duplicatesAnalyzed: number;
  contextUpdatesProvided: number;
  uptime: number;
}

export interface FeedTrend {
  keyword: string;
  frequency: number;
  timestamp: Date;
}

export interface FeedSearchResult {
  totalResults: number;
  duplicatesFound: number;
  timestamp: Date;
}

interface FeedStatsState {
  // Display state
  showStats: boolean;
  
  // Stats data (synced from producer)
  stats: FeedStats;
  trends: FeedTrend[];
  currentSearches: Map<string, FeedSearchResult>;
  isProducerActive: boolean;
  
  // Actions
  toggleStats: () => void;
  setShowStats: (show: boolean) => void;
  
  // Update stats from producer
  updateStats: (stats: FeedStats) => void;
  updateTrends: (trends: FeedTrend[]) => void;
  updateCurrentSearches: (searches: Map<string, FeedSearchResult>) => void;
  setProducerActive: (active: boolean) => void;
  
  // Reset
  resetStats: () => void;
}

const initialStats: FeedStats = {
  searchesPerformed: 0,
  duplicatesAnalyzed: 0,
  contextUpdatesProvided: 0,
  uptime: 0,
};

export const useFeedStatsStore = create<FeedStatsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    showStats: false,
    stats: initialStats,
    trends: [],
    currentSearches: new Map(),
    isProducerActive: false,
    
    // Display actions
    toggleStats: () => set((state) => ({ 
      showStats: !state.showStats 
    })),
    
    setShowStats: (show: boolean) => set({ showStats: show }),
    
    // Stats update actions
    updateStats: (stats: FeedStats) => set({ stats }),
    
    updateTrends: (trends: FeedTrend[]) => set({ trends }),
    
    updateCurrentSearches: (searches: Map<string, FeedSearchResult>) => set({ 
      currentSearches: searches 
    }),
    
    setProducerActive: (active: boolean) => set({ 
      isProducerActive: active 
    }),
    
    // Reset
    resetStats: () => set({ 
      stats: initialStats,
      trends: [],
      currentSearches: new Map(),
      isProducerActive: false
    }),
  }))
);

// Selector hooks for components - properly cached to avoid infinite loops
export const useFeedStatsDisplay = () => useFeedStatsStore((state) => state.showStats);

export const useFeedStatsData = () => {
  const stats = useFeedStatsStore((state) => state.stats);
  const trends = useFeedStatsStore((state) => state.trends);
  const currentSearches = useFeedStatsStore((state) => state.currentSearches);
  const isProducerActive = useFeedStatsStore((state) => state.isProducerActive);
  
  return { stats, trends, currentSearches, isProducerActive };
};

export const useFeedStatsActions = () => {
  const toggleStats = useFeedStatsStore((state) => state.toggleStats);
  const setShowStats = useFeedStatsStore((state) => state.setShowStats);
  const updateStats = useFeedStatsStore((state) => state.updateStats);
  const updateTrends = useFeedStatsStore((state) => state.updateTrends);
  const updateCurrentSearches = useFeedStatsStore((state) => state.updateCurrentSearches);
  const setProducerActive = useFeedStatsStore((state) => state.setProducerActive);
  const resetStats = useFeedStatsStore((state) => state.resetStats);
  
  return {
    toggleStats,
    setShowStats,
    updateStats,
    updateTrends,
    updateCurrentSearches,
    setProducerActive,
    resetStats
  };
};

console.log('📊 Feed Stats store initialized');