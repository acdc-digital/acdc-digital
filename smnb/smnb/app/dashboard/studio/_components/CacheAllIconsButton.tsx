"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/app/components/ui/button";
import { Download, CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * Admin button to pre-cache all MNQ1 (Nasdaq-100) ticker icons
 * This will fetch and store all 100 ticker icons in the Convex cache
 */
export function CacheAllIconsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    successful: number;
    failed: number;
    duration: number;
  } | null>(null);
  
  const cacheAllIcons = useAction(api.ticker.iconCache.cacheAllMNQ1Icons);

  const handleCache = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const res = await cacheAllIcons();
      setResult(res);
      console.log("✅ Icon cache complete:", res);
    } catch (error) {
      console.error("❌ Failed to cache icons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleCache}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Caching Icons...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Cache All MNQ1 Icons
          </>
        )}
      </Button>

      {result && (
        <div className="text-xs space-y-1 p-3 rounded-md bg-[#252526] border border-[#3d3d3d]">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">Caching Complete</span>
          </div>
          <div className="text-[#cccccc] space-y-0.5 ml-5">
            <div>Total: {result.total}</div>
            <div className="text-green-400">Successful: {result.successful}</div>
            {result.failed > 0 && (
              <div className="text-orange-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Failed: {result.failed}
              </div>
            )}
            <div className="text-[#858585]">
              Duration: {(result.duration / 1000).toFixed(2)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
