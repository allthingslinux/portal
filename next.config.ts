import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // ============================================================================
  // Development Optimizations
  // ============================================================================
  // These optimizations improve local development performance:
  //
  // serverComponentsHmrCache:
  //   - Caches fetch responses in Server Components across HMR refreshes
  //   - Reduces API calls and speeds up development hot reloading
  //   - Only affects development, not production builds
  //
  // Turbopack:
  //   - Enabled by default in Next.js 16.1.1
  //   - Significantly faster than Webpack for development
  //   - Automatically optimizes imports (including barrel files)

  experimental: {
    // Cache fetch responses during HMR to speed up Server Component reloads
    // This is especially useful when Server Components make API calls or
    // database queries, as it avoids re-fetching on every file change
    serverComponentsHmrCache: true,
  },

  // ============================================================================
  // Logging Configuration
  // ============================================================================
  // Uncomment to enable detailed fetch logging during development
  // This helps debug which requests are cached vs uncached
  //
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  //   },
};

export default withNextIntl(nextConfig);
