// DASHBOARD LAYOUT - Main layout for the Soloist dashboard
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/layout.tsx

"use client";

import React, { useState } from 'react';
import { Loader, Copyright, AlertCircle, Triangle } from 'lucide-react';
import { 
  ActivityBar, 
  SidePanel, 
  Navigation
} from './_components';
import { ThemeToggle } from './providers/ThemeToggle';
import { TabProvider } from './_components/context/TabContext';
import { TabContentRenderer } from './_components/TabContent/TabContentRenderer';
import { Terminal } from './_components/Terminal/Terminal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ }: DashboardLayoutProps) {
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  return (
    <TabProvider>
      <div className="h-screen flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
      {/* Header - spans full width */}
      <header className="h-10 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none">
        {/* Title */}
        <div className="flex-1 flex justify-start items-center ml-3">
          <div className="flex items-center gap-2">
            <Loader className="h-5 w-5 text-[#BE862D] border border-[#858585] rounded-xs p-0.5" />
            <span className="text-sm text-[#BE862D] font-dm-sans">
              Soloist. | Take control of tomorrow, today.
            </span>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex items-center pr-4">
          <ThemeToggle />
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar - left side, full height */}
        <ActivityBar 
          onTerminalToggle={() => setTerminalExpanded(!terminalExpanded)}
        />
        
        {/* Side Panel - back beside activity bar */}
        <SidePanel />
        
        {/* Right content area - navigation and main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navigation tabs - spans width after activity bar and sidebar */}
          <Navigation />
          
          {/* Content area with main content and persistent Terminal */}
          <div className="flex-1 flex overflow-hidden bg-[#1e1e1e]">
            {/* Main content area */}
            <div className="flex-1 overflow-hidden">
              <TabContentRenderer />
            </div>
            
            {/* Persistent Terminal Sidebar */}
            <Terminal 
              key="persistent-terminal"
              isExpanded={terminalExpanded}
              onToggle={setTerminalExpanded}
            />
          </div>
        </div>
      </div>
      
      {/* Footer - spans full width */}
      <footer className="h-[26px] bg-[#2d2d2d] text-[#BE862D] text-xs flex items-center px-2 justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Copyright className="w-3 h-3" />
            <span>ACDC.digital</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>0</span>
          </div>
          <span>Soloist Dashboard v1.0.0</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[#BE862D] flex items-center gap-1">
            <Triangle className="w-3 h-3" />
            Next.js ^15 | Convex
          </span>
          <span>Anthropic Claude 3.7 Sonnet</span>
          <span className="text-[#BE862D]">
            MCP Server: 0
          </span>
        </div>
      </footer>
      </div>
    </TabProvider>
  );
}
