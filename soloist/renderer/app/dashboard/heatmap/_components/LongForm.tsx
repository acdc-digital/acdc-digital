// LONG FORM EDITOR
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/_components/LongForm.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Loader2,
  Check,
  Save,
} from "lucide-react";
import { format } from "date-fns";

interface LongFormProps {
  onClose: () => void;
  date: string;
  entryId?: string; // Optional: for editing existing entries
}

/**
 * Long-form writing component for free-form journaling.
 * Unlike the structured daily log, this provides an open canvas
 * for users to write extended thoughts, reflections, and ideas.
 */
export default function LongForm({ onClose, date, entryId }: LongFormProps) {
  const { isAuthenticated, isLoading: userLoading, userId } = useConvexUser();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Convex mutation
  const saveLongFormEntry = useMutation(api.longForm.saveLongFormEntry);

  // Load existing entry for this date
  const existingEntry = useQuery(
    api.longForm.getLongFormEntry,
    userId ? { userId, date } : "skip"
  );

  // Populate form with existing entry data
  useEffect(() => {
    if (existingEntry && !isLoaded) {
      setTitle(existingEntry.title || "");
      setContent(existingEntry.content || "");
      setLastSaved(new Date(existingEntry.updatedAt));
      setHasUnsavedChanges(false);
      setIsLoaded(true);
    } else if (existingEntry === null && !isLoaded) {
      // No existing entry, mark as loaded
      setIsLoaded(true);
    }
  }, [existingEntry, isLoaded]);

  // Track changes (only after initial load)
  useEffect(() => {
    if (isLoaded && (title || content)) {
      setHasUnsavedChanges(true);
    }
  }, [title, content, isLoaded]);

  // Word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  /* ────────────────────────────────────────── */
  /*  Loading state                             */
  /* ────────────────────────────────────────── */
  if (userLoading || !isAuthenticated || !userId) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-zinc-500">Loading...</span>
      </div>
    );
  }

  /* ────────────────────────────────────────── */
  /*  Form submit handler                       */
  /* ────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      await saveLongFormEntry({
        userId,
        date,
        title: title.trim() || undefined,
        content,
      });

      console.log("Long form entry saved:", { date, userId, title, content });

      // Show success state
      setShowSuccess(true);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save long form entry:", err);
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ────────────────────────────────────────── */
  /*  Auto-save handler (optional)              */
  /* ────────────────────────────────────────── */
  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !content.trim() || !userId) return;

    try {
      await saveLongFormEntry({
        userId,
        date,
        title: title.trim() || undefined,
        content,
      });
      console.log("Auto-saved:", { title, content });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, [hasUnsavedChanges, title, content, userId, date, saveLongFormEntry]);

  /* ────────────────────────────────────────── */
  /*  UI                                        */
  /* ────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-[#2b2b2b] text-zinc-800 dark:text-zinc-100 overflow-hidden">
      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="px-5 py-5 flex-1 flex flex-col">
            {/* Content Textarea */}
            <div className="flex-1 relative">
              <Textarea
                placeholder="Start writing... Let your thoughts flow freely. This is your space to explore ideas, reflect on experiences, or simply express how you're feeling."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[300px] bg-transparent border-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none focus:ring-offset-0 resize-none text-base leading-relaxed px-0"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 w-full bg-neutral-100 dark:bg-[#2b2b2b] px-5 py-3">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center space-x-2 mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className={`${
              showSuccess
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "border border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700/75 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
            } h-8 px-6 text-sm font-medium rounded-none transition-all disabled:opacity-50`}
          >
            {showSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 px-4 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
