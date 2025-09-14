// BOOK NOTE EDITOR - Modal editor for creating and editing book notes
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/books/BookNoteEditor.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Save, Tag } from "lucide-react";

interface BookNoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: { title: string; content: string; tags: string[] }) => void;
  existingNote?: {
    title: string;
    content: string;
    tags: string[];
  } | null;
}

export function BookNoteEditor({ isOpen, onClose, onSave, existingNote }: BookNoteEditorProps) {
  const [title, setTitle] = useState(existingNote?.title || "");
  const [content, setContent] = useState(existingNote?.content || "");
  const [tags, setTags] = useState(existingNote?.tags.join(", ") || "");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tagArray
    });
    
    // Reset form
    setTitle("");
    setContent("");
    setTags("");
    onClose();
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setTags("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#454545] rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#454545]">
          <h3 className="text-[#cccccc] font-medium">
            {existingNote ? "Edit Note" : "New Reading Note"}
          </h3>
          <button
            onClick={handleCancel}
            className="text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-[#cccccc] mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your note..."
              className="w-full bg-[#3c3c3c] text-[#cccccc] text-sm px-3 py-2 rounded border-none outline-none focus:ring-2 focus:ring-[#007acc] transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-[#cccccc] mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, insights, quotes, or any notes about this book..."
              rows={8}
              className="w-full bg-[#3c3c3c] text-[#cccccc] text-sm px-3 py-2 rounded border-none outline-none focus:ring-2 focus:ring-[#007acc] transition-all resize-none"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-[#cccccc] mb-2">
              <Tag className="w-3 h-3" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="chapter-1, insights, quotes, key-concepts"
              className="w-full bg-[#3c3c3c] text-[#cccccc] text-sm px-3 py-2 rounded border-none outline-none focus:ring-2 focus:ring-[#007acc] transition-all"
            />
            <p className="text-xs text-[#858585] mt-1">
              Add tags to organize your notes. Separate multiple tags with commas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#454545]">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-[#858585] hover:text-[#cccccc]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="bg-[#007acc] hover:bg-[#005a9e] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Note
          </Button>
        </div>
      </div>
    </div>
  );
}
