import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";

import { Button } from "@/components/ui/button";

// ============================================================================
// Home Page
// ============================================================================
// This page uses Better Auth UI components for conditional rendering based on
// authentication state. See: https://better-auth-ui.com/llms.txt
//
// Components:
//   - SignedOut: Renders content only when user is not authenticated
//   - SignedIn: Renders content only when user is authenticated
//   - UserButton: Complete user menu component with:
//     - User avatar
//     - Dropdown menu with account options
//     - Sign out functionality
//     - Settings link
//     - Profile information
//
// Alternative: You can use authClient.useSession() hook for more control:
//   const { data: session } = authClient.useSession();
//   if (!session) { ... } else { ... }

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-4xl">Portal V2</h1>
        <p className="text-muted-foreground text-xl">
          Welcome to your authentication-enabled Next.js app
        </p>
      </div>

      <SignedOut>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <UserButton />
          <Button asChild>
            <Link href="/app">Go to Dashboard</Link>
          </Button>
        </div>
      </SignedIn>
    </div>
  );
}
