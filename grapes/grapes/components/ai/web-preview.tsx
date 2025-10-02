"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

// Context for managing preview state
interface WebPreviewContextType {
  url: string;
  setUrl: (url: string) => void;
  navigateToUrl: () => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  history: string[];
  historyIndex: number;
}

const WebPreviewContext = React.createContext<WebPreviewContextType | null>(
  null
);

function useWebPreview() {
  const context = React.useContext(WebPreviewContext);
  if (!context) {
    throw new Error("useWebPreview must be used within WebPreview");
  }
  return context;
}

// Main container component
interface WebPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultUrl?: string;
  onUrlChange?: (url: string) => void;
  locked?: boolean; // New prop to prevent navigation
}

export function WebPreview({
  defaultUrl = "",
  onUrlChange,
  locked = false,
  className,
  children,
  ...props
}: WebPreviewProps) {
  const [url, setUrlState] = React.useState(defaultUrl);
  const [currentUrl, setCurrentUrl] = React.useState(defaultUrl);
  const [history, setHistory] = React.useState<string[]>(
    defaultUrl ? [defaultUrl] : []
  );
  const [historyIndex, setHistoryIndex] = React.useState(
    defaultUrl ? 0 : -1
  );

  const setUrl = React.useCallback(
    (newUrl: string) => {
      if (locked) return; // Prevent URL changes when locked
      setUrlState(newUrl);
      onUrlChange?.(newUrl);
    },
    [locked, onUrlChange]
  );

  const navigateToUrl = React.useCallback(() => {
    if (locked) return; // Prevent navigation when locked
    if (url && url !== currentUrl) {
      setCurrentUrl(url);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(url);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      onUrlChange?.(url);
    }
  }, [locked, url, currentUrl, history, historyIndex, onUrlChange]);

  const goBack = React.useCallback(() => {
    if (locked) return; // Prevent navigation when locked
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setUrlState(prevUrl);
      setCurrentUrl(prevUrl);
      onUrlChange?.(prevUrl);
    }
  }, [locked, historyIndex, history, onUrlChange]);

  const goForward = React.useCallback(() => {
    if (locked) return; // Prevent navigation when locked
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setUrlState(nextUrl);
      setCurrentUrl(nextUrl);
      onUrlChange?.(nextUrl);
    }
  }, [locked, historyIndex, history, onUrlChange]);

  const refresh = React.useCallback(() => {
    setCurrentUrl((prev) => prev + "?_refresh=" + Date.now());
  }, []);

  const value = React.useMemo(
    () => ({
      url,
      setUrl,
      navigateToUrl,
      goBack,
      goForward,
      refresh,
      history,
      historyIndex,
    }),
    [url, setUrl, navigateToUrl, goBack, goForward, refresh, history, historyIndex]
  );

  return (
    <WebPreviewContext.Provider value={value}>
      <div
        className={cn("flex flex-col h-full rounded-lg border", className)}
        {...props}
      >
        {children}
      </div>
    </WebPreviewContext.Provider>
  );
}

// Navigation bar container
interface WebPreviewNavigationProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function WebPreviewNavigation({
  className,
  children,
  ...props
}: WebPreviewNavigationProps) {
  const { goBack, goForward, refresh, historyIndex, history } = useWebPreview();

  return (
    <div
      className={cn("flex items-center gap-2 p-3 border-b bg-muted/30", className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={goBack}
        disabled={historyIndex <= 0}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goForward}
        disabled={historyIndex >= history.length - 1}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={refresh}
        className="h-8 w-8"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      {children}
    </div>
  );
}

// URL input field
interface WebPreviewUrlProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function WebPreviewUrl({
  value: externalValue,
  onChange: externalOnChange,
  onKeyDown,
  className,
  ...props
}: WebPreviewUrlProps) {
  const { url, setUrl, navigateToUrl } = useWebPreview();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (externalOnChange) {
      externalOnChange(e);
    } else {
      setUrl(e.target.value);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      navigateToUrl();
    }
    onKeyDown?.(e);
  };

  return (
    <Input
      type="text"
      value={externalValue ?? url}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Enter URL..."
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

// Iframe preview body
interface WebPreviewBodyProps
  extends Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, "loading"> {
  src?: string;
  loading?: React.ReactNode;
}

export function WebPreviewBody({
  src: externalSrc,
  loading,
  className,
  ...props
}: WebPreviewBodyProps) {
  const { url } = useWebPreview();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const effectiveSrc = externalSrc ?? url;

  React.useEffect(() => {
    if (effectiveSrc) {
      setIsLoading(true);
      setHasError(false);
      
      // Set a timeout to detect if iframe never loads
      // Google Maps embeds should NOT timeout - they take time but work
      const isGoogleMapsEmbed = effectiveSrc.includes('google.com/maps');
      
      if (!isGoogleMapsEmbed) {
        const timeout = setTimeout(() => {
          setHasError(true);
          setIsLoading(false);
        }, 10000); // 10s timeout for non-maps URLs

        return () => clearTimeout(timeout);
      } else {
        // For Google Maps, just turn off loading after a while
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, 5000); // Give maps 5 seconds to load
        
        return () => clearTimeout(timeout);
      }
    }
  }, [effectiveSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    // Only set error if it's not a Google Maps embed
    const isGoogleMapsEmbed = effectiveSrc?.includes('google.com/maps/embed');
    if (!isGoogleMapsEmbed) {
      setIsLoading(false);
      setHasError(true);
    }
  };

  return (
    <div className="relative flex-1 bg-background overflow-hidden">
      {isLoading && effectiveSrc && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          {loading || (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading preview...</span>
            </div>
          )}
        </div>
      )}
      {hasError && effectiveSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-background p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="text-4xl">🚫</div>
            <h3 className="text-lg font-semibold">Cannot Load Preview</h3>
            <p className="text-sm text-muted-foreground">
              This site blocks iframe embedding with X-Frame-Options or Content-Security-Policy headers.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>Blocked sites include:</strong> Google, Facebook, GitHub, Twitter, Instagram
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Try instead:</strong> example.com, info.cern.ch, wikipedia.org, or your own sites
              </p>
            </div>
            <a
              href={effectiveSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Open in new tab →
            </a>
          </div>
        </div>
      )}
      {effectiveSrc ? (
        <iframe
          ref={iframeRef}
          src={effectiveSrc}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className={cn("w-full h-full border-0", className)}
          {...props}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Enter a URL to preview
            </p>
            <p className="text-xs text-muted-foreground">
              Try: example.com, info.cern.ch, or wikipedia.org
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
