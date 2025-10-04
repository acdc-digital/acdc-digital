// PROMPT INPUT COMPONENT
// Enhanced auto-resizing input for AI chat with toolbar system
// Based on AI Elements design pattern

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Send, StopCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * Chat status types matching Vercel AI SDK
 */
export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

// ============================================================================
// PROMPT INPUT (Form Container)
// ============================================================================

export interface PromptInputProps
  extends React.HTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent) => void;
}

export const PromptInput = React.forwardRef<
  HTMLFormElement,
  PromptInputProps
>(({ className, onSubmit, children, ...props }, ref) => {
  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {children}
    </form>
  );
});
PromptInput.displayName = "PromptInput";

// ============================================================================
// PROMPT INPUT TEXTAREA (Auto-resizing)
// ============================================================================

export interface PromptInputTextareaProps
  extends React.ComponentProps<typeof Textarea> {
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
}

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(
  (
    {
      placeholder = "What would you like to know?",
      minHeight = 48,
      maxHeight = 164,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize effect
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const resize = () => {
        textarea.style.height = `${minHeight}px`;
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
      };

      textarea.addEventListener("input", resize);
      resize(); // Initial resize

      return () => {
        textarea.removeEventListener("input", resize);
      };
    }, [minHeight, maxHeight, props.value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter submits (unless in composition mode or with Shift)
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
        }
      }

      // Call custom handler
      onKeyDown?.(e);
    };

    return (
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        className={cn(
          "resize-none overflow-auto transition-all",
          className
        )}
        style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

// ============================================================================
// PROMPT INPUT TOOLBAR
// ============================================================================

export const PromptInputToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 px-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PromptInputToolbar.displayName = "PromptInputToolbar";

// ============================================================================
// PROMPT INPUT TOOLS (Left side of toolbar)
// ============================================================================

export const PromptInputTools = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {children}
    </div>
  );
});
PromptInputTools.displayName = "PromptInputTools";

// ============================================================================
// PROMPT INPUT BUTTON (Toolbar button)
// ============================================================================

export interface PromptInputButtonProps
  extends React.ComponentProps<typeof Button> {
  variant?: "ghost" | "default" | "outline" | "secondary" | "link";
}

export const PromptInputButton = React.forwardRef<
  HTMLButtonElement,
  PromptInputButtonProps
>(({ variant = "ghost", size, className, children, ...props }, ref) => {
  // Auto-detect size based on content
  const hasText = React.Children.toArray(children).some(
    (child) => typeof child === "string" || React.isValidElement(child)
  );
  const autoSize = hasText ? "sm" : "icon";

  return (
    <Button
      ref={ref}
      type="button"
      variant={variant}
      size={size || autoSize}
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </Button>
  );
});
PromptInputButton.displayName = "PromptInputButton";

// ============================================================================
// PROMPT INPUT SUBMIT (Submit button with status)
// ============================================================================

export interface PromptInputSubmitProps
  extends React.ComponentProps<typeof Button> {
  status?: ChatStatus;
}

export const PromptInputSubmit = React.forwardRef<
  HTMLButtonElement,
  PromptInputSubmitProps
>(
  (
    {
      status = "ready",
      variant = "default",
      size = "icon",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Icon based on status
    const StatusIcon = React.useMemo(() => {
      switch (status) {
        case "streaming":
          return StopCircle;
        case "submitted":
          return Loader2;
        case "error":
          return AlertCircle;
        default:
          return Send;
      }
    }, [status]);

    const isLoading = status === "submitted" || status === "streaming";

    return (
      <Button
        ref={ref}
        type="submit"
        variant={variant}
        size={size}
        className={cn("shrink-0", className)}
        disabled={disabled || status === "submitted"}
        {...props}
      >
        <StatusIcon
          className={cn("w-4 h-4", isLoading && "animate-spin")}
        />
      </Button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";

// ============================================================================
// MODEL SELECTION COMPONENTS
// ============================================================================

export const PromptInputModelSelect = Select;

export const PromptInputModelSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, ...props }, ref) => (
  <SelectTrigger
    ref={ref}
    className={cn("w-auto min-w-[140px]", className)}
    {...props}
  />
));
PromptInputModelSelectTrigger.displayName = "PromptInputModelSelectTrigger";

export const PromptInputModelSelectContent = SelectContent;
export const PromptInputModelSelectItem = SelectItem;
export const PromptInputModelSelectValue = SelectValue;
