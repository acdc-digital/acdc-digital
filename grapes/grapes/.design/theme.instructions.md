---
applyTo: "**/*.{tsx,ts,css}"
description: "Modern Minimal shadcn/ui theme with subtle purple accents for Grapes"
---

# Grapes Theme Design System
**Modern Minimal Shadcn Theme**

Clean modern minimal theme with subtle purple accents. Swiss design principles with contemporary aesthetics. Based on the Modern Minimal theme from shadcn.io.

## Philosophy

Minimalism isn't about removing everything—it's about removing everything that doesn't serve a purpose. This theme uses:

- **Subtle purple accents** - Personality without overwhelming content
- **High contrast ratios** - WCAG AA compliant for accessibility
- **Generous spacing** - Content breathes, users can focus
- **Strategic restraint** - Purple only where it matters (primary actions, focus states)

Perfect for SaaS dashboards, professional portfolios, design agencies, or any project where clarity and sophistication matter more than flashy design.

## Color Palette (OKLCH)

### Light Mode (Default)
```css
--background: oklch(1.00 0 0);           /* Pure white */
--foreground: oklch(0.32 0 0);           /* Dark gray text */
--card: oklch(1.00 0 0);                 /* White cards */
--card-foreground: oklch(0.32 0 0);      /* Dark text on cards */
--primary: oklch(0.62 0.19 259.76);      /* Subtle purple */
--primary-foreground: oklch(1.00 0 0);   /* White on purple */
--secondary: oklch(0.97 0 0);            /* Light gray */
--secondary-foreground: oklch(0.45 0.03 257.68);
--muted: oklch(0.98 0 0);                /* Very light gray */
--muted-foreground: oklch(0.55 0.02 264.41);
--accent: oklch(0.95 0.03 233.56);       /* Light accent */
--accent-foreground: oklch(0.38 0.14 265.59);
--destructive: oklch(0.64 0.21 25.39);   /* Red for errors */
--destructive-foreground: oklch(1.00 0 0);
--border: oklch(0.93 0.01 261.82);       /* Subtle borders */
--input: oklch(0.93 0.01 261.82);        /* Input borders */
--ring: oklch(0.62 0.19 259.76);         /* Purple focus ring */
```

### Dark Mode
```css
--background: oklch(0.20 0 0);           /* Dark background */
--foreground: oklch(0.92 0 0);           /* Light text */
--card: oklch(0.27 0 0);                 /* Elevated surfaces */
--card-foreground: oklch(0.92 0 0);      /* Light text on cards */
--primary: oklch(0.62 0.19 259.76);      /* Same purple */
--primary-foreground: oklch(1.00 0 0);   /* White on purple */
--secondary: oklch(0.27 0 0);            /* Dark gray */
--secondary-foreground: oklch(0.92 0 0);
--muted: oklch(0.27 0 0);                /* Dark muted */
--muted-foreground: oklch(0.72 0 0);     /* Gray text */
--accent: oklch(0.38 0.14 265.59);       /* Dark accent */
--accent-foreground: oklch(0.88 0.06 254.63);
--border: oklch(0.37 0 0);               /* Dark borders */
--input: oklch(0.37 0 0);                /* Dark input borders */
--ring: oklch(0.62 0.19 259.76);         /* Purple focus ring */
```

### Chart Colors (Data Visualization)
```css
--chart-1: oklch(0.62 0.19 259.76);      /* Primary purple */
--chart-2: oklch(0.55 0.22 262.96);      /* Deeper purple */
--chart-3: oklch(0.49 0.22 264.43);      /* Even deeper */
--chart-4: oklch(0.42 0.18 265.55);      /* Dark purple */
--chart-5: oklch(0.38 0.14 265.59);      /* Darkest purple */
```

## Typography

### Fonts
- **Serif**: Source Serif 4 - Adds subtle sophistication without being pretentious
- **Mono**: JetBrains Mono - For code blocks and technical content
- **Sans**: System fonts (default)

```css
--font-serif: Source Serif 4, serif;
--font-mono: JetBrains Mono, monospace;
```

### Font Usage
- Use serif for headings that need character and warmth
- Use sans-serif (default) for body text and UI elements
- Use mono for code, technical data, and fixed-width needs

### Type Scale
- Headings: Use `font-semibold` or `font-bold`
- Body text: Default weight (400)
- Muted text: Use `text-muted-foreground` class
- Important text: Use `text-foreground`

## Design Tokens

### Border Radius
```css
--radius: 0.375rem;                      /* 6px base */
--radius-sm: calc(var(--radius) - 4px);  /* 2px - tight curves */
--radius-md: calc(var(--radius) - 2px);  /* 4px - subtle curves */
--radius-lg: var(--radius);              /* 6px - standard */
--radius-xl: calc(var(--radius) + 4px);  /* 10px - pronounced */
```

### Shadows (Subtle depth)
```css
--shadow-2xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
--shadow-xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
--shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
--shadow: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
--shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);
--shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);
--shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10);
--shadow-2xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.25);
```

Use shadows sparingly—only to establish visual hierarchy, never for decoration.

## When to Use Purple (Strategic Restraint)

Purple should appear **only** where it matters:

### ✅ DO use purple for:
- **Primary actions** - "Save," "Continue," "Submit" buttons that deserve focused attention
- **Active navigation** - Current page indicators, selected menu items
- **Focus states** - Keyboard navigation rings, input focus borders
- **Links** - Clickable text that leads somewhere important
- **Important status** - Success states, completion indicators

### ❌ DON'T use purple for:
- Decorative elements or backgrounds
- Every button on the page
- Text that doesn't need emphasis
- Borders that are purely structural
- Icons that are informational

**The rule**: If it's not interactive or critically important, it shouldn't be purple.

## Spacing Principles (Swiss Design)

### Generous White Space
```tsx
// Page-level spacing
<div className="container mx-auto px-6 py-12">
  {/* Content breathes */}
</div>

// Component spacing - use generous gaps
<div className="space-y-8">
  {/* Each section has room */}
</div>

// Grid spacing - don't cramp content
<div className="grid gap-8 md:grid-cols-3">
  {/* Cards have breathing room */}
</div>
```

### Spacing Scale (Use liberally)
- `space-y-2` / `gap-2` (8px) - Tight groupings
- `space-y-4` / `gap-4` (16px) - Related elements
- `space-y-6` / `gap-6` (24px) - Section separation
- `space-y-8` / `gap-8` (32px) - Major sections
- `space-y-12` / `gap-12` (48px) - Page sections

**Remember**: Empty space is a design element, not wasted space.

## Component Patterns

### Buttons (Purple Only for Primary)
```tsx
// Primary action - use purple sparingly
<Button variant="default">Save Changes</Button>

// Secondary actions - clean and minimal
<Button variant="secondary">Cancel</Button>

// Outline - use for less important actions
<Button variant="outline">Learn More</Button>

// Ghost - use for inline, subtle actions
<Button variant="ghost">View Details</Button>

// Destructive - red, not purple
<Button variant="destructive">Delete Account</Button>
```

### Cards (Clean, Elevated)
```tsx
// Standard card with subtle elevation
<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="mt-2 text-sm text-muted-foreground">
    Clean, minimal card content.
  </p>
</div>

// Interactive card with hover
<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
  {/* Content */}
</div>
```

### Forms (Clean, Accessible)
```tsx
// Input with proper labels and spacing
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    placeholder="you@example.com"
  />
</div>
```

### Typography Hierarchy
```tsx
// Page heading with serif font
<h1 className="font-serif text-4xl font-bold tracking-tight">
  Page Title
</h1>

// Section heading
<h2 className="text-2xl font-semibold">Section Title</h2>

// Subsection heading
<h3 className="text-lg font-medium">Subsection</h3>

// Body text
<p className="text-base text-foreground">
  Regular paragraph text.
</p>

// Muted text for secondary info
<p className="text-sm text-muted-foreground">
  Additional details or metadata.
</p>
```

## Animation Guidelines (Subtle Movement)

### Transitions - Keep them subtle
```tsx
// Standard duration for most interactions
className="transition-colors duration-200"

// Shadow transitions for cards
className="transition-shadow duration-200"

// Transform for subtle hover effects
className="transition-transform duration-200 hover:scale-[1.02]"
```

### Hover States (Understated)
```tsx
// Button hover - barely perceptible
className="hover:bg-primary/90 transition-colors"

// Link hover - simple underline
className="hover:underline"

// Card hover - subtle shadow increase
className="hover:shadow-md transition-shadow"
```

**Rule**: Animations should feel invisible. If users notice the animation itself, it's too much.

## Accessibility Standards

### WCAG AA Compliance
All color combinations in this theme pass WCAG AA standards (4.5:1 contrast ratio for normal text).

### Focus States (Critical)
```tsx
// Always include visible focus rings
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// For dark backgrounds
className="focus-visible:ring-offset-background"
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus order should follow visual layout
- Skip links for long pages
- Proper ARIA labels where semantic HTML isn't enough

### Color Contrast Testing
- Primary text: `text-foreground` (passes AA)
- Secondary text: `text-muted-foreground` (passes AA)
- Purple buttons: `bg-primary text-primary-foreground` (passes AA)
- Never use `text-muted-foreground` on `bg-muted` (fails contrast)

## Responsive Design (Mobile-First)

### Breakpoints (Tailwind)
- **Default** - Mobile (< 640px)
- **sm**: 640px - Tablets
- **md**: 768px - Small laptops
- **lg**: 1024px - Desktops
- **xl**: 1280px - Large screens
- **2xl**: 1400px - Max container width

### Layout Patterns
```tsx
// Stack on mobile, grid on desktop
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>

// Responsive padding
<div className="px-4 py-8 sm:px-6 md:px-8 md:py-12">
  {/* Content */}
</div>

// Responsive typography
<h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
  Responsive Heading
</h1>
```

### Container Usage
```tsx
// Centered container with max-width
<div className="container mx-auto max-w-7xl px-4">
  {/* Content never gets too wide */}
</div>
```

## Real-World Usage Guidelines

### What Works Well
- **SaaS Dashboards** - Clean data display without visual clutter
- **Professional Portfolios** - Content-focused, elegant presentation
- **Documentation Sites** - Easy to read, easy to scan
- **Productivity Apps** - Focus on tasks, not the interface
- **Design Agencies** - Demonstrates restraint and sophistication

### Primary Actions Pattern
```tsx
// Save/Submit forms - purple stands out
<Button variant="default">Save Changes</Button>

// Confirmation dialogs - primary action is clear
<div className="flex gap-3">
  <Button variant="default">Confirm</Button>
  <Button variant="outline">Cancel</Button>
</div>

// CTA buttons - purple draws the eye
<Button variant="default" size="lg">
  Get Started →
</Button>
```

### Content-First Layouts
```tsx
// Hero section - generous space, clear hierarchy
<section className="container mx-auto px-6 py-24 text-center">
  <h1 className="font-serif text-5xl font-bold tracking-tight">
    Your Product Name
  </h1>
  <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
    Clear, focused value proposition without visual noise.
  </p>
  <Button variant="default" size="lg" className="mt-8">
    Start Now
  </Button>
</section>

// Feature grid - let content speak
<div className="grid gap-12 md:grid-cols-3">
  {features.map(feature => (
    <div key={feature.id} className="space-y-3">
      <h3 className="text-xl font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  ))}
</div>
```

## Convex Integration Styling

### Loading States (Minimal)
```tsx
// Subtle skeleton loader
{data === undefined ? (
  <div className="space-y-3">
    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
  </div>
) : (
  <div>{data.content}</div>
)}
```

### Empty States (Clean messaging)
```tsx
<div className="py-12 text-center">
  <p className="text-muted-foreground">
    No items yet. Create your first one to get started.
  </p>
  <Button variant="default" className="mt-4">
    Create Item
  </Button>
</div>
```

### Error States (Clear, helpful)
```tsx
<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
  <p className="font-medium text-destructive">
    Something went wrong
  </p>
  <p className="mt-1 text-sm text-destructive/90">
    {error.message}
  </p>
</div>
```

## The Don'ts (Critical Rules)

### ❌ Never Do These:

1. **Don't use arbitrary colors**
   ```tsx
   // ❌ Wrong - breaks the theme
   <div className="bg-[#9b59b6]">
   
   // ✅ Correct - uses design tokens
   <div className="bg-primary">
   ```

2. **Don't overuse purple**
   ```tsx
   // ❌ Wrong - purple everywhere
   <Button variant="default">Save</Button>
   <Button variant="default">Cancel</Button>
   <Button variant="default">Delete</Button>
   
   // ✅ Correct - strategic purple
   <Button variant="default">Save</Button>
   <Button variant="outline">Cancel</Button>
   <Button variant="destructive">Delete</Button>
   ```

3. **Don't remove white space to "fit more"**
   ```tsx
   // ❌ Wrong - cramped
   <div className="grid grid-cols-4 gap-2">
   
   // ✅ Correct - generous spacing
   <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
   ```

4. **Don't use heavy animations**
   ```tsx
   // ❌ Wrong - distracting
   <div className="animate-bounce hover:scale-125">
   
   // ✅ Correct - subtle
   <div className="hover:scale-[1.02] transition-transform">
   ```

5. **Don't hardcode breakpoint values**
   ```tsx
   // ❌ Wrong
   const isMobile = window.innerWidth < 768;
   
   // ✅ Correct - use Tailwind classes
   <div className="hidden md:block">
   ```

## The Do's (Best Practices)

### ✅ Always Do These:

1. **Use semantic color classes**
   ```tsx
   <div className="bg-background text-foreground">
   <p className="text-muted-foreground">
   <Button variant="default">Primary Action</Button>
   ```

2. **Embrace negative space**
   ```tsx
   <section className="py-24">
     <div className="space-y-12">
       {/* Generous spacing = better UX */}
     </div>
   </section>
   ```

3. **Use proper TypeScript types**
   ```tsx
   // ✅ Correct
   interface CardProps {
     title: string;
     description: string;
     variant?: "default" | "outline";
   }
   ```

4. **Test on mobile first**
   - Design mobile layout first
   - Add `md:` and `lg:` variants for larger screens
   - Never assume desktop is the primary experience

5. **Follow shadcn/ui patterns**
   - Use shadcn components as foundation
   - Extend with Tailwind utilities
   - Keep component APIs consistent

## Installation

To use this theme in your project:

```bash
npx shadcn@latest add https://www.shadcn.io/registry/modern-minimal.json
```

Or manually copy the CSS variables into your `globals.css`.

## Resources

- Modern Minimal Theme: https://www.shadcn.io/themes/modern-minimal
- shadcn/ui Components: https://ui.shadcn.com
- Tailwind CSS Docs: https://tailwindcss.com/docs
- Source Serif 4 Font: https://fonts.google.com/specimen/Source+Serif+4
- JetBrains Mono: https://www.jetbrains.com/lp/mono/

---

**Remember**: Good minimalism isn't about removing features—it's about removing anything that distracts from what matters. Every element should serve a purpose. Every pixel of white space is intentional. Purple is powerful because it's rare.
