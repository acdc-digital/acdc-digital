# Font Usage Tracking Template

Use this template when adding fonts to new projects or updating existing ones.

## 📝 New Font Entry Template

```markdown
### Project Name (`/project-folder`)

**Primary Font**: [Font Name] (Google Fonts)

Implementation:
```typescript
// File: /project-folder/app/layout.tsx
import { FontName } from 'next/font/google';

const fontName = FontName({ 
  subsets: ['latin'],
  weight: ['400', '700'], // specify weights
  variable: '--font-name', // Required for Tailwind integration
  display: 'swap'
});
```

```css
/* File: /project-folder/app/globals.css */
@theme {
  --font-sans: var(--font-name), ui-sans-serif, system-ui, sans-serif;
  --font-primary: var(--font-name), ui-sans-serif, system-ui, sans-serif;
}
```

**Usage Locations**:
- [ ] Layout (global)
- [ ] Headers (H1-H6)  
- [ ] Body text
- [ ] UI components
- [ ] Other: ___________

**Specifications**:
| Property | Value |
|----------|--------|
| **Family** | Font Name |
| **Type** | Variable/Static |
| **Weights** | 300, 400, 700 |
| **Subsets** | Latin |
| **Display** | Swap |

**Performance Notes**:
- [ ] Uses next/font/google
- [ ] Includes fallbacks
- [ ] Optimized loading
- [ ] No unused weights
```

---

## 🔧 Quick Commands

### Font Audit Command
```bash
# Search for font imports across projects
grep -r "from 'next/font/google'" --include="*.tsx" --include="*.ts" .
```

### Performance Check
```bash
# Check bundle size impact (run in project directory)
npm run build -- --analyze
```

---

## 📊 Font Usage Summary

| Project | Primary Font | Secondary Font | Status |
|---------|-------------|----------------|---------|
| home | Rubik | - | ✅ Active |
| [new-project] | [font] | [font] | 🚧 Planning |

---

## 🎯 Next Actions

### Upcoming Font Decisions
- [ ] Choose serif for content-heavy projects
- [ ] Standardize monospace for code blocks
- [ ] Consider display font for marketing materials

### Maintenance Tasks
- [ ] Audit unused font weights quarterly
- [ ] Performance review every 6 months  
- [ ] Update guidelines as needed

---

**Template Version**: 1.0  
**Last Updated**: September 15, 2025