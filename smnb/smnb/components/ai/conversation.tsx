/**
 * AI Conversation Components
 * 
 * Auto-scrolling chat container with stick-to-bottom behavior.
 * Built for the Nexus Session Manager with TypeScript and shadcn/ui.
 * 
 * Features:
 * - Automatic scroll-to-bottom during streaming
 * - Scroll button when scrolled up
 * - Maintains position while reading history
 * - Smooth animations with configurable behavior
 * - ARIA roles for accessibility
 * - Resize handling without jumps
 */

"use client";

import { ComponentProps, ReactNode } from "react";
import { StickToBottom, type StickToBottomContext, useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Conversation - Main container with scroll behavior
// ============================================================================

export interface ConversationProps extends Omit<ComponentProps<typeof StickToBottom>, 'children'> {
  /**
   * Initial scroll behavior when component mounts
   * @default "smooth"
   */
  initial?: ScrollBehavior;
  
  /**
   * Scroll behavior when container resizes
   * @default "smooth"
   */
  resize?: ScrollBehavior;
  
  /**
   * Children can be ReactNode or a render function receiving context
   */
  children: ReactNode | ((context: StickToBottomContext) => ReactNode);
}

/**
 * Main conversation container with automatic scroll-to-bottom behavior.
 * 
 * @example
 * ```tsx
 * <Conversation className="relative w-full" style={{ height: "500px" }}>
 *   <ConversationContent>
 *     {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *   </ConversationContent>
 *   <ConversationScrollButton />
 * </Conversation>
 * ```
 */
export function Conversation({ 
  initial = "smooth", 
  resize = "smooth", 
  className, 
  children, 
  ...props 
}: ConversationProps) {
  return (
    <StickToBottom
      className={cn("relative h-full overflow-hidden", className)}
      initial={initial}
      resize={resize}
      {...props}
    >
      {children}
    </StickToBottom>
  );
}

Conversation.displayName = "Conversation";

// ============================================================================
// ConversationContent - Content wrapper with consistent spacing
// ============================================================================

export interface ConversationContentProps extends Omit<ComponentProps<typeof StickToBottom.Content>, 'children'> {
  /**
   * Padding size for the content area
   * @default "default"
   */
  paddingSize?: "none" | "sm" | "default" | "lg";
  
  /**
   * Children can be ReactNode or a render function receiving context
   */
  children: ReactNode | ((context: StickToBottomContext) => ReactNode);
}

/**
 * Content wrapper for conversation messages with consistent spacing.
 * Includes ARIA role for accessibility.
 * 
 * @example
 * ```tsx
 * <ConversationContent paddingSize="lg">
 *   {messages.map(msg => <Message key={msg.id} {...msg} />)}
 * </ConversationContent>
 * ```
 */
export function ConversationContent({ 
  paddingSize = "default", 
  className, 
  children, 
  ...props 
}: ConversationContentProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <StickToBottom.Content
      role="log"
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        "flex flex-col space-y-6",
        paddingClasses[paddingSize],
        className
      )}
      {...props}
    >
      {children}
    </StickToBottom.Content>
  );
}

ConversationContent.displayName = "ConversationContent";

// ============================================================================
// ConversationScrollButton - Floating scroll-to-bottom button
// ============================================================================

export interface ConversationScrollButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  /**
   * Custom label for the button (for accessibility)
   * @default "Scroll to bottom"
   */
  label?: string;
  
  /**
   * Show message count badge when scrolled up
   * @default false
   */
  showBadge?: boolean;
  
  /**
   * Number of new messages (for badge display)
   */
  newMessageCount?: number;
}

/**
 * Floating button to scroll to bottom of conversation.
 * Automatically shows/hides based on scroll position.
 * Must be used inside a <Conversation> component.
 * 
 * @example
 * ```tsx
 * <ConversationScrollButton 
 *   label="Back to latest" 
 *   showBadge={true}
 *   newMessageCount={3}
 * />
 * ```
 */
export function ConversationScrollButton({ 
  label = "Scroll to bottom", 
  showBadge = false, 
  newMessageCount = 0, 
  className, 
  ...props 
}: ConversationScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  
  if (isAtBottom) {
    return null;
  }
  
  return (
    <Button
      onClick={() => scrollToBottom()}
      variant="outline"
      size="icon"
      className={cn(
        "absolute bottom-4 right-4 z-10 rounded-full shadow-lg",
        "bg-background/95 backdrop-blur-sm border-2",
        "hover:bg-accent hover:scale-110 transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={label}
      {...props}
    >
      <ArrowDown className="h-4 w-4" />
      {showBadge && newMessageCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cyan-400 text-black text-xs font-semibold flex items-center justify-center">
          {newMessageCount > 9 ? "9+" : newMessageCount}
        </span>
      )}
    </Button>
  );
}

ConversationScrollButton.displayName = "ConversationScrollButton";

// ============================================================================
// Utility Hook - Access scroll state programmatically
// ============================================================================

/**
 * Hook to access conversation scroll state and controls.
 * Must be used inside a <Conversation> component.
 * 
 * @example
 * ```tsx
 * const { isAtBottom, scrollToBottom } = useConversation();
 * 
 * useEffect(() => {
 *   if (newMessage) {
 *     scrollToBottom();
 *   }
 * }, [newMessage]);
 * ```
 */
export { useStickToBottomContext as useConversation } from "use-stick-to-bottom";
