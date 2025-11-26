"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Mic, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from '@ai-sdk/react';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Type for message parts from the AI SDK
interface MessagePart {
  type: string;
  text?: string;
}

// Type for AI messages
interface AIMessage {
  id: string;
  role: string;
  parts: MessagePart[];
}

interface StdioChatPanelProps {
  onComponentGenerated?: (code: string, title: string) => void;
}

export function StdioChatPanel({ onComponentGenerated }: StdioChatPanelProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    messages: aiMessages,
    sendMessage,
    status
  } = useChat() as { 
    messages: AIMessage[]; 
    sendMessage: (opts: { role: string; parts: Array<{ type: string; text: string }> }) => Promise<void>; 
    status: string 
  };

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === 'submitted';

  // Convert AI SDK messages to our Message format
  const messages: Message[] = aiMessages.map((msg: AIMessage) => {
    let content = msg.parts
      .filter((part: MessagePart) => part.type === 'text')
      .map((part: MessagePart) => part.text ?? '')
      .join('');

    // If assistant message contains component code, show friendly message instead
    if (msg.role === 'assistant' && content.includes('<stdioArtifact')) {
      const titleMatch = content.match(/<stdioArtifact[^>]+title="([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : 'Component';
      content = `✨ I've created your "${title}"! Check out the code in the editor and preview on the right.`;
    }

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content,
      timestamp: new Date(),
    };
  });

  // Extract component code from assistant messages
  useEffect(() => {
    if (aiMessages.length > 0 && onComponentGenerated && status === 'ready') {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.parts
          .filter((part: MessagePart) => part.type === 'text')
          .map((part: MessagePart) => part.text ?? '')
          .join('');

        const artifactMatch = content.match(/<stdioArtifact\s+id="[^"]+"\s+title="([^"]+)">/);
        const actionMatch = content.match(/<stdioAction\s+type="component">\s*([\s\S]*?)\s*<\/stdioAction>/);

        if (artifactMatch && actionMatch) {
          const title = artifactMatch[1];
          let code = actionMatch[1].trim();
          
          // Remove markdown code fences if present
          code = code.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
          
          onComponentGenerated(code, title);
        }
      }
    }
  }, [aiMessages, onComponentGenerated, status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: userMessage }],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`bg-card border-l border-border flex flex-col shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-80'}`}>
      {/* Header */}
      <div className="h-[35px] bg-muted border-b border-border flex items-center px-3 shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={isCollapsed ? 'Expand chat' : 'Collapse chat'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="text-muted-foreground text-xs">
                    Start a conversation with the AI assistant
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3">
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Toolbar */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded hover:bg-accent/10 p-0"
                    title="Voice input"
                  >
                    <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Input Field */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the component you want to create..."
                  className="w-full min-h-12 max-h-[164px] resize-none bg-muted text-foreground text-xs border border-border rounded px-3 py-2 pr-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 bottom-1 w-8 h-8 rounded hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed p-0"
                  title="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-primary" />
                  )}
                </Button>
              </div>

              {/* Hint */}
              <div className="text-[10px] text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
