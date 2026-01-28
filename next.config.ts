import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Use relative paths so the compiled config resolves in Docker/Node (no @/ alias at config load time)
import { config } from "./src/shared/next-config";
import { withAnalyzer } from "./src/shared/next-config/with-analyzer";
import { withObservability } from "./src/shared/next-config/with-observability";

const withNextIntl = createNextIntlPlugin();

let nextConfig: NextConfig = {
  // ============================================================================
  // Core Configuration
  // ============================================================================

  // Enable React Strict Mode for better development experience
  // Helps identify problems early and prepares for React's future features
  reactStrictMode: true,

  // Disable x-powered-by header for security
  // Reduces information disclosure about the technology stack
  poweredByHeader: false,

  // Enable gzip compression for rendered content and static files
  // Improves performance by reducing payload size (only works with server target)
  compress: true,

  // Enable statically typed routes for better type safety
  // Provides autocomplete and type checking for Next.js Link href props
  // Requires TypeScript to be used in the project
  typedRoutes: true,

  // Enable Cache Components (Next.js 16+) for opt-in caching and PPR
  // Use "use cache" + cacheLife/cacheTag in server components or data helpers
  cacheComponents: true,

  // ============================================================================
  // TypeScript Configuration
  // ============================================================================

  // Enforce strict type checking during production builds
  // Builds will fail if TypeScript errors are present, ensuring type safety
  // This matches the project's strict TypeScript configuration
  typescript: {
    // Fail builds on TypeScript errors (default, but explicit for clarity)
    ignoreBuildErrors: false,
    // Use the root tsconfig.json (default, but explicit for clarity)
    tsconfigPath: "tsconfig.json",
  },

  // ============================================================================
  // Build Configuration
  // ============================================================================

  // Enable standalone output for Docker deployments
  // Creates a minimal server.js file with only necessary dependencies
  // Reduces Docker image size and improves startup time
  output: "standalone",

  // Generate consistent build IDs for multi-container deployments
  // Ensures the same build ID is used across all containers in a deployment
  // Priority: GIT_HASH env var > git rev-parse > timestamp fallback
  generateBuildId: async () => {
    // Use GIT_HASH if provided (common in CI/CD pipelines)
    if (process.env.GIT_HASH) {
      return process.env.GIT_HASH;
    }

    // Try to get git commit hash directly
    try {
      const gitHash = execSync("git rev-parse --short HEAD", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      if (gitHash) {
        return gitHash;
      }
    } catch {
      // Git not available or not a git repo, fall through to timestamp
    }

    // Fallback to timestamp if git is not available
    // This ensures builds always have a unique ID even without git
    return `build-${Date.now()}`;
  },

  // ============================================================================
  // Server External Packages
  // ============================================================================
  // Opt-out deps from Server Components/Route Handler bundling; they use Node
  // require at runtime. Next.js auto opt-outs many packages (pg, @sentry/profiling-node,
  // etc.)—only list packages not in that built-in list.
  serverExternalPackages: [
    "@sentry/node-native", // Native module with dynamic requires, cannot be bundled
    "@sentry-internal/node-native-stacktrace", // Native stacktrace module
  ],

  // ============================================================================
  // Turbopack Configuration
  // ============================================================================
  // Customize Turbopack module resolution, loaders, and build behavior
  //
  // Note: TypeScript path aliases (like @/, @/auth, @/db, etc.) work automatically
  // with Turbopack and don't need to be configured here. They are resolved from tsconfig.json.
  //
  // Root directory is automatically detected via pnpm-lock.yaml
  // If you need to use npm link/yarn link with packages outside the project root,
  // configure the root option manually.
  //
  // Turbopack has built-in support for:
  // - CSS, SCSS, Sass (sass-loader configured automatically)
  // - Modern JavaScript/TypeScript compilation
  // - Next.js features (Image, Font optimization, etc.)
  turbopack: {
    // Enable debug IDs generation (experimental)
    // Adds debug IDs to JavaScript bundles and source maps for better debugging
    // Available via globalThis._debugIds in the browser
    // debugIds: false, // Default: false, uncomment to enable
    // Configure custom loaders for specific file types
    // Example: Use @svgr/webpack to import SVGs as React components
    // rules: {
    //   '*.svg': {
    //     loaders: ['@svgr/webpack'],
    //     as: '*.js',
    //   },
    // },
    // Resolve module aliases (similar to webpack resolve.alias)
    // Useful for aliasing packages or polyfills
    // resolveAlias: {
    //   underscore: 'lodash',
    // },
    // Customize module resolution extensions
    // Overwrites default extensions, so include all needed extensions
    // resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    // Manually set root directory (auto-detected via pnpm-lock.yaml by default)
    // Only needed for monorepos or when using linked dependencies outside project root
    // root: path.join(__dirname, '..'),
  },

  // ============================================================================
  // Security & Production
  // ============================================================================

  // Disable source maps in production by default
  // Prevents source code leakage while maintaining debugging in development
  // Only enable if you specifically need production source maps for error tracking
  productionBrowserSourceMaps: false,

  // Security headers for production
  // These headers help protect against common web vulnerabilities
  async headers() {
    const securityHeaders = [
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "Document-Policy",
        value: "js-profiling",
      },
    ];

    // Add CSP reporting headers if Sentry is configured
    // Use keys() helper for consistent environment variable access
    let sentryDsn: string | undefined;
    let sentryRelease: string | undefined;
    try {
      // Import keys() helper for validated env access
      const { keys: observabilityKeys } = await import(
        "@/shared/observability/keys"
      );
      const env = observabilityKeys();
      sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN;
      sentryRelease = env.SENTRY_RELEASE;
    } catch {
      // Fallback to process.env if keys() fails (shouldn't happen, but defensive)
      sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
      sentryRelease = process.env.SENTRY_RELEASE;
    }

    if (sentryDsn) {
      try {
        const dsnUrl = new URL(sentryDsn);
        const publicKey = dsnUrl.username;
        const projectId = dsnUrl.pathname.split("/")[1];
        const orgDomain = dsnUrl.hostname;

        // Validate parsed URL components
        if (!(publicKey && projectId && orgDomain)) {
          throw new Error(
            "Invalid Sentry DSN format: missing required components"
          );
        }

        const reportUri = `https://${orgDomain}/api/${projectId}/security/?sentry_key=${publicKey}&sentry_environment=${process.env.NODE_ENV}&sentry_release=${sentryRelease || "unknown"}`;

        // Note: CSP headers with nonce support are set dynamically in proxy.ts
        // The proxy generates per-request nonces and sets CSP using 'strict-dynamic'
        // This static Report-Only header is kept for monitoring/reporting purposes only
        // TODO: Once all inline scripts/styles use nonces, remove unsafe-eval and unsafe-inline
        securityHeaders.push({
          key: "Content-Security-Policy-Report-Only",
          value: `default-src 'self'; script-src 'self' 'nonce-*' 'strict-dynamic' https://js.sentry-cdn.com; style-src 'self' 'nonce-*' 'strict-dynamic'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://${orgDomain} https://js.sentry-cdn.com; report-uri ${reportUri}; report-to csp-endpoint`,
        });

        // Modern reporting headers
        securityHeaders.push({
          key: "Report-To",
          value: JSON.stringify({
            group: "csp-endpoint",
            max_age: 10_886_400,
            endpoints: [{ url: reportUri }],
            include_subdomains: true,
          }),
        });

        securityHeaders.push({
          key: "Reporting-Endpoints",
          value: `csp-endpoint="${reportUri}"`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn("Failed to configure CSP reporting:", errorMessage);
      }
    }

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

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
  // browserDebugInfoInTerminal:
  //   - Forwards browser console logs and errors to dev server terminal
  //   - Useful for debugging client-side issues without switching contexts
  //
  // Turbopack:
  //   - Enabled by default in Next.js 16.1.1
  //   - Significantly faster than Webpack for development
  //   - Automatically optimizes imports (including barrel files)
  //
  // Turbopack FileSystem Cache:
  //   - Saves and restores data to .next folder between builds/dev sessions
  //   - Greatly speeds up subsequent builds and dev sessions
  //   - Dev cache is enabled by default in Next.js 16.1.0+
  //   - Build cache is experimental but can significantly improve build times

  experimental: {
    // Only load modules actually used from multi-export packages (lucide-react, date-fns,
    // recharts, etc. are optimized by default). Add packages not in that list here.
    optimizePackageImports: ["lodash"],

    // Cache fetch responses during HMR to speed up Server Component reloads
    // This is especially useful when Server Components make API calls or
    // database queries, as it avoids re-fetching on every file change
    serverComponentsHmrCache: true,

    // Forward browser console logs and runtime errors to terminal
    // Only active in development mode
    browserDebugInfoInTerminal: {
      showSourceLocation: true,
    },

    // Enable Turbopack FileSystem caching for development
    // Caches compilation results to .next folder for faster subsequent dev sessions
    // Enabled by default in Next.js 16.1.0+, but explicit for clarity
    turbopackFileSystemCacheForDev: true,

    // Enable Turbopack FileSystem caching for production builds (experimental)
    // Speeds up incremental builds by caching compilation results
    // Note: Experimental feature, but stable enough for most use cases
    turbopackFileSystemCacheForBuild: true,

    // Enable Web Vitals attribution for detailed performance debugging
    // Provides element-level information for metrics like:
    // - CLS: Identifies which element caused layout shifts
    // - LCP: Identifies the largest contentful paint element (and its URL if it's an image)
    // Attribution data includes PerformanceEventTiming, PerformanceNavigationTiming,
    // and PerformanceResourceTiming entries for deeper analysis
    // Note: Experimental feature, useful for development/debugging
    webVitalsAttribution: ["CLS", "LCP"],

    // Enable typed environment variables for IntelliSense
    // Generates .d.ts file in .next/types with environment variable types
    // Provides autocomplete and type checking for process.env variables in your editor
    // Types are generated based on environment variables loaded at development runtime
    // To include production-specific variables, run: NODE_ENV=production next dev
    typedEnv: true,

    // Extra safeguard against passing sensitive objects/values to Client Components.
    // Enables React experimental_taintObjectReference / experimental_taintUniqueValue.
    // Use in DAL or server code to mark values that must not cross the server–client boundary.
    // Additive to DTOs and server-only; not a substitute for sanitization.
    taint: true,
  },

  // ============================================================================
  // Logging Configuration
  // ============================================================================
  // Configure what gets logged during development
  // Uncomment fetches.fullUrl to see complete URLs for debugging
  logging: {
    fetches: {
      fullUrl: true, // Uncomment to log full fetch URLs in development
    },
  },

  // ============================================================================
  // Image Optimization
  // ============================================================================
  // Configure Next.js Image component behavior
  // Add remotePatterns if you need to load images from external domains
  images: {
    // Add remote domains here when needed
    // Example:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'example.com',
    //     pathname: '/images/**',
    //   },
    // ],
    formats: ["image/avif", "image/webp"],
  },

  // ============================================================================
  // Script Configuration
  // ============================================================================
  // Set crossOrigin attribute for next/script tags
  // Matches the crossOrigin="anonymous" used in layout.tsx
  crossOrigin: "anonymous",
  // Merge with base config from next-config package
  ...config,
};

// Apply observability configuration (Sentry source maps, etc.)
// Only applies if SENTRY_ORG and SENTRY_PROJECT are configured
nextConfig = withObservability(nextConfig);

// Apply bundle analyzer if ANALYZE env var is set
if (process.env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default withNextIntl(nextConfig);
