"use client";

import { forwardRef, useState } from "react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ReasoningProps extends React.ComponentProps<typeof Collapsible> {
  children: React.ReactNode;
}

export const Reasoning = forwardRef<
  React.ElementRef<typeof Collapsible>,
  ReasoningProps
>(({ children, open, onOpenChange, defaultOpen = false, className, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Determine if controlled or uncontrolled
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Collapsible
      ref={ref}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn("mb-2", className)}
      {...props}
    >
      {children}
    </Collapsible>
  );
});
Reasoning.displayName = "Reasoning";

interface ReasoningTriggerProps extends React.ComponentProps<typeof CollapsibleTrigger> {
  title?: string;
  isStreaming?: boolean;
  duration?: number;
}

export const ReasoningTrigger = forwardRef<
  React.ElementRef<typeof CollapsibleTrigger>,
  ReasoningTriggerProps
>(({ title = "Thinking", isStreaming = false, duration = 0, className, children, ...props }, ref) => {
  const getDurationText = () => {
    if (isStreaming) {
      return duration > 0 ? `Thinking for ${duration}s...` : "Thinking...";
    }
    return duration > 0 ? `Thought for ${duration}s` : title;
  };

  return (
    <CollapsibleTrigger
      ref={ref}
      className={cn(
        "flex items-center gap-1 text-xs text-[#666] hover:text-[#888] transition-colors",
        "group w-fit",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <Brain className="h-3 w-3" />
          <span>{getDurationText()}</span>
          <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
        </>
      )}
    </CollapsibleTrigger>
  );
});
ReasoningTrigger.displayName = "ReasoningTrigger";

interface ReasoningContentProps extends React.ComponentProps<typeof CollapsibleContent> {
  children: string;
}

export const ReasoningContent = forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  ReasoningContentProps
>(({ children, className, ...props }, ref) => (
  <CollapsibleContent
    ref={ref}
    className={cn("mt-1 pl-4 border-l border-[#333]", className)}
    {...props}
  >
    <div className="text-xs text-[#777] leading-relaxed whitespace-pre-wrap">
      {children}
    </div>
  </CollapsibleContent>
));
ReasoningContent.displayName = "ReasoningContent";