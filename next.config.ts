import type { NextConfig } from 'next';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  // Exclude seed file from build
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
  // Exclude prisma seed from TypeScript checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    typedRoutes: false,
  }
};

const nextConfig = baseConfig;
export default nextConfig;
