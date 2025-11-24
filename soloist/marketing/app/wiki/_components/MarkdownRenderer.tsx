'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  useEffect(() => {
    // Initialize Mermaid if diagrams are present
    if (content.includes('```mermaid')) {
      import('mermaid').then((mermaid) => {
        mermaid.default.initialize({ 
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#1e1e1e',
            primaryColor: '#007acc',
            primaryTextColor: '#cccccc',
            primaryBorderColor: '#2d2d2d',
            lineColor: '#858585',
            secondaryColor: '#252526',
            tertiaryColor: '#0d0d0d',
          }
        });
        mermaid.default.run();
      });
    }
  }, [content]);

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <article className="prose prose-invert prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold text-white mb-6 pb-3 border-b border-[#2d2d2d]">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-semibold text-white mt-12 mb-4">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold text-gray-200 mt-8 mb-3">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xl font-semibold text-gray-300 mt-6 mb-2">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <div className="text-gray-300 leading-7 mb-4">
                {children}
              </div>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-300 ml-4">
                {children}
              </li>
            ),
            code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (inline) {
                return (
                  <code className="bg-[#252526] text-[#ce9178] px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }

              if (language === 'mermaid') {
                return (
                  <div className="mermaid my-6 bg-[#0d0d0d] p-4 rounded-lg border border-[#2d2d2d]">
                    {children}
                  </div>
                );
              }

              return (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language || 'typescript'}
                  PreTag="div"
                  className="rounded-lg my-6 border border-[#2d2d2d]"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#007acc] bg-[#252526] pl-4 py-2 my-4 italic text-gray-400">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-[#2d2d2d] rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#252526]">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left text-sm font-semibold text-white border-b border-[#2d2d2d]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm text-gray-300 border-b border-[#2d2d2d]">
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                className="text-[#007acc] hover:text-[#4daafc] underline transition-colors"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="border-[#2d2d2d] my-8" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
