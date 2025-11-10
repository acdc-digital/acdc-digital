"use client";

import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search functions..." }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent beforeunload warning from this input
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Mark this input as not requiring save confirmation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If the active element is our search input, don't show warning
      if (document.activeElement === input) {
        e.preventDefault();
        delete e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-form-type="other"
        data-1p-ignore
        data-lpignore="true"
      />
    </div>
  );
}
