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
    <div className="flex flex-col gap-3 p-4 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Date Range Selection
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Select historical data range for AI-powered forecast analysis
            </p>
          </div>
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
            "h-7 px-3 text-xs rounded-none transition-all duration-200",
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

      {/* Range display */}
      {selectedDateRange.start && selectedDateRange.end && (
        <div className="border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="p-3 space-y-2">
            {/* Historical Period */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>
                <div>
                  <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Historical Period
                  </span>
                  <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    {format(selectedDateRange.start, 'MMM d')} → {format(selectedDateRange.end, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <Badge className="h-5 text-[10px] rounded-none bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                4 days
              </Badge>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-neutral-50 dark:bg-neutral-800/50 text-[10px] text-neutral-500 flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5" />
                  then
                </span>
              </div>
            </div>

            {/* Forecast Period */}
            {forecastDates && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Forecast Period
                    </span>
                    <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                      {format(forecastDates.forecastStart, 'MMM d')} → {format(forecastDates.forecastEnd, 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <Badge className="h-5 text-[10px] rounded-none bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                  3 days
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}