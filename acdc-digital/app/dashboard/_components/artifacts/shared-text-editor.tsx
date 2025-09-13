"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ErrorBoundary } from "./ui/ErrorBoundary";

interface SharedTextEditorProps {
  className?: string;
  documentId: Id<"documents">;
}

// Content transformation button component
function ContentTransformButton({
  type,
  documentId,
  currentContent
}: {
  type: "newsletter" | "blog" | "analysis" | "social" | "context";
  documentId: Id<"documents">;
  currentContent: string;
}) {
  const [isTransforming, setIsTransforming] = useState(false);
  const transformContent = useAction(api.ai.contentTransform.transformContent);

  const handleTransform = async () => {
    setIsTransforming(true);
    try {
      console.log(`Starting ${type} transformation with content:`, currentContent.substring(0, 100) + "...");
      
      const result = await transformContent({
        documentId,
        contentType: type,
        currentContent,
      });

      if (result.success) {
        console.log(`${type} transformation completed successfully`);
      } else {
        console.error(`${type} transformation failed:`, result.error);
        alert(`Failed to transform content: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error transforming to ${type}:`, error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsTransforming(false);
    }
  };

  const labels = {
    newsletter: "Newsletter",
    blog: "Blog Post",
    analysis: "Analysis",
    social: "Social",
    context: "Context"
  };

  return (
    <button
      onClick={handleTransform}
      disabled={isTransforming}
      className="px-3 py-1 text-xs bg-[#3e3e42] hover:bg-[#4a4a4f] text-[#cccccc] rounded border border-[#5a5a5f] transition-colors disabled:opacity-50"
    >
      {isTransforming ? (
        <div className="flex items-center">
          <div className="w-3 h-3 border border-[#cccccc] border-t-transparent rounded-full animate-spin mr-1"></div>
          {labels[type]}...
        </div>
      ) : (
        labels[type]
      )}
    </button>
  );
}

// Connected Tiptap editor component that syncs with the database
function ConnectedTiptapEditor({
  documentId,
  className = ""
}: {
  documentId: Id<"documents">;
  className?: string;
}) {
  const documentContent = useQuery(api.sharedDocument.getDocumentContent, { documentId });
  const updateContent = useMutation(api.sharedDocument.updateDocumentContent);
  
  // Debug logging for document content changes
  useEffect(() => {
    if (documentContent) {
      console.log("Document content updated from Convex:", {
        contentLength: documentContent.content.length,
        updatedAt: new Date(documentContent.updatedAt).toISOString(),
        contentPreview: documentContent.content.substring(0, 100) + "..."
      });
    }
  }, [documentContent]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasExternalUpdate, setHasExternalUpdate] = useState(false);

  // Create Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '<p>Loading...</p>',
    immediatelyRender: false, // Fix SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-4 text-white',
      },
    },
    onUpdate: ({ editor }) => {
      // Debounced save to database
      const html = editor.getHTML();
      
      // Validate content before saving
      const isValidContent = html &&
        html.length > 0 &&
        html !== '<p></p>' &&
        !html.includes('undefined') &&
        html !== lastSavedContent;
      
      if (isValidContent && isInitialized) {
        // Clear existing timeout
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        
        console.log("Scheduling save for content:", html.substring(0, 50) + "...");
        
        // Set new timeout for saving
        const timeoutId = setTimeout(async () => {
          setIsSaving(true);
          try {
            await updateContent({ documentId, content: html });
            setLastSavedContent(html);
            console.log("Content saved to database successfully");
          } catch (error) {
            console.error("Failed to save content:", error);
          } finally {
            setIsSaving(false);
            setSaveTimeout(null);
          }
        }, 1000);
        
        setSaveTimeout(timeoutId);
      }
    },
  });

  // Load content from database when it becomes available
  useEffect(() => {
    if (documentContent && editor) {
      const newContent = documentContent.content;
      const currentContent = editor.getHTML();
      
      // Initial load
      if (!isInitialized) {
        console.log("Loading initial content from database:", newContent.substring(0, 100) + "...");
        editor.commands.setContent(newContent);
        setLastSavedContent(newContent);
        setIsInitialized(true);
        return;
      }
      
      // External updates (like AI changes) - only update if content changed externally
      // and we're not currently saving to avoid overwriting user typing
      if (newContent !== currentContent &&
          newContent !== lastSavedContent &&
          !isSaving &&
          !saveTimeout) {
        console.log("Updating editor with external changes:", newContent.substring(0, 100) + "...");
        
        // Show external update indicator briefly
        setHasExternalUpdate(true);
        setTimeout(() => setHasExternalUpdate(false), 2000);
        
        // Preserve cursor position if possible
        const { from, to } = editor.state.selection;
        editor.commands.setContent(newContent);
        
        // Try to restore cursor position
        try {
          if (from <= newContent.length) {
            editor.commands.setTextSelection({ from, to: Math.min(to, newContent.length) });
          }
        } catch {
          // Cursor restoration failed, that's okay
          console.log("Could not restore cursor position after external update");
        }
        
        setLastSavedContent(newContent);
      }
    }
  }, [documentContent, editor, isInitialized, lastSavedContent, isSaving, saveTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Show loading state while waiting for content
  if (!documentContent) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-[#858585]">Loading document content...</div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-[#858585]">Preparing editor...</div>
      </div>
    );
  }

  return (
    <div className={`${className} overflow-auto bg-[#1e1e1e] text-white`}>
      <div className="w-full h-full">
        {/* Document title and transformation buttons */}
        <div className="border-b border-[#3e3e42] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#cccccc]">
              {documentContent.title}
            </h3>
            {isSaving && (
              <div className="flex items-center text-xs text-[#858585]">
                <div className="w-3 h-3 border border-[#858585] border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            )}
            {hasExternalUpdate && (
              <div className="flex items-center text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Updated by AI
              </div>
            )}
          </div>
          <p className="text-xs text-[#858585] mt-1">
            Last updated: {new Date(documentContent.updatedAt).toLocaleString()}
          </p>
          
          {/* Content transformation buttons */}
          <div className="flex gap-2 mt-3">
            <ContentTransformButton
              type="newsletter"
              documentId={documentId}
              currentContent={documentContent.content}
            />
            <ContentTransformButton
              type="blog"
              documentId={documentId}
              currentContent={documentContent.content}
            />
            <ContentTransformButton
              type="analysis"
              documentId={documentId}
              currentContent={documentContent.content}
            />
            <ContentTransformButton
              type="social"
              documentId={documentId}
              currentContent={documentContent.content}
            />
            <ContentTransformButton
              type="context"
              documentId={documentId}
              currentContent={documentContent.content}
            />
          </div>
        </div>
        
        {/* Editor content */}
        <EditorContent 
          editor={editor} 
          className="w-full h-full min-h-[400px]"
        />
      </div>
    </div>
  );
}

// Main shared text editor component with error boundary
export default function SharedTextEditor({ className = "", documentId }: SharedTextEditorProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ErrorBoundary>
        <ConnectedTiptapEditor 
          documentId={documentId}
          className="w-full h-full"
        />
      </ErrorBoundary>
    </div>
  );
}