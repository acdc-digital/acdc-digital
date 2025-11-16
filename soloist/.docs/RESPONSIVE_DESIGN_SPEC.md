# Soloist Website Responsive Design Implementation Specification

**Version**: 1.0  
**Date**: November 16, 2025  
**Target**: Transform desktop-first design to fully responsive (320px-1400px+)  
**Approach**: Mobile-first progressive enhancement with Tailwind min-width breakpoints

---

## Design Decisions & Strategy

### Technical Decisions
1. **Image Optimization**: Use Next.js `<Image>` component with automatic WebP conversion and responsive srcset generation
2. **Mobile Navigation**: Implement iOS-style bottom tab bar for primary actions (Home, Features, Pricing, Download)
3. **Breakpoint Philosophy**: Use Tailwind's default min-width breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) for progressive enhancement
4. **Performance**: Implement `prefers-reduced-motion` media query and conditional glass effects based on device capabilities

### Breakpoint System (Tailwind Defaults)
```
Base:  0px-639px   (Mobile)
sm:    640px+      (Large phones)
md:    768px+      (Tablets)
lg:    1024px+     (Small desktops)
xl:    1280px+     (Desktops)
2xl:   1400px+     (Large desktops - custom)
```

### Core Principles
- **Mobile-first**: Base styles for 320px-640px, enhance upward
- **Fluid typography**: Use clamp() utilities extensively
- **Flexible grids**: Percentage-based with max-width constraints
- **Touch-friendly**: Minimum 44x44px touch targets
- **Performance-aware**: Reduce effects on low-powered devices

---

## Phase 1: Foundation & Utilities (Priority: Critical)

### 1.1 Global CSS Enhancements
**File**: `website/app/globals.css`

**Tasks**:
- [ ] Add fluid spacing utility classes using clamp()
- [ ] Create responsive padding scale system
- [ ] Add reduced-motion media query for animations
- [ ] Create conditional glass effect utilities
- [ ] Add mobile-optimized font size scales

**Implementation Details**:

```css
/* Fluid Spacing System */
.spacing-fluid-xs { padding: clamp(0.5rem, 2vw, 1rem); }
.spacing-fluid-sm { padding: clamp(1rem, 3vw, 1.5rem); }
.spacing-fluid-md { padding: clamp(1.5rem, 4vw, 2rem); }
.spacing-fluid-lg { padding: clamp(2rem, 5vw, 3rem); }
.spacing-fluid-xl { padding: clamp(3rem, 6vw, 4rem); }

/* Responsive Padding Scale (follows 4-8-16-24-32 pattern) */
.px-responsive-sm { @apply px-4 md:px-8 lg:px-12; }
.px-responsive-md { @apply px-4 md:px-8 lg:px-16 xl:px-24; }
.px-responsive-lg { @apply px-4 md:px-12 lg:px-20 xl:px-32; }
.px-responsive-xl { @apply px-6 md:px-16 lg:px-24 xl:px-40 2xl:px-[72px]; }

/* Vertical Spacing */
.py-responsive-sm { @apply py-4 md:py-6 lg:py-8; }
.py-responsive-md { @apply py-6 md:py-10 lg:py-16; }
.py-responsive-lg { @apply py-8 md:py-16 lg:py-24 xl:py-32; }

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-float-delayed,
  .animate-float-slow,
  .animate-pulse-glow,
  .animate-slide-in-left,
  .animate-slide-in-right,
  .animate-light-sweep,
  .animate-shimmer {
    animation: none !important;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Conditional Glass Effects (disable on low-end devices) */
.glass-card-responsive {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
  .glass-card-responsive {
    backdrop-filter: blur(16px) saturate(160%);
  }
}

.glass-strong-responsive {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.12);
}

@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
  .glass-strong-responsive {
    backdrop-filter: blur(24px) saturate(200%);
  }
}

/* Mobile-Optimized Typography */
.text-hero-mobile {
  font-size: clamp(2.25rem, 8vw, 5.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-display-mobile {
  font-size: clamp(1.75rem, 5vw, 4rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.text-subtitle-mobile {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  line-height: 1.4;
}

/* Touch Target Minimum */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Mobile Container */
.container-mobile {
  @apply px-4 mx-auto;
  max-width: 100%;
}

@media (min-width: 640px) {
  .container-mobile { @apply px-6; max-width: 640px; }
}

@media (min-width: 768px) {
  .container-mobile { @apply px-8; max-width: 768px; }
}

@media (min-width: 1024px) {
  .container-mobile { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container-mobile { max-width: 1280px; }
}

@media (min-width: 1400px) {
  .container-mobile { max-width: 1400px; }
}
```

**Testing Checklist**:
- [ ] Verify clamp() values scale smoothly from 320px to 1400px+
- [ ] Test reduced-motion in Safari, Chrome, Firefox
- [ ] Confirm glass effects disabled on mobile Safari
- [ ] Validate touch-target utility on real iOS/Android devices

---

### 1.2 Tailwind Config Updates
**File**: `website/tailwind.config.js`

**Tasks**:
- [ ] Add custom container configuration
- [ ] Extend spacing scale for responsive patterns
- [ ] Add custom breakpoint utilities if needed
- [ ] Configure aspect ratio plugin

**Implementation Details**:

```javascript
module.exports = {
  theme: {
    extend: {
      // Custom container with responsive padding
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
          '2xl': '4rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
      
      // Extended spacing for fluid layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Aspect ratio utilities
      aspectRatio: {
        'feature': '4/3',
        'demo': '16/10',
        'card': '3/4',
      },
      
      // Custom max-widths for systematic container control
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Mobile-friendly line heights
      lineHeight: {
        'tight-mobile': '1.1',
        'snug-mobile': '1.3',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // Add if not present
  ],
};
```

**Testing Checklist**:
- [ ] Verify container padding scales correctly
- [ ] Test aspect-ratio utilities on images/videos
- [ ] Confirm custom spacing values work in components

---

## Phase 2: Navigation & Header (Priority: Critical)

### 2.1 Desktop Navbar Responsive Fixes
**File**: `website/components/layout/Navbar.tsx`

**Current Issues**:
- Fixed padding `px-[72px]` causes overflow on tablets
- Logo size jumps abruptly (`w-7 h-7 sm:w-12 sm:h-12`)
- Avatar dropdown may be too small on mobile

**Tasks**:
- [ ] Replace fixed padding with responsive scale
- [ ] Smooth logo size transitions
- [ ] Ensure touch-friendly dropdown menu
- [ ] Add sticky header optimization for mobile
- [ ] Test avatar menu on small screens

**Implementation Pattern**:

```tsx
// Replace
<div className="px-[72px] ...">

// With
<div className="px-responsive-xl ...">

// Or explicit breakpoints
<div className="px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-[72px] ...">

// Logo sizing
<Image
  className="w-8 sm:w-10 md:w-12 transition-all duration-200"
  width={48}
  height={48}
  alt="Soloist"
/>

// Touch-friendly buttons
<Button className="touch-target min-h-[44px] px-4">
```

**Testing Checklist**:
- [ ] No horizontal overflow from 320px to 768px
- [ ] Logo scales smoothly across all breakpoints
- [ ] Dropdown menu items are 44px+ tall on mobile
- [ ] Sticky header doesn't cause layout shift
- [ ] Dark mode works with responsive changes

---

### 2.2 iOS-Style Bottom Tab Bar (Mobile Navigation)
**File**: `website/components/layout/MobileTabBar.tsx` (NEW)

**Purpose**: Provide persistent mobile navigation for key actions (Home, Features, Pricing, Download)

**Tasks**:
- [ ] Create new component with fixed bottom positioning
- [ ] Implement tab icons with active states
- [ ] Add haptic feedback hints for iOS
- [ ] Hide on scroll down, show on scroll up
- [ ] Ensure z-index layers correctly
- [ ] Add safe-area-inset-bottom for iOS notch

**Implementation Structure**:

```tsx
// website/components/layout/MobileTabBar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Sparkles, DollarSign, Download } from "lucide-react";

export function MobileTabBar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        glass-card-responsive border-t
        transform transition-transform duration-300
        ${visible ? "translate-y-0" : "translate-y-full"}
      `}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        <TabItem href="#hero" icon={Home} label="Home" />
        <TabItem href="#features" icon={Sparkles} label="Features" />
        <TabItem href="#pricing" icon={DollarSign} label="Pricing" />
        <TabItem href="#download" icon={Download} label="Download" />
      </div>
    </nav>
  );
}

interface TabItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function TabItem({ href, icon: Icon, label }: TabItemProps) {
  return (
    <Link
      href={href}
      className="
        flex flex-col items-center justify-center gap-1
        touch-target w-full h-full
        text-muted-foreground hover:text-foreground
        transition-colors duration-200
      "
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
```

**Integration**:
- [ ] Import in `website/app/layout.tsx`
- [ ] Add padding-bottom to main content to prevent overlap
- [ ] Test scroll behavior on iOS Safari and Chrome Android

**Testing Checklist**:
- [ ] Tab bar appears only on mobile (<768px)
- [ ] Hides when scrolling down, shows when scrolling up
- [ ] Respects iOS safe area (notch/home indicator)
- [ ] Active tab state works correctly
- [ ] Smooth transitions without jank
- [ ] Works in dark mode

---

## Phase 3: Hero Section (Priority: Critical)

### 3.1 Hero Container & Layout
**File**: `website/app/page.tsx` (Hero section)

**Current Issues**:
- `px-32` (128px) causes horizontal overflow below 1024px
- `text-8xl` (96px) too large for mobile
- Download buttons hidden on mobile (`hidden md:flex`)
- Email input fixed width `w-48`

**Tasks**:
- [ ] Replace fixed padding with responsive scale
- [ ] Implement fluid typography for hero heading
- [ ] Create mobile-friendly download section
- [ ] Make email input responsive
- [ ] Adjust spacing for mobile readability

**Implementation Pattern**:

```tsx
// Hero Container
<div className="px-responsive-lg pt-8 md:pt-12 pb-2">
  {/* Hero Heading */}
  <h1 className="
    text-hero-mobile
    font-bold tracking-tight
    mb-4 md:mb-5 mt-6 md:mt-8
    font-parkinsans-bold
  ">
    Track. Compute. Forecast.
  </h1>
  
  {/* Subheading */}
  <p className="
    text-subtitle-mobile
    text-muted-foreground
    max-w-2xl
    mb-6 md:mb-8
  ">
    ...
  </p>
  
  {/* Download Section - Desktop */}
  <div className="hidden md:flex items-end justify-between mb-8">
    {/* Existing download buttons */}
  </div>
  
  {/* Download Section - Mobile */}
  <div className="md:hidden mb-6">
    <DownloadButtonsMobile />
  </div>
  
  {/* Email Newsletter */}
  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
    <input
      type="email"
      placeholder="Enter your email"
      className="
        flex-1 min-w-0
        px-4 py-2.5 rounded-md
        border border-input
        text-sm
        touch-target
      "
    />
    <Button className="touch-target whitespace-nowrap">
      Join Waitlist
    </Button>
  </div>
</div>
```

**New Component**: `website/components/landing/DownloadButtonsMobile.tsx`

```tsx
"use client";

import { useState } from "react";
import { Download, Apple, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DownloadButtonsMobile() {
  const os = detectOS(); // Reuse existing logic
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="w-full touch-target">
          <Download className="w-5 h-5 mr-2" />
          Download Soloist
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle>Download Soloist</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 mt-6 mb-4">
          <Button variant="outline" size="lg" className="touch-target justify-start">
            <Apple className="w-5 h-5 mr-3" />
            Download for macOS
            <span className="ml-auto text-xs text-muted-foreground">
              Apple Silicon & Intel
            </span>
          </Button>
          <Button variant="outline" size="lg" className="touch-target justify-start">
            <Monitor className="w-5 h-5 mr-3" />
            Download for Windows
            <span className="ml-auto text-xs text-muted-foreground">
              64-bit
            </span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Requires macOS 11+ or Windows 10+
        </p>
      </SheetContent>
    </Sheet>
  );
}
```

**Testing Checklist**:
- [ ] Hero section fits within 320px viewport
- [ ] Heading scales smoothly from mobile to desktop
- [ ] Download sheet opens properly on mobile
- [ ] Email input expands to full width on mobile
- [ ] No horizontal scroll on any device
- [ ] Typography remains readable on all screens

---

## Phase 4: Demo Section (Priority: High)

### 4.1 Responsive Demo Iframe
**File**: `website/components/demo/DemoApp.tsx` or `website/app/page.tsx` (demo section)

**Current Issues**:
- Fixed height `h-[700px]` doesn't scale
- No aspect ratio handling
- Container max-width too wide for tablets

**Tasks**:
- [ ] Implement responsive aspect ratio
- [ ] Add Next.js Image optimization for demo preview
- [ ] Create mobile-specific demo experience
- [ ] Optimize iframe loading for mobile

**Implementation Pattern**:

```tsx
// Demo Section Container
<section className="container-mobile py-responsive-lg">
  <div className="max-w-7xl mx-auto">
    {/* Demo Iframe Wrapper */}
    <div className="
      relative
      w-full
      aspect-demo
      rounded-lg overflow-hidden
      shadow-2xl
      border border-border
    ">
      <iframe
        src="/demo"
        className="absolute inset-0 w-full h-full"
        title="Soloist Demo"
        loading="lazy"
      />
    </div>
    
    {/* Mobile: Show static preview image instead */}
    <div className="md:hidden relative aspect-demo w-full">
      <Image
        src="/hero-demo-preview.png"
        alt="Soloist Demo Preview"
        fill
        className="object-cover rounded-lg"
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <Button size="lg" onClick={() => window.open('/demo', '_blank')}>
          Open Interactive Demo
        </Button>
      </div>
    </div>
  </div>
</section>
```

**Alternative: Responsive Height Calculation**

```tsx
// If iframe must be used on mobile
<div className="
  relative w-full
  h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]
  rounded-lg overflow-hidden
">
  <iframe ... />
</div>
```

**Testing Checklist**:
- [ ] Demo maintains aspect ratio on all devices
- [ ] Image preview loads quickly on mobile
- [ ] Interactive demo opens in new tab on mobile
- [ ] Iframe scrolling works properly
- [ ] No layout shift when demo loads

---

## Phase 5: Content Sections (Priority: High)

### 5.1 Steps Section
**File**: `website/components/landing/Steps.tsx`

**Current Issues**:
- `text-[84px]` heading too large for mobile
- Grid needs better mobile stacking

**Tasks**:
- [ ] Scale heading responsively
- [ ] Optimize card layout for mobile
- [ ] Ensure embedded feature cards scale

**Implementation Pattern**:

```tsx
<section className="container-mobile py-responsive-lg">
  <div className="max-w-[83rem] mx-auto">
    {/* Section Heading */}
    <h2 className="
      text-display-mobile
      font-bold tracking-tight
      mb-8 md:mb-12
      text-center md:text-left
    ">
      How Soloist Works
    </h2>
    
    {/* Steps Grid */}
    <div className="
      flex flex-col lg:flex-row
      gap-4 md:gap-6
      items-stretch
    ">
      {steps.map((step, index) => (
        <Card key={index} className="flex-1 min-w-0">
          {/* Card content with responsive padding */}
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {/* Feature preview cards */}
            <div className="aspect-feature relative rounded-md overflow-hidden">
              {step.preview}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>
```

**Testing Checklist**:
- [ ] Heading readable on mobile
- [ ] Cards stack properly on mobile
- [ ] Feature preview cards maintain aspect ratio
- [ ] Touch targets large enough on cards

---

### 5.2 Competitive Comparison Table
**File**: `website/components/landing/CompetitiveComparison.tsx`

**Strategy**: Accept horizontal scroll on mobile (standard pattern for complex tables)

**Tasks**:
- [ ] Optimize table for mobile scrolling
- [ ] Add scroll indicator
- [ ] Ensure first column (features) remains visible
- [ ] Compress column headers for mobile

**Implementation Pattern**:

```tsx
<section className="container-mobile py-responsive-lg overflow-hidden">
  <h2 className="text-display-mobile font-bold mb-8 text-center">
    Why Choose Soloist?
  </h2>
  
  {/* Scroll hint for mobile */}
  <div className="md:hidden text-center text-sm text-muted-foreground mb-4">
    ← Swipe to compare features →
  </div>
  
  {/* Table wrapper with horizontal scroll */}
  <div className="
    overflow-x-auto
    -mx-4 px-4
    md:mx-0 md:px-0
    scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
  ">
    <Table className="min-w-[800px]">
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 bg-background z-10 w-[140px] md:w-[200px]">
            Feature
          </TableHead>
          {/* Other columns */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Table rows with condensed mobile styling */}
      </TableBody>
    </Table>
  </div>
</section>
```

**Optional Enhancement**: Create mobile card view alternative

```tsx
{/* Mobile: Card-based comparison */}
<div className="md:hidden space-y-4">
  {competitors.map(comp => (
    <Card key={comp.name}>
      <CardHeader>
        <CardTitle>{comp.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map(feature => (
            <li key={feature} className="flex items-center justify-between">
              <span className="text-sm">{feature}</span>
              {comp.features[feature] ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  ))}
</div>

{/* Desktop: Table view */}
<div className="hidden md:block">
  {/* Existing table */}
</div>
```

**Testing Checklist**:
- [ ] Table scrolls smoothly on touch devices
- [ ] First column remains visible during scroll
- [ ] Scroll indicator visible on mobile
- [ ] Card view (if implemented) displays all features
- [ ] No performance issues with long tables

---

### 5.3 Pricing Section
**File**: `website/components/landing/Pricing.tsx`

**Current State**: Already responsive with `grid gap-10 lg:grid-cols-3`

**Tasks**:
- [ ] Optimize card spacing for mobile
- [ ] Ensure badge positioning works on small screens
- [ ] Verify button touch targets
- [ ] Adjust typography for mobile readability

**Implementation Pattern**:

```tsx
<section className="container-mobile py-responsive-lg">
  <h2 className="text-display-mobile font-bold mb-6 md:mb-10 text-center">
    Simple, Transparent Pricing
  </h2>
  
  <div className="
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    gap-6 md:gap-8 lg:gap-6
    max-w-6xl mx-auto
  ">
    {pricingPlans.map((plan) => (
      <Card key={plan.name} className="relative flex flex-col">
        {/* Badge positioning */}
        {plan.badge && (
          <div className="
            absolute -top-3 left-1/2 -translate-x-1/2
            z-10
          ">
            <Badge variant="default" className="px-3 py-1 text-xs">
              {plan.badge}
            </Badge>
          </div>
        )}
        
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-xl md:text-2xl">
            {plan.name}
          </CardTitle>
          <div className="mt-4">
            <span className="text-4xl md:text-5xl font-bold">
              ${plan.price}
            </span>
            <span className="text-muted-foreground">
              /{plan.period}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-6 md:p-8 pt-0">
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="p-6 md:p-8 pt-0">
          <Button size="lg" className="w-full touch-target">
            Get Started
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
</section>
```

**Testing Checklist**:
- [ ] Cards stack properly on mobile
- [ ] Badge doesn't overlap card content
- [ ] Pricing text readable and prominent
- [ ] Feature list items have proper spacing
- [ ] CTA buttons are touch-friendly

---

### 5.4 FAQ Section
**File**: `website/components/landing/FAQ.tsx`

**Current Issues**:
- Sidebar layout `grid md:grid-cols-[300px_1fr]` needs mobile optimization
- Fixed sidebar height `h-[369px]`

**Tasks**:
- [ ] Convert sidebar to horizontal tabs on mobile
- [ ] Make accordion items mobile-friendly
- [ ] Optimize spacing and typography

**Implementation Pattern**:

```tsx
<section className="container-mobile py-responsive-lg">
  <h2 className="text-display-mobile font-bold mb-6 md:mb-10 text-center">
    Frequently Asked Questions
  </h2>
  
  {/* Mobile: Horizontal Tabs */}
  <div className="md:hidden mb-6">
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className="whitespace-nowrap touch-target"
          >
            {cat}
          </Button>
        ))}
      </div>
    </ScrollArea>
  </div>
  
  {/* Desktop: Sidebar + Content */}
  <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-8">
    {/* Sidebar - Desktop Only */}
    <aside className="hidden md:block">
      <nav className="sticky top-24 space-y-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "ghost"}
            className="w-full justify-start touch-target"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </nav>
    </aside>
    
    {/* FAQ Content */}
    <div className="space-y-4">
      <Accordion type="single" collapsible className="space-y-3">
        {filteredFaqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="border rounded-lg px-4 md:px-6"
          >
            <AccordionTrigger className="
              text-left text-sm md:text-base
              py-4 md:py-5
              hover:no-underline
            ">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base pb-4 md:pb-5">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
</section>
```

**Testing Checklist**:
- [ ] Horizontal tabs scroll smoothly on mobile
- [ ] Active category visually distinct
- [ ] Accordion items have proper touch targets
- [ ] Content readable on all screen sizes
- [ ] Sidebar sticky behavior works on desktop

---

### 5.5 Roadmap Section
**File**: `website/components/landing/Roadmap.tsx`

**Current State**: Good responsive foundation with `grid md:grid-cols-2 lg:grid-cols-3`

**Tasks**:
- [ ] Verify filter buttons wrap properly on mobile
- [ ] Optimize card content for small screens
- [ ] Ensure timeline indicators scale

**Implementation Pattern**:

```tsx
<section className="container-mobile py-responsive-lg">
  <h2 className="text-display-mobile font-bold mb-6 md:mb-10 text-center">
    Product Roadmap
  </h2>
  
  {/* Phase Filters */}
  <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
    {phases.map((phase) => (
      <Button
        key={phase}
        variant={activePhase === phase ? "default" : "outline"}
        size="sm"
        className="touch-target"
        onClick={() => setActivePhase(phase)}
      >
        {phase}
      </Button>
    ))}
  </div>
  
  {/* Roadmap Grid */}
  <div className="
    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
    gap-4 md:gap-6
    max-w-6xl mx-auto
  ">
    {filteredItems.map((item) => (
      <Card key={item.id} className="flex flex-col">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <CardTitle className="text-base md:text-lg">
              {item.title}
            </CardTitle>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {item.phase}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 md:p-6 pt-0">
          <p className="text-sm text-muted-foreground">
            {item.description}
          </p>
        </CardContent>
        {item.eta && (
          <CardFooter className="p-4 md:p-6 pt-0">
            <span className="text-xs text-muted-foreground">
              ETA: {item.eta}
            </span>
          </CardFooter>
        )}
      </Card>
    ))}
  </div>
</section>
```

**Testing Checklist**:
- [ ] Filter buttons wrap without breaking layout
- [ ] Cards display properly on all screen sizes
- [ ] Phase badges don't overflow card titles
- [ ] Grid transitions smoothly between breakpoints

---

## Phase 6: Feature Components (Priority: Medium)

### 6.1 Feature Preview Cards
**Files**: `website/components/features/*.tsx`

**Components to Update**:
- `Reflections.tsx`
- `DailyLogCard.tsx`
- `FeedCard.tsx`
- `MoodForecastCard.tsx`
- `RecommendationCard.tsx`

**Current Issues**:
- Fixed dimensions like `h-[560px] w-[520px]`
- Not optimized for embedding in mobile layouts

**Tasks**:
- [ ] Replace fixed dimensions with responsive sizing
- [ ] Use aspect-ratio utilities
- [ ] Optimize internal content for small containers
- [ ] Add Next.js Image optimization

**Implementation Pattern**:

```tsx
// Example: Reflections.tsx
export function Reflections() {
  return (
    <div className="
      w-full h-auto
      aspect-feature
      rounded-lg overflow-hidden
      border border-border
      bg-card
      p-4 md:p-6
    ">
      {/* Content with responsive sizing */}
      <div className="flex flex-col h-full gap-3 md:gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-base font-semibold">
            Reflections
          </h3>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Image with Next.js optimization */}
        <div className="relative flex-1 rounded-md overflow-hidden">
          <Image
            src="/reflection-1.png"
            alt="Reflection example"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        {/* Caption */}
        <p className="text-xs md:text-sm text-muted-foreground">
          Capture moments that matter
        </p>
      </div>
    </div>
  );
}
```

**Image Optimization Strategy**:

```tsx
// Use Next.js Image component everywhere
import Image from "next/image";

// Responsive sizes attribute
<Image
  src="/feature.png"
  alt="Feature"
  width={800}
  height={600}
  className="rounded-lg"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={85} // Balance quality vs file size
  priority={false} // Lazy load non-critical images
/>

// Next.js automatically:
// ✅ Converts to WebP
// ✅ Generates responsive srcset
// ✅ Optimizes on-demand
// ✅ Serves appropriate size per device
```

**Testing Checklist**:
- [ ] Feature cards scale properly in Steps section
- [ ] Images load quickly on mobile networks
- [ ] Aspect ratios maintained on all screens
- [ ] Text remains readable when cards are small
- [ ] WebP images served to supported browsers

---

## Phase 7: Footer (Priority: Medium)

### 7.1 Footer Layout
**File**: `website/components/layout/Footer.tsx`

**Current State**: Already responsive with `grid grid-cols-1 md:grid-cols-12`

**Tasks**:
- [ ] Verify mobile stacking order
- [ ] Optimize link spacing for touch
- [ ] Ensure social icons are touch-friendly
- [ ] Test newsletter signup on mobile

**Implementation Pattern**:

```tsx
<footer className="border-t bg-muted/30">
  <div className="container-mobile py-responsive-md">
    {/* Footer Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-6 lg:gap-8">
      {/* Brand Column */}
      <div className="sm:col-span-2 md:col-span-4">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <Image
            src="/soloist-logo.svg"
            alt="Soloist"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-bold">Soloist</span>
        </Link>
        <p className="text-sm text-muted-foreground mb-6">
          Track your mood, predict your future.
        </p>
        
        {/* Social Links */}
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="touch-target" asChild>
            <Link href="https://twitter.com/soloist">
              <Twitter className="w-5 h-5" />
            </Link>
          </Button>
          {/* More social icons */}
        </div>
      </div>
      
      {/* Link Columns */}
      <div className="md:col-span-2">
        <h3 className="font-semibold mb-4 text-sm">Product</h3>
        <ul className="space-y-3">
          <li>
            <Link
              href="/features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors touch-target inline-block"
            >
              Features
            </Link>
          </li>
          {/* More links */}
        </ul>
      </div>
      
      {/* Repeat for other columns */}
      
      {/* Newsletter Column */}
      <div className="sm:col-span-2 md:col-span-4">
        <h3 className="font-semibold mb-4 text-sm">Stay Updated</h3>
        <form className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 px-3 py-2 rounded-md border text-sm touch-target"
          />
          <Button type="submit" size="sm" className="touch-target">
            Subscribe
          </Button>
        </form>
      </div>
    </div>
    
    {/* Copyright */}
    <div className="mt-8 pt-8 border-t text-center md:text-left">
      <p className="text-xs text-muted-foreground">
        © 2025 Soloist. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

**Testing Checklist**:
- [ ] Footer columns stack properly on mobile
- [ ] All links have adequate touch targets
- [ ] Social icons are 44x44px minimum
- [ ] Newsletter form works on mobile
- [ ] Content hierarchy clear on all screens

---

## Phase 8: Additional Pages (Priority: Low)

### 8.1 Blog Section
**Files**: `website/app/blog/*`

**Tasks**:
- [ ] Ensure blog post layouts are responsive
- [ ] Optimize reading width for mobile (max-w-prose)
- [ ] Make code blocks horizontally scrollable
- [ ] Ensure images are responsive

**Pattern**: Apply same responsive principles as landing page

---

### 8.2 Wiki/Documentation
**Files**: `website/app/wiki/*`

**Tasks**:
- [ ] Optimize sidebar navigation for mobile
- [ ] Ensure documentation content readable
- [ ] Make tables and code examples mobile-friendly

**Pattern**: Consider collapsible sidebar on mobile

---

## Phase 9: Performance Optimization (Priority: Medium)

### 9.1 Image Optimization
**All files with images**

**Tasks**:
- [ ] Replace all `<img>` tags with Next.js `<Image>`
- [ ] Add appropriate `sizes` attribute for responsive images
- [ ] Set `priority` for above-fold images
- [ ] Lazy load below-fold images
- [ ] Use `quality={85}` for balance

**Verification**:
```bash
# Check for regular img tags
grep -r "<img" website/app website/components

# Should be zero or only in markdown/CMS content
```

---

### 9.2 Reduced Motion Support
**File**: `website/app/globals.css` (already in Phase 1)

**Tasks**:
- [ ] Implement prefers-reduced-motion media query
- [ ] Disable animations for users who prefer reduced motion
- [ ] Test with system preferences enabled

**Testing**:
- macOS: System Preferences → Accessibility → Display → Reduce motion
- iOS: Settings → Accessibility → Motion → Reduce Motion
- Windows: Settings → Ease of Access → Display → Show animations

---

### 9.3 Conditional Glass Effects
**Files**: All components using glass effects

**Tasks**:
- [ ] Replace `.glass-card` with `.glass-card-responsive`
- [ ] Replace `.glass-strong` with `.glass-strong-responsive`
- [ ] Test performance on low-end devices

**Components to Update**:
- Navbar
- Mobile tab bar
- Modal overlays
- Card components with backdrop-filter

---

### 9.4 Font Loading Optimization
**File**: `website/app/layout.tsx`

**Tasks**:
- [ ] Ensure fonts use `display: swap`
- [ ] Subset fonts for better performance
- [ ] Consider using system fonts as fallback

**Check Current Setup**:
```tsx
// Verify font configuration
import { Inter, Geist, GeistMono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

---

## Phase 10: Testing & Validation (Priority: Critical)

### 10.1 Device Testing Matrix

**Physical Devices**:
- [ ] iPhone SE (375px) - iOS Safari
- [ ] iPhone 14 (390px) - iOS Safari
- [ ] iPhone 14 Pro Max (428px) - iOS Safari
- [ ] Samsung Galaxy S22 (360px) - Chrome Android
- [ ] iPad (768px) - iOS Safari
- [ ] iPad Pro (1024px) - iOS Safari
- [ ] MacBook Air (1280px) - Safari, Chrome, Firefox
- [ ] Desktop (1920px) - Safari, Chrome, Firefox, Edge

**Browser DevTools Testing**:
- [ ] Chrome DevTools responsive mode (320px-2560px)
- [ ] Safari Responsive Design Mode
- [ ] Firefox Responsive Design Mode

**Key Testing Areas**:
1. **Layout**:
   - [ ] No horizontal overflow at any breakpoint
   - [ ] Content stacks/reflows appropriately
   - [ ] Spacing scales naturally

2. **Typography**:
   - [ ] All text readable without zooming
   - [ ] Headings scale appropriately
   - [ ] Line heights comfortable for reading

3. **Touch Targets**:
   - [ ] All buttons/links minimum 44x44px
   - [ ] Adequate spacing between interactive elements
   - [ ] Form inputs easy to tap and type in

4. **Images**:
   - [ ] Load quickly on 3G/4G connections
   - [ ] Appropriate resolution for device
   - [ ] No layout shift during loading

5. **Navigation**:
   - [ ] Mobile menu works smoothly
   - [ ] Bottom tab bar shows/hides correctly (iOS-style)
   - [ ] Scroll behavior natural and performant

6. **Forms**:
   - [ ] Email inputs expand to full width on mobile
   - [ ] Submit buttons accessible
   - [ ] Keyboard doesn't obscure input fields

7. **Performance**:
   - [ ] Page loads in <3s on 4G
   - [ ] No jank during scrolling
   - [ ] Animations smooth (or disabled with reduced-motion)

---

### 10.2 Automated Testing Tools

**Lighthouse Audits**:
```bash
# Run Lighthouse in Chrome DevTools
# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 95+
```

**Responsive Design Checker**:
```bash
# Use online tools or browser extensions
# Test common breakpoints: 320, 375, 414, 768, 1024, 1280, 1920
```

**Accessibility Testing**:
- [ ] WAVE browser extension
- [ ] axe DevTools
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Keyboard navigation (tab through all elements)

---

### 10.3 QA Checklist

**Critical Issues (Must Fix)**:
- [ ] No horizontal scrolling on any device
- [ ] All interactive elements have 44x44px touch targets
- [ ] Typography readable without zoom on mobile
- [ ] Images load and display correctly
- [ ] Navigation works on all devices
- [ ] Forms functional on mobile

**High Priority Issues**:
- [ ] Consistent spacing across breakpoints
- [ ] Smooth transitions between layouts
- [ ] Performance acceptable on mid-range devices
- [ ] Dark mode works with responsive changes

**Medium Priority Issues**:
- [ ] Animation performance on low-end devices
- [ ] Advanced responsive image optimization
- [ ] Progressive enhancement for no-JS users

**Nice to Have**:
- [ ] Perfect pixel alignment at all breakpoints
- [ ] Custom mobile interactions
- [ ] Advanced PWA features

---

## Phase 11: Documentation & Handoff (Priority: Low)

### 11.1 Component Documentation

Create responsive design documentation for future developers:

**File**: `website/RESPONSIVE_GUIDELINES.md`

```markdown
# Soloist Responsive Design Guidelines

## Breakpoint System
- Base: 0-639px (Mobile)
- sm: 640px+ (Large phones)
- md: 768px+ (Tablets)
- lg: 1024px+ (Small desktops)
- xl: 1280px+ (Desktops)
- 2xl: 1400px+ (Large desktops)

## Spacing Scale
Use responsive utility classes:
- `px-responsive-sm`: px-4 md:px-8 lg:px-12
- `px-responsive-md`: px-4 md:px-8 lg:px-16 xl:px-24
- `px-responsive-lg`: px-4 md:px-12 lg:px-20 xl:px-32

## Typography Scale
Use fluid typography utilities:
- `.text-hero-mobile`: clamp(2.25rem, 8vw, 5.5rem)
- `.text-display-mobile`: clamp(1.75rem, 5vw, 4rem)
- `.text-subtitle-mobile`: clamp(1.125rem, 3vw, 1.5rem)

## Component Patterns
- Always use `touch-target` class for interactive elements
- Prefer `.container-mobile` for page-level containers
- Use `aspect-feature` for maintaining image ratios
- Apply `.glass-card-responsive` for performance-optimized glass effects

## Testing Checklist
- No horizontal overflow at any breakpoint
- All touch targets minimum 44x44px
- Typography readable without zoom
- Performance acceptable on 3G/4G
```

---

### 11.2 Update Project README

Add responsive design section to main README:

**File**: `website/README.md` or `soloist/README.md`

```markdown
## Responsive Design

Soloist website is fully responsive and optimized for:
- Mobile devices (320px-640px)
- Tablets (768px-1024px)
- Desktops (1280px+)

### Key Features
- ✅ Mobile-first progressive enhancement
- ✅ Fluid typography with clamp()
- ✅ Next.js Image optimization with WebP
- ✅ iOS-style bottom tab navigation
- ✅ Reduced motion support
- ✅ Conditional glass effects for performance

### Testing
Test responsive design:
```bash
npm run dev
# Open http://localhost:3000 in Chrome DevTools responsive mode
```

See `RESPONSIVE_GUIDELINES.md` for implementation details.
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Phase 1: Foundation & Utilities (2 days)
- [ ] Phase 2: Navigation & Header (2 days)
- [ ] Phase 3: Hero Section (1 day)

### Week 2: Content Sections
- [ ] Phase 4: Demo Section (1 day)
- [ ] Phase 5: Content Sections (3 days)
  - Steps, Comparison, Pricing, FAQ, Roadmap

### Week 3: Components & Features
- [ ] Phase 6: Feature Components (2 days)
- [ ] Phase 7: Footer (1 day)
- [ ] Phase 8: Additional Pages (2 days)

### Week 4: Polish & Testing
- [ ] Phase 9: Performance Optimization (2 days)
- [ ] Phase 10: Testing & Validation (2 days)
- [ ] Phase 11: Documentation (1 day)

**Total Estimated Time**: 4 weeks (20 working days)

---

## Success Metrics

### Performance Targets
- Lighthouse Performance: 90+
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

### Accessibility Targets
- WCAG 2.1 AA compliance
- Lighthouse Accessibility: 95+
- Keyboard navigation: 100%
- Screen reader compatibility: Full

### User Experience Targets
- No horizontal scroll on any device
- Touch targets: 100% meet 44x44px minimum
- Typography: Readable without zoom on all devices
- Images: WebP served to 90%+ of users

---

## Risk Mitigation

### Potential Issues
1. **Breaking existing layouts**: Test thoroughly on desktop before mobile testing
2. **Performance regression**: Monitor bundle size and Lighthouse scores
3. **Browser compatibility**: Test on Safari iOS, Chrome Android, desktop browsers
4. **Third-party component limitations**: May need to fork/customize shadcn components

### Mitigation Strategies
1. Create feature branch and test incrementally
2. Use Chrome DevTools performance profiling
3. Test on real devices, not just emulators
4. Document any component customizations

---

## Appendix

### Useful Resources
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web.dev Performance](https://web.dev/performance/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- Chrome DevTools (Device emulation)
- Lighthouse (Performance auditing)
- WAVE (Accessibility checker)
- WebPageTest (Real-world performance)
- BrowserStack (Cross-browser testing)

---

**End of Specification**
