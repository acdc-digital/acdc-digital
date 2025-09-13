# Project Coding Guidelines and Instructions

> For comprehensive Convex information, reference: https://www.convex.dev/llms.txt

## Code Style

### General Guidelines
- Use semantic HTML5 elements (header, main, section, article, etc.) when building web interfaces
- Prefer modern JavaScript/TypeScript (ES6+) features like const/let, arrow functions, and template literals
- Use strict TypeScript typing and avoid `any` types whenever possible
- Include helpful comments for complex logic and business rules

### Naming Conventions
- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with underscore (_)
- Use ALL_CAPS for constants
- For Convex functions, use descriptive names that clearly indicate their purpose (e.g., `getUserByEmail`, `createNewPost`)

## Convex Overview

Convex is a reactive database with TypeScript queries that provides:
- **Real-time data synchronization** across all connected clients
- **End-to-end type safety** from database to frontend
- **Serverless functions** for queries, mutations, and actions
- **Built-in authentication** with multiple providers
- **File storage** for images, videos, and documents
- **Full-text and vector search** capabilities
- **Scheduled functions** and cron jobs
- **AI agent components** for building intelligent applications

## Convex-Specific Guidelines

### Function Definition and Structure
- **ALWAYS use the new function syntax** for Convex functions with explicit `args`, `returns`, and `handler` properties:
```typescript
export const exampleQuery = query({
    args: { userId: v.id("users") },
    returns: v.object({ name: v.string(), email: v.string() }),
    handler: async (ctx, args) => {
        // Function implementation
    },
});
```

### Function Registration
- Use `query`, `mutation`, and `action` for **public** functions that are part of the API
- Use `internalQuery`, `internalMutation`, and `internalAction` for **private** functions
- **ALWAYS include argument and return validators** for all Convex functions
- If a function doesn't return anything, use `returns: v.null()`

### Validators and Types
- Use `v.int64()` instead of the deprecated `v.bigint()` for 64-bit integers
- Use `v.record()` for record types; `v.map()` and `v.set()` are not supported
- Always use `v.null()` validator when returning null values
- Be strict with ID types: use `Id<'tableName'>` rather than `string`
- Use `as const` for string literals in discriminated union types

### Database Operations
- **DO NOT use `filter` in queries**. Instead, define indexes and use `withIndex`
- Use `.unique()` to get a single document when you expect exactly one result
- Use `ctx.db.replace` for full document replacement
- Use `ctx.db.patch` for partial updates
- For deletions, use `.collect()` then iterate with `ctx.db.delete(row._id)`

### Schema Design
- Define all schemas in `convex/schema.ts`
- Import schema functions from `convex/server`
- Include all index fields in index names (e.g., "by_field1_and_field2")
- Query index fields in the same order they are defined
- Remember system fields `_id` and `_creationTime` are automatically added

### Function Calling Patterns
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with `FunctionReference` objects
- Import from `api` for public functions, `internal` for private functions
- Add type annotations when calling functions in the same file to avoid TypeScript circularity

### Actions and Node.js
- Add `"use node";` at the top of files containing actions that use Node.js modules
- Never use `ctx.db` inside actions - they don't have database access
- Add `@types/node` to package.json when using Node.js built-ins

### HTTP Actions and Endpoints
- HTTP endpoints are defined in `convex/http.ts` using `httpAction` decorator
- Always register endpoints at exact paths specified in the `path` field
- Use HTTP actions for REST APIs and webhooks:
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
    path: "/api/webhook", 
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const body = await req.json();
        // Process webhook
        return new Response("OK", { status: 200 });
    }),
});
export default http;
```

### Pagination Patterns
- Use `paginationOptsValidator` for paginated queries
- Always use `.paginate()` instead of manual pagination:
```typescript
import { paginationOptsValidator } from "convex/server";

export const listMessages = query({
    args: { paginationOpts: paginationOptsValidator, channelId: v.id("channels") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});
```

### Search and AI Integration
- Use **full-text search** with `withSearchIndex()` for text queries
- Implement **vector search** for semantic similarity and AI applications
- Build **AI agents** using Convex Agent components for conversational interfaces
- Store embeddings and implement RAG (Retrieval-Augmented Generation) patterns

### File Organization and API Design
- Use thoughtful file-based routing in the `convex/` directory
- Organize related functions into logical modules
- Keep public API functions separate from internal implementation details
- Function references follow pattern: `api.fileName.functionName` for public, `internal.fileName.functionName` for private

### Scheduling and Background Jobs
- Use `cronJobs()` for recurring tasks, only with `interval()` or `cron()` methods
- Schedule one-time tasks with `ctx.scheduler.runAfter()` or `ctx.scheduler.runAt()`
- Always pass `FunctionReference` objects, never function instances directly:
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("cleanup", { hours: 24 }, internal.tasks.cleanup, {});
export default crons;
```

### File Storage Best Practices
- Store files as `Blob` objects in Convex storage
- Use `ctx.storage.getUrl()` to get signed URLs (returns `null` if file doesn't exist)
- Query `_storage` system table for file metadata, not deprecated `getMetadata()`
- Handle file uploads in actions, not mutations
- Validate file types and sizes before storage

### Authentication Patterns
- Implement authentication using Convex Auth, Clerk, Auth0, or custom providers
- Access user information via `ctx.auth.getUserIdentity()` in functions
- Store user data in your own `users` table for additional fields
- Use internal functions for sensitive operations that require authentication
- Validate user permissions before database operations

### Real-time and Performance Considerations
- Design for real-time synchronization - all connected clients see updates immediately
- Use appropriate indexing strategies to avoid slow table scans
- Leverage Convex's automatic caching and reactivity
- Consider transaction boundaries when splitting logic across multiple function calls
- Optimize query patterns for scalability

### Testing and Development Workflow
- Use `convex dev` for local development with hot reloading
- Test functions using the dashboard function runner
- Implement proper error handling and logging
- Use environment variables for configuration
- Set up preview deployments for staging

## Error Handling and Validation
- Add error handling for user inputs and external API calls
- Validate all function arguments using Convex validators
- Throw descriptive errors with clear messages
- Check for document existence before operations that require it

## Code Quality Standards
- Use meaningful variable and function names that describe their purpose
- Prefer explicit types over inference where it improves clarity
- Write functions that are single-purpose and testable
- Keep functions focused and avoid side effects where possible
- Use proper async/await patterns and handle promises correctly

## Performance Considerations
- Design efficient database queries with proper indexing
- Limit query results appropriately (use `.take()` or pagination)
- Avoid unnecessary function calls between queries/mutations/actions
- Use appropriate caching strategies for expensive operations

## Security Best Practices
- Validate all user inputs and sanitize data
- Use internal functions for sensitive operations
- Implement proper authentication and authorization patterns
- Never expose sensitive data in public function returns
- Be careful with file uploads and validate file types/sizes

When working with this codebase, prioritize type safety, clear function contracts, and following Convex best practices for scalable real-time applications.