// CALENDAR FUNCTIONS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/calendar.ts

import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get all events for a specific month
export const getEventsForMonth = query({
  args: {
    year: v.number(),
    month: v.number(), // 0-11 (JS month format)
  },
  returns: v.array(
    v.object({
      _id: v.id("calendar_events"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.number(),
      color: v.string(),
      allDay: v.boolean(),
      location: v.optional(v.string()),
      attendees: v.optional(v.array(v.string())),
      eventType: v.optional(v.union(
        v.literal("earnings"),
        v.literal("sec_report"),
        v.literal("treasury_report"),
        v.literal("fed_report"),
        v.literal("economic_data"),
        v.literal("user_event")
      )),
      sourceUrl: v.optional(v.string()),
      metadata: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // Calculate start and end of month
    const startOfMonth = new Date(args.year, args.month, 1).getTime();
    const endOfMonth = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999).getTime();

    const events = await ctx.db
      .query("calendar_events")
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), startOfMonth),
          q.lte(q.field("startTime"), endOfMonth)
        )
      )
      .collect();

    return events;
  },
});

// Get events for a specific day
export const getEventsForDay = query({
  args: {
    date: v.string(), // ISO date string (YYYY-MM-DD)
  },
  returns: v.array(
    v.object({
      _id: v.id("calendar_events"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.number(),
      color: v.string(),
      allDay: v.boolean(),
      location: v.optional(v.string()),
      attendees: v.optional(v.array(v.string())),
      eventType: v.optional(v.union(
        v.literal("earnings"),
        v.literal("sec_report"),
        v.literal("treasury_report"),
        v.literal("fed_report"),
        v.literal("economic_data"),
        v.literal("user_event")
      )),
      sourceUrl: v.optional(v.string()),
      metadata: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const targetDate = new Date(args.date);
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    const events = await ctx.db
      .query("calendar_events")
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), startOfDay),
          q.lte(q.field("startTime"), endOfDay)
        )
      )
      .order("asc")
      .collect();

    return events;
  },
});

// Create a new calendar event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    color: v.string(),
    allDay: v.boolean(),
    location: v.optional(v.string()),
    attendees: v.optional(v.array(v.string())),
    eventType: v.optional(v.union(
      v.literal("earnings"),
      v.literal("sec_report"),
      v.literal("treasury_report"),
      v.literal("fed_report"),
      v.literal("economic_data"),
      v.literal("user_event")
    )),
    sourceUrl: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  returns: v.id("calendar_events"),
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("calendar_events", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      color: args.color,
      allDay: args.allDay,
      location: args.location,
      attendees: args.attendees,
      eventType: args.eventType || "user_event",
      sourceUrl: args.sourceUrl,
      metadata: args.metadata,
    });

    return eventId;
  },
});

// Update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("calendar_events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    color: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
    location: v.optional(v.string()),
    attendees: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(eventId, cleanUpdates);
    return null;
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: {
    eventId: v.id("calendar_events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
    return null;
  },
});

// Get a single event by ID
export const getEventById = query({
  args: {
    eventId: v.id("calendar_events"),
  },
  returns: v.union(
    v.object({
      _id: v.id("calendar_events"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.number(),
      color: v.string(),
      allDay: v.boolean(),
      location: v.optional(v.string()),
      attendees: v.optional(v.array(v.string())),
      eventType: v.optional(v.union(
        v.literal("earnings"),
        v.literal("sec_report"),
        v.literal("treasury_report"),
        v.literal("fed_report"),
        v.literal("economic_data"),
        v.literal("user_event")
      )),
      sourceUrl: v.optional(v.string()),
      metadata: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return event;
  },
});

// Internal mutation for creating federal report events (called from actions)
export const createFederalReportEvent = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    color: v.string(),
    allDay: v.boolean(),
    sourceUrl: v.optional(v.string()),
    eventType: v.union(
      v.literal("sec_report"),
      v.literal("treasury_report"),
      v.literal("fed_report"),
      v.literal("economic_data")
    ),
    metadata: v.optional(v.string()),
  },
  returns: v.id("calendar_events"),
  handler: async (ctx, args) => {
    // Check if event already exists (prevent duplicates)
    const existing = await ctx.db
      .query("calendar_events")
      .filter((q) =>
        q.and(
          q.eq(q.field("title"), args.title),
          q.eq(q.field("startTime"), args.startTime)
        )
      )
      .first();

    if (existing) {
      console.log(`Federal report already exists: ${args.title}`);
      return existing._id;
    }

    const eventId = await ctx.db.insert("calendar_events", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      color: args.color,
      allDay: args.allDay,
      location: undefined,
      attendees: undefined,
      eventType: args.eventType,
      sourceUrl: args.sourceUrl,
      metadata: args.metadata,
    });

    return eventId;
  },
});

// Internal mutation for creating earnings events (called from actions)
export const createEarningsEvent = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    ticker: v.string(),
    source: v.string(),
  },
  returns: v.id("calendar_events"),
  handler: async (ctx, args) => {
    // Check if event already exists (prevent duplicates)
    const existing = await ctx.db
      .query("calendar_events")
      .filter((q) =>
        q.and(
          q.eq(q.field("title"), args.title),
          q.eq(q.field("startTime"), args.startTime)
        )
      )
      .first();

    if (existing) {
      console.log(`Earnings event already exists: ${args.title}`);
      return existing._id;
    }

    const eventId = await ctx.db.insert("calendar_events", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      color: '#10b981', // Green for earnings
      allDay: true,
      location: undefined,
      attendees: undefined,
      eventType: 'earnings',
      sourceUrl: undefined,
      metadata: JSON.stringify({
        autoGenerated: true,
        ticker: args.ticker,
        source: args.source,
      }),
    });

    return eventId;
  },
});

// Internal mutation for creating economic data events (called from actions)
export const createEconomicDataEvent = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    color: v.string(),
    source: v.string(),
    seriesId: v.string(),
  },
  returns: v.id("calendar_events"),
  handler: async (ctx, args) => {
    // Check if event already exists (prevent duplicates)
    const existing = await ctx.db
      .query("calendar_events")
      .filter((q) =>
        q.and(
          q.eq(q.field("title"), args.title),
          q.eq(q.field("startTime"), args.startTime)
        )
      )
      .first();

    if (existing) {
      console.log(`Economic data event already exists: ${args.title}`);
      return existing._id;
    }

    const eventId = await ctx.db.insert("calendar_events", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      color: args.color,
      allDay: false,
      location: undefined,
      attendees: undefined,
      eventType: 'economic_data',
      sourceUrl: undefined,
      metadata: JSON.stringify({
        autoGenerated: true,
        source: args.source,
        seriesId: args.seriesId,
      }),
    });

    return eventId;
  },
});
