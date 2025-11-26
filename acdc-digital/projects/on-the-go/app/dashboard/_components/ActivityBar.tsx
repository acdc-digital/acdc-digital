"use client";

import { MessageSquare, Archive, Settings } from "lucide-react";

export type PanelType = "notes" | "archived" | "settings" | null;

interface ActivityBarProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

export function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const items = [
    { id: "notes" as const, icon: MessageSquare, label: "Notes" },
    { id: "archived" as const, icon: Archive, label: "Archived" },
  ];

  const settingsItems = [
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col flex-shrink-0">
      {/* Top navigation items */}
      <div className="flex-1">
        {items.map((item) => {
          const isActive = activePanel === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className="w-12 h-12 flex items-center justify-center hover:bg-[#2d2d2d] relative transition-colors"
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 text-[#858585]" />
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#007acc]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom navigation items */}
      <div>
        {settingsItems.map((item) => {
          const isActive = activePanel === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className="w-12 h-12 flex items-center justify-center hover:bg-[#2d2d2d] relative transition-colors"
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 text-[#858585]" />
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#007acc]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
