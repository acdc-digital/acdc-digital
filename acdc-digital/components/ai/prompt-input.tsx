"use client";

import { forwardRef, useEffect, useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Square, Loader2 } from "lucide-react";

// Form container
interface PromptInputProps extends React.HTMLAttributes<HTMLFormElement> {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export const PromptInput = forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, onSubmit, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
PromptInput.displayName = "PromptInput";

// Auto-resizing textarea
interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
}

export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, placeholder = "Ask me anything...", minHeight = 48, maxHeight = 164, onKeyDown, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize functionality
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Set CSS custom properties for min and max height
      textarea.style.setProperty("--min-height", `${minHeight}px`);
      textarea.style.setProperty("--max-height", `${maxHeight}px`);

      const adjustHeight = () => {
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
      };

      adjustHeight();
      textarea.addEventListener("input", adjustHeight);
      
      return () => textarea.removeEventListener("input", adjustHeight);
    }, [minHeight, maxHeight]);

    // Merge refs
    const mergedRef = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Enter key submission (but not Shift+Enter)
      if (e.key === "Enter" && !e.shiftKey) {
        // Check if we're in composition mode (for IME input)
        const nativeEvent = e.nativeEvent as KeyboardEvent;
        if (!nativeEvent.isComposing) {
          e.preventDefault();
          const form = e.currentTarget.closest("form");
          if (form) {
            form.requestSubmit();
          }
        }
      }
      
      onKeyDown?.(e);
    };

    return (
      <textarea
        ref={mergedRef}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent text-[#cccccc] resize-none border-0 focus:outline-none focus:ring-0",
          "placeholder:text-[#666666]",
          className
        )}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

// Toolbar container
export const PromptInputToolbar = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PromptInputToolbar.displayName = "PromptInputToolbar";

// Tools container
export const PromptInputTools = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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

// Toolbar button
interface PromptInputButtonProps extends ButtonProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export const PromptInputButton = forwardRef<HTMLButtonElement, PromptInputButtonProps>(
  ({ className, variant = "ghost", size = "sm", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "text-[#666] hover:text-[#ccc] hover:bg-[#3e3e42] transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
PromptInputButton.displayName = "PromptInputButton";

// Submit button with status
interface PromptInputSubmitProps extends ButtonProps {
  status?: "ready" | "submitted" | "streaming" | "error";
}

export const PromptInputSubmit = forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, status = "ready", variant = "default", size = "sm", disabled, children, ...props }, ref) => {
    const isLoading = status === "streaming" || status === "submitted";
    const isDisabled = disabled || isLoading;

    const getIcon = () => {
      switch (status) {
        case "streaming":
        case "submitted":
          return <Loader2 className="h-4 w-4 animate-spin" />;
        case "error":
          return <Square className="h-4 w-4" />;
        default:
          return <Send className="h-4 w-4" />;
      }
    };

    return (
      <Button
        ref={ref}
        type="submit"
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={cn(
          "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children || getIcon()}
      </Button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";