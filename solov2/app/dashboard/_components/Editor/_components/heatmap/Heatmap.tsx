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
import { Info, Loader2, Calendar, TrendingUp, Activity, Flame, ChevronLeft, ChevronRight } from "lucide-react";

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
    return "bg-[#2d2d2d]/30 border border-[#3d3d3d]/50 cursor-not-allowed";
  }
  return s == null
    ? "bg-[#1a1a1a] border border-[#2d2d2d] hover:border-[#3d3d3d] hover:bg-[#1e1e1e]"
    : s >= 90
    ? "bg-[#007acc] hover:bg-[#0098ff] border border-[#007acc]/50"
    : s >= 80
    ? "bg-[#0e7490] hover:bg-[#0891b2] border border-[#0e7490]/50"
    : s >= 70
    ? "bg-[#059669] hover:bg-[#10b981] border border-[#059669]/50"
    : s >= 60
    ? "bg-[#65a30d] hover:bg-[#84cc16] border border-[#65a30d]/50"
    : s >= 50
    ? "bg-[#ca8a04] hover:bg-[#eab308] border border-[#ca8a04]/50"
    : s >= 40
    ? "bg-[#ea580c] hover:bg-[#f97316] border border-[#ea580c]/50"
    : s >= 30
    ? "bg-[#dc2626] hover:bg-[#ef4444] border border-[#dc2626]/50"
    : s >= 20
    ? "bg-[#c026d3] hover:bg-[#d946ef] border border-[#c026d3]/50"
    : s >= 10
    ? "bg-[#9333ea] hover:bg-[#a855f7] border border-[#9333ea]/50"
    : "bg-[#e11d48] hover:bg-[#f43f5e] border border-[#e11d48]/50";
};

/* ─────────────────────────────── */
/* Legend config (constant)        */
/* ─────────────────────────────── */
const LEGEND = [
  { label: "90-100", color: "bg-[#007acc]", textColor: "text-[#007acc]", ok: (s: number) => s >= 90 },
  { label: "80-89", color: "bg-[#0e7490]", textColor: "text-[#0e7490]", ok: (s: number) => s >= 80 && s < 90 },
  { label: "70-79", color: "bg-[#059669]", textColor: "text-[#059669]", ok: (s: number) => s >= 70 && s < 80 },
  { label: "60-69", color: "bg-[#65a30d]", textColor: "text-[#65a30d]", ok: (s: number) => s >= 60 && s < 70 },
  { label: "50-59", color: "bg-[#ca8a04]", textColor: "text-[#ca8a04]", ok: (s: number) => s >= 50 && s < 60 },
  { label: "40-49", color: "bg-[#ea580c]", textColor: "text-[#ea580c]", ok: (s: number) => s >= 40 && s < 50 },
  { label: "30-39", color: "bg-[#dc2626]", textColor: "text-[#dc2626]", ok: (s: number) => s >= 30 && s < 40 },
  { label: "20-29", color: "bg-[#c026d3]", textColor: "text-[#c026d3]", ok: (s: number) => s >= 20 && s < 30 },
  { label: "10-19", color: "bg-[#9333ea]", textColor: "text-[#9333ea]", ok: (s: number) => s >= 10 && s < 20 },
  { label: "0-9", color: "bg-[#e11d48]", textColor: "text-[#e11d48]", ok: (s: number) => s >= 0 && s < 10 },
  {
    label: "No Log",
    color: "bg-[#1a1a1a] border border-[#2d2d2d]",
    textColor: "text-[#858585]",
    ok: (s?: number) => s == null,
  },
] as const;

/* ─────────────────────────────── */
/* Component                        */
/* ─────────────────────────────── */
export default function Heatmap({ year: y, onSelectDate }: HeatmapProps) {
  /* 1. Auth & canonical userId following authentication rules */
  const { isAuthenticated, isLoading: authLoading, userId } = useConvexUser();

  /* 1.5. Year navigation state */
  const [currentYear, setCurrentYear] = React.useState(y ?? new Date().getFullYear());

  /* 1.6. Year navigation functions */
  const goToPreviousYear = () => setCurrentYear(prev => prev - 1);
  const goToNextYear = () => setCurrentYear(prev => prev + 1);

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
  const year = currentYear;
  const todayKey = today.getFullYear() === year ? buildDateKey(today) : null;
  const allDates = React.useMemo(() => getAllDatesInYear(year), [year]);

  /* 6. UI state hooks (hover + feed selection) */
  const [hover, setHover] = React.useState<string | null>(null);
  const [showLogsBadge, setShowLogsBadge] = React.useState(true);
  const [showAvgBadge, setShowAvgBadge] = React.useState(true);
  const headerRef = React.useRef<HTMLDivElement>(null);
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

  /* Container width detection for progressive badge hiding */
  React.useEffect(() => {
    const checkContainerWidth = () => {
      if (headerRef.current) {
        const containerWidth = headerRef.current.offsetWidth;
        // Progressive hiding: Avg badge disappears first (at 550px), then Logs badge (at 450px)
        setShowAvgBadge(containerWidth >= 550);
        setShowLogsBadge(containerWidth >= 450);
      }
    };

    checkContainerWidth();
    const resizeObserver = new ResizeObserver(checkContainerWidth);
    
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /* For debugging */
  React.useEffect(() => {
    console.log(`Calendar dates generated: ${allDates.length}`);
    console.log(`First date: ${allDates[0]?.toISOString()}`);
    console.log(`Last date: ${allDates[allDates.length - 1]?.toISOString()}`);
  }, [allDates]);

  /* ─────────────── Render ─────────────── */
  
  // Show message if no user exists
  if (!authLoading && !userId) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-transparent">
        <div className="text-center p-6 rounded-lg border border-[#2d2d2d] bg-[#1e1e1e]">
          <Calendar className="h-8 w-8 text-[#858585] mx-auto mb-0" />
          <p className="text-[#cccccc] mb-2">No demo user found</p>
          <p className="text-[#858585] text-sm">Click "Reset Demo Data" to create sample data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent rounded-t-xl border border-[#2d2d2d] relative">
      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/60 backdrop-blur-sm z-10 rounded-lg">
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-[#1e1e1e] border border-[#2d2d2d]">
            <Loader2 className="h-6 w-6 animate-spin text-[#007acc]" />
            <span className="text-sm text-[#cccccc]">Loading mood data...</span>
          </div>
        </div>
      )}

      {/* Header - Fixed at top */}
      <div ref={headerRef} className="flex-shrink-0 flex items-center justify-between p-2 bg-[#1e1e1e] rounded-t-xl border-b border-[#2d2d2d] flex-nowrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Flame className="h-5 w-5 text-[#008080] flex-shrink-0" />
          <h3 className="text-lg font-medium text-[#cccccc] font-rubik whitespace-nowrap flex items-center gap-2">
            Mood Chart
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousYear}
                className="p-1 hover:bg-[#2d2d2d] rounded transition-colors text-[#858585] hover:text-[#cccccc]"
                title="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[50px] text-center">{year}</span>
              <button
                onClick={goToNextYear}
                className="p-1 hover:bg-[#2d2d2d] rounded transition-colors text-[#858585] hover:text-[#cccccc]"
                title="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </h3>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {showLogsBadge && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Activity className="h-4 w-4 text-[#858585] flex-shrink-0" />
              <Badge variant="outline" className="border-[#2d2d2d] bg-[#1a1a1a] text-[#cccccc] text-xs whitespace-nowrap">
                {totalLogs} Logs
              </Badge>
            </div>
          )}
          
          {showAvgBadge && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-[#858585] flex-shrink-0" />
              <Badge variant="outline" className="border-[#2d2d2d] bg-[#1a1a1a] text-[#cccccc] text-xs whitespace-nowrap">
                Avg: {Number.isNaN(avg) ? "—" : avg.toFixed(1)}
              </Badge>
            </div>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                  aria-label="Heatmap information"
                >
                  <Info className="h-4 w-4 text-[#858585]" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc] text-sm"
                side="bottom"
              >
                <p>Click any day to view or add a mood log</p>
                <p className="text-[#858585] mt-1">Hover legend items to filter by score</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Calendar grid - Scrollable area between header and legend */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-wrap gap-1 p-4 pb-8">
            {allDates.map((d) => {
              const key = buildDateKey(d);
              const log = logMap.get(key);
              const score = log?.score ?? null;
              const isFuture = isFutureDate(d);

              const show =
                hover === null ||
                LEGEND.find((l) => l.label === hover)?.ok(score as number);

              const isToday = key === todayKey;
              const isSelected = selectedDate === key;

              return (
                // <TooltipProvider key={key}>
                //   <Tooltip>
                //     <TooltipTrigger asChild>
                      <button
                        key={key}
                        onClick={() => !isFuture && click(key)}
                        disabled={isFuture}
                        className={`
                          relative flex items-center justify-center
                          w-7 h-7 rounded-sm text-[12px] font-rubik font-light
                          transition-all duration-200
                          ${getColorClass(score, isFuture)}
                          ${show ? "opacity-100" : "opacity-20"}
                          ${isSelected ? "border border-[#007acc] ring-offset-1 ring-offset-transparent" : ""}
                          ${isToday && !isSelected ? "border border-[#cccccc] ring-offset-1 ring-offset-transparent" : ""}
                          ${!isFuture ? "hover:scale-110 hover:z-10 cursor-pointer" : "cursor-not-allowed"}
                          text-[#cccccc]/90 text-center
                        `}
                      >
                        {d.getDate()}
                      </button>
                //     </TooltipTrigger>
                //     <TooltipContent 
                //       className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc] text-sm"
                //       side="top"
                //     >
                //       <p className="font-medium">
                //         {d.toLocaleDateString('en-US', { 
                //           weekday: 'long', 
                //           year: 'numeric', 
                //           month: 'long', 
                //           day: 'numeric' 
                //         })}
                //       </p>
                //       {score !== null && (
                //         <p className="text-[#007acc] mt-1">Mood Score: {score}/100</p>
                //       )}
                //       {score === null && !isFuture && (
                //         <p className="text-[#858585] mt-1">No mood logged</p>
                //       )}
                //       {isFuture && (
                //         <p className="text-[#858585] mt-1">Future date</p>
                //       )}
                //     </TooltipContent>
                //   </Tooltip>
                // </TooltipProvider>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Legend - Fixed at bottom */}
      <div className="flex-shrink-0 p-2 border-t border-[#2d2d2d] bg-[#1e1e1e]">
        {/* Line 1 - Score Legend */}
        <div className="text-md text-[#858585] font-rubik mb-2">Score Legend</div>
        
        {/* Line 2 - Score Ranges in Grid */}
        <div className="flex flex-wrap mb-0">
          {LEGEND.map((l) => (
            <button
              key={l.label}
              className={`
                flex items-center gap-1.5 px-1 py-1 rounded-sm text-xs whitespace-nowrap
                transition-all duration-200 hover:bg-[#2d2d2d]
                ${hover === l.label ? "bg-[#2d2d2d]" : ""}
                ${hover === null || hover === l.label ? 'opacity-100' : 'opacity-40'}
              `}
              onMouseEnter={() => setHover(l.label)}
              onMouseLeave={() => setHover(null)}
            >
              <div className={`w-3 h-3 rounded-sm ${l.color} transition-transform hover:scale-110`} />
              <span className={`${l.textColor} font-dm-sans`}>{l.label}</span>
            </button>
          ))}
        </div>
        
        {/* Line 3 - Instructions */}
        <div className="text-xs text-[#858585]">
          
        </div>
      </div>
    </div>
  );
}