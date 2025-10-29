/**
 * Emergency authentication cleanup utilities
 * Use these to clear corrupted auth data after demo removal
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all users to see what needs cleanup
 */
export const listAllUsers = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }));
  },
});

/**
 * List all authAccounts to see what's corrupted
 */
export const listAllAuthAccounts = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    return accounts.map(account => ({
      _id: account._id,
      userId: account.userId,
      provider: account.provider,
    }));
  },
});

/**
 * Count auth-related records for diagnostics
 */
export const countAuthRecords = query({
  args: {},
  returns: v.object({
    users: v.number(),
    authAccounts: v.number(),
    authSessions: v.number(),
    authRateLimits: v.number(),
    authVerificationCodes: v.number(),
  }),
  handler: async (ctx) => {
    const [users, accounts, sessions, rateLimits, verificationCodes] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("authAccounts").collect(),
      ctx.db.query("authSessions").collect(),
      ctx.db.query("authRateLimits").collect(),
      ctx.db.query("authVerificationCodes").collect(),
    ]);

    return {
      users: users.length,
      authAccounts: accounts.length,
      authSessions: sessions.length,
      authRateLimits: rateLimits.length,
      authVerificationCodes: verificationCodes.length,
    };
  },
});

/**
 * Clear ALL authentication data (nuclear option)
 * WARNING: This will log everyone out and require re-authentication
 */
export const clearAllAuthData = mutation({
  args: {},
  returns: v.object({
    deletedAccounts: v.number(),
    deletedSessions: v.number(),
    deletedRateLimits: v.number(),
    deletedVerificationCodes: v.number(),
  }),
  handler: async (ctx) => {
    // Get all records
    const [accounts, sessions, rateLimits, verificationCodes] = await Promise.all([
      ctx.db.query("authAccounts").collect(),
      ctx.db.query("authSessions").collect(),
      ctx.db.query("authRateLimits").collect(),
      ctx.db.query("authVerificationCodes").collect(),
    ]);

    // Delete all records
    await Promise.all([
      ...accounts.map(record => ctx.db.delete(record._id)),
      ...sessions.map(record => ctx.db.delete(record._id)),
      ...rateLimits.map(record => ctx.db.delete(record._id)),
      ...verificationCodes.map(record => ctx.db.delete(record._id)),
    ]);

    return {
      deletedAccounts: accounts.length,
      deletedSessions: sessions.length,
      deletedRateLimits: rateLimits.length,
      deletedVerificationCodes: verificationCodes.length,
    };
  },
});

/**
 * Delete a specific user and all their auth data
 */
export const deleteUserAndAuthData = mutation({
  args: { email: v.string() },
  returns: v.object({
    success: v.boolean(),
    deletedUser: v.boolean(),
    deletedAccounts: v.number(),
    deletedSessions: v.number(),
  }),
  handler: async (ctx, { email }) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return {
        success: false,
        deletedUser: false,
        deletedAccounts: 0,
        deletedSessions: 0,
      };
    }

    // Find and delete all associated auth records
    const [accounts, sessions] = await Promise.all([
      ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .collect(),
      ctx.db
        .query("authSessions")
        .withIndex("userId")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .collect(),
    ]);

    // Delete all records
    await Promise.all([
      ...accounts.map(record => ctx.db.delete(record._id)),
      ...sessions.map(record => ctx.db.delete(record._id)),
      ctx.db.delete(user._id),
    ]);

    return {
      success: true,
      deletedUser: true,
      deletedAccounts: accounts.length,
      deletedSessions: sessions.length,
    };
  },
});

/**
 * Clear only orphaned auth records (accounts/sessions without matching users)
 */
export const clearOrphanedAuthData = mutation({
  args: {},
  returns: v.object({
    deletedAccounts: v.number(),
    deletedSessions: v.number(),
  }),
  handler: async (ctx) => {
    // Get all users and auth records
    const [users, accounts, sessions] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("authAccounts").collect(),
      ctx.db.query("authSessions").collect(),
    ]);

    const userIds = new Set(users.map(u => u._id));

    // Find orphaned records
    const orphanedAccounts = accounts.filter(a => !userIds.has(a.userId));
    const orphanedSessions = sessions.filter(s => !userIds.has(s.userId));

    // Delete orphaned records
    await Promise.all([
      ...orphanedAccounts.map(record => ctx.db.delete(record._id)),
      ...orphanedSessions.map(record => ctx.db.delete(record._id)),
    ]);

    return {
      deletedAccounts: orphanedAccounts.length,
      deletedSessions: orphanedSessions.length,
    };
  },
});

/**
 * NUCLEAR: Delete ALL auth data and start fresh
 * This will log everyone out and clear all authentication state
 */
export const nukeAllAuthData = mutation({
  args: {},
  returns: v.object({
    deletedUsers: v.number(),
    deletedAccounts: v.number(),
    deletedSessions: v.number(),
    deletedRateLimits: v.number(),
    deletedVerificationCodes: v.number(),
  }),
  handler: async (ctx) => {
    // Get all records
    const [users, accounts, sessions, rateLimits, verificationCodes] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("authAccounts").collect(),
      ctx.db.query("authSessions").collect(),
      ctx.db.query("authRateLimits").collect(),
      ctx.db.query("authVerificationCodes").collect(),
    ]);

    // Delete ALL records
    await Promise.all([
      ...users.map(record => ctx.db.delete(record._id)),
      ...accounts.map(record => ctx.db.delete(record._id)),
      ...sessions.map(record => ctx.db.delete(record._id)),
      ...rateLimits.map(record => ctx.db.delete(record._id)),
      ...verificationCodes.map(record => ctx.db.delete(record._id)),
    ]);

    return {
      deletedUsers: users.length,
      deletedAccounts: accounts.length,
      deletedSessions: sessions.length,
      deletedRateLimits: rateLimits.length,
      deletedVerificationCodes: verificationCodes.length,
    };
  },
});
