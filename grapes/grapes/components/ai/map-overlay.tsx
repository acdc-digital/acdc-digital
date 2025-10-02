"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Square, Circle, Trash2, Palette, GripVertical } from "lucide-react";

// Shape types
type ShapeType = "rectangle" | "circle" | null;

interface Shape {
  id: string;
  type: "rectangle" | "circle";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

interface MapOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onAnalyzeShapes?: (shapes: Shape[]) => void;
}

export function MapOverlay({ children, className, onAnalyzeShapes, ...props }: MapOverlayProps) {
  const [selectedTool, setSelectedTool] = React.useState<ShapeType>(null);
  const [shapes, setShapes] = React.useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = React.useState<Shape | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState("#ef4444"); // Red default
  const [isDraggingToolbar, setIsDraggingToolbar] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const toolbarPositionRef = React.useRef({ x: 16, y: 16 });

  const colors = [
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Purple", value: "#a855f7" },
    { name: "Orange", value: "#f97316" },
  ];

  // Draw all shapes on canvas
  const drawShapes = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed shapes
    shapes.forEach((shape) => {
      drawShape(ctx, shape);
    });

    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape);
    }
  }, [shapes, currentShape]);

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    const width = shape.endX - shape.startX;
    const height = shape.endY - shape.startY;

    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 3;
    ctx.fillStyle = shape.color + "80"; // 50% opacity (80 in hex = 128/255)

    if (shape.type === "rectangle") {
      ctx.fillRect(shape.startX, shape.startY, width, height);
      ctx.strokeRect(shape.startX, shape.startY, width, height);
    } else if (shape.type === "circle") {
      const centerX = shape.startX + width / 2;
      const centerY = shape.startY + height / 2;
      const radius = Math.sqrt(width * width + height * height) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

  // Redraw when shapes change
  React.useEffect(() => {
    drawShapes();
  }, [drawShapes]);

  // Handle canvas resize
  React.useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      drawShapes();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [drawShapes]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentShape({
      id: crypto.randomUUID(),
      type: selectedTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: selectedColor,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentShape({
      ...currentShape,
      endX: x,
      endY: y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;

    // Only save if shape has some size
    const width = Math.abs(currentShape.endX - currentShape.startX);
    const height = Math.abs(currentShape.endY - currentShape.startY);

    if (width > 5 || height > 5) {
      setShapes([...shapes, currentShape]);
    }

    setIsDrawing(false);
    setCurrentShape(null);
    setSelectedTool(null); // Auto-deselect tool after drawing
  };

  const clearAllShapes = () => {
    setShapes([]);
    setCurrentShape(null);
    setIsDrawing(false);
  };

  // Toolbar dragging handlers with CSS transform for performance
  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (toolbarRef.current) {
      dragStartRef.current = {
        x: e.clientX - toolbarPositionRef.current.x,
        y: e.clientY - toolbarPositionRef.current.y,
      };
      setIsDraggingToolbar(true);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDragMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingToolbar || !containerRef.current || !toolbarRef.current) return;
    
    e.preventDefault();
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const toolbarWidth = toolbarRef.current.offsetWidth;
    const toolbarHeight = toolbarRef.current.offsetHeight;
    
    let newX = e.clientX - dragStartRef.current.x;
    let newY = e.clientY - dragStartRef.current.y;

    // Keep toolbar within bounds
    const maxX = containerRect.width - toolbarWidth;
    const maxY = containerRect.height - toolbarHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    toolbarPositionRef.current = { x: newX, y: newY };
    
    // Use transform for hardware-accelerated, smooth dragging
    toolbarRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
  }, [isDraggingToolbar]);

  const handleDragMouseUp = React.useCallback(() => {
    setIsDraggingToolbar(false);
  }, []);

  // Add/remove toolbar drag listeners
  React.useEffect(() => {
    if (isDraggingToolbar) {
      // Use passive: false to allow preventDefault
      const options = { passive: false } as AddEventListenerOptions;
      window.addEventListener("mousemove", handleDragMouseMove, options);
      window.addEventListener("mouseup", handleDragMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleDragMouseMove);
        window.removeEventListener("mouseup", handleDragMouseUp);
      };
    }
  }, [isDraggingToolbar, handleDragMouseMove, handleDragMouseUp]);

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Toolbar */}
      <div
        ref={toolbarRef}
        className="absolute z-20 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden"
        style={{
          left: '0px',
          top: '0px',
          transform: `translate(${toolbarPositionRef.current.x}px, ${toolbarPositionRef.current.y}px)`,
          cursor: isDraggingToolbar ? "grabbing" : "default",
          willChange: isDraggingToolbar ? "transform" : "auto",
        }}
      >
        {/* Tools */}
        <div className="flex gap-2 p-2">
          {/* Shape Tools */}
          <div className="flex gap-1 border-r border-border pr-2">
            <Button
              variant={selectedTool === "rectangle" ? "default" : "ghost"}
              size="icon"
              onClick={() =>
                setSelectedTool(selectedTool === "rectangle" ? null : "rectangle")
              }
              title="Draw Rectangle"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === "circle" ? "default" : "ghost"}
              size="icon"
              onClick={() =>
                setSelectedTool(selectedTool === "circle" ? null : "circle")
              }
              title="Draw Circle"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>

          {/* Color Picker */}
          <div className="flex gap-1 border-r border-border pr-2">
            <div className="relative group">
              <Button variant="ghost" size="icon" title="Choose Color">
                <Palette className="h-4 w-4" />
              </Button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col gap-1 bg-card border border-border rounded-lg p-2 shadow-lg">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                      selectedColor === color.value
                        ? "border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAllShapes}
            disabled={shapes.length === 0}
            title="Clear All Shapes"
            className="border-r border-border pr-2 mr-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Analyze Button */}
          {onAnalyzeShapes && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAnalyzeShapes(shapes)}
              disabled={shapes.length === 0}
              title="Analyze Shape Area"
              className="text-xs px-3"
            >
              🔍 Analyze
            </Button>
          )}

          {/* Drag Handle */}
          <div className="border-l border-border pl-2">
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleDragMouseDown}
              className="cursor-grab active:cursor-grabbing"
              title="Drag to move toolbar"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Text */}
      {selectedTool && (
        <div className="absolute top-20 left-4 z-20 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
          {selectedTool === "rectangle"
            ? "Click and drag to draw a rectangle"
            : "Click and drag to draw a circle"}
        </div>
      )}

      {/* Content Container */}
      <div ref={containerRef} className="relative w-full h-full">
        {children}

        {/* Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 z-10",
            selectedTool ? "cursor-crosshair" : "pointer-events-none"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}
