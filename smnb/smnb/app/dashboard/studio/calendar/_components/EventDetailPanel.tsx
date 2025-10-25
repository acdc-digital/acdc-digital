// EVENT DETAIL PANEL - Shows event details in right sidebar
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/EventDetailPanel.tsx

"use client";

import React from "react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ExternalLinkIcon,
} from "lucide-react";
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
  eventType?: "earnings" | "sec_report" | "treasury_report" | "fed_report" | "economic_data" | "user_event";
  sourceUrl?: string;
  metadata?: string;
}

interface EventDetailPanelProps {
  selectedDate?: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  onEventSelect: (event: CalendarEvent) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: Id<"calendar_events">) => void;
  onCreateEvent: () => void;
}

export function EventDetailPanel({
  selectedDate,
  events,
  selectedEvent,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  onCreateEvent,
}: EventDetailPanelProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const formatTimeRange = (startTime: number, endTime: number, allDay: boolean) => {
    if (allDay) {
      return "All day";
    }
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getEventTypeLabel = (eventType?: string) => {
    const labels: Record<string, string> = {
      earnings: "📈 Earnings Report",
      sec_report: "📋 SEC Report",
      treasury_report: "💰 Treasury Report",
      fed_report: "🏛️ Federal Reserve",
      economic_data: "📊 Economic Data",
      user_event: "📅 Event",
    };
    return labels[eventType || "user_event"] || "📅 Event";
  };

  // Show selected event details if one is selected
  if (selectedEvent) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#2d2d2d] bg-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-[#cccccc]">Event Details</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEventEdit(selectedEvent)}
              className="h-7 w-7 text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
              title="Edit Event"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEventDelete(selectedEvent._id)}
              className="h-7 w-7 text-[#858585] hover:text-red-500 hover:bg-[#2d2d2d]"
              title="Delete Event"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Event Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Color indicator */}
          <div
            className="h-1 w-full rounded-full"
            style={{ backgroundColor: selectedEvent.color }}
          />

          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-[#2d2d2d] text-[#858585]">
                {getEventTypeLabel(selectedEvent.eventType)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#cccccc] mb-1">
              {selectedEvent.title}
            </h3>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <ClockIcon className="w-4 h-4 text-[#858585] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[#cccccc]">
                {formatTimeRange(
                  selectedEvent.startTime,
                  selectedEvent.endTime,
                  selectedEvent.allDay
                )}
              </p>
              <p className="text-xs text-[#858585] mt-0.5">
                {formatDate(new Date(selectedEvent.startTime))}
              </p>
            </div>
          </div>

          {/* Source URL for federal reports */}
          {selectedEvent.sourceUrl && (
            <div className="flex items-start gap-3">
              <ExternalLinkIcon className="w-4 h-4 text-[#858585] mt-0.5" />
              <a
                href={selectedEvent.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                View Original Report →
              </a>
            </div>
          )}

          {/* Location */}
          {selectedEvent.location && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-4 h-4 text-[#858585] mt-0.5" />
              <p className="text-sm text-[#cccccc]">{selectedEvent.location}</p>
            </div>
          )}

          {/* Attendees */}
          {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
            <div className="flex items-start gap-3">
              <UsersIcon className="w-4 h-4 text-[#858585] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#858585] mb-1">Attendees</p>
                <div className="space-y-1">
                  {selectedEvent.attendees.map((attendee, index) => (
                    <p key={index} className="text-sm text-[#cccccc]">
                      {attendee}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {selectedEvent.description && (
            <div className="pt-3 border-t border-[#2d2d2d]">
              <p className="text-sm text-[#858585] mb-2">Description</p>
              <p className="text-sm text-[#cccccc] whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show day's events list if no specific event is selected
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#2d2d2d] bg-[#1e1e1e]">
        <h2 className="text-sm font-semibold text-[#cccccc]">
          {selectedDate ? formatDate(selectedDate) : "Select a date"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateEvent}
          className="h-7 w-7 text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
          title="Add Event"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="w-10 h-10 text-[#858585] mb-3 opacity-30" />
            <p className="text-sm text-[#858585]">No events scheduled</p>
            <p className="text-xs text-[#858585] mt-1 opacity-70">
              Click + to create a new event
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => onEventSelect(event)}
                className="relative rounded-md p-3 cursor-pointer
                  bg-[#2d2d2d] hover:bg-[#3d3d3d] transition-colors
                  border-l-2"
                style={{ borderLeftColor: event.color }}
              >
                <div className="text-xs text-[#858585] mb-1">
                  {getEventTypeLabel(event.eventType)}
                </div>
                <div className="font-medium text-[#cccccc] mb-1 text-sm">
                  {event.title}
                </div>
                <div className="text-xs text-[#858585]">
                  {formatTimeRange(event.startTime, event.endTime, event.allDay)}
                </div>
                {event.location && (
                  <div className="text-xs text-[#858585] mt-1 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
                {event.sourceUrl && (
                  <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                    <ExternalLinkIcon className="w-3 h-3" />
                    View Report
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
