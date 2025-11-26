"use client";

import { useState, useCallback } from "react";
import { StdioEditor } from "./StdioEditor";
import { StdioSidePanel } from "./StdioSidePanel";
import { StdioChatPanel } from "./StdioChatPanel";
import { ComponentCanvasRef } from "./canvas/ComponentCanvas";
import { Id } from "@/convex/_generated/dataModel";

export function StdioPage() {
  const [canvasRef, setCanvasRef] = useState<ComponentCanvasRef | null>(null);

  const handleComponentGenerated = useCallback((code: string, title: string) => {
    canvasRef?.handleComponentGenerated(code, title);
  }, [canvasRef]);

  const handleSelectComponent = useCallback((component: {
    _id: Id<"generatedComponents">;
    code: string;
    title: string;
    framework: "react";
  }) => {
    canvasRef?.handleComponentGenerated(component.code, component.title);
  }, [canvasRef]);

  return (
    <div className="h-full w-full flex bg-background text-foreground overflow-hidden">
      {/* SidePanel - Left sidebar with components list */}
      <StdioSidePanel
        onSelectComponent={handleSelectComponent}
      />

      {/* Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <StdioEditor
            onGetCanvasRef={setCanvasRef}
          />
        </div>
      </div>

      {/* Chat Panel - Right sidebar */}
      <StdioChatPanel
        onComponentGenerated={handleComponentGenerated}
      />
    </div>
  );
}
