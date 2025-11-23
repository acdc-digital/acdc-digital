import { ReactNode } from "react";

import { cn } from "@/lib/utils";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[28rem] grid-cols-5 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  index,
  hideInfo,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ElementType;
  description: string;
  index?: number;
  hideInfo?: boolean;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-5 flex flex-col justify-between overflow-hidden rounded-b-xl",
      // light styles
      "bg-white border border-zinc-900",
      // dark styles
      "transform-gpu dark:bg-black dark:border-zinc-900",
      className,
    )}
  >
    {/* Step Number Badge */}
    {/* {index !== undefined && (
      <div className="absolute top-1 left-3 z-10 text-6xl font-bold text-neutral-300/80 dark:text-neutral-700">
        {index + 1}
      </div>
    )} */}
    <div className="absolute inset-0">{background}</div>
    {!hideInfo && (
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-2">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
      </div>
    )}


  </div>
);

export { BentoCard, BentoGrid };
