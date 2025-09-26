// RESIZER COMPONENT - Horizontal resizer for terminal panel
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Terminal/Resizer.tsx

"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ResizerProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export function Resizer({ 
  onResize, 
  minWidth = 280, 
  maxWidth = 800, 
  className = "" 
}: ResizerProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    
    // Get the current width of the terminal container
    const terminalElement = resizerRef.current?.parentElement;
    if (terminalElement) {
      setStartWidth(terminalElement.offsetWidth);
    }
    
    // Add cursor style to body during resize
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = startX - e.clientX; // Reverse delta since we're resizing from the left
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
    
    onResize(newWidth);
  }, [isResizing, startX, startWidth, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    
    // Remove cursor style from body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={resizerRef}
      className={`
        absolute left-0 top-0 bottom-0 w-3 
        bg-transparent 
        cursor-grab 
        z-10 
        group
        ${className}
      `}
      onMouseDown={handleMouseDown}
      title="Drag to resize terminal"
    >
      {/* Visual indicator line - parent hover triggers this line to turn white */}
      <div 
        className={`
          absolute left-0 top-0 bottom-0 w-px 
          bg-[#2d2d2d] 
          group-hover:bg-white
          transition-colors duration-150
        `} 
      />
    </div>
  );
}