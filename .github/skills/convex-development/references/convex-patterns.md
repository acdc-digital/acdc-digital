# Advanced Convex Patterns

## Optimistic Updates

```typescript
const addItem = useMutation(api.items.add);

// With optimistic update
addItem({ name: "New Item" }, {
  optimisticUpdate: (localStore) => {
    const existing = localStore.getQuery(api.items.list, {});
    if (existing) {
      localStore.setQuery(api.items.list, {}, [...existing, { name: "New Item", _id: "temp" }]);
    }
  },
});
```

## Batch Operations

```typescript
export const batchDelete = mutation({
  args: { ids: v.array(v.id("items")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return null;
  },
});
```

## Scheduled Functions

```typescript
// Schedule for later
await ctx.scheduler.runAfter(60000, internal.cleanup.run, {});

// Schedule at specific time
await ctx.scheduler.runAt(new Date("2025-01-01"), internal.reports.generate, {});
```

## HTTP Actions

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    await ctx.runMutation(internal.webhooks.process, { data: body });
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

## Node.js Actions

For actions that need Node.js APIs:

```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const callExternalAPI = action({
  args: { endpoint: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const response = await fetch(args.endpoint);
    return await response.json();
  },
});
```

## Error Handling

```typescript
export const safeOperation = mutation({
  args: { id: v.id("items") },
  returns: v.union(v.object({ success: v.boolean() }), v.null()),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }
    // ... operation
    return { success: true };
  },
});
```

## Type-Safe Document Access

```typescript
import { Doc, Id } from "./_generated/dataModel";

type User = Doc<"users">;
type UserId = Id<"users">;

export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(v.object({ ... }), v.null()),
  handler: async (ctx, args): Promise<User | null> => {
    return await ctx.db.get(args.userId);
  },
});
```
