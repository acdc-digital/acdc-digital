# Grapes 🍇

A production-ready **React Web Preview Component** for AI-generated websites, built with TypeScript, Next.js, and shadcn/ui.

> Like v0.dev's live viewer - interactive iframe preview with navigation controls for AI-generated UIs.

## Features

- 🔒 **Safe Sandboxing** - Iframe-based preview with controlled permissions
- ⌨️ **Keyboard Navigation** - Enter to navigate, Tab between controls
- 🔄 **History Support** - Full back/forward navigation with history tracking
- ⚡️ **TypeScript First** - Fully typed API with context-based state management
- 🎨 **Modern Design** - Built with shadcn/ui and Modern Minimal theme
- 🤖 **AI-Ready** - Perfect for v0, Claude, or custom AI-generated UIs

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server (port 8010)
pnpm dev:grapes
```

Visit:
- `http://localhost:8010` - Landing page with features overview
- `http://localhost:8010/demo` - Interactive demo with sidebar controls

## Component Usage

```tsx
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai/web-preview";

export default function Page() {
  return (
    <WebPreview defaultUrl="https://example.com" className="h-[600px]">
      <WebPreviewNavigation>
        <WebPreviewUrl />
      </WebPreviewNavigation>
      <WebPreviewBody />
    </WebPreview>
  );
}
```

## Component API

### WebPreview

Container component managing preview state.

**Props:**
- `defaultUrl?: string` - Initial URL to load
- `onUrlChange?: (url: string) => void` - Callback when URL changes  
- `className?: string` - Additional CSS classes

### WebPreviewNavigation

Navigation bar with back/forward/refresh controls.

### WebPreviewUrl

URL input field with Enter key navigation.

**Props:**
- `value?: string` - Controlled value (overrides context)
- `onChange?: ChangeEventHandler` - Change handler

### WebPreviewBody

Iframe container for preview content.

**Props:**
- `src?: string` - URL to load (overrides context)
- `loading?: ReactNode` - Custom loading indicator

```
grapes/
├── .agents/          # AI agent configurations and documentation
├── .docs/            # Project documentation
├── .github/          # GitHub configurations (includes Copilot instructions)
├── .notes/           # Development notes and scratch files
├── .test/            # Test files and test data
├── .vscode/          # VS Code workspace settings
└── grapes/           # Main Next.js application
    ├── app/          # Next.js 15 App Router
    ├── components/   # React components
    ├── convex/       # Convex backend functions and schema
    ├── lib/          # Utility functions
    └── public/       # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

From the monorepo root:

```bash
cd grapes/grapes
pnpm install
```

### Development

Run the Next.js development server:

```bash
pnpm dev
```

The application will be available at: **http://localhost:8010**

### Convex Setup

1. Initialize Convex (first time only):

```bash
pnpm convex dev
```

2. Follow the prompts to:
   - Create a Convex account (if you don't have one)
   - Create a new Convex project
   - Link this app to your project

3. Once setup is complete, your `.env.local` file will contain:
   - `CONVEX_DEPLOYMENT` - Your deployment identifier
   - `NEXT_PUBLIC_CONVEX_URL` - Your public Convex API URL

### Scripts

- `pnpm dev` - Start Next.js development server on port 8010
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm convex` - Start Convex development server

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS 4
- **Backend**: Convex (real-time database + serverless functions)
- **Language**: TypeScript (strict mode)
- **Components**: shadcn/ui base components

## Key Features

- ⚡️ **Fast** - Built with Next.js 15 and React 19
- 🔄 **Real-time** - Powered by Convex for live data sync
- 🎨 **Beautiful** - Styled with Tailwind CSS
- 📱 **Responsive** - Mobile-first design
- 🔒 **Type-safe** - Full TypeScript coverage
- 🎯 **Modern** - Latest web standards and best practices

## Convex Integration

### Example Query

See `convex/items.ts` for example Convex functions:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: {},
  returns: v.array(v.object({...})),
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});
```

### Using in React Components

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const items = useQuery(api.items.getItems);
  // items will be undefined while loading, then the actual data
}
```

## Development Guidelines

- Follow the [GitHub Copilot instructions](.github/copilot-instructions.md) for Convex best practices
- Always use proper Convex validators (`v.string()`, `v.number()`, etc.)
- Use indexes instead of `.filter()` for Convex queries
- Maintain strict TypeScript - no `any` types
- Keep components in `components/` directory
- Place reusable utilities in `lib/`

## Deployment

### Frontend (Vercel)

```bash
pnpm build
```

Then deploy to Vercel:

```bash
vercel --prod
```

### Backend (Convex Cloud)

Convex automatically deploys when you push code. To manually deploy:

```bash
pnpm convex deploy
```

## Monorepo Integration

This package is part of the ACDC Digital monorepo. From the root:

```bash
# Run this package
pnpm dev:grapes

# Build this package
pnpm build:grapes

# Run Convex
pnpm convex:grapes
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## License

MIT - Part of ACDC Digital
