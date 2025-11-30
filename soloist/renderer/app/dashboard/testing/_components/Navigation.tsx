// NAVIGATION COMPONENT - REDESIGNED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/_components/Navigation.tsx

"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { NavCalendar } from "./navCalendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useTestingStore } from "../../../../store/Testingstore";

interface NavigationProps {
  onGenerateForecast: () => Promise<void>;
}

export default function Navigation({ onGenerateForecast }: NavigationProps) {
  const {
    selectedDateRange,
    setSelectedDateRange,
    isGeneratingForecast,
    forecastGenerated,
    resetState,
    clearDailyDetailsCache,
    clearWeeklyInsightsCache
  } = useTestingStore();

  const [isOpen, setIsOpen] = useState(false);

  /** Temporary date the user is choosing in the calendar */
  const [tempDate, setTempDate] = useState<Date | undefined>(
    selectedDateRange.start || undefined
  );

  // When the popover opens, initialize the temp date with current selection
  useEffect(() => {
    if (isOpen) {
      setTempDate(selectedDateRange.start || undefined);
    }
  }, [isOpen, selectedDateRange.start]);

  // Handle date selection - automatically calculate 4-day range from selected start date
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) {
      setTempDate(undefined);
      return;
    }

    setTempDate(date);

    // Automatically calculate the 4-day range (start date + 3 more days)
    const start = date;
    const end = addDays(start, 3);

    clearDailyDetailsCache();
    clearWeeklyInsightsCache();
    setSelectedDateRange({
      start: start,
      end: end
    });
    setIsOpen(false);
  }, [setSelectedDateRange, clearDailyDetailsCache, clearWeeklyInsightsCache]);

  const handleReset = useCallback(() => {
    clearDailyDetailsCache();
    clearWeeklyInsightsCache();
    resetState();
    setTempDate(undefined);

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 3);

    setSelectedDateRange({
      start: start,
      end: today
    });

    setIsOpen(false);
  }, [resetState, setSelectedDateRange, clearDailyDetailsCache, clearWeeklyInsightsCache]);

  // Format the range for display
  const formatRange = useCallback(() => {
    if (selectedDateRange.start && selectedDateRange.end) {
      const sameMonth = format(selectedDateRange.start, 'MMM') === format(selectedDateRange.end, 'MMM');
      const sameYear = format(selectedDateRange.start, 'yyyy') === format(selectedDateRange.end, 'yyyy');

      if (sameMonth && sameYear) {
        return `${format(selectedDateRange.start, 'MMM d')} - ${format(selectedDateRange.end, 'd, yyyy')}`;
      } else if (sameYear) {
        return `${format(selectedDateRange.start, 'MMM d')} - ${format(selectedDateRange.end, 'MMM d, yyyy')}`;
      } else {
        return `${format(selectedDateRange.start, 'MMM d, yyyy')} - ${format(selectedDateRange.end, 'MMM d, yyyy')}`;
      }
    }
    return "Select a date range";
  }, [selectedDateRange.start, selectedDateRange.end]);

  // Calculate forecast dates
  const forecastDates = useMemo(() => {
    if (!selectedDateRange.end) return null;

    const forecastStart = addDays(selectedDateRange.end, 1);
    const forecastEnd = addDays(forecastStart, 2);
    return { forecastStart, forecastEnd };
  }, [selectedDateRange.end]);

  return (
    <div className="flex flex-col gap-2 p-2 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30">
      {/* Top row: Title + Generate button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
            Date Range Selection
          </span>
        </div>
        <Button
          onClick={onGenerateForecast}
          disabled={
            !selectedDateRange.start ||
            !selectedDateRange.end ||
            isGeneratingForecast ||
            forecastGenerated
          }
          variant="outline"
          className={cn(
            "h-6 px-2 text-[10px] rounded-none transition-all duration-200 flex-shrink-0",
            "border-neutral-400 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600",
            forecastGenerated && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700"
          )}
          size="sm"
        >
          {isGeneratingForecast
            ? "Generating..."
            : forecastGenerated
              ? "✓ Generated"
              : "Generate Forecast"}
        </Button>
      </div>

      {/* Date picker using NavCalendar component */}
      <NavCalendar
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        selectedDate={tempDate}
        onSelect={handleDateSelect}
        onReset={handleReset}
        triggerText={formatRange()}
        disabled={false}
        defaultMonth={selectedDateRange.start || undefined}
      />

      {/* Compact Range display */}
      {selectedDateRange.start && selectedDateRange.end && (
        <div className="border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 p-2">
          <div className="flex items-center gap-2 text-[10px]">
            {/* Historical */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-neutral-600 dark:text-neutral-400">Historical:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {format(selectedDateRange.start, 'MMM d')} - {format(selectedDateRange.end, 'MMM d')}
              </span>
              <Badge className="h-4 text-[8px] px-1 rounded-none bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                4d
              </Badge>
            </div>
            
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            
            {/* Forecast */}
            {forecastDates && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-neutral-600 dark:text-neutral-400">Forecast:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {format(forecastDates.forecastStart, 'MMM d')} - {format(forecastDates.forecastEnd, 'MMM d')}
                </span>
                <Badge className="h-4 text-[8px] px-1 rounded-none bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                  3d
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}