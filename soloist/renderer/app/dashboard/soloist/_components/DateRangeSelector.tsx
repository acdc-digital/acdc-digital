// SOLOIST DATE RANGE SELECTOR
// Compact date range selector for the sidebar
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/DateRangeSelector.tsx

"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar, Check, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useSoloistStore } from "@/store/soloistStore";
import { NavCalendar } from "@/app/legacy/testing/_components/navCalendar";

interface DateRangeSelectorProps {
  onGenerateForecast?: () => Promise<void>;
  error?: string | null;
}

export function DateRangeSelector({ onGenerateForecast, error }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [hadError, setHadError] = useState(false);
  
  // Use the store for date range state so it's accessible to parent components
  const { selectedDateRange, setSelectedDateRange } = useSoloistStore();

  // Track error state and reset isGenerated when error is dismissed
  useEffect(() => {
    if (error) {
      setHadError(true);
    } else if (hadError) {
      // Error was dismissed, reset to allow regeneration
      setIsGenerated(false);
      setHadError(false);
    }
  }, [error, hadError]);

  // Initialize with default date range (last 4 days)
  useEffect(() => {
    if (!selectedDateRange.start || !selectedDateRange.end) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 3);
      setSelectedDateRange(start, today);
    }
  }, [selectedDateRange.start, selectedDateRange.end, setSelectedDateRange]);

  const [tempDate, setTempDate] = useState<Date | undefined>(
    selectedDateRange.start || undefined
  );

  useEffect(() => {
    if (isOpen) {
      setTempDate(selectedDateRange.start || undefined);
    }
  }, [isOpen, selectedDateRange.start]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) {
      setTempDate(undefined);
      return;
    }

    setTempDate(date);
    const start = date;
    const end = addDays(start, 3);

    setSelectedDateRange(start, end);
    setIsGenerated(false);
    setIsOpen(false);
  }, [setSelectedDateRange]);

  const handleGenerate = useCallback(async () => {
    if (onGenerateForecast) {
      setIsGenerating(true);
      try {
        await onGenerateForecast();
        setIsGenerated(true);
      } finally {
        setIsGenerating(false);
      }
    }
  }, [onGenerateForecast]);

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

  const forecastDates = useMemo(() => {
    if (!selectedDateRange.end) return null;

    const forecastStart = addDays(selectedDateRange.end, 1);
    const forecastEnd = addDays(forecastStart, 2);
    return { forecastStart, forecastEnd };
  }, [selectedDateRange.end]);

  return (
    <div className="flex flex-col gap-3 p-3 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30 rounded-lg">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Date Range
            </h3>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={
            !selectedDateRange.start ||
            !selectedDateRange.end ||
            isGenerating ||
            isGenerated ||
            !!error
          }
          variant="outline"
          className={cn(
            "h-7 px-3 text-xs transition-all duration-200",
            "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600",
            isGenerated && !error && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700",
            error && "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-700"
          )}
          size="sm"
        >
          {isGenerating ? (
            "Generating..."
          ) : error ? (
            <span className="flex items-center gap-1">
              <X className="h-3 w-3" />
              Generated
            </span>
          ) : isGenerated ? (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Generated
            </span>
          ) : (
            "Generate Forecast"
          )}
        </Button>
      </div>

      {/* Date picker */}
      <NavCalendar
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        selectedDate={tempDate}
        onSelect={handleDateSelect}
        onReset={() => {
          const today = new Date();
          const start = new Date(today);
          start.setDate(today.getDate() - 3);
          setSelectedDateRange(start, today);
          setTempDate(start);
          setIsGenerated(false);
          setIsOpen(false);
        }}
        triggerText={formatRange()}
        disabled={false}
        defaultMonth={selectedDateRange.start || undefined}
      />

      {/* Range display - stacked for sidebar width */}
      {selectedDateRange.start && selectedDateRange.end && forecastDates && (
        <div className="flex flex-col gap-2 text-xs">
          {/* Historical */}
          <div className="flex items-center gap-2 px-2 py-1.5 border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400">Historical:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {format(selectedDateRange.start, 'MMM d')} → {format(selectedDateRange.end, 'MMM d')}
            </span>
            <Badge className="h-4 text-[9px] px-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 ml-auto">
              4 days
            </Badge>
          </div>
          
          {/* Forecast */}
          <div className="flex items-center gap-2 px-2 py-1.5 border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
            <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400">Forecast:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {format(forecastDates.forecastStart, 'MMM d')} → {format(forecastDates.forecastEnd, 'MMM d')}
            </span>
            <Badge className="h-4 text-[9px] px-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 ml-auto">
              3 days
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangeSelector;
