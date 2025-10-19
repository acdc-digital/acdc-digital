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

const STORAGE_KEY = 'ticker-generation-attempts';
const ATTEMPT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface GenerationAttempt {
  timestamp: number;
}

interface StoredAttempts {
  sentiment: Record<string, GenerationAttempt>;
  news: Record<string, GenerationAttempt>;
}

function loadAttempts(): StoredAttempts {
  if (typeof window === 'undefined') {
    return { sentiment: {}, news: {} };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { sentiment: {}, news: {} };
    
    const parsed = JSON.parse(stored) as StoredAttempts;
    const now = Date.now();
    
    // Filter out expired attempts
    const sentiment: Record<string, GenerationAttempt> = {};
    const news: Record<string, GenerationAttempt> = {};
    
    Object.entries(parsed.sentiment || {}).forEach(([symbol, attempt]) => {
      if (now - attempt.timestamp < ATTEMPT_EXPIRY) {
        sentiment[symbol] = attempt;
      }
    });
    
    Object.entries(parsed.news || {}).forEach(([symbol, attempt]) => {
      if (now - attempt.timestamp < ATTEMPT_EXPIRY) {
        news[symbol] = attempt;
      }
    });
    
    return { sentiment, news };
  } catch {
    return { sentiment: {}, news: {} };
  }
}

function saveAttempts(attempts: StoredAttempts) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Failed to save generation attempts:', error);
  }
}

export function TickerProvider({ children }: { children: React.ReactNode }) {
  const [selectedTicker, setSelectedTicker] = useState<SelectedTicker | null>(null);
  const [attempts, setAttempts] = useState<StoredAttempts>(loadAttempts);

  const hasAttemptedGeneration = (symbol: string, type: 'sentiment' | 'news') => {
    const attempt = attempts[type][symbol];
    if (!attempt) return false;
    
    // Check if attempt has expired
    const isExpired = Date.now() - attempt.timestamp > ATTEMPT_EXPIRY;
    return !isExpired;
  };

  const markGenerationAttempted = (symbol: string, type: 'sentiment' | 'news') => {
    const newAttempts = {
      ...attempts,
      [type]: {
        ...attempts[type],
        [symbol]: { timestamp: Date.now() },
      },
    };
    setAttempts(newAttempts);
    saveAttempts(newAttempts);
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
