// SESSION SIDEBAR
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvas/_components/SessionSidebar.tsx

"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Plus, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  date: Date;
  isToday: boolean;
  customTitle?: string; // User-editable title
}

export function SessionSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sessions, setSessions] = React.useState<Session[]>(() => {
    // Generate sessions for today and previous days
    const today = new Date();
    const sessionList: Session[] = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      sessionList.push({
        id: date.toISOString(),
        date: date,
        isToday: i === 0,
      });
    }
    
    return sessionList;
  });

  const [selectedSessionId, setSelectedSessionId] = React.useState<string>(
    sessions[0]?.id
  );
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  // Edit state
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const editInputRef = React.useRef<HTMLInputElement>(null);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if session for this date already exists
    const existingSession = sessions.find(
      (s) => s.date.toDateString() === date.toDateString()
    );
    
    if (existingSession) {
      // Move existing session to top
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== existingSession.id);
        return [existingSession, ...filtered];
      });
      setSelectedSessionId(existingSession.id);
    } else {
      // Create new session and add to top
      const newSession: Session = {
        id: date.toISOString(),
        date: date,
        isToday: date.toDateString() === new Date().toDateString(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
    }
    
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get display title (custom or default)
  const getDisplayTitle = (session: Session): string => {
    return session.customTitle || formatDate(session.date);
  };

  // Start editing a session title
  const startEditing = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditValue(session.customTitle || formatDate(session.date));
    // Focus input after render
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  // Save the edited title
  const saveEdit = (sessionId: string) => {
    const trimmedValue = editValue.trim();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, customTitle: trimmedValue || undefined }
          : s
      )
    );
    setEditingSessionId(null);
    setEditValue("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditValue("");
  };

  // Handle key press in edit input
  const handleEditKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(sessionId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Filter sessions based on search query
  const filteredSessions = React.useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    
    const query = searchQuery.toLowerCase();
    return sessions.filter((session) => {
      const displayTitle = getDisplayTitle(session).toLowerCase();
      const timeLabel = formatTime(session.date).toLowerCase();
      return displayTitle.includes(query) || timeLabel.includes(query);
    });
  }, [sessions, searchQuery]);

  return (
    <div className="w-60 h-full border-r border-neutral-300 dark:border-neutral-600 flex flex-col">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-7 py-1 bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Date Picker */}
      <div className="px-3 pb-3">
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button className="w-full h-8 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-200/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between focus:outline-none focus-visible:ring-0">
              <div className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Select</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-1.5 space-y-2">
          {filteredSessions.map((session, index) => (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (editingSessionId === session.id) return; // Don't select while editing
                // Move selected session to top
                setSessions((prev) => {
                  const filtered = prev.filter((s) => s.id !== session.id);
                  return [session, ...filtered];
                });
                setSelectedSessionId(session.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (editingSessionId === session.id) return;
                  setSessions((prev) => {
                    const filtered = prev.filter((s) => s.id !== session.id);
                    return [session, ...filtered];
                  });
                  setSelectedSessionId(session.id);
                }
              }}
              className={cn(
                "w-full px-2.5 py-0.5 rounded-lg text-left focus:outline-none focus-visible:outline-none active:outline-none border border-transparent cursor-pointer group/session",
                "hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 hover:border-neutral-200 dark:hover:border-neutral-600",
                "active:border-transparent",
                selectedSessionId === session.id &&
                  "bg-neutral-200/70 dark:bg-neutral-700/70"
              )}
              style={{ 
                transition: 'background-color 0.15s ease-out, border-color 0.15s ease-out, opacity 0.2s ease-out',
                outline: 'none',
                willChange: 'background-color, border-color'
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingSessionId === session.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, session.id)}
                        onBlur={() => saveEdit(session.id)}
                        className="flex-1 min-w-0 h-5 px-1 text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(session.id);
                        }}
                        className="p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded"
                      >
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEdit();
                        }}
                        className="p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded"
                      >
                        <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-medium text-sm truncate">
                        {getDisplayTitle(session)}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => startEditing(session, e)}
                        className="p-0.5 opacity-0 group-hover/session:opacity-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded transition-opacity"
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {formatTime(session.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Optional actions */}
      <Separator />
      <div className="p-2.5 pl-5 text-xs text-muted-foreground text-left">
        {filteredSessions.length} of {sessions.length} session{sessions.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
