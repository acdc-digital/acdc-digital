// HEADER COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/DraggableHeader.tsx

import React, { useState } from "react";
import { Crown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useBrowserEnvironment } from "@/utils/environment";
import { PricingModal } from "@/dashboard/user/_components/PricingModal";
import { Button } from "@/components/ui/button";

const DraggableHeader: React.FC = () => {
  const isBrowser = useBrowserEnvironment();
  const { isAuthenticated, userId } = useConvexUser();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  // Check subscription status for browser users
  const hasActiveSubscription = useQuery(
    api.userSubscriptions.hasActiveSubscription,
    isBrowser && isAuthenticated && userId ? {} : "skip"
  );

  const handleSubscribeClick = () => {
    setIsPricingModalOpen(true);
  };

  return (
    <>
      <div
        className="flex items-center justify-between px-3 h-[37px] bg-zinc-50 dark:bg-zinc-800 select-none border-b border-zinc-200 dark:border-zinc-700"
        style={{
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          paddingLeft: '80px' // Space for macOS traffic lights
        } as React.CSSProperties & { WebkitAppRegion: string }}
      >
        {/* Title text - no extra spacing needed since padding handles it */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Soloist. | Take control of tomorrow, today.
          </span>
        </div>
      </div>
    </>
  );
};

export default DraggableHeader;