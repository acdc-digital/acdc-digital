// Donut Chart Primitive - Low-level chart rendering with recharts
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Editor/_components/donut/components/DonutChartPrimitive.tsx

"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    fill: string
  }>
  className?: string
  stroke?: string
  strokeWidth?: number
}

export function DonutChart({ data, className, stroke = "transparent", strokeWidth = 1 }: DonutChartProps) {
  return (
    <div className={cn("w-full h-[400px] outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={170}
            dataKey="value"
            stroke={stroke}
            strokeWidth={strokeWidth}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}