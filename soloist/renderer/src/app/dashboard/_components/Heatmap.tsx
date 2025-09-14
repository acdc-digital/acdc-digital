// HEATMAP
// /Users/matthewsimon/Documents/Github/solopro/renderer/src/app/dashboard/_components/Heatmap.tsx

"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useConvexUser } from "@/hooks/useConvexUser";
import { useFeedStore } from "@/store/feedStore";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";

/* ─────────────────────────────── */
/* Types & Props                   */
/* ─────────────────────────────── */
interface DailyLog {
  date: string;  // YYYY-MM-DD
  score?: number | null;
}
interface HeatmapProps {
  /** Year to display; defaults to current year */
  year?: number;
  onSelectDate?: (date: string) => void;
}

/* ─────────────────────────────── */
/* Helper functions                */
/* ─────────────────────────────── */
const buildDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const getAllDatesInYear = (year: number) => {
  const arr: Date[] = [];
  // Create a new date for each iteration to avoid mutation issues
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      arr.push(new Date(year, month, day));
    }
  }
  return arr;
};

const isFutureDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

const getColorClass = (s: number | null | undefined, isFuture: boolean) => {
  if (isFuture) {
    return "bg-zinc-400/40 border border-zinc-500/50 dark:bg-zinc-600/40 dark:border-zinc-500/50 cursor-not-allowed";
  }
  return s == null
    ? "bg-zinc-200/30 border border-zinc-300/50 dark:bg-zinc-800/20 dark:border-zinc-700/40"
    : s >= 90
    ? "bg-indigo-400/90 hover:bg-indigo-400"
    : s >= 80
    ? "bg-blue-400/90 hover:bg-blue-400"
    : s >= 70
    ? "bg-sky-400/80 hover:bg-sky-400"
    : s >= 60
    ? "bg-teal-400/80 hover:bg-teal-400"
    : s >= 50
    ? "bg-green-400/80 hover:bg-green-400"
    : s >= 40
    ? "bg-lime-400/80 hover:bg-lime-400"
    : s >= 30
    ? "bg-yellow-400/80 hover:bg-yellow-400"
    : s >= 20
    ? "bg-amber-500/80 hover:bg-amber-500"
    : s >= 10
    ? "bg-orange-500/80 hover:bg-orange-500"
    : "bg-rose-600/80 hover:bg-rose-600";
};

/* ─────────────────────────────── */
/* Legend config (constant)        */
/* ─────────────────────────────── */
const LEGEND = [
  { label: "90-100", color: "bg-indigo-400", ok: (s: number) => s >= 90 },
  { label: "80-89", color: "bg-blue-400", ok: (s: number) => s >= 80 && s < 90 },
  { label: "70-79", color: "bg-sky-400", ok: (s: number) => s >= 70 && s < 80 },
  { label: "60-69", color: "bg-teal-400", ok: (s: number) => s >= 60 && s < 70 },
  { label: "50-59", color: "bg-green-400", ok: (s: number) => s >= 50 && s < 60 },
  { label: "40-49", color: "bg-lime-400", ok: (s: number) => s >= 40 && s < 50 },
  { label: "30-39", color: "bg-yellow-400", ok: (s: number) => s >= 30 && s < 40 },
  { label: "20-29", color: "bg-amber-500", ok: (s: number) => s >= 20 && s < 30 },
  { label: "10-19", color: "bg-orange-500", ok: (s: number) => s >= 10 && s < 20 },
  { label: "0-9", color: "bg-rose-600", ok: (s: number) => s >= 0 && s < 10 },
  {
    label: "No Log",
    color: "bg-zinc-800/30 border border-zinc-700/50",
    ok: (s?: number) => s == null,
  },
] as const;

/* ─────────────────────────────── */
/* Component                        */
/* ─────────────────────────────── */
export default function Heatmap({ year: y, onSelectDate }: HeatmapProps) {
  /* 1. Auth & canonical userId following authentication rules */
  const { isAuthenticated, isLoading: authLoading, userId } = useConvexUser();

  /* 2. Convex query (always called, key = "skip" if no user) */
  const queryResult = useQuery(
    api.dailyLogs.listScores,
    isAuthenticated && userId ? { userId } : "skip"
  ); // undefined while loading, then DailyLog[]

  /* 3. Derived "ready" flag & safe array (keeps hook order stable) */
  const ready = !authLoading && isAuthenticated && userId && queryResult !== undefined;
  const dailyLogs: DailyLog[] = queryResult ?? [];

  /* 4. Hook: memo map */
  const logMap = React.useMemo(() => {
    const m = new Map<string, DailyLog>();
    dailyLogs.forEach((l) => m.set(l.date, l));
    return m;
  }, [dailyLogs]);

  /* 5. Stats & date helpers — pure calculations */
  const totalLogs = dailyLogs.length;
  const avg =
    dailyLogs.reduce((sum, l) => sum + (l.score ?? 0), 0) / Math.max(1, totalLogs);

  const today = new Date();
  const year = y ?? today.getFullYear();
  const todayKey = today.getFullYear() === year ? buildDateKey(today) : null;
  const allDates = React.useMemo(() => getAllDatesInYear(year), [year]);

  /* 6. UI state hooks (hover + feed selection) */
  const [hover, setHover] = React.useState<string | null>(null);
  const {
    selectedDate,
    setSelectedDate,
    setActiveTab,
    setSidebarOpen
  } = useFeedStore();

  const click = (d: string) => {
    onSelectDate?.(d);
    setSelectedDate(d);
    setActiveTab("feed");
    setSidebarOpen(true);
  };

  /* For debugging */
  React.useEffect(() => {
    console.log(`Calendar dates generated: ${allDates.length}`);
    console.log(`First date: ${allDates[0]?.toISOString()}`);
    console.log(`Last date: ${allDates[allDates.length - 1]?.toISOString()}`);
  }, [allDates]);

  /* ─────────────── Render ─────────────── */
  return (
    <div className="flex flex-col h-full">
      {/* Spinner overlay if not ready */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      )}

      {/* Header badges */}
      <div className="flex-shrink-0 flex items-center justify-between mb-2 px-0 pt-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="border-zinc-700 text-zinc-600 dark:text-zinc-300">
            {totalLogs} Logs
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-600 dark:text-zinc-300">
            Avg: {Number.isNaN(avg) ? "0.0" : avg.toFixed(1)}
          </Badge>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
              Scroll to see all days. Click a square to view or add a log.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 px-0 min-h-0 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900/50 rounded-md mx-0">
        <ScrollArea className="h-full">
          <div className="flex flex-wrap gap-1 p-3">
            {allDates.map((d) => {
              const key = buildDateKey(d);
              const log = logMap.get(key);
              const score = log?.score ?? null;
              const isFuture = isFutureDate(d);

              const show =
                hover === null ||
                LEGEND.find((l) => l.label === hover)?.ok(score as number);

              const isToday = key === todayKey;

              return (
                <div
                  key={key}
                  onClick={() => !isFuture && click(key)}
                  className={`
                    flex items-center justify-center
                    w-6 h-6 rounded-sm ${!isFuture ? 'cursor-pointer' : 'cursor-not-allowed'}
                    text-[10px] font-medium transition-all duration-150
                    ${getColorClass(score, isFuture)}
                    ${show ? "" : "opacity-30"}
                    ${selectedDate === key ? "ring-1 ring-blue-600" : isToday ? "ring-1 ring-red-600 dark:ring-zinc-300" : ""}
                    text-zinc-800/90 dark:text-zinc-100/90
                  `}
                  style={{ outline: "0.5px solid rgba(0,0,0,0.1)" }}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 mt-2 mb-2 px-0 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="mb-2">Score legend:</div>
        <div className="flex flex-wrap gap-2">
          {LEGEND.map((l) => (
            <div
              key={l.label}
              className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity duration-200 px-1 py-0.5 rounded-sm hover:bg-zinc-800/30"
              style={{ opacity: hover === null || hover === l.label ? 1 : 0.5 }}
              onMouseEnter={() => setHover(l.label)}
              onMouseLeave={() => setHover(null)}
            >
              <div className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-zinc-600 dark:text-zinc-400">{l.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          Scroll to view all days, or hover the legend to highlight specific ranges.
        </div>
      </div>
    </div>
  );
}