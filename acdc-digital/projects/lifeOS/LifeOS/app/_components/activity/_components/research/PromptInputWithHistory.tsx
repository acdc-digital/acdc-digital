// RESEARCH PROMPT INPUT WITH HISTORY - Enhanced input with visual prompt history
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/research/PromptInputWithHistory.tsx

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { PromptInputModeSelect } from '@/components/ai/prompt-input';
import type { ResearchMode } from '@/components/ai/prompt-input';

interface PromptHistory {
  id: string;
  text: string;
  timestamp: number;
  isSubmitting?: boolean;
}

interface PromptInputWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  researchMode: ResearchMode;
  onModeChange: (mode: ResearchMode) => void;
  isResearching: boolean;
  className?: string;
}

export function PromptInputWithHistory({
  value,
  onChange,
  onSubmit,
  researchMode,
  onModeChange,
  isResearching,
  className = ''
}: PromptInputWithHistoryProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value.trim() || isResearching) return;

    // Create new history entry with submitting state
    const newHistoryItem: PromptHistory = {
      id: Date.now().toString(),
      text: value.trim(),
      timestamp: Date.now(),
      isSubmitting: true
    };

    // Add to history immediately with submitting state
    setPromptHistory(prev => [newHistoryItem, ...prev]);

    // Call the onSubmit callback
    onSubmit(value.trim());

    // Clear the current input
    onChange('');

    // After a short delay, update the history item to remove submitting state
    setTimeout(() => {
      setPromptHistory(prev => 
        prev.map(item => 
          item.id === newHistoryItem.id 
            ? { ...item, isSubmitting: false }
            : item
        )
      );
    }, 500);

    // Focus back to textarea
    textareaRef.current?.focus();
  }, [value, isResearching, onSubmit, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-4 h-[344px] flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#858585]">Research Prompt</span>
        <div className="flex items-center gap-2">
          <PromptInputModeSelect 
            value={researchMode}
            onValueChange={onModeChange}
          />
        </div>
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to research?"
          className="w-full h-24 bg-transparent border-none outline-none text-[#cccccc] text-sm resize-none placeholder:text-[#6a6a6a] mb-0"
          autoFocus
        />
        
        {/* Prompt History - Directly below input */}
        {promptHistory.length > 0 && (
          <div className="flex-1 space-y-1 overflow-y-auto max-h-48 mb-3 -mt-14">
            {promptHistory.map((prompt, index) => (
              <div
                key={prompt.id}
                className={`
                  text-xs px-2 py-1 rounded border transition-all duration-300 ease-in-out
                  ${prompt.isSubmitting 
                    ? 'text-[#cccccc] bg-[#252526] border-[#3c3c3c] opacity-80 transform -translate-y-0.5' 
                    : 'text-[#888888] bg-[#1a1a1a] border-[#2d2d2d] opacity-60 italic transform translate-y-0'
                  }
                  ${index === 0 && !prompt.isSubmitting ? 'animate-pulse' : ''}
                `}
              >
                {prompt.isSubmitting && (
                  <div className="inline-flex items-center gap-1 mr-1">
                    <div className="w-2 h-2 border border-[#cccccc] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <span className="text-[10px] text-[#666666] mr-1">
                  {new Date(prompt.timestamp).toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {prompt.text}
              </div>
            ))}
          </div>
        )}
      </form>
      
      {/* Full-width separator */}
      <div className="border-t border-[#3c3c3c] -mx-4"></div>
      
      {/* Compact footer row */}
      <div className="flex items-center justify-between pt-2 -mx-4 px-4">
        <span className="text-xs text-[#6a6a6a]">Cmd+Enter to research</span>
        <button
          type="submit"
          disabled={!value.trim() || isResearching}
          onClick={handleSubmit}
          className="flex items-center gap-2 h-6 px-2 bg-[#252526] border border-[#3c3c3c] rounded text-[#cccccc] hover:bg-[#3c3c3c] font-['SF_Pro_Text'] text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResearching ? (
            <>
              <div className="w-3 h-3 border border-[#cccccc] border-t-transparent rounded-full animate-spin"></div>
              Researching...
            </>
          ) : (
            'Research'
          )}
        </button>
      </div>
    </div>
  );
}
