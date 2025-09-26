// NAVIGATION COMPONENT - Tab navigation for Soloist dashboard
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Navigation/Navigation.tsx

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  FileCode, 
  FileText, 
  Settings,
  Calendar,
  Bot,
  Palette,
  Pin
} from 'lucide-react';
import { useTabContext } from '../context/TabContext';

export function Navigation() {
  const { tabs, activeTabId, setActiveTabId, closeTab } = useTabContext();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = true; // TODO: Replace with actual auth state
  const TAB_WIDTH = 200;
  const visibleTabsCount = Math.floor(containerWidth / TAB_WIDTH) || 1;
  const maxScrollPosition = Math.max(0, tabs.length - visibleTabsCount);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  useEffect(() => {
    if (scrollPosition > maxScrollPosition) {
      setScrollPosition(maxScrollPosition);
    }
  }, [maxScrollPosition, scrollPosition]);

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const scrollRight = () => {
    setScrollPosition(Math.min(maxScrollPosition, scrollPosition + 1));
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScrollPosition && tabs.length > 0;



  const getTabIcon = (type: string) => {
    switch (type) {
      case 'file':
        return FileCode;
      case 'welcome':
        return FileText;
      case 'settings':
        return Settings;
      case 'calendar':
        return Calendar;
      case 'agent':
        return Bot;
      case 'identity-guidelines':
        return Palette;
      default:
        return FileCode;
    }
  };

  return (
    <div className="h-[35px] bg-[#1e1e1e] border-b border-r border-[#2d2d2d] relative flex-shrink-0">
      {/* Tab Container - Full width with space for buttons */}
      <div ref={containerRef} className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#1e1e1e]">
        <div 
          className="flex transition-transform duration-200 h-full"
          style={{ 
            transform: `translateX(-${scrollPosition * 200}px)`,
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`
                flex items-center gap-2 px-3 h-[35px] text-xs border-r border-[#2d2d2d] ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'} flex-shrink-0 transition-colors duration-150 w-[200px]
                ${activeTabId === tab.id
                  ? 'bg-[#1a1a1a] text-[#cccccc]'
                  : 'bg-[#0e0e0e] text-[#858585] hover:bg-[#181818]'
                }
              `}
              onClick={() => setActiveTabId(tab.id)}
            >
              {(() => {
                const IconComponent = getTabIcon(tab.type);
                return <IconComponent className="w-3 h-3 flex-shrink-0" />;
              })()}
              <span className={`truncate flex-1 ${tab.isDirty ? 'text-[#cccccc]' : ''}`}>
                {tab.title}
              </span>
              {tab.isDirty && <div className="w-2 h-2 bg-[#cccccc] rounded-full flex-shrink-0" />}
              
              {/* Pin Icon - Shows for pinned tabs */}
              {tab.isPinned && (
                <Pin className="w-3 h-3 flex-shrink-0 text-[#008080]" />
              )}

              {/* Close Button - Shows on hover for non-pinned tabs when authenticated */}
              {isAuthenticated && hoveredTab === tab.id && tabs.length > 1 && !tab.isPinned && (
                <X
                  className="w-3 h-3 hover:bg-[#2d2d2d] rounded flex-shrink-0 text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Left Scroll Button - Overlay */}
      <div className="absolute left-0 z-10 w-8 h-[35px] border-r border-b border-[#2d2d2d] bg-[#1e1e1e]">
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`w-full h-full flex items-center justify-center ${canScrollLeft
              ? 'hover:bg-[#2d2d2d] text-[#858585]'
              : 'text-[#3d3d3d] opacity-30'
            }`}
        >
          <span className="sr-only">Scroll left</span>
          <ChevronLeft className="w-3 h-3" />
        </button>
      </div>

      {/* Right side buttons container - Overlay */}
      <div className="absolute right-0 z-10 flex h-[35px] bg-[#1e1e1e] border-b border-[#2d2d2d]">
        {/* Right Scroll Button */}
        <div className="w-9.75 h-[35px] border-l border-[#2d2d2d]">
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`w-full h-full flex items-center justify-center ${canScrollRight
                ? 'hover:bg-[#2d2d2d] text-[#858585]'
                : 'text-[#3d3d3d] opacity-30'
              }`}
          >
            <span className="sr-only">Scroll right</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}