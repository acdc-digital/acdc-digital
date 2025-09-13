"use client";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Actions = forwardRef<HTMLDivElement, ActionsProps>(
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

Actions.displayName = "Actions";

export const Action = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "ghost", size = "sm", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "h-8 w-8 p-0 text-[#666] hover:text-[#ccc] hover:bg-[#3e3e42] transition-colors",
          "focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-[#1e1e1e]",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

Action.displayName = "Action";