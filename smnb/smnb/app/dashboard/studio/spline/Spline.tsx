// SPLINE CHART PAGE
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/spline/Spline.tsx

"use client";

import React from "react";
import { LeftChart } from "./_components/LeftChart";
import { RightChart } from "./_components/RightChart";

export default function Spline() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Content */}
      <div className="flex-1 p-8">
        {/* Dual Chart Layout */}
        <div className="grid grid-cols-2 gap-4 h-full">
          <LeftChart />
          <RightChart />
        </div>
      </div>
    </div>
  );
}
