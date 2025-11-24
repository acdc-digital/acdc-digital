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

export function Dashboard() {
  const [activePanel, setActivePanel] = useState<PanelType>("dashboard");

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

        {/* Main Content Area - Editor or Wiki */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activePanel === "content" ? <Wiki /> : <Editor />}
        </div>
      </div>

      {/* Navigator - Hidden placeholder for future implementation */}
      <Navigator />

      {/* Footer - Fixed at bottom */}
      <Footer />
    </div>
  );
}
