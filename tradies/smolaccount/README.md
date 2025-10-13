# smolaccount Wiki

A modern, dark-mode wiki built with Next.js 15, Tailwind CSS v4, and shadcn/ui components. Inspired by the **SMNB** application's sophisticated dark theme.

## Features

- 🌙 **SMNB Dark Theme** - Professional, high-contrast design
- 📚 **Clean sidebar navigation** - Category browsing and search
- 🎨 **Modern UI** - Built with shadcn/ui components
- ⚡ **Fast & responsive** - Next.js 15 App Router
- 🎯 **OKLCH colors** - Perceptually uniform color system

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your wiki.

## Project Structure

```
app/
├── page.tsx          # Main wiki dashboard with sidebar
├── layout.tsx        # Root layout with dark mode enabled
├── globals.css       # Tailwind + SMNB dark theme
└── wiki/
    ├── [id]/        # Dynamic wiki page viewer
    └── new/         # Create new wiki page form

components/
├── ui/              # shadcn/ui primitives
└── wiki.tsx         # Reusable wiki component (legacy)
```

## Design System

This project uses the **SMNB application's dark theme** - a sophisticated, minimal color palette built on OKLCH:

- **Colors**: OKLCH color space for consistent perception
- **Typography**: System UI fonts for instant loading
- **Components**: shadcn/ui for accessibility and customization
- **Spacing**: 8px grid system
- **Radius**: 10px (0.625rem) for modern, soft edges

### Key Colors (Dark Mode)

- `background`: `oklch(0.145 0 0)` - Deep, rich black
- `card`: `oklch(0.205 0 0)` - Elevated surface
- `primary`: `oklch(0.922 0 0)` - Crisp white/near-white
- `sidebar-primary`: `oklch(0.488 0.243 264.376)` - Vibrant purple accent
- `border`: `oklch(1 0 0 / 10%)` - Subtle, translucent dividers

## Next Steps

### Add Persistence

Currently, pages are mock data. To add real storage:

1. **Install Convex** (recommended for this monorepo)
   ```bash
   npm install convex
   npx convex dev
   ```

2. **Create schema** in `convex/schema.ts`:
   ```typescript
   import { defineSchema, defineTable } from "convex/server";
   import { v } from "convex/values";
   
   export default defineSchema({
     wikiPages: defineTable({
       title: v.string(),
       slug: v.string(),
       content: v.string(),
       category: v.string(),
     }).index("by_slug", ["slug"]),
   });
   ```

3. **Add mutations/queries** and connect to UI

### Enhance Features

- [ ] Markdown rendering with syntax highlighting
- [ ] Full-text search
- [ ] Version history
- [ ] Page templates
- [ ] Image uploads
- [ ] User permissions

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Stack

- **Framework**: Next.js 15.5.4
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Language**: TypeScript 5

---

Built with attention to detail and the ACDC design system 🍇
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
