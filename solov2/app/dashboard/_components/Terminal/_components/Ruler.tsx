"use client";

import React, { useEffect, useRef, useState } from 'react';

interface RulerProps {
  /** Minimum scale value */
  min?: number;
  /** Maximum scale value */
  max?: number;
}

export function Ruler({ min = 0, max = 100 }: RulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (rulerRef.current) {
        setContainerWidth(rulerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    
    if (rulerRef.current) {
      resizeObserver.observe(rulerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate tick marks based on container width
  const getTicks = () => {
    if (containerWidth < 100) return [];
    
    const range = max - min;
    const pixelsPerUnit = containerWidth / range;
    
    // Determine tick density based on available space
    let majorTickInterval: number;
    let minorTickInterval: number;
    
    if (pixelsPerUnit >= 10) {
      // High density: show every 1 and 5
      majorTickInterval = 10;
      minorTickInterval = 5;
    } else if (pixelsPerUnit >= 5) {
      // Medium density: show every 5 and 10
      majorTickInterval = 20;
      minorTickInterval = 10;
    } else if (pixelsPerUnit >= 2) {
      // Lower density: show every 10 and 20
      majorTickInterval = 25;
      minorTickInterval = 25;
    } else {
      // Very low density: show only major marks
      majorTickInterval = 50;
      minorTickInterval = 50;
    }

    const ticks = [];
    
    for (let i = min; i <= max; i += minorTickInterval) {
      const position = ((i - min) / range) * 100;
      const isMajor = i % majorTickInterval === 0;
      const isHalf = i % (majorTickInterval / 2) === 0 && !isMajor;
      
      ticks.push({
        value: i,
        position,
        type: isMajor ? 'major' : isHalf ? 'medium' : 'minor',
        showLabel: isMajor && pixelsPerUnit >= 3 && i !== min && i !== max
      });
    }
    
    return ticks;
  };

  const ticks = getTicks();

  return (
    <div 
      ref={rulerRef}
      className="relative h-6 w-full"
    >
      {/* Main ruler line */}
      <div className="absolute top-2 left-0 right-0 h-px bg-[#3d3d3d]" />
      
      {/* Tick marks */}
      {ticks.map((tick, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center -translate-x-1/2 top-2"
          style={{ left: `${tick.position}%` }} // eslint-disable-line
        >
          {/* Tick mark - positioned below the line */}
          <div
            className={`bg-[#858585] w-px ${
              tick.type === 'major' 
                ? 'h-2' 
                : tick.type === 'medium'
                ? 'h-1.5'
                : 'h-1'
            }`}
          />
          
          {/* Tick label for major marks */}
          {tick.showLabel && (
            <span className="text-[8px] text-[#858585] font-dm-sans mt-0.5 select-none">
              {tick.value}
            </span>
          )}
        </div>
      ))}
      
      {/* Ruler end caps */}
      <div className="absolute top-2 left-0 w-px h-2 bg-[#858585]" />
      <div className="absolute top-2 right-0 w-px h-2 bg-[#858585]" />
    </div>
  );
}
