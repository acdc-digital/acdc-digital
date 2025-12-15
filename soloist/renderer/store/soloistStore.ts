// SOLOIST VIEW STORE
// Zustand store for managing the Soloist view state

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { addDays, format } from 'date-fns';

// Types for day data
export interface DayData {
  date: string;
  day: string;
  shortDay?: string;
  formattedDate?: string;
  emotionScore: number | null;
  actualLogScore?: number | null; // Always the actual log score (not forecast)
  isFuture: boolean;
  isPast?: boolean;
  isToday?: boolean;
  trend?: string | null;
  description?: string;
  details?: string;
  answers?: Record<string, unknown>;
  historicalForecastScore?: number | null;
}

export interface SoloistState {
  // View state
  isInitialized: boolean;
  
  // Date range selection
  selectedDateRange: {
    start: Date | null;
    end: Date | null;
  };
  
  // Week data
  weekData: DayData[];
  
  // Selected day from the week grid
  selectedDayIndex: number;
  selectedDay: DayData | null;
  
  // Daily details cache (keyed by date string)
  dailyDetailsCache: Record<string, string>;
  
  // Actions
  initialize: () => void;
  reset: () => void;
  setSelectedDateRange: (start: Date | null, end: Date | null) => void;
  setSelectedDayIndex: (index: number) => void;
  setWeekData: (data: DayData[]) => void;
  setDailyDetail: (dateKey: string, detail: string) => void;
  clearDailyDetailsCache: () => void;
}

// Helper to generate week data from date range
function generateWeekData(startDate: Date): DayData[] {
  const days: DayData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(startDate, i);
    const isFuture = i >= 4; // Last 3 days are forecast
    
    days.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      day: format(currentDate, 'EEEE'),
      shortDay: format(currentDate, 'EEE'),
      formattedDate: format(currentDate, 'MMM d'),
      emotionScore: null, // Will be populated with real data
      isFuture,
      isPast: !isFuture && i < 3,
      isToday: i === 3,
      trend: null,
    });
  }
  
  return days;
}

/**
 * Soloist Store - State management for the Soloist view
 * 
 * This store manages the state for the new Soloist dashboard view.
 * Tracks selected date range, week data, and selected day for insights.
 */
export const useSoloistStore = create<SoloistState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      selectedDateRange: {
        start: null,
        end: null,
      },
      weekData: [],
      selectedDayIndex: 3, // Default to 4th day (today)
      selectedDay: null,
      dailyDetailsCache: {},

      // Initialize the store with default date range
      initialize: () => {
        const today = new Date();
        const defaultStart = addDays(today, -3); // 3 days before today = 4 historical days
        const defaultEnd = today; // End at today (4 historical days: start, start+1, start+2, today)
        const weekData = generateWeekData(defaultStart);
        
        set({ 
          isInitialized: true,
          selectedDateRange: {
            start: defaultStart,
            end: defaultEnd,
          },
          weekData,
          selectedDayIndex: 3,
          selectedDay: weekData[3] || null,
        });
        console.log('[SoloistStore] Initialized');
      },

      // Reset the store to initial state
      reset: () => {
        set({ 
          isInitialized: false,
          selectedDateRange: { start: null, end: null },
          weekData: [],
          selectedDayIndex: 3,
          selectedDay: null,
          dailyDetailsCache: {},
        });
        console.log('[SoloistStore] Reset');
      },

      // Set selected date range and regenerate week data
      setSelectedDateRange: (start: Date | null, end: Date | null) => {
        if (start) {
          const weekData = generateWeekData(start);
          const currentIndex = get().selectedDayIndex;
          set({ 
            selectedDateRange: { start, end },
            weekData,
            selectedDay: weekData[currentIndex] || null,
          });
        } else {
          set({ 
            selectedDateRange: { start, end },
            weekData: [],
            selectedDay: null,
          });
        }
      },

      // Set selected day from the week grid
      setSelectedDayIndex: (index: number) => {
        const weekData = get().weekData;
        set({ 
          selectedDayIndex: index,
          selectedDay: weekData[index] || null,
        });
      },

      // Set week data (from external source like Convex)
      setWeekData: (data: DayData[]) => {
        const currentIndex = get().selectedDayIndex;
        set({ 
          weekData: data,
          selectedDay: data[currentIndex] || null,
        });
      },

      // Cache daily detail for a specific date
      setDailyDetail: (dateKey: string, detail: string) => {
        set((state) => ({
          dailyDetailsCache: {
            ...state.dailyDetailsCache,
            [dateKey]: detail,
          },
        }));
      },

      // Clear all cached details
      clearDailyDetailsCache: () => {
        set({ dailyDetailsCache: {} });
      },
    }),
    {
      name: 'soloistStore',
    }
  )
);

// Selector hooks for optimized re-renders
export const useIsSoloistInitialized = () => useSoloistStore((state) => state.isInitialized);
export const useSelectedDateRange = () => useSoloistStore((state) => state.selectedDateRange);
export const useWeekData = () => useSoloistStore((state) => state.weekData);
export const useSelectedDay = () => useSoloistStore((state) => state.selectedDay);
export const useSelectedDayIndex = () => useSoloistStore((state) => state.selectedDayIndex);
export const useDailyDetailsCache = () => useSoloistStore((state) => state.dailyDetailsCache);

// Action hooks
export const useSoloistActions = () => useSoloistStore((state) => ({
  initialize: state.initialize,
  reset: state.reset,
  setSelectedDateRange: state.setSelectedDateRange,
  setSelectedDayIndex: state.setSelectedDayIndex,
  setWeekData: state.setWeekData,
  setDailyDetail: state.setDailyDetail,
  clearDailyDetailsCache: state.clearDailyDetailsCache,
}));
