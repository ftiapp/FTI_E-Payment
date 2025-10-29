import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: process.cwd(),
  },
  // Production optimizations
  serverExternalPackages: ['mysql2'],
  // Handle large responses and timeouts
  async rewrites() {
    return [];
  },
  // Increase timeout for production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
