// Interactive Donut Chart - Custom SVG chart with draggable borders
// /Users/matthewsimon/Projects/acdc-digital/donut/components/ui/interactiveDonutChart.tsx

"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"

interface ChartData {
  name: string
  value: number
  fill: string
}

interface InteractiveDonutChartProps {
  data: ChartData[]
  onDataChange?: (newData: ChartData[]) => void
  className?: string
  stroke?: string
  strokeWidth?: number
  size?: number
}

export function InteractiveDonutChart({ 
  data, 
  onDataChange,
  className = "",
  stroke = "#ffffff",
  strokeWidth = 3,
  size = 300
}: InteractiveDonutChartProps) {
  const [dragging, setDragging] = useState<number | null>(null)
  const [localData, setLocalData] = useState<ChartData[]>(data)
  const svgRef = useRef<SVGSVGElement>(null)
  const lastAngleRef = useRef<number>(0)
  const dragStartAngleRef = useRef<number>(0)

  const centerX = size / 2
  const centerY = size / 2
  const innerRadius = 90
  const outerRadius = 150

  // Update local data when props change
  useEffect(() => {
    setLocalData(data)
  }, [data])

  // Convert angle to coordinates
  const polarToCartesian = useCallback((angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180)
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    }
  }, [centerX, centerY])

  // Convert mouse position to angle with caching
  const mouseToAngle = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return 0
    
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top
    
    const deltaX = mouseX - centerX
    const deltaY = mouseY - centerY
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360
    
    return angle
  }, [centerX, centerY])

  // Throttle function to limit update frequency
  const throttle = useCallback(<T extends unknown[]>(func: (...args: T) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0
    return (...args: T) => {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }, [])

  // Create SVG path for donut segment
  const createArcPath = useCallback((startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const start = polarToCartesian(startAngle, outerR)
    const end = polarToCartesian(endAngle, outerR)
    const innerStart = polarToCartesian(startAngle, innerR)
    const innerEnd = polarToCartesian(endAngle, innerR)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      "M", start.x, start.y,
      "A", outerR, outerR, 0, largeArcFlag, 1, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerR, innerR, 0, largeArcFlag, 0, innerStart.x, innerStart.y,
      "Z"
    ].join(" ")
  }, [polarToCartesian])

  // Calculate segments with current data
  const segments = localData.map((item, index) => {
    const total = localData.reduce((sum, d) => sum + d.value, 0)
    const percentage = (item.value / total) * 100
    return { ...item, percentage, index }
  })

  // Calculate cumulative angles for segments
  let cumulativeAngle = 0
  const segmentData = segments.map((segment) => {
    const startAngle = cumulativeAngle
    const segmentAngle = (segment.percentage / 100) * 360
    const endAngle = startAngle + segmentAngle
    cumulativeAngle = endAngle
    
    return {
      ...segment,
      startAngle,
      endAngle,
      segmentAngle
    }
  })

  // Handle border drag with constraints
  const handleBorderDrag = useCallback((borderIndex: number, newAngle: number) => {
    if (borderIndex >= segmentData.length - 1) return

    // Constrain angle to reasonable bounds
    const prevBorderAngle = borderIndex > 0 ? segmentData[borderIndex - 1].endAngle : 0
    const nextBorderAngle = borderIndex < segmentData.length - 2 ? segmentData[borderIndex + 2].endAngle : 360
    
    // Add minimum segment size (5 degrees)
    const minAngle = prevBorderAngle + 5
    const maxAngle = nextBorderAngle - 5
    
    const constrainedAngle = Math.max(minAngle, Math.min(maxAngle, newAngle))
    
    const newData = [...localData]
    const total = newData.reduce((sum, d) => sum + d.value, 0)
    
    // Update the segments around the border
    const currentSegmentAngle = constrainedAngle - prevBorderAngle
    const nextSegmentAngle = nextBorderAngle - constrainedAngle
    
    newData[borderIndex].value = Math.max(0.5, (currentSegmentAngle / 360) * total)
    newData[borderIndex + 1].value = Math.max(0.5, (nextSegmentAngle / 360) * total)

    setLocalData(newData)
    onDataChange?.(newData)
  }, [localData, segmentData, onDataChange])

  // Mouse event handlers with throttling
  const throttledDrag = useMemo(
    () => throttle((borderIndex: number, angle: number) => {
      handleBorderDrag(borderIndex, angle)
    }, 16), // ~60fps
    [handleBorderDrag, throttle]
  )

  const handleMouseDown = useCallback((e: React.MouseEvent, borderIndex: number) => {
    e.preventDefault()
    const angle = mouseToAngle(e.clientX, e.clientY)
    dragStartAngleRef.current = angle
    lastAngleRef.current = angle
    setDragging(borderIndex)
  }, [mouseToAngle])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging === null) return
      
      const newAngle = mouseToAngle(e.clientX, e.clientY)
      
      // Only update if angle changed significantly
      if (Math.abs(newAngle - lastAngleRef.current) > 0.5) {
        throttledDrag(dragging, newAngle)
        lastAngleRef.current = newAngle
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      document.body.style.cursor = 'auto'
    }

    if (dragging !== null) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'auto'
    }
  }, [dragging, mouseToAngle, throttledDrag])

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        {/* Render donut segments */}
        {segmentData.map((segment, index) => (
          <path
            key={`segment-${index}`}
            d={createArcPath(segment.startAngle, segment.endAngle, innerRadius, outerRadius)}
            fill={segment.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        ))}
        
        {/* Render draggable borders */}
        {segmentData.slice(0, -1).map((segment, index) => {
          const borderAngle = segment.endAngle
          const innerPoint = polarToCartesian(borderAngle, innerRadius - 10)
          const outerPoint = polarToCartesian(borderAngle, outerRadius + 10)
          const isDragging = dragging === index
          
          return (
            <g key={`border-${index}`}>
              {/* Wide invisible drag area */}
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="transparent"
                strokeWidth={25}
                className="cursor-grab hover:cursor-grab"
                onMouseDown={(e) => handleMouseDown(e, index)}
              />
              
              {/* Visible border line */}
              <line
                x1={polarToCartesian(borderAngle, innerRadius).x}
                y1={polarToCartesian(borderAngle, innerRadius).y}
                x2={polarToCartesian(borderAngle, outerRadius).x}
                y2={polarToCartesian(borderAngle, outerRadius).y}
                stroke={isDragging ? '#3b82f6' : stroke}
                strokeWidth={isDragging ? strokeWidth + 1 : strokeWidth}
                className="pointer-events-none transition-all duration-150"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}