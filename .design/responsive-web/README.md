# Responsive Web Design Guide

**ACDC Digital · Responsive Design Standards**

This guide documents our responsive web design principles, patterns, and best practices based on real-world implementation across our projects.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Breakpoint System](#breakpoint-system)
3. [Layout Strategies](#layout-strategies)
4. [Typography & Spacing](#typography--spacing)
5. [Component Patterns](#component-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Mobile-First Approach](#mobile-first-approach)
8. [Testing & Validation](#testing--validation)

---

## Core Philosophy

### Mobile-First Design
Always start with mobile layouts and progressively enhance for larger screens. This ensures:
- Optimal performance on constrained devices
- Forced prioritization of essential content
- Cleaner, more maintainable code
- Better accessibility

### Progressive Enhancement
Build from a functional baseline and add enhancements:
```css
/* Mobile base (320px+) */
.container {
  padding: 1rem;
}

/* Tablet enhancement (640px+) */
@media (min-width: 640px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop enhancement (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 4rem;
  }
}
```

### Content-First Thinking
Design around content hierarchy, not device specifications:
- What's essential on mobile?
- What can be progressively revealed?
- What can be repositioned without losing context?

---

## Breakpoint System

### Standard Breakpoints (Tailwind-based)

```css
/* Extra Small - Mobile Portrait */
@media (min-width: 380px) { }  /* xs */

/* Small - Mobile Landscape */
@media (min-width: 475px) { }  /* sm-xs */

/* Small - Large Mobile */
@media (min-width: 640px) { }  /* sm */

/* Medium - Tablet Portrait */
@media (min-width: 768px) { }  /* md */

/* Large - Tablet Landscape / Small Desktop */
@media (min-width: 1024px) { } /* lg */

/* Extra Large - Desktop */
@media (min-width: 1280px) { } /* xl */

/* 2X Large - Large Desktop */
@media (min-width: 1536px) { } /* 2xl */
```

### When to Use Each Breakpoint

| Breakpoint | Use Case | Common Patterns |
|------------|----------|-----------------|
| `380px` | Fix micro-mobile issues | Font size adjustments, critical spacing |
| `640px` | Mobile → Tablet transition | Layout shifts, column introduction |
| `768px` | Tablet portrait | Sidebar reveals, multi-column layouts |
| `1024px` | Desktop baseline | Full navigation, complex layouts |
| `1280px+` | Wide screens | Max-width containers, additional columns |

### Custom Breakpoints
Only add custom breakpoints when:
- Content breaks at specific widths
- Standard breakpoints create awkward intermediate states
- Specific design requirements demand it

```css
/* Example: Content-specific breakpoint */
@media (min-width: 896px) {
  /* Specific layout adjustment */
}
```

---

## Layout Strategies

### 1. Container Strategy

#### Edge-to-Edge Mobile
```tsx
// Mobile: Full width, minimal padding
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  {content}
</div>
```

#### Centered Desktop Container
```tsx
// Progressively centered with max-width
<div className="w-full md:max-w-7xl md:mx-auto px-responsive">
  {content}
</div>
```

#### Hybrid Approach
```tsx
// Some sections full-width, others contained
<section className="w-full">
  <div className="md:max-w-5xl md:mx-auto px-responsive">
    {content}
  </div>
</section>
```

### 2. Grid Layouts

#### Responsive Grid Pattern
```tsx
// Mobile: 1 column → Tablet: 2 columns → Desktop: 3-4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### Asymmetric Grids
```tsx
// Mobile stack → Desktop sidebar layout
<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
  <aside>{sidebar}</aside>
  <main>{content}</main>
</div>
```

### 3. Flexbox Layouts

#### Responsive Flex Direction
```tsx
// Mobile: vertical stack → Desktop: horizontal row
<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
  <div className="flex-1">{primary}</div>
  <div>{secondary}</div>
</div>
```

#### Wrapping Flex Containers
```tsx
// Auto-wrap items based on available space
<div className="flex flex-wrap gap-3">
  {tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
</div>
```

### 4. Transform Scaling

#### Proportional Component Scaling
When you need to maintain exact proportions (like embedded demos):

```css
/* globals.css */
#demo-iframe-container {
  transform-origin: top center;
}

/* Mobile scaling */
@media (min-width: 380px) {
  #demo-iframe-container {
    transform: scale(0.82);
  }
}

@media (min-width: 475px) {
  #demo-iframe-container {
    transform: scale(0.88);
  }
}

/* Progressive enhancement to full size */
@media (min-width: 1536px) {
  #demo-iframe-container {
    transform: scale(1.0);
  }
}
```

**When to use transform scaling:**
- ✅ Embedded content (iframes, demos)
- ✅ Complex components that must maintain proportions
- ✅ Visual elements where aspect ratio is critical
- ❌ Regular text content
- ❌ Interactive elements (affects click targets)

---

## Typography & Spacing

### Responsive Typography

#### Fluid Typography with Clamp
```tsx
// Scales smoothly between min and max
<h1 className="text-[clamp(2.5rem,8vw,5rem)]">
  Heading Text
</h1>
```

#### Breakpoint-Based Typography
```tsx
// Discrete size changes at breakpoints
<h1 className="text-4xl md:text-5xl lg:text-6xl">
  Heading Text
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Body text
</p>
```

#### Custom Typography Scale
```css
/* tailwind.config.ts */
theme: {
  extend: {
    fontSize: {
      'hero-mobile': 'clamp(2.75rem, 10vw, 5.5rem)',
      'subtitle-mobile': 'clamp(1rem, 3vw, 1.25rem)',
    }
  }
}
```

### Line Height & Letter Spacing
```tsx
// Tighter leading on large headings
<h1 className="text-6xl leading-[0.9] tracking-tight">
  Compact Heading
</h1>

// Comfortable reading for body text
<p className="text-base leading-relaxed tracking-normal">
  Paragraph content
</p>
```

### Responsive Spacing

#### Padding System
```tsx
// Progressive padding increase
<section className="py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-12">
  {content}
</section>
```

#### Gap Utilities
```tsx
// Responsive gaps in flex/grid
<div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6">
  {items}
</div>
```

#### Custom Spacing Scale
```css
/* globals.css */
.px-responsive-sm { padding-left: 1rem; padding-right: 1rem; }
.px-responsive-md { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-responsive-lg { padding-left: 2rem; padding-right: 2rem; }
.px-responsive-xl { padding-left: 3rem; padding-right: 3rem; }

@media (min-width: 640px) {
  .px-responsive-lg { padding-left: 3rem; padding-right: 3rem; }
  .px-responsive-xl { padding-left: 4rem; padding-right: 4rem; }
}

@media (min-width: 1024px) {
  .px-responsive-lg { padding-left: 4rem; padding-right: 4rem; }
  .px-responsive-xl { padding-left: 6rem; padding-right: 6rem; }
}
```

---

## Component Patterns

### Navigation Components

#### Mobile: Hamburger Menu
```tsx
// Hidden on desktop, visible on mobile
<button className="md:hidden" onClick={toggleMobileMenu}>
  <Menu className="w-6 h-6" />
</button>

// Mobile menu overlay
{isMobileMenuOpen && (
  <nav className="md:hidden fixed inset-0 bg-background z-50">
    {menuItems}
  </nav>
)}
```

#### Desktop: Full Navigation
```tsx
// Hidden on mobile, visible on desktop
<nav className="hidden md:flex items-center gap-6">
  {menuItems}
</nav>
```

### Card Components

#### Responsive Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4 md:p-6">
    <CardHeader>
      <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-sm md:text-base">
      {content}
    </CardContent>
  </Card>
</div>
```

### Form Components

#### Responsive Form Layouts
```tsx
// Mobile: Stack vertically
// Desktop: Side-by-side fields
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input placeholder="First Name" />
    <Input placeholder="Last Name" />
  </div>
  
  <Input 
    type="email" 
    placeholder="Email"
    className="w-full md:w-2/3" 
  />
  
  <Button className="w-full md:w-auto">
    Submit
  </Button>
</form>
```

### Image Components

#### Responsive Images
```tsx
// Different aspect ratios per breakpoint
<div className="aspect-square md:aspect-video lg:aspect-[16/9]">
  <Image 
    src={imageSrc}
    alt={alt}
    fill
    className="object-cover"
  />
</div>
```

#### Responsive Image Sizing
```tsx
// Different sizes for different screens
<Image
  src={imageSrc}
  alt={alt}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto"
/>
```

### Modal/Dialog Components

#### Mobile: Full Screen
```tsx
<Dialog>
  <DialogContent className="w-full h-full md:w-auto md:h-auto md:max-w-2xl">
    {content}
  </DialogContent>
</Dialog>
```

### Sidebar Components

#### Responsive Sidebar Behavior
```tsx
// Mobile: Overlay/drawer
// Desktop: Fixed sidebar
const [sidebarOpen, setSidebarOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true); // Always open on desktop
    } else {
      setSidebarOpen(false); // Closed on mobile
    }
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

return (
  <>
    {/* Mobile overlay sidebar */}
    {sidebarOpen && (
      <div className="md:hidden fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <aside className="relative w-64 bg-background h-full">
          {sidebarContent}
        </aside>
      </div>
    )}
    
    {/* Desktop fixed sidebar */}
    <aside className="hidden md:block w-64 bg-background">
      {sidebarContent}
    </aside>
  </>
);
```

---

## Performance Optimization

### Lazy Loading

#### Component Lazy Loading
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // Client-side only if needed
});
```

#### Image Lazy Loading
```tsx
<Image
  src={src}
  alt={alt}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurData}
/>
```

### Conditional Rendering

#### Load Different Components Per Breakpoint
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

return isMobile ? <MobileComponent /> : <DesktopComponent />;
```

#### Hide vs Display None
```tsx
// ✅ Good: Removes from DOM on mobile
<div className="hidden md:block">
  {expensiveComponent}
</div>

// ❌ Bad: Renders but hides (still in DOM)
<div className="opacity-0 md:opacity-100">
  {expensiveComponent}
</div>
```

### CSS Performance

#### Use Transform Over Position
```css
/* ✅ Good: GPU accelerated */
.element {
  transform: translateX(100px);
}

/* ❌ Bad: Triggers layout */
.element {
  left: 100px;
}
```

#### Minimize Reflows
```css
/* Batch layout changes */
.container {
  /* All layout properties together */
  width: 100%;
  padding: 1rem;
  margin: 0 auto;
  max-width: 1200px;
}
```

---

## Mobile-First Approach

### Writing Mobile-First CSS

#### Base Styles = Mobile
```css
/* Mobile base (no media query needed) */
.card {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Enhance for larger screens */
@media (min-width: 640px) {
  .card {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .card {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

#### Tailwind Mobile-First Classes
```tsx
// These are mobile-first by default
<div className="text-sm md:text-base lg:text-lg">
  {/* 
    - Mobile: text-sm
    - 768px+: text-base
    - 1024px+: text-lg
  */}
</div>
```

### Mobile-First Decision Framework

When designing a component, ask:

1. **What's the minimum viable version?**
   - Strip to essential functionality
   - Remove decorative elements
   - Simplify interactions

2. **What can be hidden on mobile?**
   - Legends, labels, helper text
   - Secondary navigation
   - Redundant information

3. **What needs repositioning?**
   - CTA buttons (bottom on mobile, side on desktop)
   - Forms (stack on mobile, inline on desktop)
   - Navigation (hamburger vs full menu)

4. **What needs different interaction patterns?**
   - Hover states → tap states
   - Tooltips → modals
   - Multi-column → single column

---

## Testing & Validation

### Browser DevTools Testing

#### Chrome DevTools Device Mode
1. Open DevTools (F12 or Cmd+Option+I)
2. Toggle device toolbar (Cmd+Shift+M)
3. Test common devices:
   - iPhone SE (375px)
   - iPhone 12/13/14 (390px)
   - iPhone 14 Pro Max (430px)
   - iPad Mini (768px)
   - iPad Pro (1024px)

#### Responsive Design Mode
```
View → Toggle device size in browser:
- Safari: Cmd+Option+R
- Firefox: Cmd+Option+M
- Chrome: Cmd+Shift+M
```

### Real Device Testing

#### Priority Devices
1. **iPhone (iOS Safari)** - Most common
2. **Android Phone (Chrome)** - Second most common
3. **iPad (Safari)** - Tablet validation
4. **Android Tablet** - Android tablet validation

#### Testing Checklist
- [ ] Touch targets ≥ 44x44px
- [ ] Text readable without zoom
- [ ] Forms accessible with virtual keyboard
- [ ] Navigation accessible
- [ ] Images load appropriately
- [ ] No horizontal scroll
- [ ] Animations perform smoothly
- [ ] Gesture interactions work

### Automated Testing

#### Visual Regression Testing
```bash
# Using Percy or similar
npm run test:visual
```

#### Responsive Screenshot Testing
```bash
# Using Playwright
npx playwright test --project=mobile
npx playwright test --project=tablet
npx playwright test --project=desktop
```

### Accessibility Testing

#### Screen Reader Testing
- VoiceOver (iOS/macOS)
- TalkBack (Android)
- NVDA (Windows)

#### Keyboard Navigation
- Tab through all interactive elements
- Ensure logical focus order
- Test keyboard shortcuts

---

## Common Patterns & Solutions

### Pattern: Content Reordering

#### Problem: Desktop layout doesn't work on mobile

**Solution: Use flex order or grid reordering**

```tsx
// Desktop: Image left, content right
// Mobile: Content first, image second
<div className="flex flex-col md:flex-row">
  <div className="order-2 md:order-1">
    <Image src={src} alt={alt} />
  </div>
  <div className="order-1 md:order-2">
    {content}
  </div>
</div>
```

### Pattern: Progressive Disclosure

#### Problem: Too much information on mobile

**Solution: Hide non-essential content**

```tsx
// Show summary on mobile, full details on desktop
<Card>
  <CardHeader>{title}</CardHeader>
  <CardContent>
    <p>{summary}</p>
    <div className="hidden md:block mt-4">
      {detailedContent}
    </div>
  </CardContent>
</Card>
```

### Pattern: Touch-Friendly Targets

#### Problem: Click targets too small on mobile

**Solution: Larger touch targets for mobile**

```tsx
<button className="
  px-4 py-2 
  md:px-3 md:py-1.5 
  min-h-[44px] 
  md:min-h-[32px]
">
  Click Me
</button>
```

### Pattern: Responsive Tables

#### Problem: Tables don't fit on mobile

**Solution 1: Horizontal scroll**
```tsx
<div className="overflow-x-auto">
  <table className="min-w-[600px]">
    {tableContent}
  </table>
</div>
```

**Solution 2: Card layout on mobile**
```tsx
// Desktop: table, Mobile: stacked cards
<div className="hidden md:block">
  <table>{tableContent}</table>
</div>

<div className="md:hidden space-y-4">
  {data.map(row => (
    <Card key={row.id}>
      {/* Transform row into card */}
    </Card>
  ))}
</div>
```

### Pattern: Embedded Content Scaling

#### Problem: Iframe/embedded content overflows

**Solution: Aspect ratio container (preferred) or transform scale (use sparingly)**

```tsx
/* Method 1: Aspect ratio container (RECOMMENDED) */
<div className="aspect-video w-full">
  <iframe 
    src={src}
    className="w-full h-full"
  />
</div>
```

```css
/* Method 2: Transform scale (USE WITH CAUTION) */
.embed-container {
  transform: scale(0.85);
  transform-origin: top center;
}

@media (min-width: 768px) {
  .embed-container {
    transform: scale(1);
  }
}
```

**⚠️ Important: Transform Scale Considerations**

Transform scaling can cause significant issues in production environments:

**The Problem:**
- CSS `transform: scale()` applies to **both real mobile devices AND resized desktop windows**
- Media queries using `max-width` cannot distinguish between:
  - An actual iPhone viewing the site
  - A desktop browser window resized to 375px width
- This causes production mobile views to render incorrectly despite looking perfect in DevTools

**Why This Happens:**
When you test in Chrome DevTools mobile emulation, the browser:
1. Applies the viewport meta tag settings (`width=device-width`, etc.)
2. Simulates proper mobile rendering
3. Shows you the "correct" scaled version

But when you resize a desktop browser window to mobile dimensions:
1. It's still a desktop viewport (no mobile viewport constraints)
2. The transform scaling still applies via media queries
3. The result looks different from DevTools mobile view

**When to Avoid Transform Scaling:**
- ❌ Regular page content
- ❌ Text and typography
- ❌ Interactive elements (buttons, forms, etc.)
- ❌ When viewport settings alone can handle responsiveness
- ❌ Production sites that need consistent cross-device rendering

**When Transform Scaling is Acceptable:**
- ✅ Desktop-only content that needs proportional shrinking
- ✅ Print stylesheets or PDF generation
- ✅ Specific design requirements where aspect ratio must be preserved
- ✅ Complex embedded widgets that break otherwise (last resort)

**Best Practice Solution:**
Use proper responsive design with viewport settings and let browsers handle native rendering:

```tsx
// layout.tsx - Proper viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

```css
/* globals.css - No transform scaling */
.embed-container {
  width: 100%;
  /* Let the content respond naturally */
}

/* Use aspect-ratio for iframe containers */
.demo-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 400px;
}
```

```tsx
// Responsive padding without scaling
<div className="px-4 md:px-8 lg:px-12">
  <div className="aspect-video w-full">
    <iframe src={demoUrl} className="w-full h-full" />
  </div>
</div>
```

**Testing Protocol:**
1. Test in Chrome DevTools mobile emulation ✓
2. Resize desktop browser window to mobile size ✓
3. **Deploy and test on actual mobile device ✓✓** (most important)
4. If desktop window resize looks different from DevTools → likely a transform scaling issue
5. If production mobile looks different from DevTools → definitely a transform scaling issue

**The Fix:**
Remove all transform scaling media queries and rely on:
- Proper viewport meta tags
- Responsive Tailwind classes
- Natural content reflow
- Aspect ratio containers for embedded content

This ensures consistent rendering across:
- Chrome DevTools mobile emulation
- Desktop window resizing
- Actual mobile devices in production

---

## Best Practices Summary

### DO ✅

- **Start with mobile** and enhance progressively
- **Test on real devices** early and often
- **Use semantic HTML** for better accessibility
- **Minimize layout shifts** during responsive transitions
- **Optimize images** for different screen sizes
- **Use CSS custom properties** for consistent spacing
- **Hide non-essential content** on mobile
- **Make touch targets ≥ 44px** on mobile
- **Use transform** for animations (GPU accelerated)
- **Test with slow network** conditions

### DON'T ❌

- **Don't start with desktop** and scale down
- **Don't rely on hover states** for mobile
- **Don't use fixed pixel widths** for containers
- **Don't forget about landscape orientation**
- **Don't use tiny fonts** (< 16px base on mobile)
- **Don't create horizontal scroll** (except intentional carousels)
- **Don't forget about keyboard navigation**
- **Don't use too many breakpoints** (3-5 is usually enough)
- **Don't load desktop assets** on mobile
- **Don't forget about touch gestures** (swipe, pinch, etc.)

---

## Quick Reference

### Tailwind Responsive Utilities

```tsx
// Display
className="hidden md:block"          // Hidden mobile, visible desktop
className="block md:hidden"          // Visible mobile, hidden desktop

// Flexbox
className="flex-col md:flex-row"    // Stack mobile, row desktop
className="items-start md:items-center"

// Grid
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Spacing
className="p-4 md:p-6 lg:p-8"       // Progressive padding
className="gap-2 md:gap-4 lg:gap-6" // Progressive gaps

// Typography
className="text-sm md:text-base lg:text-lg"
className="text-2xl md:text-4xl lg:text-6xl"

// Width
className="w-full md:w-1/2 lg:w-1/3"
className="max-w-sm md:max-w-md lg:max-w-lg"
```

### Common Breakpoint Values

| Device | Width | Breakpoint |
|--------|-------|------------|
| Mobile Portrait | 375px | Base (no prefix) |
| Mobile Landscape | 640px | `sm:` |
| Tablet Portrait | 768px | `md:` |
| Tablet Landscape | 1024px | `lg:` |
| Desktop | 1280px | `xl:` |
| Large Desktop | 1536px | `2xl:` |

---

## Resources & Tools

### Design Tools
- **Figma** - Responsive design prototyping
- **Responsively App** - Multi-device testing
- **BrowserStack** - Real device testing

### Development Tools
- **Chrome DevTools** - Device simulation
- **React Developer Tools** - Component inspection
- **Tailwind CSS IntelliSense** - Class suggestions

### Testing Tools
- **Lighthouse** - Performance & accessibility auditing
- **WebPageTest** - Performance testing
- **axe DevTools** - Accessibility testing

### Documentation
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web.dev Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)

---

## Changelog

### 2025-01-16
- Initial guide creation
- Documented mobile-first approach
- Added transform scaling patterns
- Included component patterns from Soloist project
- Added testing & validation section

---

**Last Updated:** January 16, 2025  
**Maintained by:** ACDC Digital Team  
**Version:** 1.0.0
