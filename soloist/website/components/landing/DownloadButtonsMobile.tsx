"use client";

import { useState, useEffect } from "react";
import { Download, Apple, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DownloadButtonsMobileProps {
  downloadsEnabled: boolean;
  showSubscriptionMessage: boolean;
}

export function DownloadButtonsMobile({ 
  downloadsEnabled,
  showSubscriptionMessage 
}: DownloadButtonsMobileProps) {
  const [detectedOS, setDetectedOS] = useState<'Windows' | 'macOS' | 'Other'>('Other');
  
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setDetectedOS('Windows');
    } else if (userAgent.includes('mac')) {
      setDetectedOS('macOS');
    } else {
      setDetectedOS('Other');
    }
  }, []);

  const handleDownload = (os: 'macOS' | 'Windows') => {
    if (!downloadsEnabled) return;
    
    const downloadUrls = {
      macOS: 'https://github.com/acdc-digital/solopro/releases/download/v1.6.6/Soloist.Pro-1.6.5-x64.dmg',
      Windows: 'https://github.com/acdc-digital/solopro/releases/download/v1.6.6/Soloist.Pro-Setup-1.6.5.exe'
    };
    
    const link = document.createElement('a');
    link.href = downloadUrls[os];
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full touch-target"
          disabled={!downloadsEnabled}
        >
          <Download className="w-5 h-5 mr-2" />
          Download Soloist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Soloist</DialogTitle>
          <DialogDescription>
            {!downloadsEnabled && showSubscriptionMessage 
              ? "Active subscription required to download"
              : "Choose your platform"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            variant={detectedOS === 'macOS' ? 'default' : 'outline'}
            size="lg" 
            className="touch-target justify-start"
            onClick={() => handleDownload('macOS')}
            disabled={!downloadsEnabled}
          >
            <Apple className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">Download for macOS</span>
            <span className="text-xs text-muted-foreground">
              macOS 13+
            </span>
          </Button>
          <Button 
            variant={detectedOS === 'Windows' ? 'default' : 'outline'}
            size="lg" 
            className="touch-target justify-start"
            onClick={() => handleDownload('Windows')}
            disabled={!downloadsEnabled}
          >
            <Monitor className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">Download for Windows</span>
            <span className="text-xs text-muted-foreground">
              Windows 10+
            </span>
          </Button>
        </div>
        {!downloadsEnabled && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {showSubscriptionMessage 
              ? "Subscribe to unlock downloads"
              : "Sign in to download"
            }
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
