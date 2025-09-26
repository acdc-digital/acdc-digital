// TERMINAL COMPONENT - Right side collapsible terminal for Soloist dashboard
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Terminal/Terminal.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Terminal as TerminalIcon, X, Minimize2, SquareArrowRight, ArrowRight, ArrowLeft, Notebook, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Resizer } from './Resizer';
import { DailyJournal } from './_components/DailyJournal';

interface TerminalProps {
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  selectedDate?: string | null;
}

export function Terminal({ isExpanded: controlledExpanded, onToggle, selectedDate }: TerminalProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [terminalWidth, setTerminalWidth] = useState(400); // Default width when expanded
  const [maxWidth, setMaxWidth] = useState(800);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // Debug logging
  React.useEffect(() => {
    console.log('Terminal rendered with isExpanded:', isExpanded, 'selectedDate:', selectedDate);
  }, [isExpanded, selectedDate]);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    if (onToggle) {
      onToggle(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  const handleResize = (newWidth: number) => {
    setTerminalWidth(newWidth);
  };

  useEffect(() => {
    const updateMaxWidth = () => {
      setMaxWidth(Math.floor(window.innerWidth * 0.5));
    };
    
    updateMaxWidth();
    window.addEventListener('resize', updateMaxWidth);
    
    return () => window.removeEventListener('resize', updateMaxWidth);
  }, []);

  if (!isExpanded) {
    return (
      <div className="w-10 bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col">
        <button
          onClick={toggleExpanded}
          className="w-full h-9 rounded-none text-[#FBB041] hover:text-[#F8D194] cursor-pointer flex items-center justify-center"
          title="Open Terminal"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col relative"
      style={{ width: `${terminalWidth}px` }}
    >
      {/* Resizer Handle */}
      <Resizer 
        onResize={handleResize}
        minWidth={350}
        maxWidth={maxWidth}
      />

      {/* Terminal Header */}
      <div className="h-[35px] bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-2">
        <Notebook className="w-4 h-4 text-[#008080] mr-2" />
        <span className="text-sm text-[#cccccc] font-medium font-rubik uppercase tracking-wider flex-1">
          Daily Journal
        </span>
        <button
          onClick={() => toggleExpanded()}
          className="w-4 h-4 text-[#FBB041] hover:text-[#F8D194] cursor-pointer"
          title="Minimize Terminal"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Journal Content */}
      <div className="flex-1 overflow-hidden">
        <DailyJournal 
          selectedDate={selectedDate || undefined}
          onSave={(entry) => {
            console.log('Saving journal entry:', entry);
            // TODO: Implement save functionality with Convex
          }}
          onCancel={() => {
            if (onToggle) {
              onToggle(false);
            } else {
              setInternalExpanded(false);
            }
          }}
        />
      </div>
    </div>
  );
}