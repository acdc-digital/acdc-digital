// DASHBOARD PAGE - Main dashboard for Soloist application
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/page.tsx

"use client";

import React from 'react';
import Heatmap from '@/app/dashboard/_components/Editor/_components/heatmap/Heatmap';
import TestButton from '@/app/dashboard/_components/Editor/_components/heatmap/TestButton';

export default function DashboardPage() {
  const handleDateSelect = (date: string) => {
    // TODO: Pass selectedDate to persistent Terminal through context or prop drilling
    console.log('Date selected:', date);
  };

  return (
    <div className="h-full overflow-hidden p-4">
      {/* Welcome Section */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-light  text-[#cccccc] mb-2 font-dm-sans">
          Take control of tomorrow, today.
        </h1>
        {/* Test Button for Demo Data */}
        <TestButton />
      </div>

      {/* Heatmap Component */}
      <div className="flex-1 min-h-0">
        <Heatmap onSelectDate={handleDateSelect} />
      </div>
    </div>
  );
}
