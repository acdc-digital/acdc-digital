"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Flame, TrendingUp } from "lucide-react";

export function RecommendationCard() {
  return (
    <Card data-mini-card="true" className="w-[92%] md:w-full mx-auto h-[340px] md:h-[500px] bg-zinc-900 border-zinc-800 rounded-xl shadow-md flex flex-col justify-between">
      {/* Header */}
      <CardHeader className="p-3 md:p-4 pb-2 flex flex-col space-y-1">
        <CardTitle className="text-xs md:text-sm text-zinc-300 font-medium">Take Control</CardTitle>
        <span className="text-[10px] md:text-xs text-zinc-500">Personalized insights</span>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col justify-start md:justify-center px-3 md:px-4 space-y-3 md:space-y-4 pt-2 md:pt-0">
        <div className="text-[11px] md:text-[13px] text-zinc-300 leading-relaxed">
          Based on your recent patterns, your energy levels and focus are trending upward.  
          Maintain consistency by reinforcing calm evening routines and reducing screen time before sleep.
        </div>

        <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
          <div className="flex items-center gap-1 text-[10px] md:text-xs bg-zinc-800 text-zinc-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border border-zinc-700">
            <Moon className="h-2.5 w-2.5 md:h-3 md:w-3 text-blue-400" /> Evening Reset
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-xs bg-zinc-800 text-zinc-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border border-zinc-700">
            <Flame className="h-2.5 w-2.5 md:h-3 md:w-3 text-amber-400" /> Focus Sprint
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-xs bg-zinc-800 text-zinc-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border border-zinc-700">
            <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-emerald-400" /> Consistency Goal
          </div>
        </div>

        <div className="text-[10px] md:text-xs text-zinc-500 mt-3 md:mt-4">
          Confidence: <span className="text-emerald-400 font-medium">89%</span>  
          <br />
          Generated from your last 10 logs and sleep consistency patterns.
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-between items-center px-3 md:px-4 pb-3 md:pb-4">
        <Button className="h-7 md:h-8 px-3 md:px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] md:text-[12px] font-medium rounded-md pointer-events-none">
          Apply Insight
        </Button>
        <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200 text-[11px] md:text-[12px] pointer-events-none">
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
