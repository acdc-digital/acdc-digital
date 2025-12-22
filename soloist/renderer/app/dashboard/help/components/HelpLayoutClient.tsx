"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, MessageSquare } from "lucide-react";
import { FeedbackCard } from "./FeedbackForm";

interface HelpLayoutClientProps {
  children: React.ReactNode;
}

export function HelpLayoutClient({ children }: HelpLayoutClientProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="sticky top-0 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Documentation</h2>
          </div>
          <nav className="space-y-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
            >
              <BookOpen className="h-4 w-4" />
              User Guide
            </button>
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                showFeedback
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Share Feedback
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#2B2B2B' }}>
        <ScrollArea className="h-full">
          <div className="px-6 py-6" style={{ backgroundColor: '#2B2B2B' }}>
            {/* Feedback Section */}
            <FeedbackCard 
              showFeedback={showFeedback} 
              onToggle={() => setShowFeedback(false)} 
            />

            {/* Guide Content */}
            <article style={{ backgroundColor: '#2B2B2B' }}>
              {children}
            </article>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
