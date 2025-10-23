"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  onValueChange?: (value: number[]) => void
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, value, defaultValue, min = 0, max = 100, step = 1, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(
      value || defaultValue || [min]
    )

    const currentValue = value || internalValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      if (!value) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={handleChange}
          className={cn(
            "w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-0",
            "[&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          {...props}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-track {
            background: linear-gradient(
              to right,
              #06b6d4 0%,
              #06b6d4 ${((currentValue[0] - min) / (max - min)) * 100}%,
              #404040 ${((currentValue[0] - min) / (max - min)) * 100}%,
              #404040 100%
            );
          }
        `}</style>
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }