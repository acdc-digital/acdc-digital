// Donut Chart Component - Interactive chart for dashboard
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Editor/_components/donut/DonutChart.tsx

"use client"

import { useState } from "react"
import { DonutChart as DonutChartPrimitive } from "./components/DonutChartPrimitive"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

interface DonutChartProps {
  className?: string
}

// Sample data for demonstration
const sampleData = [
  { name: "Work", value: 35, fill: "#008080" },
  { name: "Sleep", value: 30, fill: "#00bcd4" },
  { name: "Exercise", value: 10, fill: "#4ade80" },
  { name: "Learning", value: 15, fill: "#f59e0b" },
  { name: "Free Time", value: 10, fill: "#8b5cf6" },
]

export function DonutChart({ className = '' }: DonutChartProps) {
  const [data, setData] = useState(sampleData)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const handleAddActivity = () => {
    const newActivity = {
      name: `Activity ${data.length + 1}`,
      value: 5,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`
    }
    
    // Reduce all existing values proportionally to make room
    const totalValue = data.reduce((sum, item) => sum + item.value, 0)
    const scaleFactor = (100 - newActivity.value) / totalValue
    
    const adjustedData = data.map(item => ({
      ...item,
      value: Math.round(item.value * scaleFactor)
    }))
    
    setData([...adjustedData, newActivity])
  }

  const handleRemoveActivity = (index: number) => {
    if (data.length <= 1) return
    
    const newData = data.filter((_, i) => i !== index)
    
    // Redistribute the removed value proportionally
    const totalValue = newData.reduce((sum, item) => sum + item.value, 0)
    const scaleFactor = 100 / totalValue
    
    const redistributedData = newData.map(item => ({
      ...item,
      value: Math.round(item.value * scaleFactor)
    }))
    
    setData(redistributedData)
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={`h-full w-full bg-[#1a1a1a] p-6 ${className}`}>
      <div className="h-full grid gap-6 lg:grid-cols-2">
        {/* Main Donut Chart */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Time Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Interactive donut chart showing activity breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <DonutChartPrimitive 
                data={data} 
                stroke="#ffffff"
                strokeWidth={2}
                className="h-[350px]"
              />
            ) : (
              <div className="relative opacity-20 h-[350px]">
                <DonutChartPrimitive 
                  data={[
                    { name: "No data", value: 100, fill: "#393939" }
                  ]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Panel */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Activity Breakdown</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your time distribution
            </CardDescription>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#1a1a1a] border-gray-600 text-gray-300 hover:bg-[#008080] hover:text-white cursor-pointer transition-colors"
                onClick={handleAddActivity}
              >
                <Plus size={14} className="mr-1" />
                Add Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Activity List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer
                    ${selectedSegment === item.name 
                      ? 'bg-[#008080]/20 border-[#008080]/50' 
                      : 'bg-[#1a1a1a] border-gray-700 hover:border-gray-600'
                    }
                  `}
                  onClick={() => setSelectedSegment(selectedSegment === item.name ? null : item.name)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background: item.fill }}
                    />
                    <div>
                      <span className="text-white font-medium text-sm">{item.name}</span>
                      <div className="text-xs text-gray-400">
                        {item.value}% of total time
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">
                      {item.value}%
                    </span>
                    {data.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveActivity(index)
                        }}
                      >
                        <Minus size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Activities:</span>
                <span className="text-white font-medium">{data.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-400">Total Percentage:</span>
                <span className="text-white font-medium">{totalValue}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}