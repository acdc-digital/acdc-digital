# SmolAccount Dashboard Implementation

## Project Overview

SmolAccount is a financial management platform built specifically for tradies (tradespeople), featuring a VS Code-inspired dashboard interface built with Next.js 15, React 19, and Tailwind CSS.

## Implementation Status

✅ **Completed Components:**
1. Header - Top bar with app branding
2. ActivityBar - Left navigation with icon buttons
3. SidePanel - Context-specific sidebar using shadcn
4. Editor - Main content area with tabbed interface
5. Navigator - Placeholder for future navigation
6. Terminal - Right-side expandable terminal using shadcn Sheet
7. Footer - Status bar with app information

## Tech Stack

- **Framework**: Next.js 15.5.4
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Language**: TypeScript 5

## Project Structure

```
tradies/smolaccount/
├── app/
│   ├── dashboard/
│   │   ├── _components/         # Dashboard UI components
│   │   │   ├── Header.tsx       # Top bar (32px)
│   │   │   ├── ActivityBar.tsx  # Left nav (48px wide)
│   │   │   ├── SidePanel.tsx    # Context sidebar (240px)
│   │   │   ├── Editor.tsx       # Main content area
│   │   │   ├── Navigator.tsx    # Future nav menu (placeholder)
│   │   │   ├── Terminal.tsx     # Right terminal sidebar
│   │   │   ├── Footer.tsx       # Status bar (22px)
│   │   │   ├── index.ts         # Component exports
│   │   │   └── README.md        # Component documentation
│   │   └── dashboard.tsx        # Main Dashboard container
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage (renders Dashboard)
│   └── globals.css              # Global styles and theme
├── components/
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── sidebar.tsx
│       ├── sheet.tsx
│       └── ...
├── lib/
│   └── utils.ts                 # Utility functions
└── package.json
```

## Layout Architecture

The dashboard uses a flex-based layout system:

```
┌─────────────────────────────────────────────────┐
│ Header (h-8 = 32px)                             │
├──┬────────────────────────────────────────────┬─┤
│A │ ┌────────────┬──────────────────────────┐ │T│
│C │ │            │                          │ │E│
│T │ │ SidePanel  │  Editor (Main Content)   │ │R│
│I │ │  (240px)   │  - Tab Bar (35px)        │ │M│
│V │ │            │  - Content Area          │ │I│
│I │ │            │  - Data Visualizations   │ │N│
│T │ │            │                          │ │A│
│Y │ └────────────┴──────────────────────────┘ │L│
│  │                                            │ │
│B │                                            │ │
│A │                                            │ │
│R │                                            │ │
│  │                                            │ │
│48│                                            │R│
│px│                                            │i│
│  │                                            │g│
│  │                                            │h│
│  │                                            │t│
├──┴────────────────────────────────────────────┴─┤
│ Footer (h-[22px])                               │
└─────────────────────────────────────────────────┘
```

## Component Hierarchy

```tsx
<Dashboard>
  <Header />
  <div> {/* Main content area */}
    <ActivityBar />
    <div> {/* Work area */}
      <SidebarProvider>
        <SidePanel />
      </SidebarProvider>
      <Editor />
      <Terminal /> {/* Floating right sidebar */}
    </div>
  </div>
  <Navigator /> {/* Hidden placeholder */}
  <Footer />
</Dashboard>
```

## Dark Theme Colors

The dashboard uses a consistent dark color palette:

| Element | Color | Usage |
|---------|-------|-------|
| Background (darkest) | `#0e0e0e` | Main container |
| Background (dark) | `#181818` | Header, ActivityBar |
| Background (medium) | `#1e1e1e` | SidePanel, Editor, Terminal |
| Background (panels) | `#252526` | Content cards |
| Borders | `#2d2d2d` | All borders |
| Accent (blue) | `#007acc` | Active states, highlights |
| Text (primary) | `#cccccc` | Main text |
| Text (secondary) | `#858585` | Secondary text |
| Text (disabled) | `#3d3d3d` | Disabled elements |

## Key Features

### 1. Responsive ActivityBar
- Icon-based navigation
- Active state indication with left border accent
- User initial display for account icon
- Disabled state support for future auth

### 2. Dynamic SidePanel
- Changes content based on active panel
- Uses shadcn sidebar components
- Contextual navigation items
- Smooth transitions

### 3. Tabbed Editor
- VS Code-style tab management
- Scroll controls for many tabs
- Close on hover functionality
- Large content area for data viz

### 4. Expandable Terminal
- Right-side Sheet component
- Floating trigger button
- Non-intrusive design
- Ready for command integration

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Next Steps

### Phase 1: Core Functionality
- [ ] Add state management (Zustand/Jotai)
- [ ] Implement authentication flow
- [ ] Connect to Convex backend
- [ ] Add real invoice/expense data

### Phase 2: Data Visualization
- [ ] Financial heatmap component
- [ ] Chart integrations (recharts/tremor)
- [ ] Dashboard metrics cards
- [ ] Real-time data updates

### Phase 3: Features
- [ ] Invoice creation/editing
- [ ] Expense tracking
- [ ] Report generation
- [ ] Calendar integration
- [ ] PDF export functionality

### Phase 4: Polish
- [ ] Theme toggle (light/dark)
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Mobile responsive design

## Design Guidelines

### Component Development
1. **Keep components small and focused** - Single responsibility principle
2. **Use TypeScript strictly** - No `any` types
3. **Follow VS Code design patterns** - Maintain consistency
4. **Document complex logic** - Add comments for non-obvious code
5. **Test in isolation** - Components should work independently

### Styling Standards
1. **Use Tailwind classes** - Avoid custom CSS when possible
2. **Maintain color consistency** - Use defined color palette
3. **Follow spacing system** - Use consistent padding/margins
4. **Dark mode first** - Design for dark theme primarily
5. **Responsive breakpoints** - Mobile, tablet, desktop support

### Code Organization
1. **Colocate related files** - Keep components near their usage
2. **Use barrel exports** - Export from index.ts files
3. **Type everything** - Explicit types over inference when public
4. **Name meaningfully** - Clear, descriptive names
5. **Comment public APIs** - Document component props

## References

- **AURA Dashboard**: `/Users/matthewsimon/Projects/acdc-digital/aura/AURA/app/_components`
- **Brand Guidelines**: `/Users/matthewsimon/Projects/acdc-digital/.design`
- **shadcn/ui Docs**: https://ui.shadcn.com
- **Next.js 15 Docs**: https://nextjs.org/docs
- **Tailwind CSS v4**: https://tailwindcss.com

## Contributing

When adding new components:
1. Create in appropriate `_components` directory
2. Export from `index.ts`
3. Add TypeScript types
4. Document in component README
5. Follow existing patterns
6. Test in dev environment

## Support

For issues or questions:
- Check component README files
- Review AURA reference implementation
- Consult brand guidelines for colors/spacing
- Reference shadcn/ui documentation

---

**Version**: 0.1.0  
**Last Updated**: 2025-10-07  
**Status**: Initial Implementation Complete ✅
