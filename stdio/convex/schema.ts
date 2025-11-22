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
  generatedComponents: defineTable({
    code: v.string(),
    title: v.string(),
    framework: v.literal("react"),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_framework", ["framework"]),
  uploadedFiles: defineTable({
    filename: v.string(),
    anthropicFileId: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_anthropicFileId", ["anthropicFileId"]),
});
