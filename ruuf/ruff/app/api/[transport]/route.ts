import { verifyClerkToken } from "@clerk/mcp-tools/next";
import {
  createMcpHandler,
  experimental_withMcpAuth as withMcpAuth,
} from "@vercel/mcp-adapter";
import { auth, clerkClient } from "@clerk/nextjs/server";

const clerk = await clerkClient();

const handler = createMcpHandler((server) => {
  server.tool(
    "get-clerk-user-data",
    "Gets data about the Clerk user that authorized this request",
    {},
    async (_, { authInfo }) => {
      const userId = authInfo!.extra!.userId! as string;
      const userData = await clerk.users.getUser(userId);

      return {
        content: [{ type: "text", text: JSON.stringify(userData, null, 2) }],
      };
    },
  );

  server.tool(
    "get-user-sessions",
    "Gets active sessions for the authenticated user",
    {},
    async (_, { authInfo }) => {
      const userId = authInfo!.extra!.userId! as string;
      const sessions = await clerk.users.getUserList({ userId: [userId] });

      return {
        content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }],
      };
    },
  );

  server.tool(
    "update-user-metadata",
    "Updates public metadata for the authenticated user",
    {
      metadata: {
        type: "object",
        description: "The metadata to update",
        properties: {
          key: { type: "string", description: "The metadata key" },
          value: { type: "string", description: "The metadata value" },
        },
        required: ["key", "value"],
      },
    },
    async (args, { authInfo }) => {
      const userId = authInfo!.extra!.userId! as string;
      const { key, value } = args.metadata as { key: string; value: string };

      const updatedUser = await clerk.users.updateUser(userId, {
        publicMetadata: {
          [key]: value,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully updated user metadata: ${key} = ${value}\n\nUpdated user: ${JSON.stringify(updatedUser.publicMetadata, null, 2)}`,
          },
        ],
      };
    },
  );
});

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    const clerkAuth = await auth({ acceptsToken: "oauth_token" });
    return verifyClerkToken(clerkAuth, token);
  },
  {
    required: true,
    resourceMetadataPath: "/api/.well-known/oauth-protected-resource/mcp",
  },
);

export { authHandler as GET, authHandler as POST };
