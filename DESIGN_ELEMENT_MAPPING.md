# Design Element Mapping Across ACDC Digital Monorepo

*Comprehensive analysis connecting package-specific design elements to unified brand guidelines*

---

## Package Overview

| Package | Purpose | Design Theme | Primary Audience |
|---------|---------|--------------|------------------|
| **acdc-digital** | Main company platform | VS Code-inspired IDE aesthetic | Developers, technical teams |
| **smnb** | AI news intelligence platform | News-focused with glass morphism | News consumers, analysts |
| **aura** | Social media AI agent platform | Console/terminal interface | Social media managers, creators |
| **ruuf** | Model Context Protocol platform | Clean, minimal professional | AI developers, integrators |

---

## Detailed Design Element Analysis

### 1. Typography Systems

| Brand Element | acdc-digital | smnb | aura | ruuf | Recommended Standard |
|---------------|--------------|------|------|------|---------------------|
| **Primary Font** | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto` | `-apple-system, "SF Pro Display", "SF Pro Text", system-ui` | `"Cascadia Code", monospace` | `-apple-system, system-ui` | **SF Pro Display/Text** for UI, system fallbacks |
| **Display Font** | System sans | `'Playfair Display', 'Libre Baskerville', serif` | System sans | System sans | **Playfair Display** for editorial, **SF Pro** for UI |
| **Headline Font** | System sans | `'Crimson Text', 'Source Serif 4', serif` | System sans | System sans | **Crimson Text** for content, **SF Pro Semibold** for UI |
| **Body Font** | System sans | `'Inter', 'Work Sans', sans-serif` | System sans | System sans | **Inter** primary, **SF Pro Text** fallback |
| **Monospace Font** | System mono | `'JetBrains Mono', 'Geist Mono', monospace` | `'Cascadia Code', monospace` | System mono | **JetBrains Mono** primary, **Cascadia Code** for terminals |

#### Typography Scale Analysis
```css
/* SMNB (Most comprehensive scale) */
--text-hero: clamp(3rem, 8vw, 6rem);
--text-display: clamp(2rem, 5vw, 4rem);
--text-subtitle: clamp(1.25rem, 3vw, 1.5rem);

/* AURA (Console-focused) */
--console-header: 11px;
--console-output: 12px;
--console-timestamp: 11px;

/* Unified Recommendation */
--text-xs: 0.75rem;     /* 12px - Console, meta */
--text-sm: 0.875rem;    /* 14px - UI elements */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Large body */
--text-xl: 1.25rem;     /* 20px - Small headlines */
--text-2xl: 1.5rem;     /* 24px - Section headers */
--text-3xl: 1.875rem;   /* 30px - Page titles */
--text-4xl: 2.25rem;    /* 36px - Display headers */
--text-hero: clamp(3rem, 8vw, 6rem); /* Responsive hero text */
```

### 2. Color Palette Systems

| Brand Element | acdc-digital | smnb | aura | ruuf | Unified Standard |
|---------------|--------------|------|------|------|------------------|
| **Primary Brand** | `#007acc` (VS Code Blue) | `#3b82f6` (Electric Blue) | `#007acc` (VS Code Blue) | Not defined | **#007acc** (Technical Blue) |
| **Secondary** | `#2d2d30` (Dark Gray) | `#1a1a2e` (Midnight Blue) | `#252526` (VS Code Gray) | Not defined | **#1e1e1e** (Professional Black) |
| **Accent/AI** | Not defined | `#8b5cf6` (AI Purple) | Not defined | Not defined | **#8b5cf6** (AI Intelligence Purple) |
| **Success** | Not defined | `#10b981` (Green) | `#4ec9b0` (VS Code Green) | Not defined | **#10b981** (Standard Green) |
| **Warning** | Not defined | `#f59e0b` (Amber) | `#ce9178` (VS Code Orange) | Not defined | **#f59e0b** (Standard Amber) |
| **Error** | Not defined | `#ef4444` (Red) | `#f48771` (VS Code Red) | Not defined | **#ef4444** (Standard Red) |
| **Info** | Not defined | `#3b82f6` (Blue) | `#569cd6` (VS Code Blue) | Not defined | **#3b82f6** (Information Blue) |

#### Application-Specific Color Themes

**SMNB News Intelligence Colors:**
```css
--smnb-deep-space: #0f0f1e;
--smnb-midnight: #1a1a2e;
--smnb-breaking: #ef4444;      /* Urgent news */
--smnb-developing: #f59e0b;    /* Evolving stories */
--smnb-analysis: #3b82f6;      /* Analysis content */
--smnb-human-interest: #10b981; /* Community stories */
```

**AURA Console Colors:**
```css
--vscode-bg-primary: #1e1e1e;
--vscode-bg-secondary: #252526;
--vscode-text-primary: #ffffff;
--vscode-text-secondary: #cccccc;
--vscode-accent-primary: #007acc;
```

### 3. Spacing & Layout Systems

| Element | acdc-digital | smnb | aura | ruuf | Unified Standard |
|---------|--------------|------|------|------|------------------|
| **Container Padding** | `2rem` | `0.5rem` (editor), `2rem` (layout) | Not specified | Not specified | **1.5rem** (24px) default |
| **Component Spacing** | Not systematized | `1rem, 1.5rem, 2rem` | `4px, 8px, 12px, 16px, 24px` | Not specified | **4px, 8px, 16px, 24px, 32px** |
| **Border Radius** | `var(--radius)` (calculated) | `0.625rem` (10px) | Not specified | Not specified | **6px** small, **8px** medium, **12px** large |
| **Max Width** | `1400px` (2xl container) | `65ch` (content), `80ch` (wide) | Not specified | Not specified | **1200px** (standard), **800px** (narrow) |

#### Grid Systems Analysis
```css
/* SMNB Layout Pattern */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 2fr; /* Sidebar + Main */
}

/* AURA IDE Pattern */
.ide-layout {
  display: grid;
  grid-template-columns: auto 1fr auto; /* Activity + Main + Terminal */
}

/* Unified Recommendation */
.layout-two-column { grid-template-columns: 1fr 2fr; }
.layout-three-column { grid-template-columns: auto 1fr auto; }
.layout-sidebar { grid-template-columns: 280px 1fr; }
```

### 4. Component Patterns

| Component | acdc-digital | smnb | aura | ruuf | Best Practice |
|-----------|--------------|------|------|------|---------------|
| **Button Primary** | Radix-based with CSS vars | Custom with hover animations | Minimal text-based | Shadcn/ui standard | **Shadcn/ui** with brand colors |
| **Button Hover** | Not specified | `transform: scale(1.05)` | `opacity: 0.8` | Standard | **translateY(-2px)** + shadow |
| **Card Background** | `hsl(var(--card))` | Glass morphism effects | VS Code dark surfaces | Standard | **Glass effects** for SMNB, **solid** for others |
| **Input Focus** | `hsl(var(--ring))` | Purple focus ring | VS Code blue | Standard | **Brand primary** with 3px shadow |
| **Status Indicators** | Not implemented | Pulsing dots with colors | Text-based status | Not implemented | **Pulsing dots** with semantic colors |

#### Glass Morphism Implementation (SMNB)
```css
.glass-subtle {
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.glass-card {
  backdrop-filter: blur(16px) saturate(160%);
  background: rgba(31, 31, 31, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.08);
}
```

### 5. Animation & Interaction Patterns

| Element | acdc-digital | smnb | aura | ruuf | Unified Standard |
|---------|--------------|------|------|------|------------------|
| **Transition Duration** | `0.2s` (accordion) | Not specified | Not specified | Not specified | **250ms** standard |
| **Easing Function** | `ease-out` | Not specified | Not specified | Not specified | **cubic-bezier(0.4, 0, 0.2, 1)** |
| **Hover Effects** | Not specified | `scale(1.05)`, `translateY(-1px)` | `opacity: 0.8` | Not specified | **translateY(-2px)** + shadow increase |
| **Loading States** | Not specified | Not specified | Not specified | Not specified | **Pulse animation** for loading |
| **Focus Indicators** | Ring outline | Not specified | VS Code blue border | Not specified | **3px shadow** in brand color |

#### Animation Keyframes
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes slide-in {
  from { 
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6. Dark Mode Implementation

| Package | Dark Mode Strategy | Implementation | Quality |
|---------|-------------------|----------------|---------|
| **acdc-digital** | CSS custom properties with `.dark` class | Complete with VS Code theme | ✅ Excellent |
| **smnb** | CSS custom properties with `.dark` class | Complete with OKLCH colors | ✅ Excellent |
| **aura** | VS Code theme variables | Built-in dark theme | ✅ Excellent |
| **ruuf** | CSS custom properties | Basic implementation | ⚠️ Good |

#### Dark Mode Color Mapping
```css
/* Light Mode Base */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

/* Dark Mode Override */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

---

## Inconsistencies & Harmonization Opportunities

### Critical Issues to Address

1. **Typography Fragmentation**
   - **Issue**: Four different primary font stacks across packages
   - **Solution**: Standardize on SF Pro Display/Text with Inter fallback
   - **Impact**: Improved consistency and loading performance

2. **Color Palette Divergence**
   - **Issue**: Different interpretations of brand blue (#007acc vs #3b82f6)
   - **Solution**: Establish #007acc as primary, #3b82f6 as accent
   - **Impact**: Stronger brand recognition

3. **Spacing System Gaps**
   - **Issue**: Only AURA has systematic spacing scale
   - **Solution**: Implement 8px base grid across all packages
   - **Impact**: Visual harmony and easier responsive design

4. **Component Style Variations**
   - **Issue**: Different button, form, and card implementations
   - **Solution**: Create shared component library
   - **Impact**: Reduced development time, consistent UX

### Recommended Harmonization Steps

#### Phase 1: Foundation (Immediate)
1. **Color Variables**: Implement unified color system across all packages
2. **Typography Scale**: Standardize font sizes and weights
3. **Spacing System**: Implement consistent spacing variables

#### Phase 2: Components (1-2 weeks)
1. **Button Standardization**: Align all button styles to unified system
2. **Form Elements**: Standardize inputs, selects, and form layouts
3. **Card Components**: Harmonize card designs while preserving unique characteristics

#### Phase 3: Advanced (2-4 weeks)
1. **Animation Library**: Create shared animation utilities
2. **Layout Systems**: Standardize grid and container patterns
3. **Accessibility**: Ensure WCAG 2.1 AA compliance across all packages

---

## Implementation Recommendations

### Shared Design Token System
```css
/* tokens.css - Shared across all packages */
:root {
  /* Brand Colors */
  --brand-primary: #007acc;
  --brand-secondary: #1e1e1e;
  --brand-accent: #8b5cf6;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-headline: 'Crimson Text', serif;
  --font-body: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### Package-Specific Customizations
Each package can extend the base system while maintaining core consistency:

```css
/* smnb-overrides.css */
:root {
  --glass-opacity: 0.9;
  --news-breaking: var(--color-error);
  --news-developing: var(--color-warning);
}

/* aura-overrides.css */
:root {
  --console-bg: #1e1e1e;
  --terminal-text: #cccccc;
  --console-accent: var(--brand-primary);
}
```

This approach maintains brand consistency while preserving the unique character of each application.

---

*Next: Generate unified brand guidelines with specific implementation recommendations*