"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Settings2 } from "lucide-react";

export function DailyLogCard() {
  return (
    <Card className="w-full h-[500px] bg-zinc-900 border-zinc-800 rounded-xl shadow-md flex flex-col justify-between">
      <div>
        {/* Header */}
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-sm text-zinc-300 font-medium">
              Daily Log Form
            </CardTitle>
            <span className="text-xs text-zinc-500">Oct 28, 2025</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-col w-full">
              <label className="text-[11px] text-zinc-400 mb-1 mt-1">Template:</label>
              <button className="flex items-center justify-between w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-left text-[13px] text-zinc-200">
                A New Beginning.
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Sliders */}
        <CardContent className="px-4 space-y-4 pb-2">
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-2 m-2">
              <span>Personal Life •</span>
              <span className="text-zinc-300 font-medium">5/10</span>
            </div>
            <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>Work-Life Balance •</span>
              <span className="text-zinc-300 font-medium">5/10</span>
            </div>
            <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
            </div>
          </div>

          {/* Reflections */}
          <div className="mt-5 border border-zinc-800 rounded-lg p-3">
            <div className="flex justify-between items-center text-[11px] text-zinc-500 mb-2">
              <span>QUICK REFLECTIONS</span>
              <span className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded-md text-[10px]">
                3 items
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-1">Today&apos;s highlight</p>
            <div className="rounded-md bg-zinc-800 px-2 py-2 text-[12px] text-zinc-500 border border-zinc-700">
              A small win you experienced...
            </div>
          </div>
        </CardContent>
      </div>

      {/* Footer */}
      <CardFooter className="flex justify-between px-4 pb-4">
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-4 text-[12px] font-medium rounded-md pointer-events-none">
          Update Log
        </Button>
        <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200 h-8 text-[12px] pointer-events-none">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
