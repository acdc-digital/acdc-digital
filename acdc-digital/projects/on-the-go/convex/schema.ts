import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Notes from Twilio SMS messages
  notes: defineTable({
    // Twilio message data
    phoneNumber: v.string(), // Sender's phone number
    messageBody: v.string(), // Original SMS content
    twilioMessageSid: v.optional(v.string()), // Twilio message identifier
    
    // Content management
    editedContent: v.optional(v.string()), // Markdown-edited version
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("edited"),
      v.literal("archived")
    ),
    
    // Metadata
    receivedAt: v.number(), // When SMS was received (timestamp)
    tags: v.optional(v.array(v.string())), // Optional categorization
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_receivedAt", ["receivedAt"])
    .index("by_status", ["status", "receivedAt"])
    .index("by_phoneNumber", ["phoneNumber", "receivedAt"])
    .index("by_createdAt", ["createdAt"])
    .searchIndex("search_content", {
      searchField: "messageBody",
      filterFields: ["status", "phoneNumber"]
    }),
});
