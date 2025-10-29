"use client";

import React, { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
    <div className="pl-10 pr-10 mx-auto">
      {/* Heading */}
      <div className="flex justify-between items-center pt-1 pl-3 pr-3 mb-1">
        <p className="text-lg md:text-lg text-muted-foreground max-w-3xl">
          Combine speed journaling with powerful predictions to take control of tomorrow, today
        </p>
        <p className="text-sm md:text-sm text-muted-foreground whitespace-nowrap ml-4 mr-4">
          Get Started ─────▶
        </p>
      </div>
      
      <div className="glass-strong rounded-2xl shadow-xl overflow-hidden border border-border/40">
        {/* Iframe Container */}
        <div className="relative bg-background" style={{ height: isFullscreen ? '85vh' : '700px' }}>
          <iframe
            src={demoUrl}
            className="w-full h-full border-0"
            title="Soloist App Demo"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}