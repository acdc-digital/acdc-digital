"use client";

import { useState } from "react";
import { 
  Header, 
  ActivityBar, 
  SidePanel, 
  Editor, 
  Navigator,
  Footer,
  PanelType,
  Wiki
} from "./_components";
import { StdioPage } from "./_components/stdio";

export function Dashboard() {
  const [activePanel, setActivePanel] = useState<PanelType>("dashboard");

  // Render main content based on active panel
  const renderMainContent = () => {
    switch (activePanel) {
      case "content":
        return <Wiki />;
      case "video":
        return <StdioPage />;
      default:
        return <Editor showControls={activePanel === "dashboard"} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header - Fixed at top */}
      <Header />

      {/* Main Content Area - Activity Bar + Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar - Left navigation */}
        <ActivityBar 
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
        
        {/* SidePanel - Left sidebar with marketing insights feed (only show on dashboard) */}
        {activePanel === "dashboard" && <SidePanel />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Navigator - Hidden placeholder for future implementation */}
      <Navigator />

      {/* Footer - Fixed at bottom */}
      <Footer />
    </div>
  );
}
