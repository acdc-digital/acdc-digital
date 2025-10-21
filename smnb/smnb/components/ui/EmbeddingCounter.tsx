// EMBEDDING COUNTER COMPONENT
// /Users/matthewsimon/Projects/SMNB/smnb/components/ui/EmbeddingCounter.tsx

/**
 * Compact embedding counter for dashboard footer
 * Displays total embeddings stored in the vector database
 */

'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface EmbeddingCounterProps {
  className?: string;
}

export function EmbeddingCounter({ className = '' }: EmbeddingCounterProps) {
  const embeddingStats = useQuery(api.nexus.embeddings.getTotalEmbeddingCount);

  // Format large numbers with K/M suffixes
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  if (!embeddingStats) {
    return (
      <div className={`flex items-center gap-2 text-xs text-foreground/40 ${className}`}>
        <span>Embeddings: —</span>
      </div>
    );
  }

  const { total, chat, document } = embeddingStats;

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <span className="text-foreground/60">Vectors:</span>
      <span className="text-foreground/80 font-medium">
        {formatNumber(total)}
      </span>
      {(chat > 0 || document > 0) && (
        <>
          <span className="text-foreground/50 text-xs">
            ({formatNumber(chat)}
            <span className="text-foreground/40">/</span>
            {formatNumber(document)})
          </span>
        </>
      )}
    </div>
  );
}

export default EmbeddingCounter;
