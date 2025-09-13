"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronRight, File } from "lucide-react";
import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

// Task container component
const Task = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible> & {
    defaultOpen?: boolean;
  }
>(({ className, defaultOpen = false, ...props }, ref) => (
  <Collapsible
    ref={ref}
    defaultOpen={defaultOpen}
    className={cn("rounded-lg border border-gray-700 bg-gray-800/50", className)}
    {...props}
  />
));
Task.displayName = "Task";

// Task trigger/header component
const TaskTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsibleTrigger> & {
    title: string;
    isOpen?: boolean;
  }
>(({ className, title, isOpen, ...props }, ref) => (
  <CollapsibleTrigger
    ref={ref}
    className={cn(
      "flex w-full items-center gap-2 p-3 text-left hover:bg-gray-700/50 transition-colors",
      "text-sm font-medium text-gray-200",
      className
    )}
    {...props}
  >
    <ChevronRight
      className={cn(
        "h-4 w-4 text-gray-400 transition-transform duration-200",
        isOpen && "rotate-90"
      )}
    />
    <span>{title}</span>
  </CollapsibleTrigger>
));
TaskTrigger.displayName = "TaskTrigger";

// Task content container
const TaskContent = React.forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsibleContent>
>(({ className, ...props }, ref) => (
  <CollapsibleContent
    ref={ref}
    className={cn(
      "data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
      "overflow-hidden",
      className
    )}
    {...props}
  />
));
TaskContent.displayName = "TaskContent";

// Individual task item
const TaskItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    completed?: boolean;
  }
>(({ className, children, completed = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-start gap-2 px-3 py-2 text-sm text-gray-300",
      "border-l-2 border-transparent",
      completed && "text-green-400 border-l-green-500",
      className
    )}
    {...props}
  >
    <div className={cn(
      "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
      completed ? "bg-green-500" : "bg-gray-500"
    )} />
    <div className="flex-1 leading-relaxed">{children}</div>
  </div>
));
TaskItem.displayName = "TaskItem";

// File reference badge
const TaskItemFile = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    icon?: React.ReactNode;
  }
>(({ className, children, icon, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded",
      "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      "text-xs font-mono",
      className
    )}
    {...props}
  >
    {icon || <File className="w-3 h-3" />}
    {children}
  </span>
));
TaskItemFile.displayName = "TaskItemFile";

// Enhanced Task wrapper that manages open state
const TaskWithState = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible> & {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }
>(({ title, defaultOpen = false, children, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Task
      ref={ref}
      open={isOpen}
      onOpenChange={setIsOpen}
      className={className}
      {...props}
    >
      <TaskTrigger title={title} isOpen={isOpen} />
      <TaskContent>
        <div className="px-3 pb-3 space-y-1">
          {children}
        </div>
      </TaskContent>
    </Task>
  );
});
TaskWithState.displayName = "TaskWithState";

export {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskWithState,
};