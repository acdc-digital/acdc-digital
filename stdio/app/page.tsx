"use client";

import { useState, useCallback } from "react";
import { 
  Header, 
  ActivityBar, 
  SidePanel, 
  Editor, 
  Navigator,
  Terminal, 
  Footer,
  ChatPanel,
  PanelType 
} from "./_components";
import { ComponentCanvasRef } from "./_components/canvas/ComponentCanvas";

export default function StdioPage() {
  const [activePanel, setActivePanel] = useState<PanelType>("dashboard");
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(true);
  const [canvasRef, setCanvasRef] = useState<ComponentCanvasRef | null>(null);

  const handleComponentGenerated = useCallback((code: string, title: string) => {
    canvasRef?.handleComponentGenerated(code, title);
  }, [canvasRef]);

  const handleGeneratingChange = useCallback((isGenerating: boolean) => {
    canvasRef?.setIsGenerating(isGenerating);
  }, [canvasRef]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] overflow-hidden">
      {/* Header - Fixed at top */}
      <Header />

      {/* Main Content Area - Activity Bar + Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar - Left navigation */}
        <ActivityBar 
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
        
        {/* SidePanel - Left sidebar with context-specific content (full height) */}
        <SidePanel activePanel={activePanel} />

        {/* Editor + Terminal Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Editor - Main content area (full height) */}
          <div className="absolute inset-0 overflow-hidden">
            <Editor
              activePanel={activePanel}
              onGetCanvasRef={setCanvasRef}
            />
          </div>

          {/* Terminal - Overlays editor at bottom (doesn't extend under chat panel) */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <Terminal 
              isCollapsed={isTerminalCollapsed}
              onToggle={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            />
          </div>
        </div>

        {/* Chat Panel - Right sidebar */}
        <ChatPanel
          onComponentGenerated={handleComponentGenerated}
        />
      </div>

      {/* Navigator - Hidden placeholder for future implementation */}
      <Navigator />

      {/* Footer - Fixed at bottom */}
      <Footer />
    </div>
  );
}
