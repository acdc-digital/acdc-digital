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
      <nav className="bg-white dark:bg-zinc-900 border-b-2 border-zinc-300 dark:border-zinc-700 pl-5 pr-12 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/solologo.svg"
              alt="Soloist Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="flex flex-row items-center text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Soloist. <span className="ml-2 text-sm font-normal text-zinc-500">Demo</span>
            </div>
          </div>

          {/* Right side - Simple user avatar */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-blue-500 text-white">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>
    </div>
  );
}
