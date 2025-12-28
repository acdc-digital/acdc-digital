---
name: convex-development
description: Expert guidance for Convex backend development including queries, mutations, actions, schema design, and real-time database patterns. Use when working with Convex functions, database operations, or serverless backend logic in this monorepo.
---

# Convex Development

## When to use this skill

Use this skill when:
- Creating or modifying Convex functions (queries, mutations, actions)
- Designing or updating database schemas
- Working with Convex validators and type safety
- Implementing real-time subscriptions
- Setting up HTTP endpoints or webhooks
- Working with file storage in Convex

## Function Syntax (Required)

Always use the new function syntax with explicit validators:

```typescript
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const exampleQuery = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return `Hello ${args.name}`;
  },
});
```

## Function Types

| Type | Use Case | Database Access |
|------|----------|-----------------|
| `query` | Read data, public | ✅ `ctx.db` |
| `mutation` | Write data, public | ✅ `ctx.db` |
| `action` | External APIs, side effects | ❌ Use `ctx.runQuery/Mutation` |
| `internalQuery` | Private reads | ✅ `ctx.db` |
| `internalMutation` | Private writes | ✅ `ctx.db` |
| `internalAction` | Private external calls | ❌ Use `ctx.runQuery/Mutation` |

## Validator Reference

```typescript
v.string()           // strings
v.number()           // Float64 numbers
v.int64()            // BigInt (NOT v.bigint())
v.boolean()          // booleans
v.null()             // null values
v.id("tableName")    // document IDs
v.array(type)        // arrays
v.object({...})      // objects
v.record(key, val)   // records/maps
v.union(...)         // union types
v.optional(type)     // optional fields
```

## Query Best Practices

❌ **Never use `.filter()`** - it's inefficient:
```typescript
// BAD
const results = await ctx.db.query("messages")
  .filter(q => q.eq(q.field("userId"), userId));
```

✅ **Always use indexes**:
```typescript
// GOOD
const results = await ctx.db.query("messages")
  .withIndex("by_userId", q => q.eq("userId", userId));
```

## Schema Design

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});
```

Index naming convention: `by_field1_and_field2`

## Common Patterns

### Pagination
```typescript
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("items").paginate(args.paginationOpts);
  },
});
```

### Background Jobs
```typescript
await ctx.scheduler.runAfter(0, internal.jobs.processData, { id });
```

### File Storage
```typescript
const url = await ctx.storage.getUrl(storageId);
```

## Project Structure

- `convex/` - All backend functions
- `convex/schema.ts` - Database schema
- `convex/http.ts` - HTTP endpoints
- `convex/_generated/` - Auto-generated types (don't edit)

## References

See [convex-patterns.md](references/convex-patterns.md) for advanced patterns.
