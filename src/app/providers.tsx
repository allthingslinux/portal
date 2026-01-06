"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";

import { ErrorBoundary } from "@/components/error-boundary";
import { getQueryClient } from "@/lib/api/query-client";
import { authClient } from "@/auth/client";

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

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Get QueryClient instance (singleton on client, new instance per request on server)
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      {/* QueryClientProvider for general data fetching hooks */}
      <QueryClientProvider client={queryClient}>
        {/* AuthQueryProvider for Better Auth's TanStack Query integration */}
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
              // Next.js Link component for client-side navigation
              Link={Link}
              // Multiple device session management
              multiSession
              // Programmatic navigation function
              navigate={router.push}
              // Callback when session changes (refreshes server components)
              onSessionChange={() => router.refresh()}
              // Persist client for offline auth (set to true if using persistQueryClient)
              passkey
              // WebAuthn/passkey authentication
              persistClient={false}
              // Redirect URL after successful authentication
              redirectTo="/app"
              // Replace current history entry instead of pushing
              replace={router.replace}
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
              {children}
              <Toaster />
            </AuthUIProviderTanstack>
            {/* React Query Devtools - Only included in development builds */}
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools
                buttonPosition="bottom-right"
                initialIsOpen={false}
                position="bottom"
              />
            )}
          </AuthQueryProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
