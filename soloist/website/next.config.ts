import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Suppress X-Powered-By header to avoid leaking server information
  poweredByHeader: false,
  
  // Ensure convex packages are resolved from the same location
  transpilePackages: ['convex', '@convex-dev/auth'],
  
  experimental: {
    externalDir: true, // Allow imports from outside the website directory
  },
  
  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    resolveAlias: {
      '@/convex': path.resolve(__dirname, '../convex'),
    },
  },
  
  // Webpack fallback for production builds using --webpack flag
  webpack: (config, { isServer }) => {
    // Add alias for convex to point to the root convex directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/convex': path.resolve(__dirname, '../convex'),
    };
    return config;
  },
  // Security headers to mitigate XSS and other attacks
  async headers() {
    // Define common security headers
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.convex.cloud https://*.clerk.accounts.dev https://challenges.cloudflare.com https://js.stripe.com https://*.stripe.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.clerk.accounts.dev https://api.stripe.com https://*.stripe.com",
          "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://js.stripe.com https://*.stripe.com https://website-demo-eight.vercel.app",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
          "block-all-mixed-content",
          "upgrade-insecure-requests",
        ].join("; "),
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Restrict CORS for static assets (fonts, images, etc.)
        source: "/_next/static/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Access-Control-Allow-Origin",
            value: "https://soloist.acdc.digital",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
      {
        // Restrict CORS for public assets
        source: "/public/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Access-Control-Allow-Origin",
            value: "https://soloist.acdc.digital",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
        ],
      },
      {
        // Cache control for sitemap and robots - public, revalidate daily
        source: "/(sitemap.xml|robots.txt)",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
      {
        // Cache control for static assets - immutable, long cache
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // No cache for HTML pages (dynamic content)
        source: "/((?!_next/static|favicon.ico|sitemap.xml|robots.txt).*)",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
