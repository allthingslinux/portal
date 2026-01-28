"use client";

import { type ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { CommandMenu } from "@/components/command-menu";
import { ReactQueryDevtools } from "@/components/dev-tools";
import { ErrorBoundary } from "@/components/error-boundary";
import { authClient } from "@/auth/client";
import { useBetterAuthUILocalization } from "@/auth/localization";
import { SessionProvider } from "@/auth/session-context";
import { getQueryClient } from "@/shared/api/query-client";

// Note: We use our own QueryClientProvider for general data fetching hooks.
// AuthQueryProvider is still needed for Better Auth's TanStack Query integration.

// ============================================================================
// Better Auth UI Provider Configuration with TanStack Query
// ============================================================================
// This provider wraps the application with Better Auth UI functionality
// integrated with TanStack Query for better data management and caching.
// See: https://better-auth-ui.com/data/tanstack-query
//
// Features enabled:
//   - apiKey: API key management in settings
//   - credentials: Email/password authentication
//   - passkey: WebAuthn/passkey authentication
//   - multiSession: Multiple device session management
//   - twoFactor: Two-factor authentication (OTP and TOTP)
//
// Navigation:
//   - Uses Next.js Link component for client-side navigation
//   - Uses Next.js router for programmatic navigation
//   - Redirects to /app after successful authentication
//
// TanStack Query:
//   - persistClient: Set to false (set to true if using persistQueryClient)
//   - AuthQueryProvider wraps everything to provide query context
//
// Custom account settings:
//   - account.basePath: "/app/settings"; viewPaths: { SETTINGS: "account" } so links
//     are /app/settings/account, /app/settings/security, /app/settings/api-keys
//     (avoids redundant settings/settings).
//   - We use "Build custom layouts" per https://better-auth-ui.com/advanced/custom-settings:
//     one route /app/settings with nuqs ?tab=account|security|api-keys and our own
//     Tabs + AccountSettingsCards, SecuritySettingsCards, ApiKeysCard.
//   - app/settings/[segment]/page redirects those segments to /app/settings?tab=...
//
// Custom auth paths (optional):
//   - viewPaths: Custom auth URLs (e.g. SIGN_IN: "login" → /auth/login).
//   - account.viewPaths: Custom account segment names (SETTINGS, SECURITY, API_KEYS).
//   See: https://better-auth-ui.com/advanced/custom-auth-paths
//
// Additional configuration options (commented):
//   - additionalFields: Custom fields for signup/settings
//   - account: Account settings configuration (basePath, viewPaths)
//   - organization: Organization management (if needed)
//   - signUp: Sign up form configuration
//   - signIn: Sign in form configuration

// Wrapper component for Link to match Better Auth UI's expected type
// Better Auth UI expects string href, but Next.js 16 typed routes use RouteImpl
function LinkWrapper({
  href,
  className,
  children,
  ...props
}: {
  href: string;
  className?: string;
  children: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: unknown;
}) {
  return (
    <Link
      className={className}
      href={href as Parameters<typeof Link>[0]["href"]}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Get QueryClient instance (singleton on client, new instance per request on server)
  const queryClient = getQueryClient();

  // Get Better Auth UI localization from next-intl translations
  // This hook automatically uses useTranslations() internally
  const localization = useBetterAuthUILocalization();

  // Type-safe wrappers for Better Auth UI compatibility with Next.js typed routes
  // Better Auth UI expects string types, but Next.js 16 typed routes use RouteImpl
  // Cast non-literal strings to Route type as per Next.js documentation
  const navigate = (href: string) => {
    router.push(href as Route);
  };

  const replace = (href: string) => {
    router.replace(href as Route);
  };

  return (
    <>
      <SentryClientInit />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        {/* QueryClientProvider for general data fetching hooks */}
        <QueryClientProvider client={queryClient}>
          {/* AuthQueryProvider for Better Auth's TanStack Query integration
            Note: In development with React Strict Mode, you may see multiple
            /api/auth/get-session requests on initial load. This is expected
            due to double mounting. TanStack Query automatically deduplicates
            these requests, and in production this won't occur. */}
          <ErrorBoundary>
            <AuthQueryProvider>
              <AuthUIProviderTanstack
                // Account settings: fields default to ["image", "name"]. Avatar card
                // is shown only when avatar is set; true = base64 in DB, or pass
                // { upload, delete } for custom storage.
                account={{
                  basePath: "/app/settings",
                  viewPaths: { SETTINGS: "account" },
                }}
                // API Key management
                // Can be boolean (true) or object with configuration
                // Example object: { prefix: "app_", metadata: { environment: "production" } }
                apiKey
                // Better Auth client instance
                authClient={authClient}
                // Email/password authentication
                avatar
                // Localization: Maps next-intl translations to Better Auth UI format
                // All strings are automatically translated using our locale files
                credentials
                // Next.js Link component for client-side navigation
                // Wrapper needed for Better Auth UI compatibility with Next.js typed routes
                Link={LinkWrapper}
                // Multiple device session management
                localization={localization}
                // Programmatic navigation function
                multiSession
                // Callback when session changes (refreshes server components)
                navigate={navigate}
                // Persist client for offline auth (set to true if using persistQueryClient)
                onSessionChange={() => router.refresh()}
                // WebAuthn/passkey authentication
                passkey
                // Redirect URL after successful authentication
                persistClient={false}
                // Replace current history entry instead of pushing
                redirectTo="/app"
                // Two-factor authentication methods
                // Options: ["otp", "totp"] or boolean (true for both)
                replace={replace}
                // Additional configuration options (uncomment if needed):
                // additionalFields={{
                //   company: {
                //     label: "Company",
                //     placeholder: "Your company name",
                //     description: "Enter your company name",
                //     required: true,
                //     type: "string",
                //   },
                // }}
                twoFactor={["otp", "totp"]}
                // viewPaths={{ SIGN_IN: "login", SIGN_UP: "register", FORGOT_PASSWORD: "forgot", ... }}
                // signUp={{
                //   fields: ["company"], // Include additional fields in signup
                // }}
                // settings={{
                //   fields: ["company"], // Include additional fields in settings
                // }}
              >
                {/* SessionProvider consolidates session usage to a single query */}
                <SessionProvider>
                  {children}
                  <Toaster />
                  <CommandMenu />
                </SessionProvider>
              </AuthUIProviderTanstack>
              {/* React Query Devtools - Only included in development builds */}
              <ReactQueryDevtools
                buttonPosition="bottom-right"
                initialIsOpen={false}
                position="bottom"
              />
            </AuthQueryProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

/** Loads and runs client Sentry init only in the browser. Avoids pulling in @sentry/nextjs during server render (next-prerender-crypto). */
function SentryClientInit() {
  useEffect(() => {
    import("@/shared/observability/client")
      .then(({ initializeSentry }) => {
        initializeSentry();
      })
      .catch(() => {
        // Best-effort; ignore load errors (e.g. missing DSN in dev)
      });
  }, []);
  return null;
}
