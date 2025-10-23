// AI SUGGESTION COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/components/ai/suggestion.tsx

/**
 * AI Suggestion Component
 *
 * Suggestion chips like ChatGPT's follow-up prompts.
 * Scrollable React pills for guiding conversations.
 */

'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';

// Suggestions Container
export interface SuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Suggestions({ className, children, ...props }: SuggestionsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-2 scrollbar-hide",
        "snap-x snap-mandatory scroll-smooth",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Individual Suggestion Button
export interface SuggestionProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  suggestion: string;
  onClick?: (suggestion: string) => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  children?: React.ReactNode;
}

export function Suggestion({
  suggestion,
  onClick,
  variant = 'outline',
  size = 'sm',
  className,
  children,
  ...props
}: SuggestionProps) {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "flex-shrink-0 snap-start whitespace-nowrap rounded-full",
        "transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
}

export default Suggestion;
