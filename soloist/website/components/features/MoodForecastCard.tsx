"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";

const data = [
  { day: "Today", mood: 72, average: 65 },
  { day: "+1d", mood: 68, average: 66 },
  { day: "+2d", mood: 75, average: 67 },
  { day: "+3d", mood: 71, average: 68 },
  { day: "+4d", mood: 78, average: 69 },
  { day: "+5d", mood: 74, average: 70 },
  { day: "+6d", mood: 81, average: 71 },
  { day: "+7d", mood: 77, average: 72 },
];

export function MoodForecastCard() {
  return (
    <Card data-mini-card="true" className="w-[92%] md:w-full mx-auto h-[380px] md:h-[500px] bg-zinc-900 border-zinc-800 rounded-xl shadow-md flex flex-col justify-between">
      <CardHeader className="p-3 md:p-4 pb-2">
        <CardTitle className="text-xs md:text-sm text-zinc-300 font-medium">Mood Forecast</CardTitle>
        <span className="text-[10px] md:text-xs text-zinc-500">Next 7 Days</span>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center px-3 md:px-4 pb-2">
        <div className="h-[200px] md:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[60, 90]} />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#moodGradient)"
                dot={{ r: 2.5, fill: "#60a5fa" }}
              />
              <Area
                type="linear"
                dataKey="average"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="none"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-left mt-2 text-[10px] md:text-xs text-zinc-300 space-y-0.5">
          <div>Confidence: <span className="text-blue-400">92%</span></div>
          <div>Focus rising steadily</div>
        </div>
      </CardContent>

      <CardFooter className="px-3 md:px-4 pb-3 md:pb-4 text-[10px] md:text-xs text-zinc-500">
        <span>Based on your last 14 logs</span>
      </CardFooter>
    </Card>
  );
}
