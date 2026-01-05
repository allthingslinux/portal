"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ThemeProvider } from "next-themes";

import { authClient } from "@/auth/client";

// ============================================================================
// Better Auth UI Provider Configuration
// ============================================================================
// This provider wraps the application with Better Auth UI functionality.
// See: https://better-auth-ui.com/llms.txt
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
// Additional configuration options (commented):
//   - additionalFields: Custom fields for signup/settings
//   - account: Account settings configuration
//   - organization: Organization management (if needed)
//   - signUp: Sign up form configuration
//   - signIn: Sign in form configuration

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <AuthUIProvider
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
        // WebAuthn/passkey authentication
        passkey
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
      </AuthUIProvider>
    </ThemeProvider>
  );
}
