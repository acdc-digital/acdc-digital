// Input Time Component - Row component for adding new time tracking entries
// /Users/matthewsimon/Projects/acdc-digital/donut/components/inputTime.tsx

"use client"

import { useState, useEffect } from "react"
import { useTimeInputStore } from "../lib/timeInputStore"

// Using HTML input for now - can be replaced with shadcn Input component later

interface InputTimeProps {
  rowId?: number  // Unique ID for this row
  onRemove?: () => void
  onTimeChange?: (data: { 
    activityName: string
    startTime: string
    endTime: string
    startAmPm: 'AM' | 'PM'
    endAmPm: 'AM' | 'PM'
  }) => void
}

// Time Range Selector component for Start/End time selection
interface TimeRangeSelectorProps {
  rowId: number  // Unique row identifier
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onAmPmChange?: () => void
}

// AM/PM Selector Component
interface AmPmSelectorProps {
  fieldKey: string
  onToggle?: () => void
}

function AmPmSelector({ fieldKey, onToggle }: AmPmSelectorProps) {
  const { amPmValues, toggleAmPm } = useTimeInputStore()
  const currentAmPm = amPmValues[fieldKey] || 'AM'
  
  const handleToggle = () => {
    toggleAmPm(fieldKey)
    if (onToggle) {
      onToggle()
    }
  }
  
  return (
    <div className="flex flex-col items-center ml-1">
      <button
        onClick={handleToggle}
        className="text-xs text-muted-foreground hover:text-gray-300 leading-none h-2 flex items-center"
        title="Toggle AM/PM"
      >
        ▲
      </button>
      <span className="text-xs font-medium text-muted-foreground my-0.5 min-w-[20px] text-center">
        {currentAmPm}
      </span>
      <button
        onClick={handleToggle}
        className="text-xs text-muted-foreground hover:text-gray-300 leading-none h-2 flex items-center"
        title="Toggle AM/PM"
      >
        ▼
      </button>
    </div>
  )
}

function TimeRangeSelector({ rowId, startTime, endTime, onStartTimeChange, onEndTimeChange, onAmPmChange }: TimeRangeSelectorProps) {
  const [startHours, startMinutes] = startTime.split(':')
  const [endHours, endMinutes] = endTime.split(':')
  
  const { 
    inputBuffers, 
    displayValues, 
    amPmValues,
    setInputBuffer, 
    setDisplayValue, 
    setAmPm,
    clearField
  } = useTimeInputStore()
  
  // Initialize AM/PM values if not set - use unique keys per row
  const startAmPmKey = `start_ampm_${rowId}`
  const endAmPmKey = `end_ampm_${rowId}`
  
  useEffect(() => {
    if (!amPmValues[startAmPmKey]) {
      setAmPm(startAmPmKey, 'AM')
    }
    if (!amPmValues[endAmPmKey]) {
      setAmPm(endAmPmKey, 'AM')
    }
  }, [amPmValues, setAmPm, startAmPmKey, endAmPmKey])



  const handleTimeInput = (e: React.KeyboardEvent, type: 'hour' | 'minute', isStart: boolean) => {
    const fieldKey = `${isStart ? 'start' : 'end'}_${type}_${rowId}`
    
    // Handle Enter key - save the current buffer
    if (e.key === 'Enter') {
      const currentBuffer = inputBuffers[fieldKey] || ''
      if (currentBuffer) {
        let finalValue = parseInt(currentBuffer)
        
        // Validate ranges - hours: 1-12, minutes: 0-59
        if (type === 'hour') {
          if (finalValue === 0) finalValue = 12
          else if (finalValue > 12) finalValue = 12
        } else { // minutes
          if (finalValue > 59) finalValue = 59
        }
        
        const formattedValue = finalValue.toString().padStart(2, '0')
        
        if (type === 'hour') {
          const minutes = isStart ? startMinutes : endMinutes
          const newTime = `${formattedValue}:${minutes}`
          console.log('Hour change:', newTime)
          if (isStart) {
            onStartTimeChange(newTime)
          } else {
            onEndTimeChange(newTime)
          }
        } else {
          const hours = isStart ? startHours : endHours
          const newTime = `${hours}:${formattedValue}`
          console.log('Minute change:', newTime)
          if (isStart) {
            onStartTimeChange(newTime)
          } else {
            onEndTimeChange(newTime)
          }
        }
        
        // Clear field
        clearField(fieldKey)
        ;(e.currentTarget as HTMLInputElement).blur()
      }
      return
    }
    
    // Handle Backspace - remove last digit from buffer
    if (e.key === 'Backspace') {
      const currentBuffer = inputBuffers[fieldKey] || ''
      if (currentBuffer.length > 0) {
        const newBuffer = currentBuffer.slice(0, -1)
        setInputBuffer(fieldKey, newBuffer)
        setDisplayValue(fieldKey, newBuffer.length === 0 ? '00' : newBuffer.padStart(2, '0'))
      }
      e.preventDefault()
      return
    }
    
    // Allow navigation and control keys
    if ([9, 27, 37, 38, 39, 40, 46].includes(e.keyCode)) return
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) return
    
    // Only allow numbers
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault()
      return
    }

    e.preventDefault()

    const currentBuffer = inputBuffers[fieldKey] || ''
    
    // Don't allow more than 2 digits
    if (currentBuffer.length >= 2) return
    
    const newBuffer = currentBuffer + e.key
    setInputBuffer(fieldKey, newBuffer)
    setDisplayValue(fieldKey, newBuffer.padStart(2, '0'))
  }

  const handleTimeClick = (e: React.MouseEvent, type: 'hour' | 'minute', isStart: boolean) => {
    const input = e.currentTarget as HTMLInputElement
    const fieldKey = `${isStart ? 'start' : 'end'}_${type}_${rowId}`
    
    // Start editing - clear buffer and set display to 00
    clearField(fieldKey)
    setDisplayValue(fieldKey, '00')
    input.focus()
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">begin</span>
      <div className="flex items-center">
        <input
          type="text"
          title="Start hours"
          value={displayValues[`start_hour_${rowId}`] || startHours}
          onChange={() => {}} // Controlled by keyboard handler
          onKeyDown={(e) => handleTimeInput(e, 'hour', true)}
          onClick={(e) => handleTimeClick(e, 'hour', true)}
          maxLength={2}
          className="bg-transparent border border-gray-300 rounded-l px-1 py-0.5 text-xs outline-none focus:bg-transparent focus:border-gray-300 caret-white w-8 text-center"
        />
        <span className="text-gray-400">:</span>
        <input
          type="text"
          title="Start minutes"
          value={displayValues[`start_minute_${rowId}`] || startMinutes}
          onChange={() => {}} // Controlled by keyboard handler
          onKeyDown={(e) => handleTimeInput(e, 'minute', true)}
          onClick={(e) => handleTimeClick(e, 'minute', true)}
          maxLength={2}
          className="bg-transparent border border-gray-300 rounded-r px-1 py-0.5 text-xs outline-none focus:bg-transparent focus:border-gray-300 caret-white w-8 text-center"
        />
        <AmPmSelector fieldKey={startAmPmKey} onToggle={onAmPmChange} />
      </div>
      <span className="text-muted-foreground">end</span>
      <div className="flex items-center">
        <input
          type="text"
          title="End hours"
          value={displayValues[`end_hour_${rowId}`] || endHours}
          onChange={() => {}} // Controlled by keyboard handler
          onKeyDown={(e) => handleTimeInput(e, 'hour', false)}
          onClick={(e) => handleTimeClick(e, 'hour', false)}
          maxLength={2}
          className="bg-transparent border border-gray-300 rounded-l px-1 py-0.5 text-xs outline-none focus:bg-transparent focus:border-gray-300 caret-white w-8 text-center"
        />
        <span className="text-gray-400">:</span>
        <input
          type="text"
          title="End minutes"
          value={displayValues[`end_minute_${rowId}`] || endMinutes}
          onChange={() => {}} // Controlled by keyboard handler
          onKeyDown={(e) => handleTimeInput(e, 'minute', false)}
          onClick={(e) => handleTimeClick(e, 'minute', false)}
          maxLength={2}
          className="bg-transparent border border-gray-300 rounded-r px-1 py-0.5 text-xs outline-none focus:bg-transparent focus:border-gray-300 caret-white w-8 text-center"
        />
        <AmPmSelector fieldKey={endAmPmKey} onToggle={onAmPmChange} />
      </div>
    </div>
  )
}

export function InputTime({ rowId = Date.now(), onRemove, onTimeChange }: InputTimeProps) {
  const [activityName, setActivityName] = useState("")
  const [isEditing, setIsEditing] = useState(true)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")

  // Get AM/PM values from store
  const { amPmValues } = useTimeInputStore()
  
  // Notify parent of time changes
  const notifyTimeChange = () => {
    if (onTimeChange && activityName.trim()) {
      const startAmPmKey = `start_ampm_${rowId}`
      const endAmPmKey = `end_ampm_${rowId}`
      onTimeChange({ 
        activityName, 
        startTime, 
        endTime,
        startAmPm: amPmValues[startAmPmKey] || 'AM',
        endAmPm: amPmValues[endAmPmKey] || 'AM'
      })
    }
  }
  
  // Helper to trigger time change when AM/PM changes
  const handleAmPmChange = () => {
    // Force a small delay to ensure Zustand store has updated
    setTimeout(() => {
      if (onTimeChange && activityName.trim()) {
        const startAmPmKey = `start_ampm_${rowId}`
        const endAmPmKey = `end_ampm_${rowId}`
        const { amPmValues: freshAmPmValues } = useTimeInputStore.getState()
        
        onTimeChange({ 
          activityName, 
          startTime, 
          endTime,
          startAmPm: freshAmPmValues[startAmPmKey] || 'AM',
          endAmPm: freshAmPmValues[endAmPmKey] || 'AM'
        })
      }
    }, 10) // Small delay to ensure store update
  }

  const handleSubmit = () => {
    if (activityName.trim()) {
      setIsEditing(false)
      notifyTimeChange()
    } else {
      // If empty, remove the row
      if (onRemove) {
        onRemove()
      }
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className="flex items-center justify-between py-2">
      {/* Activity Input Field */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-3 h-3 rounded-full border border-gray-400" />
        {isEditing ? (
          <input 
            type="text"
            placeholder="Enter activity name..."
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            onBlur={handleSubmit}
            autoFocus
            className="mr-6 text-sm border border-transparent outline-none bg-transparent flex-1 px-1 py-1 placeholder:text-gray-400 focus:border-white rounded transition-colors"
          />
        ) : (
          <span 
            onClick={handleEdit}
            className="text-sm flex-1 px-1 py-1 cursor-pointer"
          >
            {activityName}
          </span>
        )}
      </div>
      
      {/* Start/End Time Component */}
      <div className="flex items-center gap-2">
        <TimeRangeSelector 
          rowId={rowId}
          startTime={startTime}
          endTime={endTime}
          onAmPmChange={handleAmPmChange}
          onStartTimeChange={(time) => {
            setStartTime(time)
            // Immediately notify of time changes, regardless of edit state
            if (onTimeChange && activityName.trim()) {
              const startAmPmKey = `start_ampm_${rowId}`
              const endAmPmKey = `end_ampm_${rowId}`
              onTimeChange({ 
                activityName, 
                startTime: time, 
                endTime,
                startAmPm: amPmValues[startAmPmKey] || 'AM',
                endAmPm: amPmValues[endAmPmKey] || 'AM'
              })
            }
          }}
          onEndTimeChange={(time) => {
            setEndTime(time)
            // Immediately notify of time changes, regardless of edit state
            if (onTimeChange && activityName.trim()) {
              const startAmPmKey = `start_ampm_${rowId}`
              const endAmPmKey = `end_ampm_${rowId}`
              onTimeChange({ 
                activityName, 
                startTime, 
                endTime: time,
                startAmPm: amPmValues[startAmPmKey] || 'AM',
                endAmPm: amPmValues[endAmPmKey] || 'AM'
              })
            }
          }}
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-md text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}