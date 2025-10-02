"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComputerAction {
  action: string;
  coordinate?: [number, number];
  text?: string;
}

interface ComputerUsePanelProps {
  className?: string;
  onActionExecute?: (action: ComputerAction) => void;
}

export function ComputerUsePanel({
  className,
  onActionExecute,
}: ComputerUsePanelProps) {
  const [prompt, setPrompt] = React.useState("");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [messages, setMessages] = React.useState<
    Array<{ type: string; content: string; timestamp: number }>
  >([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for shape analysis events
  React.useEffect(() => {
    const handleAnalyze = (e: Event) => {
      const customEvent = e as CustomEvent;
      const coordinates = customEvent.detail?.coordinates;
      if (coordinates) {
        const analysisPrompt = "Calculate the area of this shape and identify what geographic region it covers.";
        setPrompt(analysisPrompt);
        
        // Execute with coordinates
        const executeAnalysis = async () => {
          if (isExecuting) return;
          
          setIsExecuting(true);
          setMessages((prev) => [
            ...prev,
            {
              type: "user",
              content: analysisPrompt,
              timestamp: Date.now(),
            },
          ]);

          try {
            const response = await fetch("/api/computer-use", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                prompt: analysisPrompt, 
                shapeCoordinates: coordinates 
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
              throw new Error("No response body");
            }

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n").filter((line) => line.trim());

              for (const line of lines) {
                try {
                  const data = JSON.parse(line);

                  if (data.type === "response") {
                    const textContent = data.content
                      .filter((block: { type: string }) => block.type === "text")
                      .map((block: { text: string }) => block.text)
                      .join("\n");

                    if (textContent) {
                      setMessages((prev) => [
                        ...prev,
                        {
                          type: "assistant",
                          content: textContent,
                          timestamp: Date.now(),
                        },
                      ]);
                    }
                  } else if (data.type === "tool_use") {
                    const toolUse = data.toolUse;
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: "tool",
                        content: `🛠️ Using tool: ${toolUse.name}`,
                        timestamp: Date.now(),
                      },
                    ]);

                    if (onActionExecute && toolUse.input) {
                      onActionExecute(toolUse.input as ComputerAction);
                    }
                  } else if (data.type === "tool_result") {
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: "tool",
                        content: `📊 Result: ${data.result}`,
                        timestamp: Date.now(),
                      },
                    ]);
                  } else if (data.type === "error") {
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: "error",
                        content: `Error: ${data.error}`,
                        timestamp: Date.now(),
                      },
                    ]);
                  }
                } catch (parseError) {
                  console.error("Error parsing line:", line, parseError);
                }
              }
            }
          } catch (error) {
            console.error("Error executing prompt:", error);
            setMessages((prev) => [
              ...prev,
              {
                type: "error",
                content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                timestamp: Date.now(),
              },
            ]);
          } finally {
            setIsExecuting(false);
          }
        };
        
        // Execute after a brief delay
        setTimeout(() => {
          executeAnalysis();
        }, 100);
      }
    };
    
    window.addEventListener('analyzeShapes', handleAnalyze);
    return () => window.removeEventListener('analyzeShapes', handleAnalyze);
  }, [isExecuting, onActionExecute]);

  const handleExecute = async (shapeCoordinates?: unknown) => {
    if (!prompt.trim() || isExecuting) return;

    setIsExecuting(true);
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: prompt,
        timestamp: Date.now(),
      },
    ]);

    try {
      const response = await fetch("/api/computer-use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, shapeCoordinates }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === "response") {
              // Handle Claude's response
              const textContent = data.content
                .filter((block: { type: string }) => block.type === "text")
                .map((block: { text: string }) => block.text)
                .join("\n");

              if (textContent) {
                setMessages((prev) => [
                  ...prev,
                  {
                    type: "assistant",
                    content: textContent,
                    timestamp: Date.now(),
                  },
                ]);
              }
            } else if (data.type === "tool_use") {
              // Handle tool use
              const toolUse = data.toolUse;
              setMessages((prev) => [
                ...prev,
                {
                  type: "tool",
                  content: `Tool: ${toolUse.name}\nAction: ${JSON.stringify(toolUse.input, null, 2)}`,
                  timestamp: Date.now(),
                },
              ]);

              // Execute the action on the map
              if (onActionExecute && toolUse.input) {
                onActionExecute(toolUse.input as ComputerAction);
              }
            } else if (data.type === "error") {
              setMessages((prev) => [
                ...prev,
                {
                  type: "error",
                  content: `Error: ${data.error}`,
                  timestamp: Date.now(),
                },
              ]);
            }
          } catch (parseError) {
            console.error("Error parsing line:", line, parseError);
          }
        }
      }
    } catch (error) {
      console.error("Error executing prompt:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-2">🤖 Claude Computer Use</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Ask Claude to draw shapes on the Canada map using the overlay tools.
        </p>

        <div className="space-y-2">
          <Input
            placeholder="e.g., Draw a red circle around British Columbia..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleExecute();
              }
            }}
            disabled={isExecuting}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !prompt.trim()}
              className="flex-1"
              size="sm"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              disabled={isExecuting || messages.length === 0}
              variant="outline"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p className="mb-2">No messages yet</p>
            <p className="text-xs">Try asking Claude to:</p>
            <ul className="text-xs mt-2 space-y-1 text-left max-w-xs mx-auto">
              <li>• Draw a red circle around Ontario</li>
              <li>• Mark the Rocky Mountains with a rectangle</li>
              <li>• Highlight the Atlantic provinces</li>
              <li>• Draw shapes on multiple regions</li>
            </ul>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg text-sm",
                message.type === "user" &&
                  "bg-primary text-primary-foreground ml-8",
                message.type === "assistant" && "bg-muted mr-8",
                message.type === "tool" && "bg-blue-500/10 border border-blue-500/20",
                message.type === "error" && "bg-destructive/10 border border-destructive/20"
              )}
            >
              <div className="flex items-start gap-2">
                <div className="font-medium text-xs opacity-70 mb-1">
                  {message.type === "user" && "You"}
                  {message.type === "assistant" && "Claude"}
                  {message.type === "tool" && "🛠️ Tool Use"}
                  {message.type === "error" && "⚠️ Error"}
                </div>
              </div>
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
