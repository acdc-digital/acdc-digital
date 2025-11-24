"use client";

import { Copyright, AlertCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="h-[22px] bg-secondary text-foreground text-xs flex items-center px-2 justify-between select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Copyright className="w-3 h-3" />
          <span>ACDC.digital</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>0</span>
        </div>
        <span>Soloist Marketing v0.1.0</span>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-foreground">▲ Next.js 15</span>
        <span className="text-muted-foreground">Marketing Management Platform</span>
      </div>
    </footer>
  );
}
