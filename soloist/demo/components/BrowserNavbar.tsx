// BROWSER NAVBAR (DEMO VERSION)
// Simplified navbar for demo - no authentication, no modals

"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDemoUser } from "@/stores/demoUserStore";

export function BrowserNavbar() {
  const user = useDemoUser();

  // Get user initials for avatar fallback
  const userInitials = React.useMemo(() => {
    if (!user?.name) return "DU";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  return (
    <div>
      <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700 pl-5 pr-12 py-2">
        <div className="flex items-center justify-between w-full">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/solologo.svg"
              alt="Soloist Logo"
              width={32}
              height={32}
              className="border border-zinc-600 rounded-md w-8 h-8"
            />
            <div className="text-xl font-parkinsans text-zinc-900 dark:text-zinc-100">
              Soloist.
            </div>
          </div>

          {/* Right side - Demo notice + User avatar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-md border border-zinc-200/50 dark:border-zinc-700/30">
              <div className="w-1 h-1 rounded-full bg-amber-500/60 animate-pulse" />
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">Preview Mode</span>
            </div>
            
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-blue-500 text-white">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>
    </div>
  );
}
