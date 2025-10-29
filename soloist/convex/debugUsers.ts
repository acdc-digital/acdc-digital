import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all users in the database (for debugging)
 */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      authId: user.authId,
      role: user.role,
    }));
  },
});
