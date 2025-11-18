"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PanelType } from "./ActivityBar";
import { ComponentStorage } from "./canvas/ComponentStorage";
import { Id } from "@/convex/_generated/dataModel";

interface SidePanelProps {
  activePanel: PanelType;
  onSelectComponent?: (component: {
    _id: Id<"generatedComponents">;
    code: string;
    title: string;
    framework: "react";
  }) => void;
}

export function SidePanel({ activePanel, onSelectComponent }: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!activePanel) return null;

  const getPanelTitle = () => {
    switch (activePanel) {
      case "dashboard": return "Components";
      case "invoices": return "Invoices";
      case "expenses": return "Expenses";
      case "reports": return "Reports";
      case "calendar": return "Calendar";
      case "settings": return "Settings";
      case "account": return "Account";
      default: return "";
    }
  };

  const renderPanelContent = () => {
    switch (activePanel) {
      case "dashboard":
        return (
          <div className="flex flex-col h-full">
            {onSelectComponent && <ComponentStorage onSelectComponent={onSelectComponent} />}
          </div>
        );
      
      case "invoices":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="text-xs font-semibold text-[#cccccc] mb-2">Invoices</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  All Invoices
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Draft
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Sent
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Paid
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Overdue
                </button>
              </div>
            </div>
          </div>
        );
      
      case "expenses":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="text-xs font-semibold text-[#cccccc] mb-2">Expenses</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  All Expenses
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Materials
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Tools & Equipment
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Vehicle
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Other
                </button>
              </div>
            </div>
          </div>
        );
      
      case "reports":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="text-xs font-semibold text-[#cccccc] mb-2">Financial Reports</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Income Statement
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Cash Flow
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Tax Summary
                </button>
              </div>
            </div>
          </div>
        );
      
      case "calendar":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="text-xs font-semibold text-[#cccccc] mb-2">Calendar</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Upcoming Jobs
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Payment Due Dates
                </button>
              </div>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="text-xs font-semibold text-[#cccccc] mb-2">Settings</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Profile
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Business Details
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Integrations
                </button>
              </div>
            </div>
          </div>
        );
      
      case "account":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="text-xs font-semibold text-[#cccccc] mb-2">Account</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Profile
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Subscription
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-[#1e1e1e] border-r border-[#2d2d2d] shrink-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-60'}`}>
      <div className="h-[35px] bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3">
        <span className="text-xs text-[#858585]">{isCollapsed ? '' : getPanelTitle()}</span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#858585] hover:text-[#cccccc] transition-colors"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      {!isCollapsed && (
        <div className="overflow-auto h-[calc(100%-35px)]">
          {renderPanelContent()}
        </div>
      )}
    </div>
  );
}
