"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface DailySentimentProps {
  className?: string;
}

export function DailySentiment({ className = "" }: DailySentimentProps) {
  const sentiment = useQuery(api.stats.dailySentiment.getDailySentiment);

  if (!sentiment) {
    return (
      <span className={className}>
        Sentiment: <span className="text-foreground/30">--</span>
      </span>
    );
  }

  const getDirectionIcon = () => {
    switch (sentiment.direction) {
      case "up":
        return <ArrowUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      case "neutral":
        return <Minus className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getScoreColor = () => {
    if (sentiment.meanScore >= 70) return "text-green-500";
    if (sentiment.meanScore >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <span className={className}>
      Sentiment:{" "}
      <span className={`font-mono ${getScoreColor()}`}>
        {sentiment.meanScore.toFixed(1)}
      </span>
      <span className="inline-flex items-center ml-1">
        {getDirectionIcon()}
      </span>
    </span>
  );
}
