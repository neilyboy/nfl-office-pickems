/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['a.espncdn.com'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
