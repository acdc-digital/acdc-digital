// CANVAS FOOTER
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvas/_components/CanvasFooter.tsx

"use client";

import React from "react";
import { Editor } from "tldraw";
import { Save, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasFooterProps {
  editor: Editor | null;
  onSave?: () => void;
}

export function CanvasFooter({ editor, onSave }: CanvasFooterProps) {
  const handleSave = () => {
    onSave?.();
    // TODO: Implement save functionality
    console.log("Save clicked");
  };

  const handleUndo = () => {
    if (!editor) return;
    editor.undo();
  };

  const handleRedo = () => {
    if (!editor) return;
    editor.redo();
  };

  const handleClear = () => {
    if (!editor) return;
    const shapeIds = editor.getCurrentPageShapeIds();
    editor.deleteShapes([...shapeIds]);
  };

  const handleZoomIn = () => {
    if (!editor) return;
    editor.zoomIn();
  };

  const handleZoomOut = () => {
    if (!editor) return;
    editor.zoomOut();
  };

  const handleZoomToFit = () => {
    if (!editor) return;
    editor.zoomToFit();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Save canvas
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={handleUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Undo <span className="text-neutral-400 ml-1">⌘Z</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={handleRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Redo <span className="text-neutral-400 ml-1">⌘⇧Z</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-500 hover:text-red-600"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Clear canvas
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Zoom out
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Zoom in
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={handleZoomToFit}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Zoom to fit
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
