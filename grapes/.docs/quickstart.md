# Grapes Quick Start Guide

Welcome to Grapes! 🍇

## Directory Structure

```
grapes/
├── .agents/          # 📝 AI agent configurations
├── .docs/            # 📚 Documentation (you are here!)
├── .github/          # ⚙️  GitHub configs + Copilot instructions
├── .notes/           # 📓 Development notes
├── .test/            # 🧪 Test files
├── .vscode/          # 💻 VS Code settings
└── grapes/           # 🍇 Main Next.js app
```

## Getting Started

### 1. Start Development Server

From the monorepo root:

```bash
pnpm dev:grapes
```

Or from this directory:

```bash
cd grapes
pnpm dev
```

Visit: **http://localhost:8010**

### 2. Setup Convex Backend

Initialize Convex (first time only):

```bash
pnpm convex:grapes  # from root
# or
cd grapes && pnpm convex  # from this directory
```

Follow the prompts to:
1. Sign in to Convex (or create account)
2. Create a new project
3. Link this app

This creates `.env.local` with your Convex credentials.

### 3. Add Convex Provider to Your App

Update `grapes/app/layout.tsx`:

```typescript
import { ConvexProvider } from "@/components/ConvexClientProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
```

Create `grapes/components/ConvexClientProvider.tsx`:

```typescript
"use client";
import { ConvexProvider as Provider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={convex}>{children}</Provider>;
}
```

## Common Tasks

### Add a New Convex Function

1. Create file in `grapes/convex/`:

```typescript
// convex/myFunction.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return `Hello, ${args.name}!`;
  },
});
```

2. Use in React component:

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const greeting = useQuery(api.myFunction.myQuery, { name: "World" });
  return <div>{greeting}</div>;
}
```

### Update Database Schema

Edit `grapes/convex/schema.ts`:

```typescript
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),
});
```

Convex auto-migrates when you save!

### Add a New Component

```bash
# Create in grapes/components/
touch grapes/components/MyComponent.tsx
```

### Run Scripts from Monorepo Root

```bash
pnpm dev:grapes      # Start dev server
pnpm build:grapes    # Build for production
pnpm start:grapes    # Start production server
pnpm lint:grapes     # Run linter
pnpm convex:grapes   # Start Convex dev
```

## Important Files

- `grapes/app/page.tsx` - Home page
- `grapes/app/layout.tsx` - Root layout
- `grapes/app/globals.css` - Global styles
- `grapes/convex/schema.ts` - Database schema
- `grapes/convex/items.ts` - Example Convex functions
- `.github/copilot-instructions.md` - Convex best practices

## Best Practices

✅ **DO:**
- Use Convex validators (`v.string()`, `v.id()`, etc.)
- Use indexes instead of `.filter()` in queries
- Keep TypeScript strict (no `any`)
- Follow the Copilot instructions in `.github/`

❌ **DON'T:**
- Use `.filter()` on Convex queries (use indexes)
- Access `ctx.db` in Convex actions (use queries/mutations)
- Forget to add indexes for query fields

## Troubleshooting

### Port 8010 already in use?

Change port in `grapes/package.json`:
```json
"dev": "next dev -p 8011"
```

### Convex not connected?

Check `.env.local` exists with:
```
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
```

### TypeScript errors?

Run from `grapes/` directory:
```bash
pnpm install
```

## Resources

- [Grapes README](../README.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Copilot Instructions](../.github/copilot-instructions.md)

---

**Need Help?** Check the documentation or ask in the team chat!
