// FORECAST CHART COMPONENT
// Displays historical and forecast data in a larger chart view
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/ForecastChart.tsx

"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { useWeekData, useSelectedDayIndex } from "@/store/soloistStore";

interface ForecastChartProps {
  className?: string;
  // Display options passed from parent
  showActual?: boolean;
  showForecast?: boolean;
  showHistorical?: boolean;
  showArea?: boolean;
  showGrid?: boolean;
  showAverage?: boolean;
}

export function ForecastChart({
  className,
  showActual = true,
  showForecast = true,
  showHistorical = true,
  showArea = false,
  showGrid = true,
  showAverage = false,
}: ForecastChartProps) {
  const weekData = useWeekData();
  const selectedDayIndex = useSelectedDayIndex();

  // Prepare chart data from week data
  const chartData = useMemo(() => {
    if (!weekData || weekData.length === 0) return [];

    return weekData.map((d, index) => {
      // Use real historical forecast score from the data
      const historicalForecast = (d as any).historicalForecastScore ?? null;
      
      // Find the last actual value to connect forecast line to actual line
      // The last historical day (index 3) should have both Actual and Forecast values
      // to create a continuous line
      const isLastHistoricalDay = !d.isFuture && (index === weekData.length - 1 || weekData[index + 1]?.isFuture);
      
      return {
        name: d.shortDay || d.day.substring(0, 3),
        date: d.date,
        fullDay: d.day,
        // Line 1: Actual score for past days (including the bridge point)
        Actual: !d.isFuture ? d.emotionScore : null,
        // Line 2: Forecast score - include the last actual day's score as bridge point
        Forecast: d.isFuture 
          ? d.emotionScore 
          : (isLastHistoricalDay ? d.emotionScore : null),
        // Line 3: Historical logs - actual log scores for all days where logs exist
        HistoricalLog: (d as any).actualLogScore ?? null,
        // Line 4: Historical forecast for comparison (previously stored predictions)
        HistoricalForecast: historicalForecast,
        isSelected: index === selectedDayIndex,
        isFuture: d.isFuture,
      };
    });
  }, [weekData, selectedDayIndex]);

  // Calculate average score
  const averageScore = useMemo(() => {
    const scores = chartData
      .map(d => d.Actual || d.Forecast)
      .filter((s): s is number => s !== null);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [chartData]);

  // Calculate dynamic Y-axis domain based on data values
  const yAxisDomain = useMemo(() => {
    const allScores = chartData
      .flatMap(d => [d.Actual, d.Forecast, d.HistoricalLog, d.HistoricalForecast])
      .filter((s): s is number => s !== null && s !== undefined);
    
    if (allScores.length === 0) return [0, 100];
    
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const range = maxScore - minScore;
    
    // Add padding: at least 10 points or 20% of range on each side
    const padding = Math.max(10, range * 0.2);
    
    // Calculate bounds, clamped to 0-100
    const lowerBound = Math.max(0, Math.floor((minScore - padding) / 5) * 5); // Round down to nearest 5
    const upperBound = Math.min(100, Math.ceil((maxScore + padding) / 5) * 5); // Round up to nearest 5
    
    // Ensure minimum range of 20 points for visibility
    if (upperBound - lowerBound < 20) {
      const midpoint = (minScore + maxScore) / 2;
      return [
        Math.max(0, Math.floor((midpoint - 10) / 5) * 5),
        Math.min(100, Math.ceil((midpoint + 10) / 5) * 5)
      ];
    }
    
    return [lowerBound, upperBound];
  }, [chartData]);

  // Generate Y-axis ticks based on dynamic domain
  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisDomain;
    const range = max - min;
    const step = range <= 30 ? 5 : range <= 50 ? 10 : 20;
    const ticks = [];
    for (let i = min; i <= max; i += step) {
      ticks.push(i);
    }
    // Ensure we have the max value
    if (ticks[ticks.length - 1] !== max) {
      ticks.push(max);
    }
    return ticks;
  }, [yAxisDomain]);

  // Define colors
  const actualColor = "#6366f1"; // Indigo (Past/Actual)
  const forecastColor = "#f59e0b"; // Amber (Future/Forecast)
  const historicalLogColor = "#22c55e"; // Green (Historical Logs)
  const historicalForecastColor = "#06b6d4"; // Cyan (Historical Forecast predictions)

  // Custom dot renderer for forecast line
  const renderForecastDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload, index } = props;
    if (payload.Forecast !== null && payload.Forecast !== undefined) {
      return (
        <circle
          key={`forecast-dot-${index}`}
          cx={cx}
          cy={cy}
          r={5}
          fill={forecastColor}
          stroke="#fff"
          strokeWidth={1}
        />
      );
    }
    return <g key={`empty-forecast-dot-${index}`} />;
  };

  // Custom dot renderer for actual line
  const renderActualDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload, index } = props;
    if (payload.Actual !== null && payload.Actual !== undefined) {
      return (
        <circle
          key={`actual-dot-${index}`}
          cx={cx}
          cy={cy}
          r={5}
          fill={actualColor}
          stroke="#fff"
          strokeWidth={1}
        />
      );
    }
    return <g key={`empty-actual-dot-${index}`} />;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-[#2b2b2b] border border-neutral-700 rounded-sm p-3 shadow-lg">
          <p className="text-sm font-medium text-neutral-100 mb-1">
            {data?.fullDay}
          </p>
          <p className="text-xs text-neutral-400 mb-2">{data?.date}</p>
          {payload.map((entry: any, index: number) => {
            const colorClass = 
              entry.dataKey === "Actual" ? "bg-indigo-500" :
              entry.dataKey === "Forecast" ? "bg-amber-500" :
              entry.dataKey === "HistoricalLog" ? "bg-green-500" :
              "bg-cyan-500"; // HistoricalForecast
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className={cn("w-2 h-2 rounded-full", colorClass)} />
                <span className="text-neutral-300">{entry.name}:</span>
                <span className="font-medium text-neutral-100">
                  {entry.value !== null ? entry.value : "—"}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Reset all controls
  const handleReset = () => {
    // This is now handled by parent component
  };

  if (chartData.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30",
        className
      )}>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No data available. Select a date range to view the chart.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30 p-4",
      className
    )}>
      {/* Chart Container */}
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={0.3}
                stroke="#525252"
              />
            )}
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{ fill: "#a3a3a3" }}
            />
            <YAxis
              domain={yAxisDomain}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tick={{ fill: "#a3a3a3" }}
              ticks={yAxisTicks}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconSize={10}
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "15px",
              }}
              formatter={(value) => (
                <span className="text-neutral-300">{value}</span>
              )}
            />

            {/* Average Reference Line */}
            {showAverage && (
              <ReferenceLine
                y={averageScore}
                stroke="#a855f7"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Avg: ${averageScore}`,
                  position: "right",
                  fill: "#a855f7",
                  fontSize: 11,
                }}
              />
            )}

            {/* Area fills (optional) */}
            {showArea && showActual && (
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={actualColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={actualColor} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}

            {/* Line 1: Actual Past Data */}
            {showActual && (
              <Line
                type="monotone"
                dataKey="Actual"
                stroke={actualColor}
                strokeWidth={2.5}
                dot={renderActualDot}
                activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
                connectNulls
                name="Actual Score"
                fill={showArea ? "url(#actualGradient)" : undefined}
              />
            )}

            {/* Line 2: Forecast Data */}
            {showForecast && (
              <Line
                type="monotone"
                dataKey="Forecast"
                stroke={forecastColor}
                strokeWidth={2.5}
                dot={renderForecastDot}
                activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
                connectNulls
                name="Forecast"
              />
            )}

            {/* Line 3: Historical Logs - all actual log scores */}
            {showHistorical && (
              <Line
                type="monotone"
                dataKey="HistoricalLog"
                stroke={historicalLogColor}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: historicalLogColor, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
                name="Historical Logs"
              />
            )}

            {/* Line 4: Historical Forecast - previously stored predictions */}
            {showHistorical && (
              <Line
                type="monotone"
                dataKey="HistoricalForecast"
                stroke={historicalForecastColor}
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ r: 3, fill: historicalForecastColor, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
                name="Historical Forecast"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;
