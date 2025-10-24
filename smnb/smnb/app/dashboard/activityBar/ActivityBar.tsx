// ACTIVITY BAR - Left navigation sidebar for SMNB Dashboard
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/activityBar/ActivityBar.tsx

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import {
  Wallpaper,
  Haze,
  Waypoints,
  Hash,
  NotebookPen,
  Settings,
  User,
  Archive,
  Landmark,
  ChartSpline,
  DatabaseZap
} from "lucide-react";

export type PanelType = "archive" | "manager" | "home" | "stats" | "heatmap" | "spline" | "keywords" | "landmark" | "docs" | "settings" | "account" | "engine";

interface ActivityBarProps {
  activePanel?: PanelType;
  onPanelChange?: (panel: PanelType) => void;
}

export default function ActivityBar({ activePanel = "archive", onPanelChange }: ActivityBarProps) {
  const mainActivityItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "landmark", icon: Landmark, label: "Landmark" },
    { id: "archive", icon: Archive, label: "Projects" },
    { id: "home", icon: Wallpaper, label: "Home" },
    { id: "engine", icon: DatabaseZap, label: "Engine" },
    // { id: "stats", icon: Waypoints, label: "Stats" },
        { id: "heatmap" as PanelType, icon: Haze, label: "Market Heatmap" },
    { id: "spline" as PanelType, icon: ChartSpline, label: "Spline Chart" },
    { id: "docs", icon: NotebookPen, label: "Docs" },
    { id: "account", icon: User, label: "Account" },
  ];

  const bottomActivityItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleActivityClick = (id: PanelType) => {
    onPanelChange?.(id);
  };

  const renderActivityButton = (item: { id: PanelType; icon: LucideIcon; label: string }) => {
    const Icon = item.icon;
    const isActive = activePanel === item.id;
    
    // Special styling for user account button
    if (item.id === "account") {
      return (
        <button
          key={item.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleActivityClick(item.id);
          }}
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

  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Main Activity Icons */}
      <div className="flex flex-col items-center">
        {mainActivityItems.map(renderActivityButton)}
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Bottom Activity Icons */}
      <div className="flex flex-col items-center pb-2">
        {bottomActivityItems.map(renderActivityButton)}
      </div>
    </aside>
  );
}
