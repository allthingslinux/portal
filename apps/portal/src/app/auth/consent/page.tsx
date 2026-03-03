import { AuthView } from "@daveyplate/better-auth-ui";

// ============================================================================
// OAuth Consent Page
// ============================================================================
// This page handles OAuth 2.1 provider consent flow using Better Auth UI.
// See: https://better-auth-ui.com/llms.txt
//
// When a client application requests access to user resources, users are
// redirected here to grant or deny consent. The AuthView component handles
// the consent UI and OAuth flow automatically.
//
// This page is used by the OAuth 2.1 Provider plugin when:
//   - A client requests authorization with scopes
//   - User needs to approve/deny the requested permissions
//   - Consent screen needs to be displayed

export default function ConsentPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center font-bold text-2xl">
          Authorize Application
        </h1>
        <p className="text-center text-muted-foreground text-sm">
          An application is requesting access to your account
        </p>
        <AuthView path="consent" />
      </div>
    </div>
  );
}
