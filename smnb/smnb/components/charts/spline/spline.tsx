"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Historical MNQ=F data for Oct 8-10, 2025 (26 hours)
// Data ordered from earliest to latest (Oct 8, 9:41 PM AST to Oct 10, 12:01 AM AST)
const mnqData = [
  25331.75,
  25310.5,
  25325.5,
  25340.5,
  25355.5,
  25337.25,
  25337.75,
  25301,
  25321,
  25318,
  25313.75,
  25332.5,
  25279,
  25250.5,
  25263,
  25203.75,
  25215.75,
  25235,
  25294.75,
  25287.5,
  25319,
  25335,
  25336.5,
  25351.5,
  25338.25,
  25318,
];

const chartConfig = {
  price: {
    label: "MNQ=F Price",
    color: "#2563eb",
  },
} satisfies ChartConfig

export function MultipleLineChart() {
  // Create chart data with hour labels
  const startTime = new Date("2025-10-08T21:41:59-04:00"); // Oct 8, 9:41 PM AST
  
  const chartData = mnqData.map((price, index) => {
    const timestamp = new Date(startTime.getTime() + (index * 60 * 60 * 1000)); // Add hours
    return {
      time: timestamp.toLocaleTimeString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric',
        hour12: true 
      }),
      hour: `Hour ${index + 1}`,
      price: price,
    };
  });

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
          content={<ChartTooltipContent />} 
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
