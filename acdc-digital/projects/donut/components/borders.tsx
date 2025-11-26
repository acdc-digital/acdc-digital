// Borders Component - Interactive grabbable borders for donut chart sections
// /Users/matthewsimon/Projects/acdc-digital/donut/components/borders.tsx

"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface Border {
  id: string
  angle: number // Angle in degrees (0-360)
  sectionName: string
  isGrabbing: boolean
}

interface BordersProps {
  data: Array<{
    name: string
    value: number
    fill: string
  }>
  onBorderDrag?: (sectionId: string, newValue: number) => void
  centerX?: number
  centerY?: number
  radius?: number
}

export function Borders({ 
  data, 
  onBorderDrag, 
  centerX = 150, 
  centerY = 150, 
  radius = 100 
}: BordersProps) {
  const [borders, setBorders] = useState<Border[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate border positions from data
  useEffect(() => {
    if (!data || data.length === 0) return

    let cumulativeAngle = 0
    const newBorders: Border[] = []

    data.forEach((item, index) => {
      // Calculate the percentage and angle for this section
      const total = data.reduce((sum, d) => sum + d.value, 0)
      const percentage = (item.value / total) * 100
      const sectionAngle = (percentage / 100) * 360

      // Add border at the end of this section (except for the last section)
      if (index < data.length - 1) {
        cumulativeAngle += sectionAngle
        newBorders.push({
          id: `border-${index}`,
          angle: cumulativeAngle,
          sectionName: item.name,
          isGrabbing: false
        })
      }
    })

    setBorders(newBorders)
  }, [data])

  // Convert angle to x,y coordinates
  const angleToCoords = (angle: number) => {
    const radian = ((angle - 90) * Math.PI) / 180 // -90 to start from top
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    }
  }

  // Convert mouse position to angle
  const mouseToAngle = useCallback((mouseX: number, mouseY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return 0

    const relativeX = mouseX - rect.left - centerX
    const relativeY = mouseY - rect.top - centerY
    
    let angle = (Math.atan2(relativeY, relativeX) * 180) / Math.PI + 90
    if (angle < 0) angle += 360
    
    return angle
  }, [centerX, centerY])

  const handleMouseDown = (borderId: string) => {
    setDragging(borderId)
    setBorders(prev => 
      prev.map(border => 
        border.id === borderId 
          ? { ...border, isGrabbing: true }
          : border
      )
    )
  }

  // Add global mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return

      const newAngle = mouseToAngle(e.clientX, e.clientY)
      
      setBorders(prev =>
        prev.map(border =>
          border.id === dragging
            ? { ...border, angle: newAngle }
            : border
        )
      )

      // Notify parent of the change
      if (onBorderDrag) {
        const borderIndex = borders.findIndex(b => b.id === dragging)
        if (borderIndex !== -1) {
          // Calculate new percentages based on angle change
          const newPercentage = (newAngle / 360) * 100
          onBorderDrag(borders[borderIndex].sectionName, newPercentage)
        }
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      setBorders(prev =>
        prev.map(border => ({ ...border, isGrabbing: false }))
      )
    }

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'auto'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'auto'
    }
  }, [dragging, borders, onBorderDrag, mouseToAngle])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      {borders.map((border) => {
        const coords = angleToCoords(border.angle)
        
        return (
          <div
            key={border.id}
            className={`
              absolute pointer-events-auto
              w-4 h-4 -ml-2 -mt-2
              rounded-full
              border-2 border-white
              bg-gray-800 hover:bg-gray-600
              transition-all duration-200
              ${border.isGrabbing ? 'scale-125 bg-gray-500' : ''}
              ${dragging === border.id ? 'cursor-grabbing' : 'cursor-grab'}
            `}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`
            }}
            onMouseDown={() => handleMouseDown(border.id)}
            title={`Adjust ${border.sectionName} time allocation`}
          >
            {/* Glove/grab icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-white"
              >
                <path d="M8.5 1.5A1.5 1.5 0 0 0 7 3v3H6V3a2.5 2.5 0 0 1 5 0v7a.5.5 0 0 1-1 0V8.5a.5.5 0 0 0-1 0v1.793l-.854.853a.5.5 0 1 1-.707-.707L8.5 9.5V3a.5.5 0 0 0-.5-.5z"/>
                <path d="M3 7.5a.5.5 0 0 1 .5-.5H5v-.5a.5.5 0 0 1 1 0V7h1.5a.5.5 0 0 1 0 1H6v.5a.5.5 0 0 1-1 0V8H3.5a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}