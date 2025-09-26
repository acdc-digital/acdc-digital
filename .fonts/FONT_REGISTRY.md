# Font Registry - ACDC Digital

## 🏠 Home Package (`/home`)

### Font Implementation Details

**Primary Font**: Rubik (Google Fonts)

```typescript
// File: /home/app/layout.tsx
import { Rubik } from 'next/font/google';

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik' // CSS variable for Tailwind integration
});
```

```typescript
// File: /home/app/page.tsx  
import { Rubik } from 'next/font/google'

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik' // CSS variable for Tailwind integration
})
```

### Usage Locations

#### Layout (`/home/app/layout.tsx`)
- **HTML Element**: CSS variable applied via `${rubik.variable}`
- **Body Element**: Uses Tailwind utility class
- **Scope**: Entire application
- **Implementation**: 
  ```html
  <html className={rubik.variable}>
  <body className="min-h-screen bg-background text-foreground font-sans">
  ```

#### Homepage (`/home/app/page.tsx`)
- **Main Heading**: Uses Tailwind font utility
- **Usage**: `<h1 className="text-9xl font-bold text-foreground font-sans">`
- **Element**: Main "acdc.digital" title

#### Global CSS (`/home/app/globals.css`)
- **Tailwind Theme**: Define custom font properties
- **Implementation**:
  ```css
  @theme {
    --font-sans: var(--font-rubik), ui-sans-serif, system-ui, sans-serif;
  }
  ```

#### Global CSS (`/home/app/globals.css`)
- **Fallback Fonts**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Font Features**: `"rlig" 1, "calt" 1` (ligatures and contextual alternates)

### Font Specifications

| Property | Value |
|----------|--------|
| **Family** | Rubik |
| **Type** | Variable Font |
| **Weights** | 300-900 |
| **Subsets** | Latin |
| **Display** | Swap |
| **Fallback** | System fonts (Apple System, Segoe UI, Roboto) |

### Performance Notes

- ✅ Uses Next.js `next/font/google` for optimal loading
- ✅ Font display swap for better user experience  
- ✅ Includes proper fallback fonts
- ✅ Font optimization enabled automatically

---

## 🎨 Font Pairing Notes

### Current Combinations
- **Rubik**: Used for both headings and body text (monofont approach)
- **Fallback Chain**: System fonts provide excellent cross-platform consistency

### Recommendations
- Consider adding a complementary serif for future content-heavy projects
- Rubik works well for UI, branding, and readability across all screen sizes

---

## 📊 Load Performance

| Font | Size | Load Strategy | Impact |
|------|------|---------------|---------|
| Rubik | Variable (optimized) | `next/font/google` | Minimal - preloaded & optimized |

---

**Last Updated**: September 15, 2025  
**Audited by**: GitHub Copilot  
**Next Audit**: When fonts are added/changed in any project