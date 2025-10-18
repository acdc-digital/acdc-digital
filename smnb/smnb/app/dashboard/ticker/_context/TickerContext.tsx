"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface SelectedTicker {
  symbol: string;
  weight: number;
}

interface TickerContextType {
  selectedTicker: SelectedTicker | null;
  setSelectedTicker: (ticker: SelectedTicker | null) => void;
  hasAttemptedGeneration: (symbol: string, type: 'sentiment' | 'news') => boolean;
  markGenerationAttempted: (symbol: string, type: 'sentiment' | 'news') => void;
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

export function TickerProvider({ children }: { children: React.ReactNode }) {
  const [selectedTicker, setSelectedTicker] = useState<SelectedTicker | null>(null);
  const attemptedGenerationsRef = useRef<{ sentiment: Set<string>, news: Set<string> }>({
    sentiment: new Set(),
    news: new Set(),
  });

  const hasAttemptedGeneration = (symbol: string, type: 'sentiment' | 'news') => {
    return attemptedGenerationsRef.current[type].has(symbol);
  };

  const markGenerationAttempted = (symbol: string, type: 'sentiment' | 'news') => {
    attemptedGenerationsRef.current[type].add(symbol);
  };

  return (
    <TickerContext.Provider value={{ 
      selectedTicker, 
      setSelectedTicker,
      hasAttemptedGeneration,
      markGenerationAttempted,
    }}>
      {children}
    </TickerContext.Provider>
  );
}

export function useTickerContext() {
  const context = useContext(TickerContext);
  if (context === undefined) {
    throw new Error("useTickerContext must be used within a TickerProvider");
  }
  return context;
}
