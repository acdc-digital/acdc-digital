// MONTH CALENDAR VIEW - Full calendar grid like Google Calendar
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/MonthCalendarView.tsx

"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

interface CalendarEvent {
  _id: Id<"calendar_events">;
  _creationTime: number;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  color: string;
  allDay: boolean;
  location?: string;
  attendees?: string[];
}

interface MonthCalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onMonthChange: (newDate: Date) => void;
}

export function MonthCalendarView({
  currentDate,
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
  onMonthChange,
}: MonthCalendarViewProps) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get the calendar grid (6 weeks x 7 days)
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month's days to fill
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days: Date[] = [];
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, daysInPrevMonth - i));
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's leading days to complete the grid (42 days = 6 weeks)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };
  
  // Get events for a specific day
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };
  
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const calendarDays = getCalendarDays();
  
  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-[7.5px] border-b border-[#2d2d2d]">
        <h2 className="text-xl font-semibold text-[#cccccc]">
          {formatMonthYear()}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8 text-[#cccccc] hover:bg-[#2d2d2d]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMonthChange(new Date())}
            className="text-[#cccccc] hover:bg-[#2d2d2d]"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 text-[#cccccc] hover:bg-[#2d2d2d]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-[#2d2d2d] bg-[#252526]">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-xs font-semibold text-[#858585] text-center uppercase"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 border-l border-t border-[#2d2d2d] overflow-hidden">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const today = isToday(date);
          const selected = isSelected(date);
          const inCurrentMonth = isCurrentMonth(date);
          
          return (
            <div
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                relative border-r border-b border-[#2d2d2d] p-2 cursor-pointer
                transition-colors hover:bg-[#2a2a2a]
                ${selected ? "bg-[#2a2a2a]" : "bg-[#1e1e1e]"}
                ${!inCurrentMonth ? "opacity-40" : ""}
              `}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-xs font-medium px-2 py-0.5 rounded-full
                    ${today ? "bg-[#007acc] text-white" : "text-[#cccccc]"}
                    ${selected && !today ? "bg-[#2d2d2d]" : ""}
                  `}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-[#858585]">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="group relative"
                  >
                    <div
                      className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer
                        hover:brightness-110 transition-all"
                      style={{
                        backgroundColor: event.color + "30",
                        borderLeft: `2px solid ${event.color}`,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {!event.allDay && (
                          <span className="text-[#858585] font-mono">
                            {formatTime(event.startTime)}
                          </span>
                        )}
                        <span className="text-[#cccccc] truncate">
                          {event.title}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show "+N more" if there are more events */}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[#858585] px-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
