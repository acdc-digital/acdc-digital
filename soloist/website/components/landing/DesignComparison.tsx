// DESIGN COMPARISON DEMO
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/DesignComparison.tsx
// Optional component for internal review and showcase

"use client";

import { useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { HeroEnhanced } from "@/components/landing/HeroEnhanced";
// import { Features } from "./Features"; // TODO: Create this component
import { FeaturesEnhanced } from "./FeaturesEnhanced";

export function DesignComparison() {
  const [showV2, setShowV2] = useState(true);

  return (
    <div className="min-h-screen">
      {/* Toggle Controls */}
      <div className="fixed top-4 right-4 z-50 glass-card rounded-xl p-4 border border-emerald-200/50 shadow-lg">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold text-[#1e1e1e] mb-2">
            Design Version
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowV2(false)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                !showV2
                  ? "bg-gray-700 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              V1 (Original)
            </button>
            <button
              onClick={() => setShowV2(true)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                showV2
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              V2 (Enhanced)
            </button>
          </div>
          
          {/* Design Feature Indicators */}
          {showV2 && (
            <div className="mt-4 space-y-2 text-xs border-t border-emerald-200/50 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-glow"></div>
                <span className="text-[#495057]">Glass Morphism Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-glow"></div>
                <span className="text-[#495057]">Premium Animations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-glow"></div>
                <span className="text-[#495057]">Enhanced Typography</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1">
        {showV2 ? (
          <>
            <HeroEnhanced />
            <FeaturesEnhanced />
          </>
        ) : (
          <>
            <Hero />
            {/* <Features /> */}
          </>
        )}
      </main>

      {/* Design Stats Footer */}
      <div className="fixed bottom-4 left-4 glass-card rounded-xl p-4 border border-gray-200/50 shadow-lg max-w-sm">
        <div className="text-xs font-bold text-[#1e1e1e] mb-3">
          {showV2 ? "V2 Enhancements" : "V1 Original"}
        </div>
        {showV2 ? (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6c757d]">Animation Effects:</span>
              <span className="font-semibold text-emerald-600">8 types</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6c757d]">Glass Components:</span>
              <span className="font-semibold text-blue-600">12+ cards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6c757d]">Typography Scale:</span>
              <span className="font-semibold text-purple-600">Enhanced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6c757d]">Brand Alignment:</span>
              <span className="font-semibold text-emerald-600">100%</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#6c757d]">
            Basic gradient backgrounds, standard typography, minimal animations
          </div>
        )}
      </div>
    </div>
  );
}
