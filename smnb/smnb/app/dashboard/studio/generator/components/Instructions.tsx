"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Core prompt input components
interface PromptInputProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const PromptInput = React.forwardRef<HTMLFormElement, PromptInputProps>(
  ({ onSubmit, className, children, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(e);
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("relative w-full", className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
PromptInput.displayName = "PromptInput";

interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, minHeight = 48, maxHeight = 164, onKeyDown, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const internalRef = ref || textareaRef;

    // Auto-resize functionality
    const adjustHeight = useCallback(() => {
      const textarea = typeof internalRef === 'object' && internalRef?.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${scrollHeight}px`;
      }
    }, [internalRef, minHeight, maxHeight]);

    // Adjust height on content change
    useEffect(() => {
      adjustHeight();
    }, [props.value, adjustHeight]);

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Check for composition events (IME input)
      const isComposing = e.nativeEvent && 'isComposing' in e.nativeEvent ? 
        (e.nativeEvent as KeyboardEvent).isComposing : false;
      
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (form) {
          const event = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(event);
        }
      }
      onKeyDown?.(e);
    };

    return (
      <textarea
        ref={internalRef}
        className={cn(
          "flex w-full resize-none rounded-md border border-input bg-background px-3 py-2",
          "text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 ease-in-out",
          "overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted",
          className
        )}
        rows={Math.ceil(minHeight / 24)} // Approximate rows based on line height
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

interface PromptInputToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PromptInputToolbar = React.forwardRef<HTMLDivElement, PromptInputToolbarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2",
          "border-t border-border bg-muted/50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PromptInputToolbar.displayName = "PromptInputToolbar";

interface PromptInputToolsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const PromptInputTools = React.forwardRef<HTMLDivElement, PromptInputToolsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PromptInputTools.displayName = "PromptInputTools";

interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: "ready" | "submitted" | "streaming" | "error";
}

const PromptInputSubmit = React.forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, disabled, status = "ready", children, ...props }, ref) => {
    const getStatusIcon = () => {
      switch (status) {
        case "submitted":
        case "streaming":
          return <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />;
        case "error":
          return <X className="h-4 w-4" />;
        default:
          return <Send className="h-4 w-4" />;
      }
    };

    return (
      <Button
        ref={ref}
        type="submit"
        size="sm"
        className={cn(
          "shrink-0 transition-all",
          status === "error" && "bg-destructive hover:bg-destructive/90",
          className
        )}
        disabled={disabled || status === "submitted" || status === "streaming"}
        {...props}
      >
        {children || getStatusIcon()}
      </Button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";

// Main Instructions component
interface InstructionsProps {
  onSubmit?: (instructions: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onStatusChange?: (hasInstructions: boolean) => void;
  onClear?: () => void; // Callback when clear button is clicked
  columnId?: string; // For state persistence
  initialValue?: string;
}

export default function Instructions({
  onSubmit,
  placeholder = "Add guidance for the post generation (optional)...",
  disabled = false,
  onStatusChange,
  onClear,
  columnId,
  initialValue = ""
}: InstructionsProps) {
  // Get persisted instructions from localStorage or use initial value
  const getPersistedInstructions = () => {
    if (typeof window !== 'undefined' && columnId) {
      const stored = localStorage.getItem(`instructions-${columnId}`);
      return stored || initialValue;
    }
    return initialValue;
  };

  const [instructions, setInstructions] = useState(getPersistedInstructions);
  const [hasContent, setHasContent] = useState(getPersistedInstructions().trim().length > 0);

  // Initialize status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && columnId) {
      const stored = localStorage.getItem(`instructions-${columnId}`);
      const initialInstructions = stored || initialValue;
      const hasInitialContent = initialInstructions.trim().length > 0;
      
      if (hasInitialContent && stored) { // Only restore if there's actually stored data
        setInstructions(initialInstructions);
        setHasContent(true);
      }
      
      // Check submission status separately and only call if different from current state
      const wasSubmitted = localStorage.getItem(`instructions-submitted-${columnId}`) === 'true';
      if (wasSubmitted && hasInitialContent) {
        onStatusChange?.(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnId, initialValue]); // Removed onStatusChange from dependencies

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInstructions(value);
    setHasContent(value.trim().length > 0);
    
    // Persist to localStorage
    if (typeof window !== 'undefined' && columnId) {
      localStorage.setItem(`instructions-${columnId}`, value);
    }
    
    // If user starts typing after submission, reset status
    if (value.trim().length === 0) {
      onStatusChange?.(false);
      if (typeof window !== 'undefined' && columnId) {
        localStorage.removeItem(`instructions-submitted-${columnId}`);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInstructions = instructions.trim();
    if (trimmedInstructions) {
      onSubmit?.(trimmedInstructions);
      onStatusChange?.(true); // Notify parent that instructions are submitted
      
      // Persist submission status
      if (typeof window !== 'undefined' && columnId) {
        localStorage.setItem(`instructions-submitted-${columnId}`, 'true');
      }
      
      // Blur the textarea to remove cursor
      const textarea = e.currentTarget.querySelector('textarea');
      if (textarea) {
        textarea.blur();
      }
      
      console.log('Instructions submitted:', trimmedInstructions);
    }
  };

  // Handle clear instructions
  const handleClear = () => {
    setInstructions("");
    setHasContent(false);
    onStatusChange?.(false); // Notify parent that instructions are cleared
    
    // Clear persisted data
    if (typeof window !== 'undefined' && columnId) {
      localStorage.removeItem(`instructions-${columnId}`);
      localStorage.removeItem(`instructions-submitted-${columnId}`);
    }
    
    // Notify parent to clear generated content
    onClear?.();
    
    console.log('Instructions cleared');
  };

  return (
    <div className="space-y-2">
      {/* Header with clear button only */}
      {hasContent && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Prompt Input Container */}
      <div className={cn(
        "rounded-lg border border-border bg-background transition-all duration-200",
        hasContent && "border-primary/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <PromptInput onSubmit={handleSubmit}>
          <div className="relative">
            <PromptInputTextarea
              value={instructions}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              minHeight={48}
              maxHeight={120}
              className={cn(
                "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                "resize-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
              )}
            />
          </div>


        </PromptInput>
      </div>
    </div>
  );
}
