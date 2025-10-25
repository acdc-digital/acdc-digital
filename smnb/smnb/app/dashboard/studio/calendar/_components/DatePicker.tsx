// DATE PICKER COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/DatePicker.tsx

"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[240px] justify-between font-normal bg-[#2d2d2d] border-[#3d3d3d] text-[#cccccc] hover:bg-[#3d3d3d] hover:text-[#cccccc]"
        >
          {date ? date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          }) : "Select date"}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto overflow-hidden p-0 bg-[#252526] border-[#3d3d3d]" 
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date: Date | undefined) => {
            onDateChange(date);
            setOpen(false);
          }}
          className="bg-[#252526]"
        />
      </PopoverContent>
    </Popover>
  );
}
