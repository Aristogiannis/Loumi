import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        // Allow favicons from any domain for web search results
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features for AI SDK
  experimental: {
    // Enable server actions (already stable in Next.js 15)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. Enable only if you're confident in your CI.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
