"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Script from "next/script";

/**
 * DevTools Component
 * Centralized component for all development tools and debugging utilities.
 * Only loads and initializes tools in development mode.
 *
 * Tools included:
 * - React Scan: Performance profiling (requires NEXT_PUBLIC_REACT_SCAN_ENABLED=true)
 * - React Grab: Cursor tracking and interaction debugging
 * - React Query Devtools: Query debugging (exported separately, must be inside QueryClientProvider)
 *
 * Usage:
 * - Default dev: All tools except React Scan
 * - With React Scan: Set NEXT_PUBLIC_REACT_SCAN_ENABLED=true and run `pnpm scan`
 *
 * Note: This component should be placed in the <head> for scripts and in the <body> for components.
 * ReactQueryDevtools must be rendered inside QueryClientProvider context (see Providers.tsx).
 */
export function DevTools(): React.ReactNode | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Note: Nonce is not passed to Script components because:
  // 1. CSP is in Report-Only mode, so nonces aren't enforced
  // 2. Passing nonces causes hydration mismatches between server/client
  // 3. Nonces will be added when CSP is switched to enforcing mode
  //
  // Scripts are only rendered client-side to prevent Next.js from auto-injecting
  // nonces from headers during SSR, which causes hydration mismatches.
  return (
    <>
      {/* React Grab - Cursor tracking and interaction debugging */}
      {isClient && (
        <>
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-grab/dist/index.global.js"
            strategy="afterInteractive"
          />
          <Script
            src="//unpkg.com/@react-grab/cursor/dist/client.global.js"
            strategy="lazyOnload"
          />
        </>
      )}

      {/* React Scan - Performance profiling (client-side only) */}
      {isClient && <ReactScan />}
    </>
  );
}

/**
 * ReactScan Component
 * Only enables react-scan when REACT_SCAN_ENABLED environment variable is set
 * This prevents CORS errors when the react-scan server (port 5567) isn't running
 */
function ReactScan(): React.ReactNode | null {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check environment variable at runtime (client-side only)
    const enabled = process.env.NEXT_PUBLIC_REACT_SCAN_ENABLED === "true";
    setIsEnabled(enabled);

    if (!enabled) {
      return;
    }

    // Dynamically import react-scan only when enabled
    // This prevents the module from initializing and attempting connections
    // when the environment variable is not set
    import("react-scan/all-environments")
      .then((module) => {
        try {
          module.scan({
            enabled: true,
          });
        } catch (error) {
          // Silently fail if react-scan can't initialize
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[DevTools] React Scan failed to initialize. Make sure the react-scan server is running (port 5567).",
              error
            );
          }
        }
      })
      .catch((error) => {
        // Handle import errors (e.g., module not found)
        if (process.env.NODE_ENV === "development") {
          console.warn("[DevTools] Failed to load react-scan module.", error);
        }
      });
  }, []);

  // Return null if not enabled to prevent any rendering
  if (!isEnabled) {
    return null;
  }

  return null;
}

/**
 * ReactQueryDevtools Component
 * TanStack Query devtools for debugging queries, mutations, and cache state.
 * Must be rendered inside QueryClientProvider context.
 *
 * This component is exported separately so it can be used in Providers.tsx
 * where QueryClientProvider is available.
 */
export function ReactQueryDevtools({
  buttonPosition = "bottom-right",
  initialIsOpen = false,
  position = "bottom",
}: {
  buttonPosition?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  initialIsOpen?: boolean;
  position?: "bottom" | "top";
} = {}): React.ReactNode | null {
  // Hooks must be called before any conditional returns
  const [Devtools, setDevtools] = useState<React.ComponentType<{
    buttonPosition?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
    initialIsOpen?: boolean;
    position?: "bottom" | "top";
  }> | null>(null);

  useEffect(() => {
    // Only load in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    import("@tanstack/react-query-devtools").then((mod) => {
      setDevtools(() => mod.ReactQueryDevtools);
    });
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!Devtools) {
    return null;
  }

  return (
    <Devtools
      buttonPosition={buttonPosition}
      initialIsOpen={initialIsOpen}
      position={position}
    />
  );
}
