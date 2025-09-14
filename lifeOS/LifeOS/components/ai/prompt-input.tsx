// RESEARCH PROMPT INPUT - Auto-resizing textarea with toolbar for research queries
// /Users/matthewsimon/Projects/LifeOS/LifeOS/components/ai/prompt-input.tsx

'use client';

import React, { 
  forwardRef, 
  useRef, 
  useEffect, 
  useCallback,
  useImperativeHandle,
  ComponentProps,
  FormEventHandler,
  HTMLAttributes,
  useState
} from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles, FileText, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export type ResearchStatus = 'ready' | 'submitted' | 'streaming' | 'error';
export type ResearchMode = 'comprehensive' | 'quick' | 'deep-dive' | 'trend-analysis';

interface PromptInputProps extends HTMLAttributes<HTMLFormElement> {
  onSubmit: FormEventHandler<HTMLFormElement>;
}

interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: ResearchStatus;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

interface PromptInputModeSelectProps {
  value?: ResearchMode;
  onValueChange?: (value: ResearchMode) => void;
  className?: string;
}

// Research modes configuration
export const researchModes: Array<{ id: ResearchMode; name: string; icon: React.ReactNode; description: string }> = [
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    icon: <Globe className="w-4 h-4" />,
    description: 'Deep research across multiple sources'
  },
  {
    id: 'quick',
    name: 'Quick',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Fast overview and key insights'
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive',
    icon: <FileText className="w-4 h-4" />,
    description: 'Thorough analysis with detailed citations'
  },
  {
    id: 'trend-analysis',
    name: 'Trends',
    icon: <Send className="w-4 h-4" />,
    description: 'Current trends and market analysis'
  }
];

// Main form container
export const PromptInput = forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, onSubmit, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn(
          "flex flex-col gap-3 p-4 bg-[#252526] border border-[#3c3c3c] rounded-lg h-full",
          className
        )}
        {...props}
      />
    );
  }
);

PromptInput.displayName = "PromptInput";

// Auto-resizing textarea
export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, minHeight = 48, maxHeight = 164, onKeyDown, value, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useImperativeHandle(ref, () => textareaRef.current!, []);

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // Reset height to auto to get accurate scrollHeight
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [minHeight, maxHeight]);

    useEffect(() => {
      adjustHeight();
    }, [adjustHeight, value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to submit, Shift+Enter for new line
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
      
      onKeyDown?.(e);
    };

    const handleInput = () => {
      adjustHeight();
    };

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "min-h-[48px] resize-none bg-transparent border-none p-0 text-[#cccccc] placeholder:text-[#6a6a6a] focus:ring-0 focus:outline-none font-['SF_Pro_Text'] text-base leading-relaxed w-full flex-1",
          className
        )}
        data-min-height={minHeight}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        value={value}
        {...props}
      />
    );
  }
);

PromptInputTextarea.displayName = "PromptInputTextarea";

// Toolbar container
export const PromptInputToolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-3 pt-3 border-t border-[#3c3c3c]",
          className
        )}
        {...props}
      />
    );
  }
);

PromptInputToolbar.displayName = "PromptInputToolbar";

// Tools container (left side of toolbar)
export const PromptInputTools = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      />
    );
  }
);

PromptInputTools.displayName = "PromptInputTools";

// Tool button
export const PromptInputButton = forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>(
  ({ className, variant = "ghost", size, children, ...props }, ref) => {
    // Auto-determine size based on content
    const hasText = React.Children.toArray(children).some(child => 
      typeof child === 'string' || 
      (React.isValidElement(child) && child.type === 'span')
    );
    
    const buttonSize = size || (hasText ? "sm" : "icon");
    
    return (
      <Button
        ref={ref}
        variant={variant}
        size={buttonSize}
        className={cn(
          "text-[#cccccc] hover:text-white hover:bg-[#3c3c3c] font-['SF_Pro_Text']",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

PromptInputButton.displayName = "PromptInputButton";

// Submit button with status indicators
export const PromptInputSubmit = forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, status = 'ready', variant = "default", size = "sm", disabled, children, ...props }, ref) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'streaming':
          return <Loader2 className="w-4 h-4 animate-spin" />;
        case 'submitted':
          return <Loader2 className="w-4 h-4 animate-spin" />;
        case 'error':
          return <Send className="w-4 h-4" />;
        default:
          return <Send className="w-4 h-4" />;
      }
    };

    const isLoading = status === 'streaming' || status === 'submitted';

    return (
      <Button
        ref={ref}
        type="submit"
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        className={cn(
          "bg-[#007acc] hover:bg-[#005a9e] text-white font-['SF_Pro_Text'] font-medium px-4",
          status === 'error' && "bg-red-600 hover:bg-red-700",
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">
          {getStatusIcon()}
          {children || 'Research'}
        </span>
      </Button>
    );
  }
);

PromptInputSubmit.displayName = "PromptInputSubmit";

// Simple Research Mode Select (without Radix dependency)
export const PromptInputModeSelect = forwardRef<HTMLButtonElement, PromptInputModeSelectProps>(
  ({ className, value, onValueChange }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedMode = researchModes.find(mode => mode.id === value) || researchModes[0];

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 h-8 px-3 bg-transparent border border-[#3c3c3c] rounded text-[#cccccc] hover:bg-[#3c3c3c] font-['SF_Pro_Text'] text-sm transition-colors",
            className
          )}
        >
          {selectedMode.icon}
          <span>{selectedMode.name}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-1 bg-[#252526] border border-[#3c3c3c] rounded-md shadow-lg z-10 min-w-[180px]">
            {researchModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  onValueChange?.(mode.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-['SF_Pro_Text'] hover:bg-[#3c3c3c] transition-colors",
                  value === mode.id ? "text-[#007acc] bg-[#3c3c3c]" : "text-[#cccccc]"
                )}
              >
                {mode.icon}
                <div>
                  <div className="font-medium">{mode.name}</div>
                  <div className="text-xs text-[#858585]">{mode.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PromptInputModeSelect.displayName = "PromptInputModeSelect";
