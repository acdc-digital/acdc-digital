"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { ComponentCanvas, ComponentCanvasRef } from "./canvas/ComponentCanvas";

interface Tab {
  id: string;
  title: string;
  type: string;
}

interface StdioEditorProps {
  onGetCanvasRef?: (ref: ComponentCanvasRef | null) => void;
}

export function StdioEditor({ onGetCanvasRef }: StdioEditorProps) {
  const canvasRef = useRef<ComponentCanvasRef>(null);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "welcome", title: "Welcome", type: "welcome" }
  ]);
  const [activeTabId, setActiveTabId] = useState("welcome");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Pass canvas ref to parent
  useEffect(() => {
    if (onGetCanvasRef) {
      onGetCanvasRef(canvasRef.current);
    }
  }, [onGetCanvasRef]);

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const renderContent = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    if (!activeTab) {
      return (
        <div className="p-4 space-y-3">
          <div className="inline-block px-3 py-1 bg-card border border-border rounded text-xs text-foreground">
            No active tab selected
          </div>
        </div>
      );
    }

    // Render Canvas for welcome tab
    if (activeTab.type === "welcome") {
      return <ComponentCanvas ref={canvasRef} />;
    }

    return (
      <div className="p-4 space-y-3 space-x-2">
        <div className="inline-block px-3 py-1 bg-card border border-border rounded text-xs text-foreground">
          Tab content placeholder
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Tab Bar */}
      <div className="h-[35px] bg-card border-b border-border relative shrink-0">
        {/* Tabs Container */}
        <div className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-card">
          <div className="flex h-full">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`
                  flex items-center gap-2 px-3 h-[35px] text-xs border-r border-border cursor-pointer shrink-0 transition-colors duration-150 w-[200px]
                  ${activeTabId === tab.id
                    ? 'bg-background text-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent/10'
                  }
                `}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="truncate flex-1">{tab.title}</span>
                
                {hoveredTab === tab.id && (
                  <X
                    className="w-3 h-3 hover:bg-accent/20 rounded shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

        {/* Left Scroll Button */}
        <div className="absolute left-0 z-10 w-8 h-[35px] border-r border-b border-border bg-card">
          <button
            disabled
            className="w-full h-full flex items-center justify-center text-muted-foreground opacity-30"
            title="Scroll left"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Right side buttons container */}
        <div className="absolute right-0 z-10 flex h-[35px] bg-card border-b border-border">
          {/* Right Scroll Button */}
          <div className="w-8 h-[35px] border-l border-border">
            <button
              disabled
              className="w-full h-full flex items-center justify-center text-muted-foreground opacity-30"
              title="Scroll right"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
            
          {/* Add New Tab Button */}
          <button
            className="flex items-center justify-center w-8 h-[35px] text-xs border-l border-border transition-colors text-muted-foreground hover:bg-accent/10"
            title="New tab"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editor Content - Scrollable */}
      <div className="flex-1 overflow-auto bg-background">
        {renderContent()}
      </div>
    </div>
  );
}
