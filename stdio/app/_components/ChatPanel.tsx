"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Mic, Loader2, ChevronRight, ChevronLeft, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from '@ai-sdk/react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  onComponentGenerated?: (code: string, title: string) => void;
}

export function ChatPanel({ onComponentGenerated }: ChatPanelProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [attachedFileIds, setAttachedFileIds] = useState<string[]>([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const {
    messages: aiMessages,
    sendMessage,
    status
  } = useChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const files = useQuery(api.files.list);

  const isLoading = status === 'submitted';

  // Convert AI SDK messages to our Message format
  const messages: Message[] = aiMessages.map((msg) => {
    let content = msg.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part as { type: 'text'; text: string }).text)
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

  // Log messages for debugging
  useEffect(() => {
    if (aiMessages.length > 0) {
      console.log('Total messages:', aiMessages.length);
      console.log('Status:', status);
      const lastMsg = aiMessages[aiMessages.length - 1];
      console.log('Last message role:', lastMsg.role);
      console.log('Last message parts:', lastMsg.parts.length);
    }
  }, [aiMessages, status]);

  // Extract component code from assistant messages
  useEffect(() => {
    if (aiMessages.length > 0 && onComponentGenerated && status === 'ready') {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.parts
          .filter((part) => part.type === 'text')
          .map((part) => (part as { type: 'text'; text: string }).text)
          .join('');

        console.log('Checking for component in message:', content.substring(0, 200));

        const artifactMatch = content.match(/<stdioArtifact\s+id="[^"]+"\s+title="([^"]+)">/);
        const actionMatch = content.match(/<stdioAction\s+type="component">\s*([\s\S]*?)\s*<\/stdioAction>/);

        if (artifactMatch && actionMatch) {
          const title = artifactMatch[1];
          let code = actionMatch[1].trim();
          
          // Remove markdown code fences if present
          code = code.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
          
          console.log('Component extracted! Title:', title, 'Code length:', code.length);
          onComponentGenerated(code, title);
        } else {
          console.log('No component found. Artifact match:', !!artifactMatch, 'Action match:', !!actionMatch);
        }
      }
    }
  }, [aiMessages, onComponentGenerated, status]);  const scrollToBottom = () => {
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

    // Send message with attached file IDs
    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: userMessage }],
      experimental_attachments: attachedFileIds.map(fileId => ({
        contentType: 'text/plain',
        name: files?.find(f => f.anthropicFileId === fileId)?.filename || 'file',
        url: `/api/files/${fileId}`,
      })),
    });

    // Clear attachments after sending
    setAttachedFileIds([]);
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
    <div className={`bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-80'}`}>
      {/* Header */}
      <div className="h-[35px] bg-[#252526] border-b border-[#3e3e42] flex items-center px-3 shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#858585] hover:text-[#cccccc] transition-colors"
          title={isCollapsed ? 'Expand chat' : 'Collapse chat'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="text-[#858585] text-xs">
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
                      ? "bg-[#007acc] text-white"
                      : "bg-[#252526] text-[#cccccc] border border-[#2d2d2d]"
                  }`}
                >
                  <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
                </div>
                <div className="text-[10px] text-[#858585] mt-1 px-1">
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
      <div className="border-t border-[#2d2d2d] p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Toolbar with File Attachment */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {/* File Attachment Dropdown */}
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded hover:bg-[#2d2d2d] p-0"
                  title="Attach files"
                  onClick={() => setShowFileMenu(!showFileMenu)}
                >
                  <File className="w-3.5 h-3.5 text-[#858585]" />
                </Button>
                
                {showFileMenu && files && files.length > 0 && (
                  <div className="absolute left-0 bottom-full mb-1 bg-[#252526] border border-[#2d2d2d] rounded shadow-lg max-h-48 overflow-y-auto z-10 min-w-[200px]">
                    {files.map((file) => (
                      <button
                        key={file._id}
                        type="button"
                        onClick={() => {
                          if (!attachedFileIds.includes(file.anthropicFileId)) {
                            setAttachedFileIds([...attachedFileIds, file.anthropicFileId]);
                          }
                          setShowFileMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-[#cccccc] hover:bg-[#2d2d2d] flex items-center gap-2"
                      >
                        <File className="w-3 h-3 text-[#858585]" />
                        <span className="truncate">{file.filename}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {showFileMenu && (!files || files.length === 0) && (
                  <div className="absolute left-0 bottom-full mb-1 bg-[#252526] border border-[#2d2d2d] rounded shadow-lg p-3 z-10 min-w-[200px]">
                    <p className="text-xs text-[#858585]">No files uploaded yet</p>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded hover:bg-[#2d2d2d] p-0"
                title="Voice input"
              >
                <Mic className="w-3.5 h-3.5 text-[#858585]" />
              </Button>
            </div>
            
            {/* Attached Files Display */}
            {attachedFileIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {attachedFileIds.map((fileId) => {
                  const file = files?.find(f => f.anthropicFileId === fileId);
                  return (
                    <div
                      key={fileId}
                      className="flex items-center gap-1 px-2 py-1 bg-[#2d2d2d] rounded text-xs text-[#cccccc]"
                    >
                      <File className="w-3 h-3 text-[#858585]" />
                      <span className="max-w-[120px] truncate">{file?.filename || 'file'}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFileIds(attachedFileIds.filter(id => id !== fileId))}
                        className="hover:text-[#f44747]"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe the component you want to create..."
              className="w-full min-h-12 max-h-[164px] resize-none bg-[#252526] text-[#cccccc] text-xs border border-[#2d2d2d] rounded px-3 py-2 pr-10 placeholder:text-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              variant="ghost"
              size="icon"
              className="absolute right-1 bottom-1 w-8 h-8 rounded hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed p-0"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-[#007acc] animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-[#007acc]" />
              )}
            </Button>
          </div>

          {/* Hint */}
          <div className="text-[10px] text-[#858585]">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
        </>
      )}
    </div>
  );
}
