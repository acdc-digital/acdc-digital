// CANVAS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/page.tsx

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Editor } from "tldraw";
import { CanvasHeader } from "./_components/CanvasHeader";
import { SessionSidebar } from "./_components/SessionSidebar";
import { CanvasControls } from "./_components/CanvasControls";
import { CanvasFooter } from "./_components/CanvasFooter";

// Dynamically import TldrawWrapper with SSR disabled
const TldrawWrapper = dynamic(
  () => import("./_components/TldrawWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-500/20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ),
  }
);

export default function CanvasPage() {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  return (
    <div className="h-full w-full flex">
      {/* Left Sidebar - Session Manager */}
      <SessionSidebar />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-3">
        {/* Controls Header - Distinct container */}
        <div className="shrink-0">
          <CanvasControls editor={editor} />
        </div>
        
        {/* Canvas - Distinct container */}
        <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600">
          <TldrawWrapper onEditorMount={setEditor} />
        </div>

        {/* Footer - Individual buttons */}
        <div className="shrink-0">
          <CanvasFooter editor={editor} />
        </div>
      </div>
    </div>
  );
}
