"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Settings, BarChart3, Home, Zap, Palette, Code2, Cpu, Rocket } from "lucide-react";
import Artifact from "./_components/artifacts/artifact";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabs = [
    { id: "Dashboard", title: "Dashboard", icon: Home },
    { id: "Settings", title: "Settings", icon: Settings },
    { id: "Analytics", title: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#1e1e1e]">
      {/* Top Header Bar */}
      <div className="h-8 bg-[#2d2d30] border-b border-[#454545] flex items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="text-[#cccccc] text-[13px] font-semibold">ACDC Digital</div>
            <div className="text-[#858585] text-[11px]">•</div>
            <div className="text-[#858585] text-[11px]">Component Workbench</div>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <div className="flex items-center space-x-1">
              <span className="text-[#4ec9b0]">●</span>
              <span className="text-[#858585]">Live</span>
            </div>
            <div className="text-[#858585]">Branch: main</div>
            <div className="text-[#858585]">v2.1.0</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[11px] text-[#858585]">
            <span>localhost:3000</span>
            <div className="w-1 h-1 bg-[#4ec9b0] rounded-full"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#f48771] rounded-full"></div>
            <div className="w-3 h-3 bg-[#ce9178] rounded-full"></div>
            <div className="w-3 h-3 bg-[#4ec9b0] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-[#181818] border-r border-[#454545] flex flex-col items-center py-4 space-y-4">
          <div className="w-5 h-5 flex items-center justify-center text-[#858585]">
            <Zap className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#858585]">
            <Palette className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#858585]">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#858585]">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#858585]">
            <Rocket className="w-4 h-4" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-60 bg-[#1e1e1e] border-r border-[#454545]">
          <div className="p-3 border-b border-[#2d2d30]">
            <h2 className="text-[11px] uppercase text-[#cccccc] font-semibold tracking-wider">Explorer</h2>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <div className="text-[11px] uppercase text-[#cccccc] tracking-wider mb-2 font-medium">Features</div>
              <div className="ml-3 space-y-1">
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">🤖 AI Assistant</div>
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">📊 Analytics</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[#cccccc] tracking-wider mb-2 font-medium">Project Files</div>
              <div className="ml-3 space-y-1">
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">📄 dashboard.tsx</div>
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">📄 layout.tsx</div>
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">📄 globals.css</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[#cccccc] tracking-wider mb-2 font-medium">Components</div>
              <div className="ml-3 space-y-1">
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">📁 ui/</div>
                <div className="text-[13px] text-[#cccccc] cursor-pointer hover:text-white hover:bg-[#2a2d2e] px-2 py-1 rounded transition-all duration-150">📄 ConvexClientProvider.tsx</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col border-r border-[#454545]">
          {/* Enhanced Tab Bar - Aura Style */}
          <div className="h-[35px] bg-[#1e1e1e] border-b border-r border-[#2d2d2d] relative flex-shrink-0">
            {/* Tab Container */}
            <div className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#1e1e1e]">
              <div className="flex h-full">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <div
                      key={tab.id}
                      onMouseEnter={() => setHoveredTab(tab.id)}
                      onMouseLeave={() => setHoveredTab(null)}
                      className={`
                        flex items-center gap-2 px-3 h-[35px] text-xs border-r border-[#2d2d2d] cursor-pointer flex-shrink-0 transition-colors duration-150 w-[200px]
                        ${activeTab === tab.id
                          ? 'bg-[#1a1a1a] text-[#cccccc]'
                          : 'bg-[#0e0e0e] text-[#858585] hover:bg-[#181818]'
                        }
                      `}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate flex-1">{tab.title}</span>
                      
                      {/* Close Button - Shows on hover */}
                      {hoveredTab === tab.id && (
                        <X
                          className="w-3 h-3 hover:bg-[#2d2d2d] rounded flex-shrink-0 text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real implementation, this would close the tab
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Scroll Button */}
            <div className="absolute left-0 z-10 w-8 h-[35px] border-r border-b border-[#2d2d2d] bg-[#1e1e1e]">
              <button
                disabled={true}
                className="w-full h-full flex items-center justify-center text-[#3d3d3d] opacity-30"
                aria-label="Scroll tabs left"
              >
                <span className="sr-only">Scroll left</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Right side buttons container */}
            <div className="absolute right-0 z-10 flex h-[35px] bg-[#1e1e1e] border-b border-[#2d2d2d]">
              {/* Right Scroll Button */}
              <div className="w-8 h-[35px] border-l border-[#2d2d2d]">
                <button
                  disabled={true}
                  className="w-full h-full flex items-center justify-center text-[#3d3d3d] opacity-30"
                  aria-label="Scroll tabs right"
                >
                  <span className="sr-only">Scroll right</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              
              {/* Add New Tab Button */}
              <button
                className="flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] transition-colors text-[#858585] hover:bg-[#2d2d2d]"
                aria-label="Add new tab"
              >
                <span className="sr-only">Create new tab</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Editor Area - Single Content for All Tabs */}
          <div className="flex-1 bg-[#1e1e1e] overflow-auto">
            <Artifact />
          </div>

          {/* Terminal Header Only */}
                  {/* Terminal Header */}
        <div className="bg-[#007acc] h-6 px-4 flex items-center gap-4">
          <button className="text-white text-xs font-medium">Terminal</button>
          <button className="text-white/80 text-xs">Output</button>
          <button className="text-white/80 text-xs">Debug Console</button>
        </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="h-6 bg-[#2d2d30] border-t border-[#454545] flex items-center justify-between px-4 text-[10px] text-[#858585]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-[#4ec9b0]">●</span>
            <span>Ready</span>
          </div>
          <div>TypeScript</div>
          <div>Next.js 15</div>
          <div>Convex</div>
        </div>
        <div className="flex items-center space-x-4">
          <div>Ln 42, Col 16</div>
          <div>UTF-8</div>
          <div>Spaces: 2</div>
          <div className="flex items-center space-x-1">
            <span>ACDC Digital</span>
            <span>©</span>
            <span>2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}