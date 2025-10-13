"use client";

import { useEffect, useState } from "react";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
}

// Global flag to track if ticker has been initialized (survives hot reloads)
let globalTickerInitialized = false;

export function useTickerPrices(pollInterval = 5000) {
  const [prices, setPrices] = useState<StockPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the ticker updates only once globally
    if (!globalTickerInitialized) {
      globalTickerInitialized = true;
      fetch("/api/ticker/init", { method: "POST" })
        .then((res) => res.json())
        .then((data) => console.log("[Ticker] Initialized:", data))
        .catch((err) => console.error("[Ticker] Init failed:", err));
    }

    // Fetch prices immediately
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/ticker/prices");
        const data = await res.json();
        
        if (data.success) {
          setPrices(data.data);
          setError(null);
        } else {
          setError("Failed to fetch prices");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();

    // Poll for updates
    const interval = setInterval(fetchPrices, pollInterval);

    return () => {
      clearInterval(interval);
    };
  }, [pollInterval]);

  return { prices, isLoading, error };
}
