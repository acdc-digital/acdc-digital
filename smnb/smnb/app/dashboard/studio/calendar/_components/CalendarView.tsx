// CALENDAR VIEW COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/CalendarView.tsx

"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/app/components/ui/card";

interface CalendarViewProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function CalendarView({ date, onDateChange }: CalendarViewProps) {
  return (
    <Card className="w-fit bg-[#252526] border-[#2d2d2d]">
      <CardContent className="p-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="bg-transparent p-0 border-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center text-[#cccccc]",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#cccccc] hover:bg-[#2d2d2d]",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-[#858585] rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#2d2d2d] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-[#cccccc] hover:bg-[#2d2d2d] hover:text-[#cccccc] rounded-md",
            day_selected: "bg-[#007acc] text-white hover:bg-[#007acc] hover:text-white focus:bg-[#007acc] focus:text-white",
            day_today: "bg-[#3d3d3d] text-[#cccccc] font-semibold",
            day_outside: "text-[#858585] opacity-50",
            day_disabled: "text-[#858585] opacity-50",
            day_range_middle: "aria-selected:bg-[#2d2d2d] aria-selected:text-[#cccccc]",
            day_hidden: "invisible",
          }}
        />
      </CardContent>
    </Card>
  );
}
