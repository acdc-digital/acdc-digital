// TLDRAW WRAPPER
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/_components/TldrawWrapper.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Tldraw, Editor } from "tldraw";
import { useTheme } from "next-themes";
import "tldraw/tldraw.css";

interface TldrawWrapperProps {
  onEditorMount?: (editor: Editor) => void;
}

export default function TldrawWrapper({ onEditorMount }: TldrawWrapperProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const { resolvedTheme } = useTheme();

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    // Start with the draw tool by default
    editor.setCurrentTool("draw");
    // Notify parent of editor instance
    onEditorMount?.(editor);
  }, [onEditorMount]);

  // Sync tldraw's color scheme with the app's theme
  useEffect(() => {
    if (!editor) return;
    const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
    editor.user.updateUserPreferences({ colorScheme });
  }, [editor, resolvedTheme]);

  return (
    <div className="w-full h-full [&_.tl-background]:!bg-neutral-400/30 dark:[&_.tl-background]:!bg-neutral-700/10">
      <Tldraw hideUi onMount={handleMount} />
    </div>
  );
}
