// TEMPLATE SELECTOR COMPONENT
// Shows dropdown of available templates and allows switching between them

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Plus } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { Template } from "./Templates";

interface TemplateSelectorProps {
  userId?: string;
  selectedDate?: Date | null;
  onCreateNew?: () => void;
}

export default function TemplateSelector({ userId, selectedDate, onCreateNew }: TemplateSelectorProps) {
  const {
    templates,
    activeTemplate,
    setActiveTemplate,
    isLoading,
  } = useTemplates({ 
    userId, 
    selectedDate: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined 
  });

  // Deduplicate templates by name, keeping the most recent one
  const uniqueTemplates = templates.reduce((acc: Template[], current: Template) => {
    const existingIndex = acc.findIndex(t => t.name === current.name);
    if (existingIndex === -1) {
      // Template name doesn't exist, add it
      acc.push(current);
    } else {
      // Template name exists, keep the more recent one
      const existing = acc[existingIndex];
      if (new Date(current.updatedAt) > new Date(existing.updatedAt)) {
        acc[existingIndex] = current;
      }
    }
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">Loading templates...</span>
      </div>
    );
  }

  const handleTemplateChange = async (value: string) => {
    if (value === "create-new") {
      // Handle creating a new template
      onCreateNew?.();
      return;
    }

    try {
      await setActiveTemplate(value as any);
    } catch (error) {
      console.error("Failed to set active template:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Template Selector - full width */}
      <Select
        value={activeTemplate?.id || ""}
        onValueChange={handleTemplateChange}
      >
        <SelectTrigger className="h-8 w-full text-sm bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-zinc-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none">
          <SelectValue placeholder="Select Template">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-neutral-500 dark:text-zinc-400 flex-shrink-0">Template:</span>
              <span className="text-sm font-medium text-neutral-700 dark:text-zinc-200 truncate">
                {activeTemplate?.name || "A New Beginning."}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-none bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-zinc-200">
          {/* Existing Templates */}
          {uniqueTemplates.map((template: Template) => (
            <SelectItem key={template.id} value={template.id} className="rounded-none focus:bg-neutral-200 dark:focus:bg-neutral-700 focus:text-neutral-900 dark:focus:text-zinc-100">
              <div className="flex items-center gap-2">
                <span>{template.name}</span>
                {template.name === "A New Beginning." && (
                  <span className="text-xs text-neutral-500 dark:text-zinc-400">(Default)</span>
                )}
              </div>
            </SelectItem>
          ))}

          {/* Separator */}
          {uniqueTemplates.length > 0 && (
            <div className="border-t border-neutral-300 dark:border-neutral-600 my-1" />
          )}

          {/* Create New Template Option */}
          <SelectItem value="create-new" className="rounded-none text-neutral-600 dark:text-neutral-300 font-medium focus:bg-neutral-200 dark:focus:bg-neutral-700">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create New Template</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 