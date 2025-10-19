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
              <CardTitle>MNQ=F - Last 24 Hours</CardTitle>
              <CardDescription>
                Real-time hourly ticker data with live updates from Convex
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-1">
                Trading Hours: Sunday 6:00 PM - Friday 5:00 PM ET (23 hours/day, 5 days/week)
              </p>
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
                    <strong>24-hour rolling window</strong> displaying the last 24 hours of hourly ticker data
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Real-time updates</strong> from Convex database with automatic refresh
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Monotone interpolation</strong> creating smooth curves between data points
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Interactive tooltips</strong> showing exact timestamp and price at each hour
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
                    <strong>Intraday trading</strong> - Track hourly price movements for day trading decisions
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Price trend analysis</strong> - Identify short-term patterns in ticker movement
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Volatility monitoring</strong> - See recent price swings hour by hour
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <strong>Live market tracking</strong> - Stay updated with the latest hourly data points
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
              <p>• Data fetched from Convex historical_chart_data table with 1-hour intervals</p>
              <p>• Chart displays hours 1-24, where hour 24 is the most recent hour</p>
              <p>• Automatically updates when new hourly data becomes available</p>
              <p>• Uses closing price for each hour to show accurate price movements</p>
              <p>• Empty state displayed when no data is available for the time period</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
