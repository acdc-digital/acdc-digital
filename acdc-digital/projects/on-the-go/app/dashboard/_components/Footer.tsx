"use client";

import { AlertCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="h-[22px] bg-[#2d2d2d] border-t border-[#2d2d2d] flex items-center justify-between px-4 text-xs">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <span className="text-[#cccccc]">© ACDC.digital</span>
        <div className="flex items-center gap-1 text-[#858585]">
          <AlertCircle className="w-3 h-3" />
          <span>0</span>
        </div>
        <span className="text-[#858585]">On The Go v0.1.0</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <span className="text-[#858585]">▲ Next.js 15</span>
        <span className="text-[#858585]">SMS Notes Platform</span>
      </div>
    </footer>
  );
}
