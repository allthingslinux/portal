"use client";

import { initializeSentry } from "@/shared/observability/client";

// Initialize Sentry on client-side
initializeSentry();

import type { ReactNode } from "react";
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
import { authClient } from "@/features/auth/lib/auth/client";
import { useBetterAuthUILocalization } from "@/features/auth/lib/auth/localization";
import { SessionProvider } from "@/features/auth/lib/auth/session-context";
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
// Additional configuration options (commented):
//   - additionalFields: Custom fields for signup/settings
//   - account: Account settings configuration
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
              // API Key management
              // Can be boolean (true) or object with configuration
              // Example object: { prefix: "app_", metadata: { environment: "production" } }
              apiKey
              // Better Auth client instance
              authClient={authClient}
              // Email/password authentication
              credentials
              // Localization: Maps next-intl translations to Better Auth UI format
              // All strings are automatically translated using our locale files
              Link={LinkWrapper}
              // Next.js Link component for client-side navigation
              // Wrapper needed for Better Auth UI compatibility with Next.js typed routes
              localization={localization}
              // Multiple device session management
              multiSession
              // Programmatic navigation function
              navigate={navigate}
              // Callback when session changes (refreshes server components)
              onSessionChange={() => router.refresh()}
              // Persist client for offline auth (set to true if using persistQueryClient)
              passkey
              // WebAuthn/passkey authentication
              persistClient={false}
              // Redirect URL after successful authentication
              redirectTo="/app"
              // Replace current history entry instead of pushing
              replace={replace}
              // Two-factor authentication methods
              // Options: ["otp", "totp"] or boolean (true for both)
              twoFactor={["otp", "totp"]}
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
              // account={{
              //   basePath: "/account",
              // }}
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
  );
}
