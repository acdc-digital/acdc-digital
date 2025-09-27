'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Edit3, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  content: string;
  onSave?: (content: string) => void;
  editable?: boolean;
}

export default function MarkdownEditor({ 
  content: initialContent, 
  onSave,
  editable = true 
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
  }, [initialContent]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== initialContent);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setHasChanges(false);
    }
  };

  // Enhanced markdown to HTML conversion
  const renderMarkdown = (markdown: string) => {
    const sections = markdown.split('\n\n');
    
    return sections.map((section, i) => {
      const trimmed = section.trim();
      
      // Skip empty sections
      if (!trimmed) return null;
      
      // Headers
      if (trimmed.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold mb-6 text-white border-b border-white/20 pb-2">{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-semibold mb-4 text-white mt-8">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-semibold mb-3 text-white mt-6">{trimmed.slice(4)}</h3>;
      }
      
      // Horizontal rule
      if (trimmed === '---') {
        return <hr key={i} className="my-8 border-white/20" />;
      }
      
      // Tables
      if (trimmed.includes('|') && trimmed.includes('\n')) {
        const rows = trimmed.split('\n').filter(row => row.includes('|'));
        if (rows.length >= 2) {
          const headers = rows[0].split('|').map(h => h.trim()).filter(h => h);
          const dataRows = rows.slice(2); // Skip header separator
          
          return (
            <div key={i} className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/5">
                    {headers.map((header, j) => (
                      <th key={j} className="border border-white/10 px-4 py-2 text-left font-semibold text-white">
                        {header.replace(/\*\*/g, '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-white/5">
                      {row.split('|').map((cell, cellIndex) => {
                        const cleanCell = cell.trim();
                        if (!cleanCell) return null;
                        
                        return (
                          <td key={cellIndex} className="border border-white/10 px-4 py-2 text-gray-300">
                            {cleanCell.includes('**') ? (
                              <strong className="text-white">{cleanCell.replace(/\*\*/g, '')}</strong>
                            ) : cleanCell.includes('✅') ? (
                              <span className="text-green-400">{cleanCell}</span>
                            ) : cleanCell.includes('⚠️') ? (
                              <span className="text-yellow-400">{cleanCell}</span>
                            ) : cleanCell.includes('❌') ? (
                              <span className="text-red-400">{cleanCell}</span>
                            ) : (
                              cleanCell
                            )}
                          </td>
                        );
                      }).filter(Boolean)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
      
      // Lists
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
        return (
          <ul key={i} className="list-disc list-inside mb-4 space-y-2 ml-4">
            {items.map((item, j) => (
              <li key={j} className="text-gray-300">
                {item.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong className="text-white">$1</strong>')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Code blocks
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        const code = trimmed.slice(3, -3).trim();
        return (
          <pre key={i} className="bg-black/50 border border-white/10 p-4 rounded-lg mb-4 overflow-x-auto">
            <code className="text-sm text-green-400 font-mono">{code}</code>
          </pre>
        );
      }
      
      // Process inline formatting for regular paragraphs
      let processedText = trimmed;
      
      // Bold text
      processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
      
      // Inline code
      processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-black/50 px-2 py-1 rounded text-gray-400 text-sm font-mono">$1</code>');
      
      // Emojis and special formatting
      if (processedText.includes('⭐') || processedText.includes('🔥') || processedText.includes('⚡') || processedText.includes('💰')) {
        return (
          <p key={i} className="text-gray-300 mb-4 leading-relaxed text-lg" dangerouslySetInnerHTML={{__html: processedText}} />
        );
      }
      
      // Default paragraph
      return (
        <p key={i} className="text-gray-300 mb-4 leading-relaxed" dangerouslySetInnerHTML={{__html: processedText}} />
      );
    }).filter(Boolean);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {editable && (
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                "flex items-center gap-2",
                isPreview ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              )}
            >
              {isPreview ? (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          )}
        </div>
        {editable && hasChanges && (
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {!isPreview && editable ? (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
            placeholder="Enter markdown content..."
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(content)}
          </div>
        )}
      </div>
    </div>
  );
}