"use client"

interface AnnouncementBannerProps {
  text?: string
  className?: string
}

export function AnnouncementBanner({ 
  text = "In the chaos of each day lies the ability to transform experience into growth",
  className = "" 
}: AnnouncementBannerProps) {
  return (
    <div className={`hidden md:block w-full bg-background py-1 px-24 ${className}`}>
      <div className="container mx-auto">
        <p className="text-center text-sm text-zinc-900/90">
          {text}
        </p>
      </div>
    </div>
  )
}
