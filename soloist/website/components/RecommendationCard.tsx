"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Flame, TrendingUp } from "lucide-react";

export function RecommendationCard() {
  return (
    <Card className="w-full max-w-[280px] h-[500px] bg-zinc-900 border-zinc-800 rounded-xl shadow-md flex flex-col justify-between">
      {/* Header */}
      <CardHeader className="p-4 pb-2 flex flex-col space-y-1">
        <CardTitle className="text-sm text-zinc-300 font-medium">Take Control</CardTitle>
        <span className="text-xs text-zinc-500">Personalized insights</span>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col justify-center px-4 space-y-4">
        <div className="text-[13px] text-zinc-300 leading-relaxed">
          Based on your recent patterns, your energy levels and focus are trending upward.  
          Maintain consistency by reinforcing calm evening routines and reducing screen time before sleep.
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
            <Moon className="h-3 w-3 text-blue-400" /> Evening Reset
          </div>
          <div className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
            <Flame className="h-3 w-3 text-amber-400" /> Focus Sprint
          </div>
          <div className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
            <TrendingUp className="h-3 w-3 text-emerald-400" /> Consistency Goal
          </div>
        </div>

        <div className="text-xs text-zinc-500 mt-4">
          Confidence: <span className="text-emerald-400 font-medium">89%</span>  
          <br />
          Generated from your last 10 logs and sleep consistency patterns.
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-between items-center px-4 pb-4">
        <Button className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-medium rounded-md pointer-events-none">
          Apply Insight
        </Button>
        <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200 text-[12px] pointer-events-none">
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
