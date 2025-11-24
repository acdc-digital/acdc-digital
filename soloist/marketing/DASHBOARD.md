# Marketing Dashboard

VS Code-inspired marketing content management dashboard for Soloist.

## Features

- **Dashboard**: Overview of marketing performance and quick actions
- **Content**: Manage blog posts, landing pages, and documentation
- **Campaigns**: Create and track marketing campaigns
- **Analytics**: View traffic, conversions, and engagement metrics
- **Media Library**: Organize images, videos, and brand assets
- **Email Marketing**: Manage email campaigns and subscribers
- **Settings**: Configure brand settings and integrations

## Architecture

The dashboard follows a VS Code-inspired interface design:

- **Header** (32px): Application branding and title
- **Activity Bar** (48px): Primary navigation with 7 sections
- **Side Panel** (240px): Context-specific navigation and filters
- **Editor**: Main content area with tab management
- **Terminal**: Collapsible overlay terminal (35-250px)
- **Footer** (22px): Status bar with version info

## Color Palette

- Background (Deep): `#0e0e0e`
- Background (Dark): `#181818`
- Background (Medium): `#1e1e1e`
- Background (Card): `#252526`
- Border: `#2d2d2d`
- Text (Primary): `#cccccc`
- Text (Secondary): `#858585`
- Accent (Blue): `#007acc`

## Running the Dashboard

```bash
cd soloist/marketing
npm run dev
```

Access at: http://localhost:10000/dashboard

## Component Structure

```
app/dashboard/
├── dashboard.tsx              # Main container
├── page.tsx                   # Next.js page wrapper
└── _components/
    ├── index.ts              # Barrel exports
    ├── Header.tsx            # Top navigation
    ├── ActivityBar.tsx       # Left icon navigation
    ├── SidePanel.tsx         # Context sidebar
    ├── Editor.tsx            # Main content area
    ├── Navigator.tsx         # Hidden placeholder
    ├── Terminal.tsx          # Bottom terminal
    └── Footer.tsx            # Status bar
```

## Future Enhancements

- [ ] Convex backend integration
- [ ] Content CRUD operations
- [ ] Campaign management
- [ ] Analytics visualization
- [ ] Media upload and management
- [ ] Email template editor
- [ ] Real-time collaboration
