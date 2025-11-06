// WAYPOINTS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/waypoints/page.tsx

"use client";

import React from "react";

import { BaselineSelfAnalysisForm } from "./_components/BaselineSelfAnalysisForm";

export default function WaypointsPage() {
  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <BaselineSelfAnalysisForm />
        </div>
      </div>
    </div>
  );
}
