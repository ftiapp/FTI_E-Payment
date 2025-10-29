import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: process.cwd(),
  },
  // Production optimizations
  serverExternalPackages: ['mysql2'],
  // Handle reverse proxy headers for production deployment
  experimental: {
    serverActions: {
      allowedOrigins: ['ftie-payment-7vekz.kinsta.app', 'pgw-ui.2c2p.com', '*.kinsta.app'],
    },
  },
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
