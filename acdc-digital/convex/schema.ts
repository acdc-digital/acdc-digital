import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  projects: defineTable({
    value: v.number(),
  }),
  
  chatMessages: defineTable({
    sessionId: v.string(), // Session or conversation ID
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId", "createdAt"]),
  
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()), // HTML content from the Tiptap editor
    description: v.optional(v.string()),
    createdBy: v.optional(v.string()), // User ID - will be proper auth later
    createdAt: v.number(),
    updatedAt: v.number(),
    searchableText: v.optional(v.string()), // For full text search
    lastVersion: v.optional(v.number()), // Last snapshot version
    isSystemGenerated: v.optional(v.boolean()), // Track if content was AI-generated
  }).index("by_createdBy", ["createdBy"])
    .index("by_createdAt", ["createdAt"])
    .searchIndex("search_text", {
      searchField: "searchableText",
      filterFields: ["createdBy"],
    }),
});
