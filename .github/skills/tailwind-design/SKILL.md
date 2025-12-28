---
name: tailwind-design
description: Create distinctive, production-grade frontend interfaces using Tailwind CSS and shadcn/ui. Use when building React components, pages, or applications that need polished visual design. Generates creative, memorable code that follows ACDC Digital brand guidelines and avoids generic AI aesthetics.
---

# Tailwind CSS Design System

This skill guides creation of distinctive, production-grade frontend interfaces using Tailwind CSS. Implement working code with exceptional attention to aesthetic details and creative choices that align with ACDC Digital brand identity.

## Design Thinking (Before Coding)

Before writing any code, understand context and commit to a BOLD aesthetic direction:

1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: Choose a distinctive direction - brutally minimal, refined luxury, editorial/magazine, retro-futuristic, organic/natural, playful, brutalist/raw, soft/pastel, industrial/utilitarian
3. **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?
4. **Brand Alignment**: Reference ACDC Digital brand colors, typography, and patterns

**CRITICAL**: Choose a clear conceptual direction and execute with precision. Bold maximalism and refined minimalism both work—the key is intentionality, not intensity.

## ACDC Digital Brand System

### Core Colors (Use These First)

```tsx
// Primary brand colors - extend in tailwind.config.ts
const colors = {
  acdc: {
    primary: '#007acc',      // Technical Blue - Primary actions
    secondary: '#1e1e1e',    // Professional Black - Backgrounds
    accent: '#8b5cf6',       // AI Purple - Intelligence features
  },
  status: {
    success: '#10b981',      // Green - Success, live indicators
    warning: '#f59e0b',      // Amber - Warnings
    error: '#ef4444',        // Red - Errors
    info: '#3b82f6',         // Electric Blue - Information
  }
}
```

### Typography Hierarchy

**Display/Headlines**: Use distinctive fonts like Playfair Display, Crimson Text for editorial contexts
**UI/Body**: Inter, SF Pro, or system fonts for interfaces
**Code/Console**: JetBrains Mono, Cascadia Code for technical content

```tsx
// Font pairing example
<h1 className="font-serif text-4xl font-black tracking-tight">
  Bold Editorial Headline
</h1>
<p className="font-sans text-base text-neutral-600">
  Clean body text for readability
</p>
```

## Tailwind Best Practices

### 1. Component Composition

Build from atomic utilities to composed components:

```tsx
// ❌ Avoid inline utility soup for repeated patterns
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">

// ✅ Extract to reusable component with semantic classes
const Button = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-acdc-primary hover:bg-acdc-primary/90 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-transparent border-2 border-acdc-primary text-acdc-primary hover:bg-acdc-primary hover:text-white',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-acdc-primary',
  };
  
  return (
    <button className={cn(
      'px-6 py-3 font-semibold rounded-xl transition-all duration-250',
      'hover:-translate-y-0.5 active:translate-y-0',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acdc-primary/50',
      variants[variant]
    )}>
      {children}
    </button>
  );
};
```

### 2. Use CSS Variables for Theming

```tsx
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
    },
  },
}
```

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 9%;
    --primary: 203 100% 40%; /* #007acc */
  }
  
  .dark {
    --background: 0 0% 12%;
    --foreground: 0 0% 95%;
  }
}
```

### 3. Animation & Motion

Use Tailwind's animation utilities with custom extensions:

```tsx
// Staggered reveal on page load
<div className="space-y-4">
  {items.map((item, i) => (
    <div 
      key={item.id}
      className="animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      {item.content}
    </div>
  ))}
</div>

// Hover micro-interactions
<div className="group relative overflow-hidden rounded-2xl">
  <div className="absolute inset-0 bg-gradient-to-r from-acdc-primary/20 to-acdc-accent/20 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  <img className="transition-transform duration-500 group-hover:scale-105" />
</div>
```

### 4. Glass Morphism (SMNB-style)

```tsx
<div className="backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 
                border border-white/20 dark:border-neutral-700/50
                rounded-2xl shadow-2xl">
  {/* Glass card content */}
</div>
```

### 5. Responsive Design

Mobile-first with intentional breakpoints:

```tsx
// Container with responsive padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">

// Grid that adapts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hide/show at breakpoints
<nav className="hidden md:flex">
<button className="md:hidden">
```

### 6. Dark Mode

Always implement dark mode with proper contrast:

```tsx
<div className="bg-white dark:bg-neutral-900 
                text-neutral-900 dark:text-neutral-100
                border border-neutral-200 dark:border-neutral-800">
```

## shadcn/ui Integration

Use shadcn/ui as the component foundation, then customize:

```tsx
// Extend shadcn Button with brand styles
import { Button } from "@/components/ui/button"

// Use variant prop + additional classes
<Button 
  variant="default" 
  className="bg-acdc-primary hover:bg-acdc-primary/90 
             shadow-lg hover:shadow-xl hover:-translate-y-0.5
             transition-all duration-200"
>
  Get Started
</Button>
```

## Anti-Patterns to AVOID

❌ **Generic AI aesthetics**:
- Purple gradients on white (overused)
- Inter/Roboto for everything
- Cookie-cutter card layouts
- Predictable spacing patterns
- Default Tailwind colors without customization

❌ **Utility soup without purpose**:
- Random margins/padding
- Inconsistent spacing
- Colors that don't match the system
- Animations without meaning

❌ **Ignoring accessibility**:
- Low contrast text
- Missing focus states
- No reduced-motion support

## Design Patterns That Work

✅ **Distinctive typography choices**: Mix serif display with sans-serif body
✅ **Asymmetric layouts**: Break the grid intentionally
✅ **Generous negative space**: Let elements breathe
✅ **Cohesive color stories**: Dominant color with sharp accents
✅ **Purposeful motion**: One orchestrated reveal > scattered micro-interactions
✅ **Atmospheric backgrounds**: Gradients, noise, textures over flat colors

## References

See [brand-guidelines.md](references/brand-guidelines.md) for complete ACDC Digital design tokens.
See [component-patterns.md](references/component-patterns.md) for reusable Tailwind patterns.
