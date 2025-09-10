import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add cache-busting headers
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },

  // Optional: Disable CSS optimization for dev
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
