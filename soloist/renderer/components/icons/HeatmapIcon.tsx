// Custom Heatmap/Calendar Icon
// Follows Soloist design language with asymmetric corners

import { cn } from "@/lib/utils";

interface HeatmapIconProps {
  className?: string;
  isActive?: boolean;
}

export function HeatmapIcon({ className, isActive }: HeatmapIconProps) {
  return (
    <div
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center",
        className
      )}
    >
      <div className="grid grid-cols-2 gap-[2px]">
        {/* top row */}
        <div
          className={cn(
            "h-[8px] w-[8px] rounded-[2px] border",
            isActive ? "border-white/90" : "border-white/60"
          )}
        />
        <div
          className={cn(
            "h-[8px] w-[8px] rounded-[2px] border",
            isActive ? "border-white/90" : "border-white/60"
          )}
        />

        {/* bottom row */}
        <div
          className={cn(
            "h-[8px] w-[8px] rounded-[2px] border",
            isActive ? "border-white/90" : "border-white/60"
          )}
        />
        {/* bottom right – filled */}
        <div
          className={cn(
            "h-[8px] w-[8px] rounded-[2px]",
            isActive ? "bg-white" : "bg-white/70"
          )}
        />
      </div>
    </div>
  );
}
