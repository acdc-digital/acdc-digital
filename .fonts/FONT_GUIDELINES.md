# Font Guidelines - ACDC Digital

## 🎯 Core Principles

### 1. Google Fonts Only
- **Standard**: All projects must use Google Fonts via `next/font/google`
- **Reason**: Consistent optimization, loading performance, and reliability
- **Exception**: System fonts as fallbacks only

### 2. Font Limit
- **Maximum**: 2-3 font families per project
- **Recommended**: 1-2 font families (primary + optional accent)
- **Rationale**: Maintains performance and visual cohesion

### 3. Weight Optimization
- **Use Variable Fonts** when available for flexibility
- **Limit Weights**: Only load weights you actually use
- **Typical Range**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

---

## 🏗 Implementation Standards

### Tailwind CSS v4 Compliance

All font implementations must follow Tailwind CSS v4 typography patterns:

1. **Use CSS Custom Properties**: Define fonts in `@theme` blocks
2. **CSS Variables Required**: All Next.js fonts must include `variable` option
3. **Tailwind Utilities**: Use `font-*` classes instead of custom CSS
4. **Proper Fallbacks**: Follow Tailwind's ui-* font stack conventions

## 🏗 Implementation Standards

### Next.js Implementation (Required)

```typescript
// ✅ CORRECT: Use next/font/google with CSS variables
import { FontName } from 'next/font/google'

const fontName = FontName({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Specify only needed weights
  variable: '--font-name', // Required for Tailwind integration
  display: 'swap' // For better performance
})

// Apply CSS variable in layout
<html className={fontName.variable}>
<body className="font-primary"> {/* Use Tailwind utility */}
```

```typescript
// ❌ INCORRECT: Don't use @import or link tags
// Don't do this in CSS:
// @import url('https://fonts.googleapis.com/css2?family=Font+Name')
```

### Tailwind CSS v4 Font Integration (Required)

```css
/* Define in globals.css using @theme */
@theme {
  --font-primary: var(--font-rubik), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-rubik), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-rubik), ui-sans-serif, system-ui, sans-serif;
}
```

```typescript
// Next.js implementation with CSS variables
import { Rubik } from 'next/font/google'

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik', // Required for CSS custom properties
  display: 'swap'
})

// Apply in layout
<body className={`${rubik.variable} font-primary`}>
```

```html
<!-- Use Tailwind utilities -->
<h1 class="font-primary">Primary font</h1>
<h2 class="font-display">Display font</h2>
<p class="font-sans">Body text</p>
```

---

## 📐 Typography Scale

### Hierarchy Standards

```css
/* Recommended font sizes (using Tailwind classes) */
.display: text-9xl    /* 128px - Hero titles */
.h1: text-6xl        /* 60px - Page titles */  
.h2: text-4xl        /* 36px - Section titles */
.h3: text-2xl        /* 24px - Subsection titles */
.h4: text-xl         /* 20px - Component titles */
.body: text-base     /* 16px - Body text */
.caption: text-sm    /* 14px - Captions, meta */
.small: text-xs      /* 12px - Fine print */
```

### Weight Assignments

| Element | Weight | Tailwind Class |
|---------|---------|----------------|
| Display/Hero | 900 | `font-black` |
| H1-H2 | 700 | `font-bold` |
| H3-H4 | 600 | `font-semibold` |
| Body Bold | 500 | `font-medium` |
| Body Regular | 400 | `font-normal` |
| Body Light | 300 | `font-light` |

---

## 🎨 Approved Font Categories

### Primary Fonts (UI & Headers)

#### **Sans-Serif - Modern & Clean**
- ✅ **Rubik** - Currently used, rounded & friendly
- ✅ **Inter** - Excellent for UI, high readability
- ✅ **Manrope** - Geometric, professional
- ✅ **Plus Jakarta Sans** - Modern, versatile

#### **Sans-Serif - Geometric**  
- ✅ **Nunito** - Rounded, approachable
- ✅ **Outfit** - Display-focused, strong
- ✅ **Space Grotesk** - Technical, modern

### Secondary Fonts (Content & Accents)

#### **Serif - Content & Elegance**
- ✅ **Crimson Text** - Reading-focused
- ✅ **Lora** - Blog content, elegant
- ✅ **Playfair Display** - Headers, sophisticated

#### **Monospace - Code & Technical**
- ✅ **JetBrains Mono** - Code, developer-focused
- ✅ **Source Code Pro** - Technical content
- ✅ **Fira Code** - Programming, ligatures

### ❌ Fonts to Avoid
- **Comic fonts** (Comic Neue, etc.)
- **Overly decorative fonts**
- **Fonts with poor mobile readability**
- **Fonts without variable weight options**

---

## 🚀 Performance Guidelines

### Loading Strategy

```typescript
// ✅ Optimal loading
const font = FontName({ 
  subsets: ['latin'], // Only include needed character sets
  weight: ['400', '700'], // Only weights you'll use
  display: 'swap', // Prevent layout shift
  preload: true, // For critical fonts
})
```

### Tailwind Font Fallback Strategy

```css
/* Define proper fallback chains in @theme */
@theme {
  /* Sans-serif fonts */
  --font-sans: var(--font-rubik), ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  --font-primary: var(--font-rubik), ui-sans-serif, system-ui, sans-serif;
  
  /* Serif fonts (when needed) */
  --font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  
  /* Monospace fonts */
  --font-mono: ui-monospace, 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
```

```html
<!-- Use Tailwind utilities with proper fallbacks -->
<p class="font-sans">Uses --font-sans with system fallbacks</p>
<p class="font-primary">Uses custom primary font</p>
<code class="font-mono">Uses monospace with system fallbacks</code>
```

---

## 📋 Project Checklist

### Before Adding New Fonts

- [ ] Check if existing fonts can serve the purpose
- [ ] Verify font supports all needed weights
- [ ] Confirm font has good mobile readability
- [ ] Test loading performance impact
- [ ] Update font registry documentation
- [ ] Consider font pairing with existing fonts

### Implementation Checklist

- [ ] Use `next/font/google` import
- [ ] Include `variable: '--font-name'` option
- [ ] Specify only needed subsets
- [ ] Include only required weights  
- [ ] Define font in `@theme` block in globals.css
- [ ] Use Tailwind `font-*` utility classes
- [ ] Include proper ui-* fallback fonts
- [ ] Test across devices/browsers
- [ ] Update documentation

### Tailwind CSS v4 Compliance Checklist

- [ ] Font defined in `@theme { --font-*: ... }`
- [ ] CSS variable applied to `<html>` element
- [ ] Uses `font-sans`, `font-primary`, etc. utility classes
- [ ] Includes ui-sans-serif, ui-serif, or ui-monospace in fallback stack
- [ ] No custom CSS font-family declarations (use utilities only)

---

## 🔄 Maintenance

### Regular Audits
- **Frequency**: Every 6 months or when adding projects
- **Check**: Unused fonts, performance impact, consistency
- **Update**: Registry and guidelines as needed

### Documentation Updates
- **When**: Adding/removing fonts from any project  
- **Where**: Update `FONT_REGISTRY.md` and this file
- **Who**: Developer implementing the change

---

## 🤝 Approval Process

### New Font Requests
1. **Justify Need**: Explain why existing fonts don't work
2. **Performance Check**: Verify minimal impact  
3. **Design Review**: Ensure brand consistency
4. **Documentation**: Update registry before implementation

### Emergency Additions
- Document immediately after implementation
- Schedule review for next maintenance cycle

---

**Guidelines Version**: 1.0  
**Last Updated**: September 15, 2025  
**Next Review**: March 15, 2026