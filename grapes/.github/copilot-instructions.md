# GitHub Copilot Instructions for Grapes (ACDC Digital Convex Project)

## Project Overview
This is a Next.js project with Convex backend for real-time data management and AI integration.

## Technology Stack
- **Frontend**: Next.js 15+ with TypeScript, React, Tailwind CSS
- **Backend**: Convex (real-time database and serverless functions)
- **Language**: TypeScript throughout
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

## Core Coding Standards

### Convex Function Guidelines
1. **Always use the new function syntax** for all Convex functions:
```typescript
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const exampleQuery = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Function implementation
    return `Hello ${args.name}`;
  },
});
```

2. **Function Registration Rules**:
   - Use `query`, `mutation`, `action` for PUBLIC functions
   - Use `internalQuery`, `internalMutation`, `internalAction` for PRIVATE functions
   - ALWAYS include `args` and `returns` validators
   - Use `returns: v.null()` if function doesn't return anything

3. **Function Calling Patterns**:
   - Use `ctx.runQuery()` to call queries from any function
   - Use `ctx.runMutation()` to call mutations from mutations/actions
   - Use `ctx.runAction()` to call actions from actions only
   - Always use function references from `api` or `internal` objects

### Validator Standards
Always use proper Convex validators:
- `v.string()` for strings
- `v.number()` for numbers (Float64)
- `v.int64()` for BigInt (NOT `v.bigint()`)
- `v.boolean()` for booleans
- `v.null()` for null values
- `v.id(tableName)` for document IDs
- `v.array(type)` for arrays
- `v.object({...})` for objects
- `v.record(keyType, valueType)` for records
- `v.union(...)` for union types
- `v.optional(type)` for optional fields

### TypeScript Guidelines
1. **Type Safety**:
   - Use `Id<"tableName">` for document IDs
   - Use `Doc<"tableName">` for document types
   - Be strict with ID types - use `Id<'users'>` not `string`
   - Always use `as const` for string literals in discriminated unions

2. **Type Definitions**:
```typescript
// Correct way to define arrays and records
const items: Array<string> = [...];
const userMap: Record<Id<"users">, string> = {...};
```

### Database Schema Rules
1. **Schema Definition** (in `convex/schema.ts`):
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tableName: defineTable({
    field1: v.string(),
    field2: v.id("otherTable"),
    // System fields _id and _creationTime are automatic
  }).index("by_field1_and_field2", ["field1", "field2"]),
});
```

2. **Index Naming**: Include all fields in index names
   - Index `["userId", "status"]` should be named `"by_userId_and_status"`
   - Query index fields in the same order they're defined

### Query Best Practices
1. **NO `.filter()` in queries** - use indexes instead:
```typescript
// ❌ Don't do this
const results = await ctx.db.query("messages").filter(q => q.eq(q.field("userId"), userId));

// ✅ Do this instead
const results = await ctx.db.query("messages").withIndex("by_userId", q => q.eq("userId", userId));
```

2. **Query Methods**:
   - Use `.unique()` for single document queries
   - Use `.take(n)` to limit results
   - Use `.order("desc")` or `.order("asc")` for ordering
   - Use `for await (const doc of query)` for async iteration

3. **Pagination**:
```typescript
export const paginatedQuery = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("table").paginate(args.paginationOpts);
  },
});
```

### Mutation Guidelines
- Use `ctx.db.insert()` for new documents
- Use `ctx.db.patch()` for partial updates
- Use `ctx.db.replace()` for full document replacement
- Use `ctx.db.delete()` for deletions
- NO `.delete()` on query results - collect and iterate instead

### Action Guidelines
1. **Node.js Actions**: Add `"use node";` at top of files using Node.js modules
2. **No Database Access**: Actions can't use `ctx.db` directly
3. **Call Other Functions**: Use `ctx.runQuery()` and `ctx.runMutation()`

### HTTP Endpoints
Define in `convex/http.ts`:
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    return new Response(JSON.stringify({success: true}), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

### File Organization
- **Public functions**: Organize thoughtfully in `convex/` with file-based routing
- **Function references**: `api.filename.functionName` for public, `internal.filename.functionName` for private
- **Nested directories**: Support for `convex/subdirectory/file.ts` → `api.subdirectory.file.functionName`

## Next.js Specific Guidelines

### App Router Structure
- Use App Router (not Pages Router)
- Place components in `components/` directory  
- Use Server Components by default, Client Components when needed
- Implement proper loading and error boundaries

### Convex Integration
1. **Client Setup**:
```typescript
// components/ConvexClientProvider.tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

2. **Using Convex Hooks**:
```typescript
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const data = useQuery(api.myFile.myQuery, { arg: "value" });
  const myMutation = useMutation(api.myFile.myMutation);
  
  // Handle loading states and mutations properly
}
```

## Code Quality Standards
- **Error Handling**: Always handle null/undefined cases
- **Loading States**: Implement proper loading UIs
- **Type Safety**: Never use `any` type
- **Performance**: Minimize database calls, use pagination for large datasets
- **Security**: Use internal functions for sensitive operations

## File Storage
- Use `ctx.storage` for file operations
- Convert files to/from Blob objects
- Use `ctx.storage.getUrl()` for signed URLs (returns null if not found)
- Query `_storage` system table for metadata instead of deprecated `getMetadata()`

## AI Integration Patterns
When implementing AI features:
1. Use actions for external API calls (OpenAI, etc.)
2. Add proper error handling and fallbacks  
3. Use internal functions for processing AI responses
4. Schedule background processing with `ctx.scheduler.runAfter()`

Remember: Follow these patterns consistently and prioritize type safety, performance, and maintainability in all code suggestions.
