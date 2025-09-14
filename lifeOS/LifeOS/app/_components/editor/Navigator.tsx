// NAVIGATOR COMPONENT - Main editor panel with tabs and navigation for LifeOS
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/editor/Navigator.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { useConvexAuth } from "convex/react";
import { ChevronLeft, ChevronRight, Plus, X, FileCode, FileText, Settings, CreditCard, User, Calendar, BookOpen, CheckSquare, MapPin, Lightbulb } from "lucide-react";
import { UserProfile } from "@/app/_components/activity/_components/userProfle/UserProfile";
import { FileExplorerTab } from "@/app/_components/activity/_components/fileExplorer";
import { CalendarTab } from "@/app/_components/activity/_components/calendar";
import { BooksTab } from "@/app/_components/activity/_components/books";
import { KanbanTodosTab } from "@/app/_components/activity/_components/todos";
import { ResearchTab } from "@/app/_components/activity/_components/research";
import { RunningDashboard } from "@/app/_components/activity/_components/health/RunningDashboard";

export function Navigator() {
  const { 
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab
  } = useEditorStore();

  const { isAuthenticated } = useConvexAuth();
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Calculate the visible area width (container width minus button widths)
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

  // Adjust scroll position if tabs are removed
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

  const handleNewFile = () => {
    if (isAuthenticated) {
      const newTab = {
        id: `new-file-${Date.now()}`,
        title: 'Untitled',
        type: 'file' as const,
        filePath: undefined
      };
      openTab(newTab);
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'file':
        return FileCode;
      case 'welcome':
        return FileText;
      case 'settings':
        return Settings;
      case 'subscription':
        return CreditCard;
      case 'user-profile':
        return User;
      case 'calendar':
        return Calendar;
      case 'books':
        return BookOpen;
      case 'todos':
        return CheckSquare;
      case 'running':
        return MapPin;
      case 'research':
        return Lightbulb;
      default:
        return FileCode;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] h-full">
      {/* Tab Bar */}
      <div className="h-[35px] bg-[#181818] border-b border-r border-[#2d2d2d] relative flex-shrink-0">
        {/* Tab Container - Full width with space for buttons */}
        <div ref={containerRef} className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#1e1e1e]">
          <div 
            className="flex transition-transform duration-200 h-full"
            style={{ 
              transform: `translateX(-${scrollPosition * 200}px)` 
            }}
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`
                  flex items-center gap-2 px-3 h-[35px] text-xs border-r border-[#2d2d2d] ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'} flex-shrink-0 transition-colors duration-150
                  ${activeTabId === tab.id
                    ? 'bg-[#1a1a1a] text-[#cccccc]'
                    : 'bg-[#0e0e0e] text-[#858585] hover:bg-[#181818]'
                  }
                `}
                style={{ 
                  width: '200px'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {(() => {
                  const IconComponent = getTabIcon(tab.type);
                  return <IconComponent className="w-3 h-3 flex-shrink-0" />;
                })()}
                <span className={`truncate flex-1 ${tab.isDirty ? 'text-[#cccccc]' : ''}`}>
                  {tab.title}
                </span>
                {tab.isDirty && <div className="w-2 h-2 bg-[#cccccc] rounded-full flex-shrink-0" />}

                {/* Close Button - Shows on hover for all tabs when authenticated */}
                {isAuthenticated && hoveredTab === tab.id && (
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
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`
            absolute left-0 z-10 w-8 h-[35px] flex items-center justify-center border-r border-b border-[#2d2d2d] bg-[#181818]
            ${canScrollLeft 
              ? 'hover:bg-[#2d2d2d] text-[#858585]' 
              : 'text-[#3d3d3d] opacity-30'
            }
          `}
        >
          <span className="sr-only">Scroll left</span>
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Right side buttons container - Overlay */}
        <div className="absolute right-0 z-10 flex h-[35px] bg-[#181818] border-b border-[#2d2d2d]">
          {/* Right Scroll Button */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`
              w-8 h-[35px] flex items-center justify-center border-l border-[#2d2d2d]
              ${canScrollRight 
                ? 'hover:bg-[#2d2d2d] text-[#858585]' 
                : 'text-[#3d3d3d] opacity-30'
              }
            `}
          >
            <span className="sr-only">Scroll right</span>
            <ChevronRight className="w-3 h-3" />
          </button>
            
          {/* Add New Tab Button */}
          <button
            disabled={!isAuthenticated}
            className={`flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] transition-colors ${
              isAuthenticated
                ? 'text-[#858585] hover:bg-[#2d2d2d]'
                : 'text-[#3d3d3d] opacity-50'
            }`}
            onClick={handleNewFile}
          >
            <span className="sr-only">Create new file</span>
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editor Content - Scrollable */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        {currentTab ? (
          <>
            {currentTab.type === 'user-profile' && <UserProfile />}
            {currentTab.type === 'file' && currentTab.id === 'file-explorer' && <FileExplorerTab />}
            {currentTab.type === 'calendar' && <CalendarTab />}
            {currentTab.type === 'books' && <BooksTab />}
            {currentTab.type === 'todos' && <KanbanTodosTab />}
            {currentTab.type === 'running' && <RunningDashboard />}
            {currentTab.type === 'research' && <ResearchTab />}
            {currentTab.type === 'subscription' && (
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-[#cccccc] mb-4">
                  Subscription Plans
                </h2>
                <p className="text-[#858585]">
                  Manage your subscription and billing preferences.
                </p>
              </div>
            )}
            {currentTab.type === 'settings' && (
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-[#cccccc] mb-4">
                  Settings
                </h2>
                <p className="text-[#858585]">
                  Configure your LifeOS preferences and editor settings.
                </p>
              </div>
            )}
            {(currentTab.type === 'file' && currentTab.id !== 'file-explorer') && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold text-[#cccccc]">
                    {currentTab.title}
                  </h2>
                  <p className="text-[#858585]">
                    Edit your file here
                  </p>
                </div>
              </div>
            )}
            {currentTab.type === 'welcome' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold text-[#cccccc]">
                    {currentTab.title}
                  </h2>
                  <p className="text-[#858585]">
                    Welcome to LifeOS!
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            {/* Background image commented out for now */}
            {/* 
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: 'url(/frweywer.png)',
                filter: 'blur(2px) brightness(0.4)'
              }}
            ></div>
            <div className="absolute inset-0 bg-black/30"></div>
            */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-white drop-shadow-2xl tracking-tight">
                {isAuthenticated ? 'Welcome to LifeOS!' : 'Please sign in'}
              </h1>
              <p className="text-xl text-white/90 drop-shadow-lg font-medium">
                {isAuthenticated ? 'Create a new file to get started.' : 'Sign in to access the editor.'}
              </p>
              {isAuthenticated && (
                <button
                  onClick={handleNewFile}
                  className="px-6 py-3 bg-[#007acc] text-white rounded-lg hover:bg-[#005a9e] transition-all duration-200 shadow-2xl text-lg font-semibold hover:shadow-xl hover:scale-105"
                >
                  Create New File
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
