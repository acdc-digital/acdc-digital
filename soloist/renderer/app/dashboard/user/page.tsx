// USER PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/user/page.tsx

"use client";

import React from "react";

export default function UserPage() {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f9f9f9] dark:bg-neutral-900">
      {/* Header */}
      <div className="flex-shrink-0 px-5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-600">
        <div className="pb-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {/* Solo Dot */}
              <div className="mt-1 w-7 h-7 rounded-full bg-[#3B82F6] flex items-center justify-center pr-2.5 pb-2">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  Your Profile
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0">
                  Manage your account and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        <div className="text-neutral-500 dark:text-neutral-400">
          User profile page content will be added here.
        </div>
      </div>
    </div>
  );
}
