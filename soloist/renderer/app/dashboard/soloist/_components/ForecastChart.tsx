// FORECAST CHART COMPONENT
// Displays historical and forecast data in a larger chart view
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/ForecastChart.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush,
  ReferenceLine,
} from "recharts";
import { 
  Settings2, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Activity,
  ScatterChart,
  PieChart,
  Radar,
  GitBranch,
  Columns3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeekData, useSelectedDayIndex } from "@/store/soloistStore";

interface ForecastChartProps {
  className?: string;
}

// Chart control toggle button component
interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

function ToggleButton({ active, onClick, icon, label, color }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm transition-colors",
        active 
          ? "bg-neutral-700 text-neutral-100" 
          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
      )}
    >
      <span className={cn("flex-shrink-0", color)}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function ForecastChart({ className }: ForecastChartProps) {
  const weekData = useWeekData();
  const selectedDayIndex = useSelectedDayIndex();

  // Chart control state
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showArea, setShowArea] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAverage, setShowAverage] = useState(false);

  // Prepare chart data from week data
  const chartData = useMemo(() => {
    if (!weekData || weekData.length === 0) return [];

    return weekData.map((d, index) => {
      // For now, using mock historical forecast data
      // In production, this would come from stored forecasts
      const historicalForecast = !d.isFuture ? (d.emotionScore ? d.emotionScore + Math.floor(Math.random() * 10) - 5 : null) : null;
      
      return {
        name: d.shortDay || d.day.substring(0, 3),
        date: d.date,
        fullDay: d.day,
        // Line 1: Actual score for past days
        Actual: !d.isFuture ? d.emotionScore : null,
        // Line 2: Forecast score for future days
        Forecast: d.isFuture ? d.emotionScore : null,
        // Line 3: Historical forecast for comparison (past days only)
        HistoricalForecast: historicalForecast,
        isSelected: index === selectedDayIndex,
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

  // Define colors
  const actualColor = "#6366f1"; // Indigo (Past/Actual)
  const forecastColor = "#f59e0b"; // Amber (Future/Forecast)
  const historicalForecastColor = "#22c55e"; // Green (Historical Forecast)

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
        <div className="bg-neutral-900/95 border border-neutral-700 rounded-sm p-3 shadow-lg">
          <p className="text-sm font-medium text-neutral-100 mb-1">
            {data?.fullDay}
          </p>
          <p className="text-xs text-neutral-400 mb-2">{data?.date}</p>
          {payload.map((entry: any, index: number) => {
            const colorClass = 
              entry.dataKey === "Actual" ? "bg-indigo-500" :
              entry.dataKey === "Forecast" ? "bg-amber-500" :
              "bg-green-500";
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
    setShowActual(true);
    setShowForecast(true);
    setShowHistorical(true);
    setShowArea(false);
    setShowGrid(true);
    setShowAverage(false);
  };

  if (chartData.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No data available. Select a date range to view the chart.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Chart Controls Panel */}
      <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-700 pb-3 mb-3 -mx-4 px-4">
        <div className="flex items-center justify-between">
          {/* Left: Data Series Toggles */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2">
              Series:
            </span>
            <ToggleButton
              active={showActual}
              onClick={() => setShowActual(!showActual)}
              icon={showActual ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              label="Actual"
              color="text-indigo-400"
            />
            <ToggleButton
              active={showForecast}
              onClick={() => setShowForecast(!showForecast)}
              icon={showForecast ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              label="Forecast"
              color="text-amber-400"
            />
            <ToggleButton
              active={showHistorical}
              onClick={() => setShowHistorical(!showHistorical)}
              icon={showHistorical ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              label="Historical"
              color="text-green-400"
            />
          </div>

          {/* Center: Display Options */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2">
              Display:
            </span>
            <ToggleButton
              active={showArea}
              onClick={() => setShowArea(!showArea)}
              icon={<Layers className="h-3.5 w-3.5" />}
              label="Area Fill"
            />
            <ToggleButton
              active={showGrid}
              onClick={() => setShowGrid(!showGrid)}
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              label="Grid"
            />
            <ToggleButton
              active={showAverage}
              onClick={() => setShowAverage(!showAverage)}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label={`Avg (${averageScore})`}
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-sm transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
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
              domain={[0, 100]}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tick={{ fill: "#a3a3a3" }}
              ticks={[0, 50, 100]}
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

            {/* Line 3: Historical Forecast Comparison */}
            {showHistorical && (
              <Line
                type="monotone"
                dataKey="HistoricalForecast"
                stroke={historicalForecastColor}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: historicalForecastColor, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
                name="Historical Forecast"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer - Chart Type Selector */}
      <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3 -mx-4 px-4">
        <div className="flex items-center justify-start gap-2">
          <ChartTypeButton
            icon={<LineChartIcon className="h-4 w-4" />}
            active={true}
            tooltip="Line Chart"
          />
          <ChartTypeButton
            icon={<AreaChartIcon className="h-4 w-4" />}
            active={false}
            tooltip="Area Chart"
          />
          <ChartTypeButton
            icon={<BarChart3 className="h-4 w-4" />}
            active={false}
            tooltip="Bar Chart"
          />
          <ChartTypeButton
            icon={<Activity className="h-4 w-4" />}
            active={false}
            tooltip="Step Chart"
          />
          <ChartTypeButton
            icon={<ScatterChart className="h-4 w-4" />}
            active={false}
            tooltip="Scatter Plot"
          />
          <ChartTypeButton
            icon={<Radar className="h-4 w-4" />}
            active={false}
            tooltip="Radar Chart"
          />
          <ChartTypeButton
            icon={<GitBranch className="h-4 w-4" />}
            active={false}
            tooltip="Deviation Chart"
          />
          <ChartTypeButton
            icon={<Columns3 className="h-4 w-4" />}
            active={false}
            tooltip="Comparison View"
          />
        </div>
      </div>
    </div>
  );
}

// Chart type button component
interface ChartTypeButtonProps {
  icon: React.ReactNode;
  active: boolean;
  tooltip: string;
  onClick?: () => void;
}

function ChartTypeButton({ icon, active, tooltip, onClick }: ChartTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        "p-2 border rounded-sm transition-colors",
        active
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
          : "border-neutral-600 text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
      )}
    >
      {icon}
    </button>
  );
}

export default ForecastChart;
