"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface PreviewFrameProps {
  code: string;
  framework: "react";
}

export function PreviewFrame({ code, framework }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      // For React, create a simple React setup with CDN
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; script-src 'unsafe-inline' 'unsafe-eval' https:; style-src 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
      padding: 1rem;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
  </script>
</body>
</html>`;

      // Create data URL
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      
      if (iframeRef.current) {
        iframeRef.current.src = dataUrl;
      }

      // Set loading to false after a short delay
      setTimeout(() => setIsLoading(false), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render preview");
      setIsLoading(false);
    }
  }, [code, framework]);

  return (
    <div className="relative w-full h-full bg-white rounded border border-[#3e3e42]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-[#858585]">Loading preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-[#cccccc] mb-1">Preview Error</p>
            <p className="text-xs text-[#858585]">{error}</p>
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
