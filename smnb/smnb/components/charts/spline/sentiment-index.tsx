"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  sentimentIndex: {
    label: "Sentiment Index",
    color: "#10b981",
  },
} satisfies ChartConfig

export function SentimentIndexChart() {
  // Fetch last 24 hours of sentiment index data from Convex
  const indexData = useQuery(api.stats.sentimentIndex.getLast24HoursSentimentIndex);

  // Show loading state
  if (!indexData) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        Loading sentiment index data...
      </div>
    );
  }

  // Show empty state if no data
  if (indexData.length === 0) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center text-muted-foreground">
        <p>No sentiment index data available</p>
        <p className="text-xs mt-2">Run backfill to generate historical data</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = indexData.map((point: {
    hour: number;
    sentimentIndex: number;
    performanceScore: number;
    momentumScore: number;
    baseline: number;
    timestamp: string;
  }) => ({
    hour: `Hour ${point.hour}`,
    hourNum: point.hour,
    sentimentIndex: point.sentimentIndex,
    timestamp: new Date(point.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={Math.floor(chartData.length / 8)} // Show ~8 labels
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={['auto', 'auto']}
          tickFormatter={(value) => value.toFixed(3)}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={<ChartTooltipContent
            labelFormatter={(value, payload) => {
              const data = payload?.[0]?.payload as { timestamp?: string };
              return data?.timestamp || value;
            }}
          />}
        />
        <Line
          dataKey="sentimentIndex"
          type="monotone"
          stroke="#10b981"
          strokeWidth={3}
          dot={{
            fill: "#10b981",
            r: 4,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
