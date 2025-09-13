import {
  protectedResourceHandlerClerk,
  metadataCorsOptionsRequestHandler,
} from "@clerk/mcp-tools/next";

const handler = protectedResourceHandlerClerk({
  scopes: ["user:read", "user:write"],
  resource: "http://localhost:5454/api/mcp",
});
const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
