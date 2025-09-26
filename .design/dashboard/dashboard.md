ok, in our new package, ive setup a dashboard page - and id like to setup the page and layout here:
/Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/page.tsx
and
/Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/layout.tsx

context:
/Users/matthewsimon/Projects/acdc-digital/.design

i need your help buidling this out so lets go:
1. our dashboard page will be made from 5 essential components as listed here:
/Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components

ok, lets consider the following:
note- we're developing in dark mode. refer to our standard brand guidelines for colors, etc. 

1. the layout should position -
a. header across the top- then, 
b. activity bar
c. sidepanel 
d. editor
e. navigation
f. terminal
g. footer 

References and definitions:
a. the header spans across the top of the page. reference:
"<header className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none">
          {/* Title */}
          <div className="flex-1 flex justify-start items-center ml-2">
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 text-[#858585] border border-[#858585] rounded-xs p-0.5" />
              <span className="text-xs text-[#858585] font-sf">
                Soloist. | Take control of tomorrow, today.
              </span>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center pr-4">
            <ThemeToggle />
          </div>
        </header>"

2. the activity bar begins below the header, and spans down the left side of the page:
a. the activity bar might reference:
<aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center py-2 space-y-1">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          // Special handling for account icon
          if (item.id === 'account') {
            return (
              <button
                key={item.id}
                className={`w-9 h-9 rounded-none hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]'
                    : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleActivityClick(item.id)}
                title={item.label}
              >
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'border-[#cccccc] text-[#cccccc]'
                      : 'border-[#858585] text-[#858585]'
                  }`}
                >
                  {getUserInitial()}
                </div>
              </button>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handleActivityClick(item.id)}
              disabled={!isAuthenticated}
              className={`
                w-9 h-9 rounded-none hover:bg-[#2d2d2d] relative
                ${isActive 
                  ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]' 
                  : 'border-l-2 border-transparent'
                }
                ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isAuthenticated ? item.label : 'Sign in to access'}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#cccccc]' : 'text-[#858585]'
                }`}
              />
            </Button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto mb-2 flex flex-col items-center space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handleActivityClick(item.id)}
              disabled={!isAuthenticated}
              className={`
                w-9 h-9 rounded-none hover:bg-[#2d2d2d] relative
                ${isActive 
                  ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]' 
                  : 'border-l-2 border-transparent'
                }
                ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isAuthenticated ? item.label : 'Sign in to access'}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#cccccc]' : 'text-[#858585]'
                }`}
              />
            </Button>
          );
        })}
      </div>
    </aside>
  );
}

3. ensure to use shadcn for the sidebar/ sidepanel. 

4. the editor is the main content area. we're displaying large amounts of data visualization here, including a future heatmap, so it will be a big space. 

5. the navigation menu is a placeholder for now. we still need to scaffold it into the design, and we'll update the functionality as we go along. heres a reference of a working component- that you can strip down for design requirements.

// NAVIGATOR COMPONENT - Main editor panel with tabs and navigation for AURA
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/editor/Navigator.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { useConvexAuth } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, Plus, X, FileCode, FileText, Settings, CreditCard, User, Calendar, Bot, Puzzle, Palette } from "lucide-react";
import { UserProfile } from "@/app/_components/activity/_components/userProfle/UserProfile";
import { FileExplorerTab } from "@/app/_components/activity/_components/fileExplorer";
import CalendarTab from "@/app/_components/activity/_components/calendar/CalendarTab";
import SocialConnectorTab from "@/app/_components/activity/_components/socialConnectors/SocialConnectorTab";
import { AgentTab } from "@/app/_components/activity/_components/agents";
import { ExtensionTab } from "@/app/_components/activity/_components/extensions";
import { FileTabContainer } from "@/app/_components/dashboard/_components/fileTab";
import { IdentityGuidelinesTab } from "@/app/_components/dashboard/_components/identityTab/IdentityGuidelinesTab";

export function Navigator() {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    openTab
  } = useEditorStore();

  // Safely handle Convex auth - may not be available during SSR
  let isAuthenticated = false;
  try {
    const convexAuth = useConvexAuth();
    isAuthenticated = convexAuth?.isAuthenticated || false;
  } catch (error) {
    // Convex provider not available - continue with default state
    console.warn('Convex provider not available:', error);
  }  const [scrollPosition, setScrollPosition] = useState(0);
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
      case 'agent':
        return Bot;
      case 'extension':
        return Puzzle;
      case 'identity-guidelines':
        return Palette;
      default:
        return FileCode;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] h-full">
      {/* Tab Bar */}
      <div className="h-[35px] bg-[#1e1e1e] border-b border-r border-[#2d2d2d] relative flex-shrink-0">
        {/* Tab Container - Full width with space for buttons */}
        <div ref={containerRef} className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#1e1e1e]">
          <div 
            className="flex transition-transform duration-200 h-full"
            style={{ 
              transform: `translateX(-${scrollPosition * 200}px)`,
              // Dynamic transform values require inline styles for reactivity
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
          <div className="w-8 h-[35px] border-l border-[#2d2d2d]">
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
            {currentTab.type === 'social-connector' && <SocialConnectorTab />}
            {currentTab.type === 'agent' && <AgentTab />}
            {currentTab.type === 'extension' && <ExtensionTab />}
            {currentTab.type === 'identity-guidelines' && <IdentityGuidelinesTab />}
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
                  Configure your AURA preferences and editor settings.
                </p>
              </div>
            )}
            {(currentTab.type === 'file' && currentTab.id !== 'file-explorer') && (
              currentTab.filePath ? (
                <FileTabContainer
                  fileId={currentTab.id.replace('file-', '') as Id<"files">}
                  fileName={currentTab.title}
                  filePath={currentTab.filePath}
                />
              ) : (
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
              )
            )}
            {currentTab.type === 'welcome' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold text-[#cccccc]">
                    {currentTab.title}
                  </h2>
                  <p className="text-[#858585]">
                    Welcome to AURA!
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-[#cccccc]">
                {isAuthenticated ? 'Welcome to AURA!' : 'Please sign in'}
              </h1>
              <p className="text-[#858585]">
                {isAuthenticated ? 'Create a new file to get started.' : 'Sign in to access the editor.'}
              </p>
              {isAuthenticated && (
                <button
                  onClick={handleNewFile}
                  className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors"
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

6. our terminal will be an expand/ collapse sidebar on the right side of the page- not our typical activity bar on the left- so we'll implement this using shadcn- similar to the activity bar. 

7. the footer spans across the bottom, reference:
{/* Status Bar - 22px */}
        <footer className="h-[22px] bg-[#2d2d2d] text-[#cccccc] text-xs flex items-center px-2 justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Copyright className="w-3 h-3" />
              <span>ACDC.digital</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>0</span>
            </div>
            <span>AURA Dashboard v1.0.0</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[#cccccc]">▲ Next.js ^15 | Convex</span>
            <span>Anthropic Claude 3.7 Sonnet</span>
            <span className="text-[#858585]">
              MCP Server: 0
            </span>
          </div>
        </footer>


the dashbaord page is a dedictaed /page, so we need to use the best organizational methods for these components. ensure not only are you using the current structure and expanding:
/Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard,

but that you're also implementing a maintainable architecture that we can expand on the modularity of the concepts we're about to integrate. 

implement now. 