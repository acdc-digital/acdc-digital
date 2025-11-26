"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface PreviewFrameProps {
  code: string;
  framework: "react";
}

export function PreviewFrame({ code }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      // Transform imports to use CDN globals
      let transformedCode = code;
      
      // Remove import statements and map to globals
      transformedCode = transformedCode
        .replace(/import\s+{([^}]+)}\s+from\s+['"]react['"]/g, 'const {$1} = React')
        .replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g, (match, icons) => {
          const iconMap: Record<string, string> = {
            'Check': '✓',
            'X': '✗',
            'ChevronRight': '→',
            'ChevronDown': '↓',
            'Star': '★',
            'Heart': '♥',
            'Circle': '•',
            'ArrowRight': '→',
            'Menu': '☰',
            'Search': '🔍',
            'Mail': '📧',
            'Home': '🏠',
            'User': '👤',
            'Phone': '📱'
          };
          const iconNames = icons.split(',').map((i: string) => i.trim());
          return iconNames.map((icon: string) => 
            `const ${icon} = ({className = ''}) => React.createElement('span', {className: \`inline-block \${className}\`, style: {lineHeight: 1}}, '${iconMap[icon] || '•'}');`
          ).join('\n');
        })
        .replace(/import\s+.*?from\s+['"].*?['"]/g, '// Import removed for preview')
        .replace(/export\s+default\s+/g, ''); // Remove export default

      // For React, create a simple React setup with CDN
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
      padding: 1rem;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
    try {
      ${transformedCode}
      
      // Find the component (look for function Component or function [Name])
      const componentMatch = ${JSON.stringify(transformedCode)}.match(/function\\s+(\\w+)/);
      const componentName = componentMatch ? componentMatch[1] : 'Component';
      
      // Render the component
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(eval(componentName)));
    } catch (err) {
      console.error('Preview error:', err);
      document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px; font-family: monospace; white-space: pre-wrap;">Error: ' + err.message + '\\n\\n' + err.stack + '</div>';
    }
  </script>
</body>
</html>`;

      // Handle iframe load event
      const handleLoad = () => {
        setIsLoading(false);
      };

      const handleError = () => {
        setError("Failed to load preview");
        setIsLoading(false);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Create blob URL instead of data URL (more reliable)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      iframe.src = blobUrl;

      // Cleanup
      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        URL.revokeObjectURL(blobUrl);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render preview");
      setIsLoading(false);
    }
  }, [code]);

  return (
    <div className="relative w-full h-full bg-white rounded border border-border">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-foreground mb-1">Preview Error</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Component Preview"
      />
    </div>
  );
}
