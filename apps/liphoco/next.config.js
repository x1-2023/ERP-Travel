/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@erp/database'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
