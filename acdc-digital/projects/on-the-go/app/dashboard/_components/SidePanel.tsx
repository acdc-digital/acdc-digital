"use client";

import { PanelType } from "./ActivityBar";

interface SidePanelProps {
  activePanel: PanelType;
}

export function SidePanel({ activePanel }: SidePanelProps) {
  if (!activePanel) return null;

  const renderContent = () => {
    switch (activePanel) {
      case "notes":
        return (
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-4 text-[#cccccc]">NOTES</h2>
            <nav className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#cccccc]">
                All Notes
              </button>
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#858585]">
                New
              </button>
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#858585]">
                Read
              </button>
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#858585]">
                Edited
              </button>
            </nav>
          </div>
        );
      
      case "archived":
        return (
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-4 text-[#cccccc]">ARCHIVED</h2>
            <nav className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#cccccc]">
                All Archived
              </button>
            </nav>
          </div>
        );
      
      case "settings":
        return (
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-4 text-[#cccccc]">SETTINGS</h2>
            <nav className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#cccccc]">
                General
              </button>
              <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#2d2d2d] text-[#858585]">
                Twilio Integration
              </button>
            </nav>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-[240px] bg-[#1e1e1e] border-r border-[#2d2d2d] flex-shrink-0 overflow-y-auto">
      {renderContent()}
    </div>
  );
}
