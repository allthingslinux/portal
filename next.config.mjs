// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Remove this when pushing to production
  reactStrictMode: false,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
