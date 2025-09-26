"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

export function ThemeAwareLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return dark mode logo as default while loading
    return (
      <Image 
        src="/acdcHeaderLogo-D.svg" 
        alt="ACDC Digital Logo" 
        width={24} 
        height={24}
        className="w-5 h-5"
      />
    )
  }

  const logoSrc = resolvedTheme === "dark" ? "/acdcHeaderLogo-D.svg" : "/acdcHeaderLogo-L.svg"
  
  return (
    <Image 
      src={logoSrc}
      alt="ACDC Digital Logo" 
      width={24} 
      height={24}
      className="w-5 h-5"
    />
  )
}