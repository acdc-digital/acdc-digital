// NAVCAL - REDESIGNED
// /Users/matthewsimon/Projects/solopro/renderer/src/app/dashboard/testing/_components/navCalendar.tsx

"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NavCalendarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onReset: () => void;
  triggerText: string;
  disabled?: boolean;
  className?: string;
  defaultMonth?: Date;
}

export function NavCalendar({
  isOpen,
  onOpenChange,
  selectedDate,
  onSelect,
  onReset,
  triggerText,
  disabled = false,
  className,
  defaultMonth
}: NavCalendarProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-9 justify-between text-left font-normal rounded-none transition-all duration-200",
            "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800",
            "hover:border-neutral-400 dark:hover:border-neutral-500",
            "focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-900",
            !selectedDate && "text-neutral-500 dark:text-neutral-400",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="text-xs font-medium">{triggerText}</span>
          </div>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            Click to change
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-fit p-0"
        align="start"
        sideOffset={8}
      >
        <div className="overflow-hidden border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900">
          {/* Header Section */}
          <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  Select Starting Date
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Auto-calculates 4-day period
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-300 h-6 px-2 text-[10px] rounded-none"
                disabled={!selectedDate}
              >
                <RefreshCcw className="h-2.5 w-2.5 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="p-0">
            <Calendar
              mode="single"
              numberOfMonths={1}
              selected={selectedDate}
              onSelect={onSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                return date > today;
              }}
              defaultMonth={defaultMonth || selectedDate || new Date()}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2030}
              showOutsideDays={false}
              className="rounded-none border-none"
            />
          </div>

          {/* Footer Section */}
          <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30">
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              <span className="font-medium">Tip:</span> Select any date to create a 4-day analysis period
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}