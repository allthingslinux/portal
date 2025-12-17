/**
 * Loading state for sign-in page
 * Shows immediately while proxy redirects to OAuth
 */
export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
