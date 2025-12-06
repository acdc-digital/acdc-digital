// TLDRAW WRAPPER
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/_components/TldrawWrapper.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Tldraw, Editor } from "tldraw";
import { useTheme } from "next-themes";
import "tldraw/tldraw.css";
import { CanvasControls } from "./CanvasControls";

export default function TldrawWrapper() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const { resolvedTheme } = useTheme();

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    // Start with the draw tool by default
    editor.setCurrentTool("draw");
  }, []);

  // Sync tldraw's color scheme with the app's theme
  useEffect(() => {
    if (!editor) return;
    const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
    editor.user.updateUserPreferences({ colorScheme });
  }, [editor, resolvedTheme]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top controls */}
      <CanvasControls editor={editor} />
      
      {/* Clean canvas area */}
      <div className="flex-1 min-h-0 [&_.tl-background]:!bg-neutral-400/30 dark:[&_.tl-background]:!bg-neutral-700/10">
        <Tldraw hideUi onMount={handleMount} />
      </div>
    </div>
  );
}
