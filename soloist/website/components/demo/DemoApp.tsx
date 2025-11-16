"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Maximize2 } from "lucide-react";
import { Span } from "next/dist/trace";

export function DemoApp() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // The demo app runs on port 3003
  // This is a standalone browser-only version with no authentication
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "http://localhost:3003/dashboard";

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="demo-section-wrapper">
      <div className="w-full md:max-w-7xl md:mx-auto">
        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6 gap-2 md:gap-3 pl-6 pr-6 md:px-2">
          <p className="text-sm md:text-base lg:text-xl text-muted-foreground max-w-3xl">
            Combine speed journaling with powerful predictions to take control of tomorrow, today
          </p>
          <p className="text-sm text-muted-foreground whitespace-nowrap hidden md:block">
            Get Started ─────▶
          </p>
        </div>
        
        <div id="demo-iframe-container" className="glass-strong-responsive rounded-2xl shadow-xl overflow-hidden border-0 md:border border-border/40">
          {/* Iframe Container with responsive aspect ratio */}
          <div
            className={`bg-background w-full ${isFullscreen ? 'demo-container-fullscreen' : 'demo-container'}`}
          >
            <iframe
              src={demoUrl}
              className="absolute inset-0 w-full h-full border-0"
              title="Soloist App Demo"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
            />
          </div>
        </div>
        
        {/* Get Started text - below demo on mobile */}
        <p className="md:hidden text-sm text-muted-foreground text-left mt-0.5 pl-8 pr-6">
          Get Started ─────▶
        </p>
      </div>
    </div>
  );
}