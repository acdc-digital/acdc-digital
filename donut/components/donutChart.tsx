// Donut Chart Component - Interactive chart with statistics display
// /Users/matthewsimon/Projects/acdc-digital/donut/components/donutChart.tsx

"use client"

import { useState } from "react"
import { DonutChart as DonutChartPrimitive } from "@/components/ui/donutChartPrimitive"
// import { InteractiveDonutChart } from "@/components/ui/interactiveDonutChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputTime } from "@/components/inputTime"
import { TimeTracker } from "@/components/timeTracker"

interface BrowserUsageProps {
  data: Array<{
    name: string
    value: number
    fill: string
  }>
}

export function DonutChart({ data }: BrowserUsageProps) {
  const [inputRows, setInputRows] = useState<number[]>([])
  const [timeEntries, setTimeEntries] = useState<Record<number, { 
    activityName: string
    startTime: string
    endTime: string
    startAmPm: 'AM' | 'PM'
    endAmPm: 'AM' | 'PM'
  }>>({})

  const handleAddRow = () => {
    setInputRows(prev => [...prev, Date.now()])
  }

  const handleRemoveRow = (id: number) => {
    setInputRows(prev => prev.filter(rowId => rowId !== id))
    setTimeEntries(prev => {
      const newEntries = { ...prev }
      delete newEntries[id]
      return newEntries
    })
  }

  const handleTimeChange = (id: number, timeData: { 
    activityName: string
    startTime: string
    endTime: string
    startAmPm: 'AM' | 'PM'
    endAmPm: 'AM' | 'PM'
  }) => {
    setTimeEntries(prev => ({
      ...prev,
      [id]: timeData
    }))
  }

  // const handleChartDataChange = (newData: Array<{ name: string; value: number; fill: string }>) => {
  //   // Update chart data and sync back to time entries if needed
  //   console.log('Chart data changed:', newData)
  //   
  //   // TODO: Convert chart changes back to time entries
  //   // This would require mapping the chart percentages back to time values
  //   // and updating the corresponding timeEntries state
  // }

  // Helper function to calculate duration in minutes with proper AM/PM handling
  function calculateDurationInMinutes(startTime: string, endTime: string, startAmPm: 'AM' | 'PM', endAmPm: 'AM' | 'PM'): number {
    if (!startTime || !endTime) return 0
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    // Convert to 24-hour format
    let start24Hour = startHour
    let end24Hour = endHour
    
    // Handle 12 AM (midnight) and 12 PM (noon)
    if (startHour === 12) {
      start24Hour = startAmPm === 'AM' ? 0 : 12
    } else {
      start24Hour = startAmPm === 'PM' ? startHour + 12 : startHour
    }
    
    if (endHour === 12) {
      end24Hour = endAmPm === 'AM' ? 0 : 12
    } else {
      end24Hour = endAmPm === 'PM' ? endHour + 12 : endHour
    }
    
    // Calculate start and end times in minutes from midnight
    const startTotalMinutes = (start24Hour * 60) + startMin
    let endTotalMinutes = (end24Hour * 60) + endMin
    
    // Handle next-day scenarios properly
    // Only add 24 hours for clear next-day scenarios:
    // 1. PM to AM (e.g., 11 PM to 6 AM)
    // 2. Same period but end time is earlier (e.g., 11 PM to 1 PM next day)
    if (endTotalMinutes < startTotalMinutes) {
      // Add 24 hours for next day scenarios
      endTotalMinutes += 24 * 60
    } else if (startAmPm === 'PM' && endAmPm === 'AM') {
      // PM to AM always crosses to next day, even if times don't suggest it
      endTotalMinutes += 24 * 60
    }
    
    return Math.max(0, endTotalMinutes - startTotalMinutes)
  }

  // Convert timeEntries to chart data or use provided data
  const chartData = data.length > 0 ? data : (() => {
    const activities = Object.values(timeEntries).map((entry, index) => ({
      name: entry.activityName,
      minutes: calculateDurationInMinutes(
        entry.startTime, 
        entry.endTime, 
        entry.startAmPm || 'AM', 
        entry.endAmPm || 'AM'
      ),
      fill: `hsl(${index * 137.5 % 360}, 70%, 60%)` // Generate colors
    })).filter(item => item.name && item.minutes > 0)

    // Convert to percentage of 24-hour day (1440 minutes)
    const activitiesWithPercentage = activities.map(activity => ({
      name: activity.name,
      value: (activity.minutes / 1440) * 100, // Convert to percentage of full day
      fill: activity.fill
    }))

    // Calculate remaining time in the day
    const totalUsedMinutes = activities.reduce((sum, activity) => sum + activity.minutes, 0)
    const remainingMinutes = Math.max(0, 1440 - totalUsedMinutes)
    const remainingPercentage = (remainingMinutes / 1440) * 100

    // Always add remaining time as a visible background segment
    if (remainingPercentage > 0) {
      activitiesWithPercentage.push({
        name: "Available time",
        value: remainingPercentage,
        fill: "#393939" // Match the empty state color
      })
    }

    return activitiesWithPercentage
  })()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Main Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Interactive donut-chart showing how much time spent on activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            // Temporarily commenting out InteractiveDonutChart
            // <InteractiveDonutChart
            //   data={chartData}
            //   onDataChange={handleChartDataChange}
            //   stroke="#ffffff"
            //   strokeWidth={3}
            // />
            <DonutChartPrimitive 
              data={chartData} 
              stroke="#ffffff"
              strokeWidth={3}
            />
          ) : (
            <div className="relative opacity-20">
              <DonutChartPrimitive 
                data={[
                  { name: "No data", value: 100, fill: "#393939" }
                ]}
                stroke="#ffffff"
                strokeWidth={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>
            Breakdown of time-usage data.
          </CardDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-fit hover:bg-gray-50/10 cursor-pointer transition-colors duration-200"
            onClick={handleAddRow}
          >
            add +
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* Input Rows for new activities */}
            {inputRows.map((rowId) => (
              <InputTime 
                key={rowId} 
                rowId={rowId}
                onRemove={() => handleRemoveRow(rowId)}
                onTimeChange={(timeData) => handleTimeChange(rowId, timeData)}
              />
            ))}
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full bg-gray-500"
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.value} users
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2.5 border-t">
            <TimeTracker timeEntries={Object.values(timeEntries)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}