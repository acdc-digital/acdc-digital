// SPLINE CHART PAGE
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/spline/Spline.tsx

"use client";

import React from "react";
import { MultipleLineChart } from "@/components/charts/spline/spline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Spline() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-sm font-medium text-foreground">Multiple Line Chart</h1>
        <div className="text-xs text-muted-foreground">
          Compare multiple data series with overlapping line charts
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Chart Card */}
          <Card>
            <CardHeader>
              <CardTitle>Desktop vs Mobile Performance</CardTitle>
              <CardDescription>
                Displaying multiple metrics with smooth monotone interpolation
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <MultipleLineChart />
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Multiple data series</strong> displaying desktop and mobile metrics simultaneously
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Overlapping visualization</strong> with distinct colors for easy comparison
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Monotone interpolation</strong> creating smooth curves for both lines
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Interactive tooltips</strong> showing all series values at each data point
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Platform comparison</strong> - Compare desktop vs mobile performance metrics
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Multi-metric dashboards</strong> - Display related KPIs on the same timeline
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>A/B testing results</strong> - Visualize control vs variant performance over time
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Competitive analysis</strong> - Compare multiple products or services simultaneously
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Implementation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Data structure requires month field plus numeric values for each series</p>
              <p>• Chart automatically handles multiple Line components with different dataKeys</p>
              <p>• Colors are assigned using CSS variables (--chart-1, --chart-2, etc.)</p>
              <p>• Tooltip displays all series values when hovering over data points</p>
              <p>• Best suited for comparing 2-4 related data series on same scale</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
