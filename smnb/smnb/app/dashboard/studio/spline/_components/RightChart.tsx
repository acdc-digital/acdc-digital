// RIGHT CHART COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/spline/RightChart.tsx

"use client";

import React from "react";
import { SentimentIndexChart } from "@/components/charts/spline/sentiment-index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RightChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NASDAQ-100 Sentiment Index</CardTitle>
        <CardDescription>
          Aggregate sentiment score across all 100 companies
        </CardDescription>
        <p className="text-xs text-muted-foreground mt-1">
          Formula: Δ = ((P + M) / 2) - B | P=Performance, M=Momentum, B=Baseline
        </p>
      </CardHeader>
      <CardContent className="pl-2">
        <SentimentIndexChart />
      </CardContent>
    </Card>
  );
}
