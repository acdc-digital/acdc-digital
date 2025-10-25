// CALENDAR
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/Calendar.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MonthCalendarView } from "./_components/MonthCalendarView";
import { EventDetailPanel } from "./_components/EventDetailPanel";
import { EventFormPanel } from "./_components/EventFormPanel";

interface CalendarProps {
  isActive?: boolean;
}

type PanelView = "list" | "detail" | "form";

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
  eventType?: "earnings" | "sec_report" | "treasury_report" | "fed_report" | "economic_data" | "user_event";
  sourceUrl?: string;
  metadata?: string;
}

export default function Calendar({ isActive }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [panelView, setPanelView] = useState<PanelView>("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch events for current month
  const monthEvents = useQuery(api.calendar.getEventsForMonth, {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  });

  // Fetch events for selected day
  const dayEvents = useQuery(api.calendar.getEventsForDay, {
    date: selectedDate.toISOString().split("T")[0],
  });

  // Mutations and Actions
  const createEvent = useMutation(api.calendar.createEvent);
  const updateEvent = useMutation(api.calendar.updateEvent);
  const deleteEvent = useMutation(api.calendar.deleteEvent);

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setFormMode("create");
    setPanelView("form");
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormMode("edit");
    setPanelView("form");
  };

  const handleDeleteEvent = async (eventId: Id<"calendar_events">) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent({ eventId });
      setSelectedEvent(undefined);
      setPanelView("list");
    }
  };

  const handleSaveEvent = async (eventData: {
    title: string;
    description?: string;
    startTime: number;
    endTime: number;
    color: string;
    allDay: boolean;
    location?: string;
    attendees?: string[];
  }) => {
    if (formMode === "create") {
      await createEvent(eventData);
    } else if (selectedEvent) {
      await updateEvent({
        eventId: selectedEvent._id,
        ...eventData,
      });
    }
    setPanelView("list");
  };

  const handleCancelForm = () => {
    setPanelView(selectedEvent ? "detail" : "list");
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startTime));
    setPanelView("detail");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setPanelView("list");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1e1e1e] p-4">
      <div className="flex-1 flex overflow-hidden bg-[#1e1e1e] rounded-lg border border-[#2d2d2d]">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[#2d2d2d]">
        
        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          <MonthCalendarView
            currentDate={currentDate}
            events={monthEvents || []}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onMonthChange={setCurrentDate}
          />
        </div>
      </div>

      {/* Right Panel - Dynamic View */}
      <div className="w-80 bg-[#252526] flex flex-col">
        {panelView === "form" ? (
          <EventFormPanel
            event={selectedEvent}
            defaultDate={selectedDate}
            onSave={handleSaveEvent}
            onCancel={handleCancelForm}
            mode={formMode}
          />
        ) : (
          <EventDetailPanel
            selectedDate={selectedDate}
            events={dayEvents || []}
            selectedEvent={panelView === "detail" ? selectedEvent : undefined}
            onEventSelect={handleEventClick}
            onEventEdit={handleEditEvent}
            onEventDelete={handleDeleteEvent}
            onCreateEvent={handleCreateEvent}
          />
        )}
      </div>
      </div>
    </div>
  );
}
