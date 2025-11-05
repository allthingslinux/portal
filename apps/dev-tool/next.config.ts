import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@portal/ui', '@portal/shared'],
  reactCompiler: true,
  devIndicators: {
    position: 'bottom-right',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
