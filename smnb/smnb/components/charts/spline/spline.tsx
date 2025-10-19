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
  price: {
    label: "MNQ=F Price",
    color: "#2563eb",
  },
} satisfies ChartConfig

export function MultipleLineChart() {
  // Fetch last 24 hours of ticker data from Convex
  const tickerData = useQuery(api.stats.getLast24HoursData.getLast24HoursTickerData, {
    ticker: "MNQ=F"
  });

  // Show loading state
  if (!tickerData) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  // Show empty state if no data
  if (tickerData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the last 24 hours
      </div>
    );
  }

  // Transform data for the chart
  const chartData = tickerData.map((point) => ({
    hour: `Hour ${point.hour}`,
    hourNum: point.hour,
    price: point.close,
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
          domain={['dataMin - 50', 'dataMax + 50']}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={<ChartTooltipContent
            labelFormatter={(value, payload) => {
              const data = payload?.[0]?.payload;
              return data?.timestamp || value;
            }}
          />}
        />
        <Line
          dataKey="price"
          type="monotone"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{
            fill: "#2563eb",
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
