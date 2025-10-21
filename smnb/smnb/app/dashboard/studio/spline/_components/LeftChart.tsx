// LEFT CHART COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/spline/LeftChart.tsx

"use client";

import React from "react";
import { MultipleLineChart } from "@/components/charts/spline/spline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LeftChart() {
  return (
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
  );
}
