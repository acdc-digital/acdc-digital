// EVENT FORM PANEL - Create/Edit events in right sidebar
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/EventFormPanel.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
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

interface EventFormPanelProps {
  event?: CalendarEvent;
  defaultDate?: Date;
  onSave: (eventData: {
    title: string;
    description?: string;
    startTime: number;
    endTime: number;
    color: string;
    allDay: boolean;
    location?: string;
    attendees?: string[];
  }) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
}

const EVENT_COLORS = [
  { name: "Blue", value: "#007acc" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Yellow", value: "#eab308" },
  { name: "Teal", value: "#14b8a6" },
];

export function EventFormPanel({
  event,
  defaultDate,
  onSave,
  onCancel,
  mode,
}: EventFormPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState(EVENT_COLORS[0].value);
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with event data or defaults
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      setStartDate(start.toISOString().split("T")[0]);
      setStartTime(
        start.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setEndDate(end.toISOString().split("T")[0]);
      setEndTime(
        end.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setAllDay(event.allDay);
      setColor(event.color);
      setLocation(event.location || "");
      setAttendees(event.attendees?.join(", ") || "");
    } else if (defaultDate) {
      // Set defaults for new event
      const dateStr = defaultDate.toISOString().split("T")[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
      setStartTime("09:00");
      setEndTime("10:00");
      setColor(EVENT_COLORS[0].value);
      setAllDay(false);
      setTitle("");
      setDescription("");
      setLocation("");
      setAttendees("");
    }
  }, [event, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !startDate || !endDate) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse dates
      let startTimestamp: number;
      let endTimestamp: number;

      if (allDay) {
        // All-day events: start at midnight, end at 23:59
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        startTimestamp = start.getTime();

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        endTimestamp = end.getTime();
      } else {
        // Regular events with times
        const start = new Date(`${startDate}T${startTime}`);
        startTimestamp = start.getTime();

        const end = new Date(`${endDate}T${endTime}`);
        endTimestamp = end.getTime();
      }

      // Parse attendees (comma-separated)
      const attendeesList = attendees
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startTimestamp,
        endTime: endTimestamp,
        color,
        allDay,
        location: location.trim() || undefined,
        attendees: attendeesList.length > 0 ? attendeesList : undefined,
      });
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#2d2d2d] bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-7 w-7 text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold text-[#cccccc]">
            {mode === "create" ? "New Event" : "Edit Event"}
          </h2>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs text-[#858585]">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
              required
            />
          </div>

          {/* All Day Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked as boolean)}
              className="border-[#858585]"
            />
            <Label htmlFor="allDay" className="text-sm text-[#cccccc] font-normal cursor-pointer">
              All day event
            </Label>
          </div>

          {/* Start Date/Time */}
          <div className="space-y-2">
            <Label className="text-xs text-[#858585]">Start</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                required
              />
              {!allDay && (
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                />
              )}
            </div>
          </div>

          {/* End Date/Time */}
          <div className="space-y-2">
            <Label className="text-xs text-[#858585]">End</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                required
              />
              {!allDay && (
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                />
              )}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs text-[#858585]">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLORS.map((eventColor) => (
                <button
                  key={eventColor.value}
                  type="button"
                  onClick={() => setColor(eventColor.value)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === eventColor.value
                      ? "ring-2 ring-[#cccccc] ring-offset-2 ring-offset-[#252526]"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: eventColor.value }}
                  title={eventColor.name}
                />
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs text-[#858585]">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees" className="text-xs text-[#858585]">
              Attendees
            </Label>
            <Input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Comma-separated names"
              className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs text-[#858585]">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={4}
              className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc] resize-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-[#2d2d2d] p-4 space-y-2">
          <Button
            type="submit"
            className="w-full bg-[#007acc] hover:bg-[#006bb3] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Event" : "Update Event"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full text-[#cccccc] hover:bg-[#2d2d2d]"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
