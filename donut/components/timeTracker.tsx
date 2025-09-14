// Time Tracker Component - Calculates and displays total time from activity entries
// /Users/matthewsimon/Projects/acdc-digital/donut/components/timeTracker.tsx

"use client"

interface TimeEntry {
  activityName: string
  startTime: string
  endTime: string
  startAmPm: 'AM' | 'PM'
  endAmPm: 'AM' | 'PM'
}

interface TimeTrackerProps {
  timeEntries: TimeEntry[]
}

// Helper function to calculate duration between two times with proper AM/PM handling
function calculateDuration(startTime: string, endTime: string, startAmPm: 'AM' | 'PM', endAmPm: 'AM' | 'PM'): number {
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

// Helper function to format minutes into hours and minutes
function formatDuration(totalMinutes: number): string {
  if (totalMinutes === 0) return "0 hours"
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours === 0) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${hours}h ${minutes}m`
  }
}

export function TimeTracker({ timeEntries }: TimeTrackerProps) {
  // Calculate total minutes from all time entries
  const totalMinutes = timeEntries.reduce((total, entry) => {
    const duration = calculateDuration(
      entry.startTime, 
      entry.endTime, 
      entry.startAmPm || 'AM', 
      entry.endAmPm || 'AM'
    )
    console.log('Entry duration:', {
      activity: entry.activityName,
      from: entry.startTime + ' ' + (entry.startAmPm || 'AM'),
      to: entry.endTime + ' ' + (entry.endAmPm || 'AM'),
      minutes: duration,
      hours: Math.floor(duration/60) + 'h ' + (duration%60) + 'm'
    })
    return total + duration
  }, 0)
  
  console.log('TOTAL MINUTES:', totalMinutes, '=', Math.floor(totalMinutes/60) + 'h ' + (totalMinutes%60) + 'm')
  
  const formattedTime = formatDuration(totalMinutes)
  
  // Calculate individual durations for breakdown
  const activityBreakdown = timeEntries.map(entry => {
    const duration = calculateDuration(
      entry.startTime, 
      entry.endTime, 
      entry.startAmPm || 'AM', 
      entry.endAmPm || 'AM'
    )
    return {
      name: entry.activityName,
      duration,
      formattedDuration: formatDuration(duration),
      timeRange: `${entry.startTime} ${entry.startAmPm || 'AM'} - ${entry.endTime} ${entry.endAmPm || 'AM'}`
    }
  })
  
  return (
    <div className="space-y-3">
      {/* Total Time Tracker */}
      <div className="flex justify-between text-sm">
        <span>Time Tracker:</span>
        <span className="font-medium">{formattedTime}</span>
      </div>
      
      {/* Individual Activity Breakdown */}
      {activityBreakdown.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-gray-300">
          {activityBreakdown.map((activity, index) => (
            <div key={index} className="flex justify-between text-xs text-orange-400">
              <span className="truncate">{activity.name}</span>
              <div className="flex flex-col items-end ml-2">
                <span className="font-medium">{activity.formattedDuration}</span>
                <span className="text-xs">{activity.timeRange}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}