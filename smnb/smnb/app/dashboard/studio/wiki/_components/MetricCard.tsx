'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  name: string;
  value: number;
  formula: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  example?: string;
}

export default function MetricCard({
  name,
  value,
  formula,
  description,
  trend = 'stable',
  example
}: MetricCardProps) {
  const getValueColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10';
    if (score >= 40) return 'text-orange-400 bg-orange-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={cn("text-2xl font-bold px-3 py-1 rounded-lg", getValueColor(value))}>
            {value}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">{description}</p>
      
      <div className="bg-black/30 rounded-md p-3 mb-3">
        <code className="text-xs text-gray-400">{formula}</code>
      </div>
      
      {example && (
        <div className="text-xs text-gray-500 italic">
          Example: {example}
        </div>
      )}
    </div>
  );
}