'use client';

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Eye, Edit3, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';

// Lazy load ReactMarkdown for better performance
const ReactMarkdown = lazy(() => import('react-markdown'));

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
  const [useReactMarkdown, setUseReactMarkdown] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
    // Use ReactMarkdown for large documents (>50KB)
    setUseReactMarkdown(initialContent.length > 50000);
  }, [initialContent]);

  // Dynamically load Mermaid
  useEffect(() => {
    let isMounted = true;
    
    import('mermaid').then((mod) => {
      if (isMounted) {
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#1a1a1a',
            primaryColor: '#4CAF50',
            primaryTextColor: '#fff',
            primaryBorderColor: '#2E7D32',
            lineColor: '#fff',
            secondaryColor: '#2196F3',
            tertiaryColor: '#FF9800',
            fontSize: '14px',
          },
        });
        setMermaidLoaded(true);
      }
    }).catch((error) => {
      console.error('Failed to load Mermaid:', error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Render Mermaid diagrams when content changes
  useEffect(() => {
    if (!mermaidLoaded || !isPreview || !mermaidRef.current || useReactMarkdown) return;

    const renderDiagrams = async () => {
      const mermaid = (await import('mermaid')).default;
      const mermaidElements = mermaidRef.current!.querySelectorAll('.mermaid-diagram');
      
      mermaidElements.forEach(async (element, index) => {
        const code = element.getAttribute('data-mermaid-code');
        if (code) {
          try {
            const id = `mermaid-${Date.now()}-${index}`;
            const { svg } = await mermaid.render(id, code);
            element.innerHTML = svg;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Mermaid rendering error:', error);
            element.innerHTML = `<pre class="text-red-400 p-4 bg-black/50 rounded">Error rendering diagram: ${errorMessage}</pre>`;
          }
        }
      });
    };

    renderDiagrams();
  }, [content, isPreview, mermaidLoaded, useReactMarkdown]);

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
    // Handle raw HTML/CSS sections
    if (markdown.includes('<div class="agent-card-container">') || markdown.includes('<style>')) {
      return (
        <div 
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: markdown }}
        />
      );
    }
    
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
        const firstLine = trimmed.split('\n')[0];
        const language = firstLine.slice(3).trim();
        const code = trimmed.slice(firstLine.length + 1, -3).trim();
        
        // Handle Mermaid diagrams
        if (language === 'mermaid') {
          return (
            <div 
              key={i} 
              className="mermaid-diagram my-8 flex justify-center bg-[#0a0a0a] border border-white/10 p-6 rounded-lg overflow-x-auto"
              data-mermaid-code={code}
            />
          );
        }
        
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
      <div className="flex-1 overflow-y-auto p-6" ref={mermaidRef}>
        {!isPreview && editable ? (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
            placeholder="Enter markdown content..."
          />
        ) : useReactMarkdown ? (
          <Suspense fallback={<div className="text-gray-400">Loading content...</div>}>
            <div className="prose prose-invert prose-lg max-w-none 
              prose-headings:text-white prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:border-b prose-h1:border-white/20 prose-h1:pb-2
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-6
              prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-semibold
              prose-code:bg-black/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-gray-400 prose-code:text-sm prose-code:font-mono
              prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:p-4 prose-pre:rounded-lg prose-pre:mb-4
              prose-ul:list-disc prose-ul:list-inside prose-ul:mb-4 prose-ul:space-y-2 prose-ul:ml-4 prose-ul:text-gray-300
              prose-ol:list-decimal prose-ol:list-inside prose-ol:mb-4 prose-ol:space-y-2 prose-ol:ml-4 prose-ol:text-gray-300
              prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-white/20 prose-table:rounded-lg prose-table:mb-6
              prose-thead:bg-white/5
              prose-th:border prose-th:border-white/10 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-white
              prose-td:border prose-td:border-white/10 prose-td:px-4 prose-td:py-2 prose-td:text-gray-300
              prose-tr:hover:bg-white/5
              prose-hr:my-8 prose-hr:border-white/20
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </Suspense>
        ) : (
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(content)}
          </div>
        )}
      </div>
    </div>
  );
}