import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@clerk/mcp-tools"],
  // Development server configuration
  async rewrites() {
    return [];
  },
};

export default nextConfig;
