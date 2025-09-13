// ACTIVITY BAR - Left navigation sidebar for SMNB Dashboard
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/activityBar/ActivityBar.tsx

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import {
  Wallpaper,
  ChartNetwork,
  BarChart3,
  FileCode,
  Settings,
  User
} from "lucide-react";

export type PanelType = "home" | "stats" | "analytics" | "docs" | "settings" | "account";

interface ActivityBarProps {
  activePanel?: PanelType;
  onPanelChange?: (panel: PanelType) => void;
}

export default function ActivityBar({ activePanel = "home", onPanelChange }: ActivityBarProps) {
  console.log('🔍 ActivityBar: Rendering with activePanel:', activePanel, 'onPanelChange:', !!onPanelChange);
  
  const activityItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "home", icon: Wallpaper, label: "Home" },
    { id: "stats", icon: BarChart3, label: "Stats" },
    { id: "analytics", icon: ChartNetwork, label: "Analytics" },
    { id: "docs", icon: FileCode, label: "Documentation" },
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "account", icon: User, label: "Account" },
  ];

  const bottomItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [];

  const handleActivityClick = (id: PanelType) => {
    console.log('🖱️ ActivityBar: Button clicked for panel', id);
    onPanelChange?.(id);
  };

  const renderActivityButton = (item: { id: PanelType; icon: LucideIcon; label: string }) => {
    const Icon = item.icon;
    const isActive = activePanel === item.id;
    console.log('🎨 ActivityBar: Rendering button for', item.id, 'isActive:', isActive);
    
    // Special styling for user account button
    if (item.id === "account") {
      return (
        <button
          key={item.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Button DIRECT click for', item.id);
            handleActivityClick(item.id);
          }}
          onMouseDown={() => console.log('🖱️ Button mouseDown for', item.id)}
          className={`
            w-full h-11 hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer
            ${isActive 
              ? 'bg-[#2d2d2d] border-r-1 border-[#007acc]' 
              : ''
            }
          `}
          title={item.label}
        >
          <div className={`
            w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium
            ${isActive 
              ? 'border-[#cccccc] text-[#cccccc]' 
              : 'border-[#858585] text-[#858585]'
            }
          `}>
            M
          </div>
        </button>
      );
    }
    
    return (
      <button
        key={item.id}
        onClick={() => handleActivityClick(item.id)}
        className={`
          w-full h-11 hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer
          ${isActive 
            ? 'bg-[#2d2d2d] border-r-1 border-[#007acc]' 
            : ''
          }
        `}
        title={item.label}
      >
        <Icon
          className={`w-4 h-4 ${
            isActive ? 'text-[#cccccc]' : 'text-[#858585]'
          }`}
        />
      </button>
    );
  };

  console.log('🏗️ ActivityBar: About to render', activityItems.length, 'activity items');
  
  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center pb-2">
        {activityItems.map(renderActivityButton)}
      </div>
      {/* Debug indicator */}
      <div style={{fontSize: '8px', color: '#007acc', padding: '2px'}}>
        {activePanel}
      </div>
    </aside>
  );
}
