"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ErrorBoundary } from "./ui/ErrorBoundary";

interface SharedTextEditorProps {
  className?: string;
  documentId: Id<"documents">;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");

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
      if (html !== lastSavedContent && isInitialized) {
        setLastSavedContent(html);
        // Debounce the save operation
        const timeoutId = setTimeout(() => {
          updateContent({ documentId, content: html });
          console.log("Content saved to database");
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    },
  });

  // Load content from database when it becomes available
  useEffect(() => {
    if (documentContent && editor) {
      const newContent = documentContent.content;
      const currentContent = editor.getHTML();
      
      console.log("Loading content from database:", newContent);
      
      // Only update if content actually changed to avoid cursor jumping
      if (newContent !== currentContent && newContent !== lastSavedContent) {
        editor.commands.setContent(newContent);
        setLastSavedContent(newContent);
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    }
  }, [documentContent, editor, lastSavedContent, isInitialized]);

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
        {/* Document title */}
        <div className="border-b border-[#3e3e42] p-3">
          <h3 className="text-sm font-medium text-[#cccccc]">
            {documentContent.title}
          </h3>
          <p className="text-xs text-[#858585] mt-1">
            Last updated: {new Date(documentContent.updatedAt).toLocaleString()}
          </p>
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