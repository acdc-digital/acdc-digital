"use client";

import { memo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Import KaTeX CSS
import "katex/dist/katex.min.css";

interface ResponseProps {
  children: string | React.ReactNode;
  className?: string;
  parseIncompleteMarkdown?: boolean;
}

// Auto-complete incomplete formatting tokens during streaming
function parseIncompleteMarkdown(content: string): string {
  if (typeof content !== "string") return String(content);

  let parsed = content;

  // Count formatting tokens to determine if they need completion
  const boldCount = (parsed.match(/\*\*/g) || []).length;
  const italicCount = (parsed.match(/(?<!\*)\*(?!\*)/g) || []).length;
  const strikeCount = (parsed.match(/~~/g) || []).length;
  const codeCount = (parsed.match(/(?<!`)`(?!`)/g) || []).length;

  // Auto-complete odd counts (incomplete formatting)
  if (boldCount % 2 === 1) {
    // Check if we're inside a code block to avoid interference
    const codeBlockMatches = parsed.match(/```/g);
    const inCodeBlock = codeBlockMatches && codeBlockMatches.length % 2 === 1;
    if (!inCodeBlock) {
      parsed += "**";
    }
  }

  if (italicCount % 2 === 1) {
    const codeBlockMatches = parsed.match(/```/g);
    const inCodeBlock = codeBlockMatches && codeBlockMatches.length % 2 === 1;
    if (!inCodeBlock) {
      parsed += "*";
    }
  }

  if (strikeCount % 2 === 1) {
    parsed += "~~";
  }

  if (codeCount % 2 === 1) {
    const codeBlockMatches = parsed.match(/```/g);
    const inCodeBlock = codeBlockMatches && codeBlockMatches.length % 2 === 1;
    if (!inCodeBlock) {
      parsed += "`";
    }
  }

  // Hide incomplete links and images
  parsed = parsed.replace(/!\[([^\]]*?)$/g, ""); // Incomplete images
  parsed = parsed.replace(/(?<!!)\[([^\]]*?)$/g, ""); // Incomplete links (not images)

  return parsed;
}

// Code block component with copy functionality
function CodeBlock({ language, children }: { language?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-300" />
        )}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-md !bg-gray-900"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export const Response = memo(function Response({
  children,
  className,
  parseIncompleteMarkdown: shouldParse = true,
  ...props
}: ResponseProps) {
  // Convert children to string and apply parsing if enabled
  const content = typeof children === "string" ? children : String(children);
  const parsedContent = shouldParse ? parseIncompleteMarkdown(content) : content;

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-pre:p-0 prose-code:bg-gray-100 dark:prose-code:bg-gray-800",
        "prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20",
        "prose-blockquote:pl-4 prose-blockquote:py-2",
        "prose-table:text-sm",
        "prose-th:border-gray-300 dark:prose-th:border-gray-600",
        "prose-td:border-gray-200 dark:prose-td:border-gray-700",
        className
      )}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: (props) => {
            const { className, children } = props;
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : undefined;
            const isInline = !className;

            if (!isInline && language) {
              return (
                <CodeBlock language={language}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              );
            }

            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <div className="not-prose">
              {children}
            </div>
          ),
        }}
      >
        {parsedContent}
      </ReactMarkdown>
    </div>
  );
});