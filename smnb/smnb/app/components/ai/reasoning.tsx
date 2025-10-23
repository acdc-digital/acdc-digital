// REASONING COMPONENT
// Collapsible AI thinking process display
// Based on AI Elements design pattern

"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTO_CLOSE_DELAY = 1000; // 1 second after streaming stops

// ============================================================================
// REASONING (Main Container)
// ============================================================================

export interface ReasoningProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  /**
   * Auto-opens when true, auto-closes when false (with delay)
   */
  isStreaming?: boolean;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Initial open state (uncontrolled)
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Controlled duration in seconds
   */
  duration?: number;
}

export const Reasoning = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  ReasoningProps
>(
  (
    {
      isStreaming = false,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      duration: controlledDuration,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const [startTime, setStartTime] = React.useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = React.useState(0);
    const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    // Auto-open/close behavior based on streaming state
    React.useEffect(() => {
      if (isStreaming) {
        // Start streaming - open and start timer
        if (!isControlled) {
          setUncontrolledOpen(true);
        }
        onOpenChange?.(true);
        
        if (!startTime) {
          setStartTime(Date.now());
        }

        // Clear any pending auto-close
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      } else if (startTime) {
        // Streaming stopped - calculate final duration and schedule auto-close
        const finalElapsed = Math.round((Date.now() - startTime) / 1000);
        setElapsedTime(finalElapsed);

        closeTimeoutRef.current = setTimeout(() => {
          if (!isControlled) {
            setUncontrolledOpen(false);
          }
          onOpenChange?.(false);
        }, AUTO_CLOSE_DELAY);
      }

      return () => {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      };
    }, [isStreaming, startTime, isControlled, onOpenChange]);

    // Update elapsed time while streaming
    React.useEffect(() => {
      if (!isStreaming || !startTime) return;

      const interval = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }, [isStreaming, startTime]);

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange]
    );

    const duration = controlledDuration ?? elapsedTime;

    return (
      <ReasoningContext.Provider value={{ isStreaming, duration }}>
        <CollapsiblePrimitive.Root
          ref={ref}
          open={open}
          onOpenChange={handleOpenChange}
          className={cn("group", className)}
          {...props}
        >
          {children}
        </CollapsiblePrimitive.Root>
      </ReasoningContext.Provider>
    );
  }
);
Reasoning.displayName = "Reasoning";

// ============================================================================
// REASONING CONTEXT
// ============================================================================

interface ReasoningContextValue {
  isStreaming: boolean;
  duration: number;
}

const ReasoningContext = React.createContext<ReasoningContextValue>({
  isStreaming: false,
  duration: 0,
});

const useReasoningContext = () => React.useContext(ReasoningContext);

// ============================================================================
// REASONING TRIGGER
// ============================================================================

export interface ReasoningTriggerProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.Trigger
  > {
  /**
   * Custom title for thinking state
   */
  title?: string;
}

export const ReasoningTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ReasoningTriggerProps
>(({ title = "Reasoning", className, children, ...props }, ref) => {
  const { isStreaming, duration } = useReasoningContext();

  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex items-center justify-between w-full px-3 py-2 text-sm",
        "rounded-lg border border-neutral-700 bg-neutral-800/50",
        "hover:bg-neutral-800 hover:border-neutral-600",
        "transition-colors duration-200",
        "group/trigger",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <div className="flex items-center gap-2">
            <Brain className={cn(
              "w-4 h-4 text-purple-400 transition-transform",
              isStreaming && "animate-pulse"
            )} />
            <span className="font-medium text-neutral-200">
              {isStreaming ? "Thinking..." : title}
            </span>
            {!isStreaming && duration > 0 && (
              <span className="text-xs text-neutral-500">
                • Thought for {duration}s
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-400 transition-transform duration-200 group-data-[state=closed]/trigger:rotate-[-90deg]" />
        </>
      )}
    </CollapsiblePrimitive.Trigger>
  );
});
ReasoningTrigger.displayName = "ReasoningTrigger";

// ============================================================================
// REASONING CONTENT
// ============================================================================

export interface ReasoningContentProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.Content
  > {
  children: string | React.ReactNode;
}

export const ReasoningContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  ReasoningContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden",
        "data-[state=open]:animate-collapsible-down",
        "data-[state=closed]:animate-collapsible-up"
      )}
      {...props}
    >
      <div
        className={cn(
          "mt-2 px-3 py-2.5 rounded-lg",
          "bg-neutral-900/50 border border-neutral-700",
          "text-sm text-neutral-300 leading-relaxed",
          "max-h-[300px] overflow-y-auto",
          "prose prose-sm prose-invert max-w-none",
          className
        )}
      >
        {typeof children === "string" ? (
          <p className="whitespace-pre-wrap m-0">{children}</p>
        ) : (
          children
        )}
      </div>
    </CollapsiblePrimitive.Content>
  );
});
ReasoningContent.displayName = "ReasoningContent";
