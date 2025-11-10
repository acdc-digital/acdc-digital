"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type ViewType = "dashboard" | "soloist" | "testing" | "waypoints";

interface ViewContainerProps {
  view: ViewType;
  currentView: ViewType;
  children: React.ReactNode;
  className?: string;
}

/**
 * ViewContainer component that keeps all views mounted and uses CSS to show/hide them.
 * This prevents state loss when switching between views.
 * 
 * Based on SMNB's keep-mounted pattern from /smnb/app/dashboard/layout.tsx
 */
export function ViewContainer({
  view,
  currentView,
  children,
  className,
}: ViewContainerProps) {
  const isActive = view === currentView;

  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 right-0 left-14 flex flex-col bg-zinc-50 dark:bg-zinc-900",
        !isActive && "hidden",
        className
      )}
      data-view={view}
      data-active={isActive}
    >
      {children}
    </div>
  );
}

/**
 * ViewsWrapper component that contains all keep-mounted views.
 * Should be used as the parent container for all views.
 */
interface ViewsWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ViewsWrapper({ children, className }: ViewsWrapperProps) {
  return (
    <div className={cn("relative flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
}
