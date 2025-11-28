// BASELINE ASSESSMENT DEMO FEATURE
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/features/BaselineAssessmentDemo.tsx

"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BaselineAssessmentDemo() {
  return (
    <div className="absolute inset-0 p-3 flex flex-col">
      {/* Header Text */}
      <div className="mb-3 px-2 flex items-start gap-3 flex-shrink-0">
        {/* Number */}
        <div className="flex-shrink-0">
          <span className="text-5xl font-bold text-neutral-700">1</span>
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-300 mb-1">
            Personality Profile
          </h3>
          <p className="text-sm text-neutral-400">
            Create the baseline for future days. Update or change at any time.
          </p>
        </div>
      </div>
      
      <Card className="w-full flex-1 min-h-0 bg-zinc-900 border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Left Side - Assessment Questions */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            {/* Questions Section */}
            <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
              {/* Emotional Landscape */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-blue-500 rounded-full" />
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                    Emotional Landscape
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300">
                    How often do you experience strong emotions?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-600 transition-colors">
                      Rarely
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-600 transition-colors">
                      Sometimes
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full bg-zinc-100 text-zinc-900 border border-zinc-100">
                      Often
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-600 transition-colors">
                      Constantly
                    </button>
                  </div>
                </div>
              </div>

              {/* Cognitive Patterns */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-blue-500 rounded-full" />
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                    Cognitive Patterns
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300">
                    When making decisions, do you rely more on logic or instinct?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1.5 text-xs rounded-full bg-zinc-100 text-zinc-900 border border-zinc-100">
                      Logic
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-600 transition-colors">
                      Balanced
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-600 transition-colors">
                      Instinct
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="flex items-center gap-2 justify-center text-xs border border-zinc-700 rounded-sm pt-2 pb-2">
              <span className="text-zinc-500">Index: <span className="text-zinc-100">79</span></span>
              <span className="text-zinc-500">Confidence: <span className="text-green-600">82%</span></span>
            </div>
          </div>

          {/* Right Side - AI Analysis */}
          <div className="flex-1 bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 flex flex-col min-h-0 border-l border-zinc-800">
            {/* Chat Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Hey there, future business builder! I noticed right away that your passion for creating something from scratch is a powerful driving force in your life.
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your profile reveals a fascinating blend of logical thinking, achievement-oriented motivation, and a strategic approach to personal growth. You&apos;re someone who values progress and has a clear vision.
                </p>
              </div>
            </div>

            {/* Input Area */}
            <div className="pt-3 flex-shrink-0">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ask questions about your analysis..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 pr-9"
                  disabled
                />
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-700 transition-colors"
                  aria-label="Send message"
                  disabled
                >
                  <svg 
                    className="w-4 h-4 text-blue-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
