import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Clear all data from the database (for development/testing)
export const clearAllData = mutation({
  args: {},
  returns: v.object({
    documentsDeleted: v.number(),
    chatMessagesDeleted: v.number(),
    projectsDeleted: v.number(),
  }),
  handler: async (ctx) => {
    console.log("Clearing all database data...");
    
    let documentsDeleted = 0;
    let chatMessagesDeleted = 0;
    let projectsDeleted = 0;

    // Clear documents
    const documents = await ctx.db.query("documents").collect();
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
      documentsDeleted++;
    }
    console.log(`Deleted ${documentsDeleted} documents`);

    // Clear chat messages
    const chatMessages = await ctx.db.query("chatMessages").collect();
    for (const msg of chatMessages) {
      await ctx.db.delete(msg._id);
      chatMessagesDeleted++;
    }
    console.log(`Deleted ${chatMessagesDeleted} chat messages`);

    // Clear projects
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
      projectsDeleted++;
    }
    console.log(`Deleted ${projectsDeleted} projects`);

    console.log("Database cleared successfully");
    
    return {
      documentsDeleted,
      chatMessagesDeleted,
      projectsDeleted,
    };
  },
});

// Clear only chat data (preserve documents)
export const clearChatData = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    console.log("Clearing chat data...");
    
    const chatMessages = await ctx.db.query("chatMessages").collect();
    let deleted = 0;
    
    for (const msg of chatMessages) {
      await ctx.db.delete(msg._id);
      deleted++;
    }
    
    console.log(`Deleted ${deleted} chat messages`);
    return deleted;
  },
});

// Clear only document data (preserve chat)
export const clearDocumentData = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    console.log("Clearing document data...");
    
    const documents = await ctx.db.query("documents").collect();
    let deleted = 0;
    
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
      deleted++;
    }
    
    console.log(`Deleted ${deleted} documents`);
    return deleted;
  },
});