import { convexAuth } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { CustomPassword } from "./CustomPassword";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";

// Configure auth with CustomPassword, Google, and Apple providers
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    CustomPassword,
    Google,
    Apple({
      profile: (appleInfo) => {
        // Apple only shares name on first auth, so we need to handle this carefully
        const name = appleInfo.user
          ? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
          : undefined;
        return {
          id: appleInfo.sub,
          name: name,
          email: appleInfo.email,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { existingUserId, userId }) {
      if (!existingUserId) {
        // Set default role to "user" for new users only
        await ctx.runMutation(internal.admin.setDefaultRole, { userId });
        
        // Set the authId for the new user
        // The userId here is the auth ID that Convex Auth generates
        await ctx.runMutation(internal.users.setUserAuthId, {
          userId: userId as Id<"users">,
          authId: userId
        });
      }
    },
  },
});

/**
 * Get the authenticated user's ID
 */
export const getUserId = query({
  args: {},
  handler: async (ctx) => {
    // Get the actual database user ID, not the identity subject
    const userId = await getAuthUserId(ctx);
    // console.log("getUserId query called, returning:", userId);
    return userId;
  },
});

/**
 * Debug query to check authentication state
 */
export const debugAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = await getAuthUserId(ctx);

    console.log("Debug auth info:", {
      identity: identity ? {
        subject: identity.subject,
        tokenIdentifier: identity.tokenIdentifier,
      } : null,
      userId,
    });

    return {
      hasIdentity: !!identity,
      identitySubject: identity?.subject,
      userId,
    };
  },
});
