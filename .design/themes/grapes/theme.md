# Grapes Theme Documentation

**Version:** 1.0  
**Created:** October 2025  
**Framework:** Next.js 15.2.3 + Tailwind CSS v4 + shadcn/ui  

---

## Philosophy

The Grapes theme is a **modern minimal design system** built on cutting-edge web technologies. We're using Tailwind CSS v4 (the latest generation) with the OKLCH color space for perceptually uniform colors, shadcn/ui component primitives for accessibility, and carefully chosen typography for a refined reading experience.

**Core principles:**
- **Minimal but not stark** - Clean design with subtle depth
- **Color science** - OKLCH ensures colors look consistent across displays
- **System fonts first** - Fast loading, familiar, beautiful
- **Dark mode native** - Both modes treated as first-class citizens
- **Composable components** - shadcn/ui pattern for full ownership

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.2.3 | React framework with App Router |
| `react` | 19.0.0 | UI library |
| `tailwindcss` | 4.x | CSS framework (latest generation) |
| `@radix-ui/react-slot` | 1.2.3 | Composition primitive |
| `class-variance-authority` | 0.7.1 | Type-safe component variants |
| `clsx` | 2.1.1 | Conditional className builder |
| `tailwind-merge` | 3.3.1 | Merge Tailwind classes intelligently |
| `lucide-react` | 0.541.0 | Icon system |

### Typography Fonts

| Font | Use Case | Loading |
|------|----------|---------|
| **Source Serif 4** | Headings (h1-h6) | Google Fonts |
| **JetBrains Mono** | Code, pre, kbd | Google Fonts |
| **System UI Stack** | Body text | Native |

---

## Color System

### Why OKLCH?

We're using **OKLCH color space** instead of traditional HSL/RGB because:

1. **Perceptually uniform** - Equal changes in values = equal perceptual changes
2. **Wider gamut** - Access to more vibrant colors
3. **Better interpolation** - Smooth gradients without muddy midpoints
4. **Future-proof** - Modern CSS spec, P3 display support

**Format:** `oklch(L C H)` where:
- **L** = Lightness (0-1)
- **C** = Chroma (saturation, 0-0.4)
- **H** = Hue (0-360 degrees)

### Light Mode Colors

| Token | OKLCH Value | Description | Visual |
|-------|-------------|-------------|---------|
| `background` | `oklch(1 0 0)` | Pure white base | ⚪ |
| `foreground` | `oklch(0.12 0 0)` | Near-black text | ⚫ |
| `primary` | `oklch(0.62 0.19 259.76)` | Purple-blue brand | 🟣 |
| `secondary` | `oklch(0.95 0.01 247.5)` | Subtle gray-blue | ◻️ |
| `muted` | `oklch(0.95 0.01 247.5)` | Background variation | ◻️ |
| `accent` | `oklch(0.95 0.01 247.5)` | Hover states | ◻️ |
| `destructive` | `oklch(0.55 0.22 24.2)` | Red for errors | 🔴 |
| `border` | `oklch(0.92 0.01 247.5)` | Subtle dividers | ➖ |

### Dark Mode Colors

| Token | OKLCH Value | Description | Visual |
|-------|-------------|-------------|---------|
| `background` | `oklch(0.12 0 0)` | Deep charcoal | ⚫ |
| `foreground` | `oklch(0.98 0 0)` | Near-white text | ⚪ |
| `primary` | `oklch(0.62 0.19 259.76)` | Same purple-blue | 🟣 |
| `secondary` | `oklch(0.16 0.01 261)` | Dark gray-blue | ⬛ |
| `muted` | `oklch(0.16 0.01 261)` | Subtle backgrounds | ⬛ |
| `accent` | `oklch(0.16 0.01 261)` | Hover states | ⬛ |
| `border` | `oklch(0.19 0.01 261)` | Visible dividers | ➖ |

### Chart Colors

Five coordinated colors for data visualization:

```css
--color-chart-1: oklch(0.62 0.19 259.76);  /* Primary purple-blue */
--color-chart-2: oklch(0.48 0.15 259.76);  /* Darker variant */
--color-chart-3: oklch(0.75 0.12 259.76);  /* Lighter variant */
--color-chart-4: oklch(0.85 0.07 259.76);  /* Very light */
--color-chart-5: oklch(0.42 0.18 259.76);  /* Very dark */
```

**Use these for:** graphs, data tables, analytics dashboards

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
# Core
npm install next@15.2.3 react@19 react-dom@19

# Tailwind CSS v4
npm install -D tailwindcss@4 @tailwindcss/postcss@4

# shadcn/ui dependencies
npm install @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# TypeScript
npm install -D typescript @types/node @types/react @types/react-dom
```

### Step 2: Tailwind Config

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
```

**Note:** Tailwind v4 uses `@theme` directive in CSS instead of `theme.extend` in config!

### Step 3: Global Styles

**File:** `app/globals.css`

```css
@import "tailwindcss";

/* Modern Minimal Theme - Tailwind CSS v4 */
@theme {
  /* OKLCH Color Space */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.12 0 0);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.12 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.12 0 0);
  --color-primary: oklch(0.62 0.19 259.76);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(0.95 0.01 247.5);
  --color-secondary-foreground: oklch(0.31 0.08 261);
  --color-muted: oklch(0.95 0.01 247.5);
  --color-muted-foreground: oklch(0.42 0.05 255);
  --color-accent: oklch(0.95 0.01 247.5);
  --color-accent-foreground: oklch(0.31 0.08 261);
  --color-destructive: oklch(0.55 0.22 24.2);
  --color-destructive-foreground: oklch(1 0 0);
  --color-border: oklch(0.92 0.01 247.5);
  --color-input: oklch(0.92 0.01 247.5);
  --color-ring: oklch(0.62 0.19 259.76);
  
  /* Chart Colors */
  --color-chart-1: oklch(0.62 0.19 259.76);
  --color-chart-2: oklch(0.48 0.15 259.76);
  --color-chart-3: oklch(0.75 0.12 259.76);
  --color-chart-4: oklch(0.85 0.07 259.76);
  --color-chart-5: oklch(0.42 0.18 259.76);
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.375rem;
  --radius-xl: 0.5rem;
  --radius: 0.375rem;
}

@layer base {
  .dark {
    /* Dark Mode Overrides */
    --color-background: oklch(0.12 0 0);
    --color-foreground: oklch(0.98 0 0);
    --color-card: oklch(0.12 0 0);
    --color-card-foreground: oklch(0.98 0 0);
    --color-popover: oklch(0.12 0 0);
    --color-popover-foreground: oklch(0.98 0 0);
    --color-secondary: oklch(0.16 0.01 261);
    --color-secondary-foreground: oklch(0.88 0.04 261);
    --color-muted: oklch(0.16 0.01 261);
    --color-muted-foreground: oklch(0.55 0.04 261);
    --color-accent: oklch(0.16 0.01 261);
    --color-accent-foreground: oklch(0.88 0.04 261);
    --color-border: oklch(0.19 0.01 261);
    --color-input: oklch(0.19 0.01 261);
  }

  * {
    border-color: var(--color-border);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 
                 "Segoe UI", Roboto, sans-serif;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: "Source Serif 4", Georgia, serif;
    font-optical-sizing: auto;
    font-weight: 600;
  }

  code, pre, kbd, samp {
    font-family: "JetBrains Mono", "SF Mono", Monaco, 
                 "Cascadia Code", "Roboto Mono", Consolas, 
                 "Courier New", monospace;
  }

  /* Custom Scrollbars */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--muted);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--muted-foreground);
  }
}
```

### Step 4: Utility Function

**File:** `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**What this does:** Merges Tailwind classes intelligently, resolving conflicts (e.g., `"px-2 px-4"` → `"px-4"`)

### Step 5: Base Components

**File:** `components/ui/button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**Usage:**
```tsx
<Button variant="default">Click me</Button>
<Button variant="outline" size="sm">Small outline</Button>
<Button variant="ghost">Ghost button</Button>
```

---

## Typography System

### Font Loading

**File:** `app/layout.tsx`

```tsx
import { Source_Serif_4, JetBrains_Mono } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Stack Details

**Headings (Source Serif 4):**
- Elegant serif for important content
- Variable font with optical sizing
- Weights: 400, 600 (used: 600)
- Fallback: Georgia, serif

**Body (System UI):**
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, sans-serif;
```
- Uses device's native UI font
- Zero latency, always available
- Familiar to users

**Code (JetBrains Mono):**
- Monospaced programming font
- Excellent ligatures support
- Highly legible at small sizes
- Fallback: SF Mono, Monaco, Consolas

---

## Dark Mode Implementation

### Activation

The theme uses **class-based dark mode**. Toggle by adding/removing `dark` class on `<html>`:

```typescript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Set explicitly
document.documentElement.classList.add('dark');    // Enable
document.documentElement.classList.remove('dark'); // Disable
```

### Persistence

**Recommended pattern:**

```typescript
// Save preference
localStorage.setItem('theme', isDark ? 'dark' : 'light');

// Restore on load
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

// Respect system preference
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### Color Behavior

- **Primary color stays the same** in both modes (brand consistency)
- **Backgrounds/foregrounds invert** (light ↔ dark)
- **Borders become more visible** in dark mode
- **Muted colors stay subtle** in both contexts

---

## Component Patterns

### Variant System (CVA)

All components use `class-variance-authority` for type-safe variants:

```typescript
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm", // base
  {
    variants: {
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      border: {
        default: "border",
        thick: "border-2",
        none: "border-0",
      }
    },
    defaultVariants: {
      padding: "md",
      border: "default",
    }
  }
);

// Usage
<Card className={cardVariants({ padding: "lg", border: "thick" })} />
```

### Composition Pattern

Use `asChild` prop for component composition:

```tsx
// Render button as link
<Button asChild>
  <Link href="/about">About</Link>
</Button>

// Renders: <a href="/about" class="[button classes]">About</a>
```

### Accessibility Defaults

All components include:
- ✅ Keyboard navigation
- ✅ Focus visible styles (`focus-visible:ring-2`)
- ✅ ARIA attributes via Radix UI
- ✅ Disabled state handling

---

## Color Token Reference

### Using Colors in Code

```tsx
// Tailwind classes
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="border-border">

// CSS variables (when needed)
<div style={{ backgroundColor: 'var(--color-background)' }}>

// Opacity modifiers
<div className="bg-primary/90">  {/* 90% opacity */}
<div className="text-muted-foreground/50">  {/* 50% opacity */}
```

### Complete Token Map

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | White | Dark gray | Page background |
| `foreground` | Near black | Near white | Primary text |
| `card` | White | Dark gray | Card backgrounds |
| `card-foreground` | Near black | Near white | Card text |
| `popover` | White | Dark gray | Dropdown/menu bg |
| `popover-foreground` | Near black | Near white | Dropdown text |
| `primary` | Purple-blue | Purple-blue | Brand actions |
| `primary-foreground` | White | White | Text on primary |
| `secondary` | Light gray | Dark gray | Secondary actions |
| `secondary-foreground` | Dark blue | Light blue | Text on secondary |
| `muted` | Light gray | Dark gray | Subtle backgrounds |
| `muted-foreground` | Medium gray | Medium gray | Subtle text |
| `accent` | Light gray | Dark gray | Hover states |
| `accent-foreground` | Dark blue | Light blue | Text on accent |
| `destructive` | Red | Red | Error/delete |
| `destructive-foreground` | White | White | Text on destructive |
| `border` | Light gray | Medium gray | All borders |
| `input` | Light gray | Medium gray | Input borders |
| `ring` | Purple-blue | Purple-blue | Focus rings |

---

## Border Radius System

```css
--radius-sm: 0.125rem;  /* 2px  - Tight corners */
--radius-md: 0.25rem;   /* 4px  - Standard */
--radius-lg: 0.375rem;  /* 6px  - Cards, buttons */
--radius-xl: 0.5rem;    /* 8px  - Large containers */
--radius: 0.375rem;     /* Default */
```

**Usage:**
```tsx
<div className="rounded">      {/* Uses --radius (6px) */}
<div className="rounded-sm">   {/* 2px */}
<div className="rounded-lg">   {/* 6px */}
<div className="rounded-xl">   {/* 8px */}
```

---

## Quick Start Checklist

Copy this theme to a new project:

- [ ] Install all dependencies from Step 1
- [ ] Copy `tailwind.config.ts` (minimal version)
- [ ] Copy `app/globals.css` (complete theme definition)
- [ ] Copy `lib/utils.ts` (cn helper)
- [ ] Copy `components/ui/button.tsx` (base component)
- [ ] Set up fonts in `app/layout.tsx`
- [ ] Add dark mode toggle component
- [ ] Test both light and dark modes
- [ ] Verify colors on different displays

---

## Customization Guide

### Change Primary Color

1. Pick a new hue (0-360 degrees):
   - Red: 24
   - Orange: 40
   - Yellow: 90
   - Green: 142
   - Blue: 259 (current)
   - Purple: 300

2. Update in `globals.css`:
```css
--color-primary: oklch(0.62 0.19 142);  /* Green example */
```

3. Adjust chroma (C) for saturation:
   - `0.10` = Muted
   - `0.19` = Current (vibrant)
   - `0.25` = Highly saturated

### Change Font System

Replace fonts in `layout.tsx`:
```tsx
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });
```

Update CSS:
```css
body {
  font-family: var(--font-inter), sans-serif;
}

code {
  font-family: var(--font-roboto-mono), monospace;
}
```

### Add New Color Token

1. Define in `@theme`:
```css
--color-info: oklch(0.62 0.19 220);  /* Blue info color */
--color-info-foreground: oklch(1 0 0);
```

2. Use in components:
```tsx
<div className="bg-info text-info-foreground">
```

---

## Best Practices

### Do's ✅

- **Use semantic tokens** (`bg-background` not `bg-white`)
- **Compose with cn()** for merging classes
- **Test both themes** before shipping
- **Use CVA variants** for component variations
- **Leverage opacity modifiers** (`/90`, `/50`)
- **Keep components in `/ui`** directory
- **Export both component and variants**

### Don'ts ❌

- **Don't hardcode colors** (`bg-[#ffffff]`)
- **Don't skip dark mode testing**
- **Don't override Radix UI internals**
- **Don't use arbitrary values** when tokens exist
- **Don't forget focus states**
- **Don't mix color systems** (stay in OKLCH)

---

## Performance Notes

### Bundle Size

- **Tailwind v4:** Smaller than v3 (~30% reduction)
- **OKLCH support:** Native CSS (0 KB JS)
- **CVA:** Tiny (~1 KB)
- **Radix UI:** Tree-shakeable primitives

### Font Loading

```tsx
// Use display: 'swap' to prevent FOIT
display: "swap"

// Preload critical fonts in <head>
<link rel="preload" href="/fonts/..." as="font" />
```

### Color Computation

OKLCH colors are computed by the browser's CSS engine (not JavaScript), so there's zero runtime cost for color management.

---

## Browser Support

### OKLCH Color Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 111+ | ✅ Full |
| Edge | 111+ | ✅ Full |
| Firefox | 113+ | ✅ Full |
| Safari | 15.4+ | ✅ Full |

**Fallback:** Modern browsers only. For older browsers, consider using `@supports` queries or build-time color conversion.

### Tailwind v4 Support

Requires browsers with:
- CSS Cascade Layers
- `:has()` selector
- Container queries (optional)

**Minimum:** Chrome 105, Firefox 110, Safari 15.4

---

## Migration from v3

If you're upgrading from Tailwind v3:

### Config Changes

**Old (v3):**
```js
module.exports = {
  theme: {
    extend: {
      colors: { ... }
    }
  }
}
```

**New (v4):**
```css
@theme {
  --color-primary: oklch(...);
}
```

### CSS Changes

**Old:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**New:**
```css
@import "tailwindcss";
```

### Color Conversion

**Old (HSL):**
```css
--primary: 259 78% 62%;
```

**New (OKLCH):**
```css
--color-primary: oklch(0.62 0.19 259.76);
```

Use [oklch.com](https://oklch.com) for conversions.

---

## Resources

- **Tailwind CSS v4 Docs:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **OKLCH Color Picker:** https://oklch.com
- **Radix UI Primitives:** https://radix-ui.com
- **CVA Documentation:** https://cva.style

---

## Version History

**v1.0** (October 2025)
- Initial theme creation
- Tailwind CSS v4 adoption
- OKLCH color system
- shadcn/ui integration
- Source Serif 4 + JetBrains Mono typography
- Full dark mode support

---

## License & Attribution

This theme is part of the ACDC Digital monorepo project. Feel free to reuse and adapt for your own projects.

**Fonts:**
- Source Serif 4 (SIL Open Font License)
- JetBrains Mono (Apache License 2.0)

**Component Library:**
- shadcn/ui (MIT License)
- Radix UI (MIT License)

---

**Questions?** This theme is designed to be self-contained and portable. Copy the files, install the dependencies, and you're ready to build. The OKLCH color system ensures your designs look consistent everywhere, and the shadcn/ui patterns give you full control over components.

Happy building! 🍇🍇🍇
