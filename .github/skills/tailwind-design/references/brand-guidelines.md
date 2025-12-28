# ACDC Digital Brand Guidelines for Tailwind

## Color System

### Primary Brand Colors

```js
// tailwind.config.ts extend colors
acdc: {
  primary: '#007acc',      // Technical Blue
  secondary: '#1e1e1e',    // Professional Black
  accent: '#8b5cf6',       // AI Purple
},
```

### Status Colors

```js
status: {
  success: '#10b981',      // Green - Success, live
  warning: '#f59e0b',      // Amber - Warnings
  error: '#ef4444',        // Red - Errors
  info: '#3b82f6',         // Electric Blue
},
```

### Project-Specific Extensions

```js
// SMNB News Intelligence
smnb: {
  'deep-space': '#0f0f1e',
  'midnight': '#1a1a2e',
},

// AURA Console Theme
aura: {
  console: '#1e1e1e',
  terminal: '#252526',
},
```

## Typography Scale

```js
// tailwind.config.ts extend fontSize
fontSize: {
  'xs': 'clamp(0.75rem, 1vw, 0.8125rem)',
  'sm': 'clamp(0.875rem, 1.25vw, 0.9375rem)',
  'base': 'clamp(1rem, 1.5vw, 1.125rem)',
  'lg': 'clamp(1.125rem, 2vw, 1.25rem)',
  'xl': 'clamp(1.25rem, 2.5vw, 1.5rem)',
  '2xl': 'clamp(1.5rem, 3vw, 1.875rem)',
  '3xl': 'clamp(1.875rem, 4vw, 2.25rem)',
  '4xl': 'clamp(2.25rem, 5vw, 3rem)',
  'hero': 'clamp(3rem, 8vw, 6rem)',
},
```

## Font Families

```js
fontFamily: {
  sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
  serif: ['Playfair Display', 'Crimson Text', 'serif'],
  mono: ['JetBrains Mono', 'Cascadia Code', 'SF Mono', 'monospace'],
},
```

## Spacing (8px Grid)

Use Tailwind's default spacing which is based on 4px units:
- `space-1` = 4px
- `space-2` = 8px (base unit)
- `space-4` = 16px
- `space-6` = 24px
- `space-8` = 32px

## Border Radius

```js
borderRadius: {
  'sm': '0.25rem',   // 4px
  'md': '0.5rem',    // 8px
  'lg': '0.75rem',   // 12px
  'xl': '1rem',      // 16px
  '2xl': '1.5rem',   // 24px
},
```

## Shadows

```js
boxShadow: {
  'glow': '0 0 20px rgba(0, 122, 204, 0.3)',
  'glow-lg': '0 0 40px rgba(0, 122, 204, 0.4)',
  'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
  'card-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
},
```

## Animation Timing

```js
transitionTimingFunction: {
  'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
},
transitionDuration: {
  '250': '250ms',
},
```

## Container Widths

```js
maxWidth: {
  'content': '65ch',   // Reading content
  'wide': '80ch',      // Wide content
},
```
