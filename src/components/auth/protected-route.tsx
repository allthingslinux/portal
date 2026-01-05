// ============================================================================
// Protected Route Component
// ============================================================================
// This component protects routes by checking authentication status using
// Better Auth UI components. See: https://better-auth-ui.com/llms.txt
//
// Components:
//   - AuthLoading: Shows loading state while checking authentication
//     - Displays fallback or default skeleton while loading
//     - Automatically handles loading state from authClient
//   - RedirectToSignIn: Redirects unauthenticated users to sign-in page
//     - Only renders when user is not authenticated
//     - Uses redirectTo from AuthUIProvider or defaults to /auth/sign-in
//   - SignedIn: Renders children only when user is authenticated
//     - Automatically handles authentication state
//     - Re-renders when session changes
//
// Usage:
//   <ProtectedRoute>
//     <YourProtectedContent />
//   </ProtectedRoute>
//
//   <ProtectedRoute fallback={<CustomLoading />}>
//     <YourProtectedContent />
//   </ProtectedRoute>

import {
  AuthLoading,
  RedirectToSignIn,
  SignedIn,
} from "@daveyplate/better-auth-ui";

import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  return (
    <>
      <AuthLoading>
        {fallback || (
          <div className="flex flex-col space-y-3 p-6">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        )}
      </AuthLoading>

      <RedirectToSignIn />

      <SignedIn>{children}</SignedIn>
    </>
  );
}
