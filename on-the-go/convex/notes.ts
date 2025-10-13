import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { twilio } from "./twilio";

// Query: Get all notes with filtering options
export const listNotes = query({
  args: {
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("edited"),
      v.literal("archived")
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("notes"),
    _creationTime: v.number(),
    phoneNumber: v.string(),
    messageBody: v.string(),
    twilioMessageSid: v.optional(v.string()),
    editedContent: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("edited"),
      v.literal("archived")
    ),
    receivedAt: v.number(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    // Build query with proper typing
    let result;
    
    if (args.status) {
      // Filter by status using index
      result = await ctx.db
        .query("notes")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      // Get all notes ordered by receivedAt
      result = await ctx.db
        .query("notes")
        .withIndex("by_receivedAt")
        .order("desc")
        .collect();
    }
    
    // Apply limit if provided
    if (args.limit) {
      result = result.slice(0, args.limit);
    }
    
    return result;
  },
});

// Query: Get a single note by ID
export const getNote = query({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.union(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
      phoneNumber: v.string(),
      messageBody: v.string(),
      twilioMessageSid: v.optional(v.string()),
      editedContent: v.optional(v.string()),
      status: v.union(
        v.literal("new"),
        v.literal("read"),
        v.literal("edited"),
        v.literal("archived")
      ),
      receivedAt: v.number(),
      tags: v.optional(v.array(v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.noteId);
  },
});

// Query: Search notes by content
export const searchNotes = query({
  args: {
    searchText: v.string(),
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("edited"),
      v.literal("archived")
    )),
  },
  returns: v.array(v.object({
    _id: v.id("notes"),
    _creationTime: v.number(),
    phoneNumber: v.string(),
    messageBody: v.string(),
    twilioMessageSid: v.optional(v.string()),
    editedContent: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("edited"),
      v.literal("archived")
    ),
    receivedAt: v.number(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) => 
        q.search("messageBody", args.searchText)
      )
      .collect();
    
    // Filter by status if provided
    if (args.status) {
      return results.filter((note) => note.status === args.status);
    }
    
    return results;
  },
});

// Mutation: Create a new note (called by Twilio webhook)
export const createNote = internalMutation({
  args: {
    phoneNumber: v.string(),
    messageBody: v.string(),
    twilioMessageSid: v.optional(v.string()),
    receivedAt: v.optional(v.number()),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("notes", {
      phoneNumber: args.phoneNumber,
      messageBody: args.messageBody,
      twilioMessageSid: args.twilioMessageSid,
      status: "new",
      receivedAt: args.receivedAt ?? now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation: Update note content and status
export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    editedContent: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("edited"),
      v.literal("archived")
    )),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const { noteId, ...updates } = args;
    
    // Get existing note to check if it exists
    const existingNote = await ctx.db.get(noteId);
    if (!existingNote) {
      throw new Error("Note not found");
    }
    
    // Update the note
    await ctx.db.patch(noteId, {
      ...updates,
      updatedAt: Date.now(),
      // If content was edited, update status to "edited"
      status: updates.editedContent !== undefined && updates.status === undefined
        ? "edited"
        : updates.status ?? existingNote.status,
    });
    
    return noteId;
  },
});

// Mutation: Mark note as read
export const markAsRead = mutation({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (note && note.status === "new") {
      await ctx.db.patch(args.noteId, {
        status: "read",
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

// Mutation: Delete a note
export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
    return null;
  },
});

// Query: Get stats about notes
export const getStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    new: v.number(),
    read: v.number(),
    edited: v.number(),
    archived: v.number(),
  }),
  handler: async (ctx) => {
    const allNotes = await ctx.db.query("notes").collect();
    
    return {
      total: allNotes.length,
      new: allNotes.filter((n) => n.status === "new").length,
      read: allNotes.filter((n) => n.status === "read").length,
      edited: allNotes.filter((n) => n.status === "edited").length,
      archived: allNotes.filter((n) => n.status === "archived").length,
    };
  },
});

// Action: Send SMS using Twilio component
export const sendSms = internalAction({
  args: {
    to: v.string(),
    body: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await twilio.sendMessage(ctx, {
      to: args.to,
      body: args.body,
    });
  },
});
