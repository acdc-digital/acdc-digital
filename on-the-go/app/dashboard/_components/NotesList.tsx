"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, Phone, Clock, Tag } from "lucide-react";
import { useState } from "react";

interface NotesListProps {
  onNoteClick: (noteId: Id<"notes">, phoneNumber: string) => void;
}

export function NotesList({ onNoteClick }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const notes = useQuery(api.notes.listNotes, { limit: 100 });
  const stats = useQuery(api.notes.getStats);

  if (notes === undefined) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-[#858585]">Loading notes...</div>
      </div>
    );
  }

  const filteredNotes = notes.filter((note) =>
    searchQuery === "" ||
    note.messageBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.phoneNumber.includes(searchQuery)
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-[#007acc]";
      case "read":
        return "bg-[#858585]";
      case "edited":
        return "bg-[#10b981]";
      case "archived":
        return "bg-[#6c757d]";
      default:
        return "bg-[#858585]";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Stats */}
      <div className="p-6 border-b border-[#2d2d2d]">
        <h1 className="text-2xl font-bold text-[#cccccc] mb-4">Notes</h1>
        
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-[#252526] rounded-lg p-3">
              <div className="text-xs text-[#858585] mb-1">Total</div>
              <div className="text-xl font-bold text-[#cccccc]">{stats.total}</div>
            </div>
            <div className="bg-[#252526] rounded-lg p-3">
              <div className="text-xs text-[#858585] mb-1">New</div>
              <div className="text-xl font-bold text-[#007acc]">{stats.new}</div>
            </div>
            <div className="bg-[#252526] rounded-lg p-3">
              <div className="text-xs text-[#858585] mb-1">Edited</div>
              <div className="text-xl font-bold text-[#10b981]">{stats.edited}</div>
            </div>
            <div className="bg-[#252526] rounded-lg p-3">
              <div className="text-xs text-[#858585] mb-1">Archived</div>
              <div className="text-xl font-bold text-[#6c757d]">{stats.archived}</div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#858585]" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg text-sm text-[#cccccc] placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#858585]">
            <MessageSquareIcon className="w-12 h-12 mb-4" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-2">Send an SMS to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                onClick={() => onNoteClick(note._id, note.phoneNumber)}
                className="bg-[#252526] hover:bg-[#2d2d2d] rounded-lg p-4 cursor-pointer transition-colors border border-transparent hover:border-[#007acc]"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#007acc]" />
                    <span className="text-sm font-medium text-[#cccccc]">
                      {note.phoneNumber}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(note.status)}`} />
                    <span className="text-xs text-[#858585] uppercase">{note.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#858585]">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatTimestamp(note.receivedAt)}</span>
                  </div>
                </div>

                {/* Message Preview */}
                <p className="text-sm text-[#cccccc] line-clamp-2 mb-2">
                  {note.editedContent || note.messageBody}
                </p>

                {/* Tags (if any) */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Tag className="w-3 h-3 text-[#858585]" />
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-[#2d2d2d] text-[#858585] text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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

// Simple icon component for empty state
function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}
