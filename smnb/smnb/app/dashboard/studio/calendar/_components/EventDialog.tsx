// EVENT DIALOG - Create/Edit events
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/calendar/_components/EventDialog.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";

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

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSave,
  mode,
}: EventDialogProps) {
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
    }
  }, [event, defaultDate, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setAllDay(false);
        setColor(EVENT_COLORS[0].value);
        setLocation("");
        setAttendees("");
      }, 200);
    }
  }, [open]);

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

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#252526] border-[#2d2d2d] text-[#cccccc]">
        <DialogHeader>
          <DialogTitle className="text-[#cccccc]">
            {mode === "create" ? "Create Event" : "Edit Event"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#cccccc]">
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

            {/* Date and Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="allDay"
                  checked={allDay}
                  onCheckedChange={(checked) => setAllDay(checked as boolean)}
                  className="border-[#858585]"
                />
                <Label htmlFor="allDay" className="text-[#cccccc] font-normal cursor-pointer">
                  All day event
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-[#cccccc]">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                    required
                  />
                </div>
                {!allDay && (
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-[#cccccc]">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-[#cccccc]">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                    required
                  />
                </div>
                {!allDay && (
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-[#cccccc]">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="text-[#cccccc]">Color</Label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((eventColor) => (
                  <button
                    key={eventColor.value}
                    type="button"
                    onClick={() => setColor(eventColor.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
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
              <Label htmlFor="location" className="text-[#cccccc]">
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
              <Label htmlFor="attendees" className="text-[#cccccc]">
                Attendees
              </Label>
              <Input
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Enter names separated by commas"
                className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#cccccc]">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description"
                rows={3}
                className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#cccccc] hover:bg-[#2d2d2d]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#007acc] hover:bg-[#006bb3] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
