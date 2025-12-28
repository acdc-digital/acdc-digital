---
name: nextjs-patterns
description: Next.js 15+ development patterns with App Router, Server Components, Client Components, and Convex integration. Use when building React components, pages, layouts, or working with Next.js features in this monorepo.
---

# Next.js Development Patterns

## When to use this skill

Use this skill when:
- Creating pages, layouts, or route handlers
- Building React components (Server or Client)
- Integrating Convex with Next.js
- Implementing loading states, error boundaries
- Working with metadata, SEO, or routing

## App Router Structure

```
app/
├── layout.tsx          # Root layout (Server Component)
├── page.tsx            # Home page
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── (routes)/
│   └── dashboard/
│       ├── page.tsx
│       └── layout.tsx
└── api/
    └── route.ts        # API routes
```

## Server vs Client Components

### Server Components (Default)
```tsx
// No directive needed - default is Server Component
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function Page() {
  // Can fetch data directly
  const data = await fetchQuery(api.items.list, {});
  return <div>{/* render data */}</div>;
}
```

### Client Components
```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function InteractiveComponent() {
  const data = useQuery(api.items.list, {});
  const addItem = useMutation(api.items.add);
  
  if (data === undefined) return <LoadingSpinner />;
  
  return (
    <button onClick={() => addItem({ name: "New" })}>
      Add Item
    </button>
  );
}
```

## Convex Provider Setup

```tsx
// providers/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

## Loading States Pattern

```tsx
// Always handle undefined state from useQuery
const data = useQuery(api.items.list, {});

if (data === undefined) {
  return <Skeleton />; // Loading
}

if (data.length === 0) {
  return <EmptyState />;
}

return <ItemList items={data} />;
```

## Error Boundaries

```tsx
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Metadata & SEO

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
  openGraph: {
    title: "OG Title",
    description: "OG Description",
  },
};
```

## Best Practices

1. **Use Server Components** by default, Client only when needed
2. **Handle loading states** - `useQuery` returns `undefined` while loading
3. **Colocate components** - keep related files together
4. **Use TypeScript** - never use `any` type
5. **Implement error boundaries** - graceful error handling
