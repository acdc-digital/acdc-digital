# ACDC Digital Font Management

This directory contains font documentation, guidelines, and assets for the ACDC Digital workspace.

## 📚 Overview

We standardize on **Google Fonts** for consistency, performance, and accessibility across all projects in our monorepo workspace.

## 🎯 Font Philosophy

- **Consistency**: Use a limited, curated set of fonts across projects
- **Performance**: Leverage Next.js font optimization with `next/font/google`
- **Accessibility**: Choose fonts with excellent readability and support
- **Brand Cohesion**: Maintain visual consistency across the ACDC Digital ecosystem

## 📋 Current Font Usage

### Active Fonts by Project

| Project | Primary Font | Usage | Implementation |
|---------|-------------|-------|----------------|
| `home` | Rubik | Headers, body text | `next/font/google` |

### Font Details

#### **Rubik**
- **Type**: Sans-serif
- **Google Fonts**: [Rubik](https://fonts.google.com/specimen/Rubik)
- **Weights Used**: 300-900 (variable)
- **Subsets**: Latin
- **Character**: Modern, rounded, friendly
- **Best For**: Headers, UI elements, body text
- **Projects**: `home`

---

## 📖 Quick Reference

### Implementation Example (Next.js)

```typescript
import { Rubik } from 'next/font/google'

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik' // Optional: for CSS variables
})

export default function Layout({ children }) {
  return (
    <html className={rubik.variable}>
      <body className={rubik.className}>
        {children}
      </body>
    </html>
  )
}
```

### CSS Usage

```css
/* Using the font class */
.title {
  font-family: var(--font-rubik), sans-serif;
}

/* Using Tailwind with the font */
<h1 className={`text-4xl ${rubik.className}`}>Title</h1>
```

---

## 🔄 Updates

**Last Updated**: September 15, 2025  
**Next Review**: When adding new projects or fonts

For font guidelines and standards, see [`FONT_GUIDELINES.md`](./FONT_GUIDELINES.md)  
For detailed project font usage, see [`FONT_REGISTRY.md`](./FONT_REGISTRY.md)