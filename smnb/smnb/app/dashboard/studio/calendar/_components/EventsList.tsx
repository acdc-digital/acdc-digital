// EVENTS LIST COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/EventsList.tsx

"use client";

import * as React from "react";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  from: string;
  to: string;
  description?: string;
}

interface EventsListProps {
  selectedDate: Date | undefined;
  events: Event[];
}

export function EventsList({ selectedDate, events }: EventsListProps) {
  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    const fromTime = fromDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    
    const toTime = toDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    
    return `${fromTime} - ${toTime}`;
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "No date selected";
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selected Date Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
        <div>
          <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">
            Selected Date
          </p>
          <p className="text-sm text-[#cccccc] font-medium">
            {formatSelectedDate()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
          title="Add Event"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">Add Event</span>
        </Button>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">
          Events
        </p>
        
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="w-10 h-10 text-[#858585] mb-3 opacity-30" />
            <p className="text-sm text-[#858585]">No events scheduled</p>
            <p className="text-xs text-[#858585] mt-1 opacity-70">
              Events will appear here when created
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="relative rounded-md p-3 pl-5 text-sm bg-[#2d2d2d] hover:bg-[#3d3d3d] transition-colors cursor-pointer border-l-2 border-[#007acc]"
              >
                <div className="font-medium text-[#cccccc] mb-1">
                  {event.title}
                </div>
                <div className="text-xs text-[#858585]">
                  {formatDateRange(event.from, event.to)}
                </div>
                {event.description && (
                  <div className="text-xs text-[#858585] mt-1 opacity-80">
                    {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
