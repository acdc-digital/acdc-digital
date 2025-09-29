// AGENT DEMO PAGE
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/agents/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, Loader2, CheckCircle, XCircle } from "lucide-react";

// Import our agent system
import { smnbAgentRegistry } from "@/lib/agents";

export default function AgentsPage() {
  const [selectedCommand, setSelectedCommand] = useState("/chat");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: unknown } | null>(null);

  // Get available agents and commands
  const agents = smnbAgentRegistry.getAllAgents();
  const commands = smnbAgentRegistry.getAllCommands();

  const handleExecute = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Mock mutations for demo
      const mockMutations = {
        addChatMessage: async (_args: unknown) => {
          console.log("Mock addChatMessage:", _args);
          return "mock-message-id";
        },
        updateChatMessage: async () => {},
        createSession: async () => "mock-session-id",
        updateSession: async () => {},
        updateAgentProgress: async () => {}
      };

      // Mock context
      const mockContext = {
        sessionId: "demo-session",
        userId: "demo-user"
      };

      // Execute command
      const executionResult = await smnbAgentRegistry.executeCommand(
        selectedCommand,
        input,
        mockMutations,
        mockContext
      );

      setResult(executionResult);
    } catch (error) {
      console.error("Agent execution error:", error);
      setResult({
        success: false,
        message: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">SMNB Agent System</h1>
        <p className="text-neutral-400">
          Test the unified agent architecture following ACDC Digital patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Overview */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Registered Agents
            </CardTitle>
            <CardDescription>
              Available agents in the registry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border border-neutral-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{agent.icon}</span>
                  <div>
                    <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                    <p className="text-xs text-neutral-500">{agent.id}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mb-2">{agent.description}</p>
                <div className="flex flex-wrap gap-1">
                  {agent.tools.map((tool: { command: string; name: string }) => (
                    <Badge 
                      key={tool.command} 
                      variant="outline" 
                      className="text-xs border-neutral-700 text-neutral-300"
                    >
                      {tool.command}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Command Execution */}
        <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Command Executor
            </CardTitle>
            <CardDescription>
              Test agent commands and see responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Command Selection */}
            <div>
              <label className="text-sm font-medium text-neutral-200 mb-2 block">
                Select Command
              </label>
              <div className="flex flex-wrap gap-2">
                {commands.map((command) => (
                  <button
                    key={command}
                    onClick={() => setSelectedCommand(command)}
                    className={`px-3 py-1 text-xs rounded border transition-colors ${
                      selectedCommand === command
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                    }`}
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="text-sm font-medium text-neutral-200 mb-2 block">
                Input Text
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter input for ${selectedCommand}...`}
                className="bg-neutral-800 border-neutral-700 text-white min-h-[100px]"
              />
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecute}
              disabled={!input.trim() || isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Executing {selectedCommand}...
                </>
              ) : (
                <>
                  Execute {selectedCommand}
                </>
              )}
            </Button>

            {/* Result */}
            {result && (
              <div className="border border-neutral-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-medium text-white">
                    {result.success ? "Success" : "Failed"}
                  </span>
                </div>
                
                <div className="bg-neutral-800 rounded p-3 mb-3">
                  <p className="text-sm text-neutral-200 whitespace-pre-wrap">
                    {result.message}
                  </p>
                </div>

                {result.data && typeof result.data === 'object' && (
                  <details className="text-xs">
                    <summary className="text-neutral-400 cursor-pointer hover:text-neutral-200">
                      Additional Data
                    </summary>
                    <pre className="mt-2 p-2 bg-neutral-950 rounded text-neutral-400 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Command Examples */}
      <Card className="bg-neutral-900 border-neutral-800 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Command Examples</CardTitle>
          <CardDescription>
            Try these example commands to test different agent capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-200">Chat Commands</h4>
              <div className="space-y-1 text-xs text-neutral-400">
                <div><code>/chat</code> - &quot;What are the latest trends in AI?&quot;</div>
                <div><code>/session-chat</code> - &quot;Continue our previous discussion&quot;</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-200">Analysis Commands</h4>
              <div className="space-y-1 text-xs text-neutral-400">
                <div><code>/analyze</code> - &quot;This product is amazing and works perfectly!&quot;</div>
                <div><code>/help-chat</code> - (no input needed)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}