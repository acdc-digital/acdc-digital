"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark")
        break
      case "dark":
        setTheme("system")
        break
      case "system":
        setTheme("light")
        break
      default:
        setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return "Light mode - Switch to dark"
      case "dark":
        return "Dark mode - Switch to system"
      case "system":
        return `System mode (${resolvedTheme}) - Switch to light`
      default:
        return "Switch theme"
    }
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <div className="h-4 w-4 text-foreground" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-8 w-8 text-foreground hover:text-foreground transition-colors"
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">{getTooltip()}</span>
    </Button>
  )
}