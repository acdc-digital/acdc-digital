"use client";

import React, { useState, useEffect } from "react";
import { SignupPaymentModal } from "../../modals/SignupPaymentModal";

export function DemoApp() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cacheKey, setCacheKey] = useState("");
  
  // The demo app runs on port 3003
  // This is a standalone browser-only version with no authentication
  // PRODUCTION: const baseUrl = process.env.NEXT_PUBLIC_DEMO_URL || "http://localhost:3003/dashboard";
  // DEV: Using local demo server for testing
  const baseUrl = "http://localhost:3003/dashboard";
  
  // Set cache key on client side only to avoid hydration mismatch
  useEffect(() => {
    setCacheKey(`?v=${Date.now()}`);
  }, []);
  
  const demoUrl = `${baseUrl}${cacheKey}`;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="demo-section-wrapper">
      <div className="w-full md:max-w-[76rem] md:mx-auto px-4 md:px-0">
        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-3 pl-0 pr-0 md:px-2">
          <p className="text-sm md:text-base lg:text-xl text-muted-foreground max-w-4xl">
            Combine speed journaling with powerful predictions to take control of tomorrow, today
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-blue-600 whitespace-nowrap hidden md:block focus:outline-none"
          >
            Get Started ─────▶
          </button>
        </div>
        
        <div id="demo-iframe-container" className="glass-strong-responsive rounded-2xl overflow-hidden">
          {/* Iframe Container with responsive aspect ratio */}
          <div
            className={`bg-background w-full ${isFullscreen ? 'demo-container-fullscreen' : 'demo-container'}`}
          >
            <iframe
              src={demoUrl}
              className="absolute inset-0 w-full h-full"
              title="Soloist App Demo"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          {/* Bottom CTA */}
            <div className="mt-4 text-center hidden md:block">
              <p className="text-xl text-foreground max-w-5xl mx-auto italic">
                Progress has a rhythm. Find yours with Soloist.
              </p>
            </div>
        </div>
        
        {/* Get Started text - below demo on mobile */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="md:hidden text-sm text-blue-600 text-left mt-5 pl-1 pr-1 focus:outline-none"
        >
          Get Started ─────▶
        </button>
      </div>

      <SignupPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}