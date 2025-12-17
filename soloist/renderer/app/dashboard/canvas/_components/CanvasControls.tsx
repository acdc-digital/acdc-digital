// CANVAS CONTROLS
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/_components/CanvasControls.tsx

"use client";

import React from "react";
import { Editor } from "tldraw";
import { 
  MousePointer2, 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  ArrowUpRight,
  Eraser,
  Hand,
  ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasControlsProps {
  editor: Editor | null;
}

type ToolId = "select" | "hand" | "draw" | "eraser" | "arrow" | "rectangle" | "ellipse" | "text";

interface ToolButton {
  id: ToolId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
}

const tools: ToolButton[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "hand", icon: Hand, label: "Hand", shortcut: "H" },
  { id: "draw", icon: Pencil, label: "Draw", shortcut: "D" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
  { id: "rectangle", icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: Circle, label: "Ellipse", shortcut: "O" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
];

// Hidden file input for image upload
const HiddenFileInput = React.forwardRef<HTMLInputElement, { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }>(
  ({ onChange }, ref) => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      onChange={onChange}
      className="hidden"
      aria-label="Upload image"
    />
  )
);
HiddenFileInput.displayName = "HiddenFileInput";

export function CanvasControls({ editor }: CanvasControlsProps) {
  const [currentTool, setCurrentTool] = React.useState<string>("draw");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync with editor's current tool
  React.useEffect(() => {
    if (!editor) return;
    
    const handleToolChange = () => {
      const toolId = editor.getCurrentToolId();
      setCurrentTool(toolId);
    };

    // Listen to tool changes
    const cleanup = editor.store.listen(handleToolChange, { source: "user" });
    handleToolChange(); // Initial sync
    
    return () => cleanup();
  }, [editor]);

  const selectTool = (toolId: ToolId) => {
    if (!editor) return;
    
    // Handle geo shapes specially - they use the same tool but different geo types
    if (toolId === "rectangle" || toolId === "ellipse") {
      // First set the tool to geo
      editor.setCurrentTool("geo");
      // Set the geo type via instance state
      const geoStyle = toolId === "rectangle" ? "rectangle" : "ellipse";
      const currentStyles = editor.getInstanceState().stylesForNextShape;
      editor.updateInstanceState({
        stylesForNextShape: {
          ...currentStyles,
          "tldraw:geo": geoStyle,
        },
      });
    } else {
      editor.setCurrentTool(toolId);
    }
    
    setCurrentTool(toolId);
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    // Convert file to base64 data URL (tldraw requires data: or https: URLs)
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      
      // Get viewport center for placement
      const viewportCenter = editor.getViewportPageBounds().center;

      // Create image element to get dimensions
      const img = new Image();
      img.onload = async () => {
        // Scale down if too large (max 500px on longest side)
        const maxSize = 500;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const scale = maxSize / Math.max(width, height);
          width *= scale;
          height *= scale;
        }

        // Create a unique asset ID
        const assetId = `asset:${Date.now()}` as any;

        // First create an asset for the image
        editor.createAssets([
          {
            id: assetId,
            type: "image",
            typeName: "asset",
            props: {
              name: file.name,
              src: dataUrl,
              w: img.width,
              h: img.height,
              mimeType: file.type,
              isAnimated: false,
            },
            meta: {},
          },
        ]);

        // Then create the image shape referencing the asset
        editor.createShape({
          type: "image",
          x: viewportCenter.x - width / 2,
          y: viewportCenter.y - height / 2,
          props: {
            w: width,
            h: height,
            assetId: assetId,
          },
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <TooltipProvider delayDuration={300}>
      <HiddenFileInput ref={fileInputRef} onChange={handleFileChange} />
      <div className="flex items-center justify-between px-3 py-2 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-lg border border-neutral-300 dark:border-neutral-600 shadow-lg">
        {/* Left: Tool buttons */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.id || 
              (tool.id === "rectangle" && currentTool === "geo") ||
              (tool.id === "ellipse" && currentTool === "geo");
            
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      isActive 
                        ? "bg-neutral-200 dark:bg-neutral-700" 
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                    onClick={() => selectTool(tool.id)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {tool.label} {tool.shortcut && <span className="text-neutral-400 ml-1">{tool.shortcut}</span>}
                </TooltipContent>
              </Tooltip>
            );
          })}

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={handleAddImage}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Add image
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default CanvasControls;
