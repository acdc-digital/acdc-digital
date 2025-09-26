"use client";

import React from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useTiptapSync } from '@convex-dev/prosemirror-sync/tiptap';
import { api } from '@/convex/_generated/api';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

// Tiptap extensions configuration  
const extensions = [
  StarterKit.configure({
    // Disable any extensions that might conflict
    codeBlock: false,
  }),
  Typography,
  Underline,
  Placeholder.configure({
    placeholder: 'Start typing your document...',
  }),
];

interface TiptapEditorProps {
  documentId: string;
  className?: string;
}

// Toolbar component for editor controls
function EditorToolbar({ editor }: { editor: Editor | null }) {
  // Force re-render on editor updates
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    if (!editor) return;

    // Listen to editor updates to trigger re-renders
    const updateHandler = () => {
      forceUpdate();
    };

    editor.on('update', updateHandler);
    editor.on('selectionUpdate', updateHandler);

    return () => {
      editor.off('update', updateHandler);
      editor.off('selectionUpdate', updateHandler);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const headingLevels = [
    { level: 1, label: 'H1' },
    { level: 2, label: 'H2' },
    { level: 3, label: 'H3' },
    { level: 4, label: 'H4' },
  ];

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`
        p-1 rounded text-xs font-medium transition-colors border cursor-pointer
        ${isActive 
          ? 'border-[#008080] text-[#cccccc]' 
          : 'border-transparent text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white'
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-[#2d2d2d] bg-[#1a1a1a] px-3 py-1">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Headings */}
        <div className="flex items-center gap-1 mr-3">
          {headingLevels.map(({ level, label }) => (
            <ToolbarButton
              key={level}
              onClick={() => {
                console.log(`Trying H${level}, can toggle:`, editor.can().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }));
                const result = editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                console.log(`H${level} command result:`, result);
              }}
              isActive={editor.isActive('heading', { level })}
              title={`Heading ${level}`}
            >
              {label}
            </ToolbarButton>
          ))}
          <ToolbarButton
            onClick={() => {
              console.log('Trying paragraph, can set:', editor.can().setParagraph());
              const result = editor.chain().focus().setParagraph().run();
              console.log('Paragraph command result:', result);
            }}
            isActive={editor.isActive('paragraph')}
            title="Normal text"
          >
            P
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-[#2d2d2d] mx-1" />

        {/* Text formatting */}
        <div className="flex items-center gap-1 mr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-[#2d2d2d] mx-1" />

        {/* Lists and quotes */}
        <div className="flex items-center gap-1 mr-3">
          <ToolbarButton
            onClick={() => {
              // Force focus and try bullet list
              editor.commands.focus();
              if (editor.can().toggleBulletList()) {
                editor.chain().focus().toggleBulletList().run();
              } else {
                // Try alternative approach - clear formatting first
                editor.chain().focus().clearNodes().toggleBulletList().run();
              }
            }}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              // Force focus and try ordered list
              editor.commands.focus();
              if (editor.can().toggleOrderedList()) {
                editor.chain().focus().toggleOrderedList().run();
              } else {
                // Try alternative approach - clear formatting first
                editor.chain().focus().clearNodes().toggleOrderedList().run();
              }
            }}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              // Force focus and try blockquote
              editor.commands.focus();
              if (editor.can().toggleBlockquote()) {
                editor.chain().focus().toggleBlockquote().run();
              } else {
                // Try alternative approach
                editor.chain().focus().clearNodes().toggleBlockquote().run();
              }
            }}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={14} />
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-[#2d2d2d] mx-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => {
              if (editor.can().undo()) {
                editor.chain().focus().undo().run();
              }
            }}
            isActive={false}
            title="Undo"
          >
            <Undo size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              if (editor.can().redo()) {
                editor.chain().focus().redo().run();
              }
            }}
            isActive={false}
            title="Redo"
          >
            <Redo size={14} />
          </ToolbarButton>
        </div>

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
          <span className="text-xs text-[#858585]">Live</span>
        </div>
      </div>
    </div>
  );
}

export function TiptapEditor({ documentId, className = '' }: TiptapEditorProps) {
  const sync = useTiptapSync(api.prosemirror, documentId);
  
  const editor = useEditor({
    content: sync.initialContent || '',
    extensions: sync.extension ? [
      StarterKit.configure({ codeBlock: false }),
      Typography, 
      Underline,
      Placeholder.configure({ placeholder: 'Start typing your document...' }),
      sync.extension
    ] : extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-[#cccccc] min-h-[400px] prose prose-invert max-w-none',
        style: 'background-color: transparent; border: none; outline: none; padding: 20px; font-family: inherit;'
      },
    },
    // Add onUpdate to ensure state changes are reflected
    onUpdate: ({ editor }) => {
      // This ensures React knows about state changes
      console.log('Editor updated, active marks:', {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        heading1: editor.isActive('heading', { level: 1 }),
        heading2: editor.isActive('heading', { level: 2 }),
        paragraph: editor.isActive('paragraph'),
      });
    },
  }, [sync.initialContent, sync.extension]);

  if (sync.isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-[#1e1e1e] border border-[#2d2d2d]">
          <div className="w-6 h-6 border-2 border-[#008080] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#cccccc]">Loading editor...</span>
        </div>
      </div>
    );
  }

  if (sync.initialContent !== null) {
    return (
      <div className={`h-full w-full flex flex-col ${className}`}>
        {/* Editor Toolbar - At the very top */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] border-b-0 shrink-0">
          <EditorToolbar editor={editor} />
        </div>
        
        {/* Editor Content - Below toolbar */}
        <div className="flex-1 bg-[#1e1e1e] border border-[#2d2d2d] border-t-0 overflow-auto">
          <EditorContent 
            editor={editor} 
            className="
              [&_.ProseMirror]:min-h-[400px]
              [&_.ProseMirror]:px-5
              [&_.ProseMirror]:py-4
              [&_.ProseMirror_h1]:text-3xl
              [&_.ProseMirror_h1]:font-bold
              [&_.ProseMirror_h1]:mb-4
              [&_.ProseMirror_h2]:text-2xl
              [&_.ProseMirror_h2]:font-semibold
              [&_.ProseMirror_h2]:mb-3
              [&_.ProseMirror_h3]:text-xl
              [&_.ProseMirror_h3]:font-semibold
              [&_.ProseMirror_h3]:mb-2
              [&_.ProseMirror_h4]:text-lg
              [&_.ProseMirror_h4]:font-medium
              [&_.ProseMirror_h4]:mb-2
              [&_.ProseMirror_p]:mb-3
              [&_.ProseMirror_ul]:list-disc
              [&_.ProseMirror_ul]:pl-6
              [&_.ProseMirror_ol]:list-decimal
              [&_.ProseMirror_ol]:pl-6
              [&_.ProseMirror_blockquote]:border-l-4
              [&_.ProseMirror_blockquote]:border-[#008080]
              [&_.ProseMirror_blockquote]:pl-4
              [&_.ProseMirror_blockquote]:italic
              [&_.ProseMirror_blockquote]:text-[#a0a0a0]
            "
          />
        </div>
      </div>
    );
  }

  // Document doesn't exist yet - show create button
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center p-6 rounded-lg border border-[#2d2d2d] bg-[#1e1e1e]">
        <div className="mb-4">
          <svg className="w-12 h-12 text-[#858585] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#cccccc] font-rubik mb-2">
          Create New Document
        </h3>
        <p className="text-sm text-[#858585] mb-4">
          Start a new collaborative document that syncs in real-time.
        </p>
        <button
          onClick={() => sync.create({ type: 'doc', content: [] })}
          className="px-4 py-2 bg-[#008080] hover:bg-[#20b2aa] text-white rounded-md transition-colors font-dm-sans text-sm"
        >
          Create Document
        </button>
      </div>
    </div>
  );
}

export default TiptapEditor;
