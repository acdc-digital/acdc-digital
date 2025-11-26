"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Save, Archive, Phone, Clock, Tag, Eye, Edit3 } from "lucide-react";

interface NoteEditorProps {
  noteId: Id<"notes">;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const note = useQuery(api.notes.getNote, { noteId });
  const updateNote = useMutation(api.notes.updateNote);
  const markAsRead = useMutation(api.notes.markAsRead);

  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.editedContent || note.messageBody);
      setTags(note.tags || []);
      
      // Mark as read when opened
      if (note.status === "new") {
        markAsRead({ noteId });
      }
    }
  }, [note, noteId, markAsRead]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNote({
        noteId,
        editedContent: content,
        tags,
        status: "edited",
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleArchive = async () => {
    await updateNote({
      noteId,
      status: "archived",
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#858585]">Loading note...</div>
      </div>
    );
  }

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering (you can enhance this with a library like react-markdown)
    return text
      .split("\n")
      .map((line, i) => {
        // Headings
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        // Lists
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 list-disc">
              {line.slice(2)}
            </li>
          );
        }
        // Regular paragraph
        if (line.trim() === "") {
          return <br key={i} />;
        }
        return <p key={i} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#2d2d2d]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-[#007acc]" />
              <h1 className="text-xl font-bold text-[#cccccc]">{note.phoneNumber}</h1>
              <span className={`
                px-2 py-0.5 text-xs rounded uppercase
                ${note.status === "new" ? "bg-[#007acc] text-white" : ""}
                ${note.status === "read" ? "bg-[#858585] text-white" : ""}
                ${note.status === "edited" ? "bg-[#10b981] text-white" : ""}
                ${note.status === "archived" ? "bg-[#6c757d] text-white" : ""}
              `}>
                {note.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#858585]">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Received: {formatTimestamp(note.receivedAt)}</span>
              </div>
              {note.updatedAt > note.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {formatTimestamp(note.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#cccccc] text-sm rounded transition-colors flex items-center gap-2"
              title={showPreview ? "Edit" : "Preview"}
            >
              {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isEditing}
              className="px-3 py-1.5 bg-[#007acc] hover:bg-[#005a9e] disabled:bg-[#3d3d3d] disabled:text-[#858585] text-white text-sm rounded transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleArchive}
              className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#cccccc] text-sm rounded transition-colors flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>
        </div>

        {/* Original Message (if edited) */}
        {note.editedContent && (
          <div className="mt-4 p-3 bg-[#252526] rounded border-l-2 border-[#007acc]">
            <div className="text-xs text-[#858585] mb-1">Original SMS:</div>
            <div className="text-sm text-[#cccccc]">{note.messageBody}</div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {showPreview ? (
          <div className="prose prose-invert max-w-none text-[#cccccc]">
            {renderMarkdown(content)}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setIsEditing(true);
            }}
            className="w-full h-full bg-transparent text-[#cccccc] text-base leading-relaxed resize-none focus:outline-none font-mono"
            placeholder="Start editing your note... (Markdown supported)"
          />
        )}
      </div>

      {/* Tags Section */}
      <div className="p-6 border-t border-[#2d2d2d]">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-[#858585]" />
          <span className="text-sm text-[#858585]">Tags</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-[#2d2d2d] text-[#cccccc] text-sm rounded flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => {
                  setTags(tags.filter((_, i) => i !== index));
                  setIsEditing(true);
                }}
                className="text-[#858585] hover:text-[#cccccc]"
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                setTags([...tags, e.currentTarget.value.trim()]);
                e.currentTarget.value = "";
                setIsEditing(true);
              }
            }}
            className="px-3 py-1 bg-[#2d2d2d] text-[#cccccc] text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#007acc]"
          />
        </div>
      </div>
    </div>
  );
}
