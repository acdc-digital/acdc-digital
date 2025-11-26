"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGrapesAgent } from "@/lib/hooks/useGrapesAgent";

interface ComputerAction {
  action: string;
  coordinate?: [number, number];
  text?: string;
}

interface ComputerUsePanelProps {
  className?: string;
  onActionExecute?: (action: ComputerAction) => void; // Reserved for future map interaction features
}

/**
 * ComputerUsePanel - Nexus Architecture Implementation
 *
 * Uses GrapesOrchestratorAgent via useGrapesAgent hook for:
 * - Screenshot capture analysis
 * - Google Maps API integration (area calculation, geocoding, place search)
 * - Real-time streaming responses
 */
export function ComputerUsePanel({
  className,
}: ComputerUsePanelProps) {
  const [prompt, setPrompt] = React.useState("");
  const [storedCoordinates, setStoredCoordinates] = React.useState<Array<{
    type: string;
    color: string;
    coordinates: Array<{ lat: number; lng: number }>;
  }> | null>(null);
  const [storedScreenshot, setStoredScreenshot] = React.useState<string | undefined>(undefined);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Use Nexus agent hook
  const {
    messages,
    isStreaming,
    error,
    currentResponse,
    sendMessage,
    clearMessages,
  } = useGrapesAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  // Listen for shape analysis events from map
  React.useEffect(() => {
    const handleAnalyze = (e: Event) => {
      const customEvent = e as CustomEvent;
      const coordinates = customEvent.detail?.coordinates;
      const screenshot = customEvent.detail?.screenshot;
      const useHybrid = customEvent.detail?.useHybrid;
      
      if (coordinates) {
        console.log('[ComputerUsePanel] Received shape analysis event', {
          coordinateCount: coordinates.length,
          hasScreenshot: !!screenshot,
          useHybrid
        });

        // Store coordinates and screenshot for future questions
        setStoredCoordinates(coordinates);
        setStoredScreenshot(screenshot);
        
        // Build analysis prompt
        const analysisPrompt = useHybrid && screenshot
          ? "I've drawn a shape on a Google Maps interface. Analyze the area using the provided coordinates, and verify the location using the screenshot. Calculate the area and identify the region."
          : "Calculate the area of this shape and identify what geographic region it covers.";

        // Execute analysis via Nexus agent
        sendMessage({
          message: analysisPrompt,
          screenshot,
          shapeCoordinates: coordinates,
        });
      }
    };
    
    window.addEventListener('analyzeShapes', handleAnalyze);
    return () => window.removeEventListener('analyzeShapes', handleAnalyze);
  }, [sendMessage]);

  const handleExecute = async () => {
    if (!prompt.trim() || isStreaming) return;

    const currentPrompt = prompt;
    setPrompt(""); // Clear input immediately

    // Send message with stored context
    await sendMessage({
      message: currentPrompt,
      screenshot: storedScreenshot,
      shapeCoordinates: storedCoordinates || undefined,
    });
  };

  const handleClear = () => {
    clearMessages();
    setStoredCoordinates(null);
    setStoredScreenshot(undefined);
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <h3 className="text-lg font-semibold mb-2">🍇 Grapes Analyzer</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Draw shapes on the map and ask questions about geography, area, and places.
        </p>

        {/* Input Area */}
        <div className="space-y-2">
          <Input
            placeholder="e.g., What restaurants are in this area?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleExecute();
              }
            }}
            disabled={isStreaming}
            className="bg-background"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleExecute}
              disabled={isStreaming || !prompt.trim()}
              className="flex-1"
              size="sm"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              disabled={isStreaming || messages.length === 0}
              variant="outline"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Context Indicators */}
        {(storedCoordinates || storedScreenshot) && (
          <div className="mt-3 flex gap-2 text-xs">
            {storedCoordinates && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary">
                <span>📍</span>
                <span>{storedCoordinates.length} shape(s)</span>
              </div>
            )}
            {storedScreenshot && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-600">
                <span>📸</span>
                <span>Screenshot</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !currentResponse ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p className="mb-2">No analysis yet</p>
            <p className="text-xs">Try:</p>
            <ul className="text-xs mt-2 space-y-1 text-left max-w-xs mx-auto">
              <li>• Draw a shape, then click &ldquo;Analyze&rdquo;</li>
              <li>• Ask &ldquo;What&apos;s the area in square miles?&rdquo;</li>
              <li>• Ask &ldquo;What restaurants are nearby?&rdquo;</li>
              <li>• Ask &ldquo;What city is this?&rdquo;</li>
            </ul>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "p-3 rounded-lg text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                )}
              >
                <div className="font-medium text-xs opacity-70 mb-1">
                  {message.role === "user" ? "You" : "Grapes AI"}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                
                {/* Show tool calls if present */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.toolCalls.map((toolCall, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20"
                      >
                        🛠️ {toolCall.toolId}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Current streaming response */}
            {currentResponse && (
              <div className="p-3 rounded-lg text-sm bg-muted mr-8">
                <div className="font-medium text-xs opacity-70 mb-1">
                  Grapes AI
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {currentResponse}
                  <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg text-sm bg-destructive/10 border border-destructive/20">
            <div className="font-medium text-xs mb-1">⚠️ Error</div>
            <div className="text-destructive">{error}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
