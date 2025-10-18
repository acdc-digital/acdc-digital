"use client";

import React from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface TickerProps {
  children: React.ReactNode;
  className?: string;
}

interface TickerIconProps {
  src?: string;
  symbol: string;
  className?: string;
}

interface TickerSymbolProps {
  symbol: string;
  weight?: number; // Percentage weight in the index (0-100)
  className?: string;
}

interface TickerPriceProps {
  price: number;
  currency?: string;
  locale?: string;
  className?: string;
}

interface TickerPriceChangeProps {
  change: number;
  showPercent?: boolean;
  locale?: string;
  className?: string;
}

export function Ticker({ children, className = "" }: TickerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

export function TickerIcon({ src, symbol, className = "" }: TickerIconProps) {
  const [hasError, setHasError] = React.useState(false);

  // If no src or error occurred, show symbol fallback
  if (!src || hasError) {
    return (
      <div className={`w-6 h-6 rounded-full bg-[#252526] border border-[#2d2d2d] flex items-center justify-center ${className}`}>
        <span className="font-sans text-[10px] font-semibold text-[#858585]">
          {symbol.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`w-6 h-6 p-1.25 border rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      <Image
        src={src}
        alt={symbol}
        width={24}
        height={24}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function TickerSymbol({ symbol, weight, className = "" }: TickerSymbolProps) {
  return (
    <span className={`font-sans text-xs text-[#cccccc] ${className}`}>
      <span className="font-semibold">{symbol}</span>
      {weight !== undefined && <span className="font-thin"> {weight.toFixed(1)}%</span>}
    </span>
  );
}

export function TickerPrice({ 
  price, 
  currency = "USD", 
  locale = "en-US",
  className = "" 
}: TickerPriceProps) {
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <span className={`font-sans text-xs text-[#cccccc] ${className}`}>
      {formattedPrice}
    </span>
  );
}

export function TickerPriceChange({ 
  change, 
  showPercent = false,
  locale = "en-US",
  className = "" 
}: TickerPriceChangeProps) {
  const isPositive = change >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500";
  
  const formattedChange = showPercent
    ? `${isPositive ? "+" : ""}${change.toFixed(2)}%`
    : new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: "always",
      }).format(change);

  return (
    <span className={`font-sans text-xs font-medium ${colorClass} ${className}`}>
      {formattedChange}
    </span>
  );
}

export function TickerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon skeleton */}
      <Skeleton className="w-6 h-6 rounded-full" />
      
      <div className="flex-1 flex items-center justify-between min-w-0">
        {/* Symbol skeleton */}
        <Skeleton className="h-3 w-12" />
        
        <div className="flex items-center gap-2 ml-2">
          {/* Price skeleton */}
          <Skeleton className="h-3 w-16" />
          {/* Change skeleton */}
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
