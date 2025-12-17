import { SiteFooter } from "~/(marketing)/_components/site-footer";
import { SiteHeader } from "~/(marketing)/_components/site-header";
import { getSessionUserData } from "~/core/auth/better-auth/session";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

async function SiteLayout(props: React.PropsWithChildren) {
  // Marketing pages are public - get user if logged in, but don't require it
  // getSessionUserData() returns null if not authenticated (doesn't throw)
  let user: BetterAuthUser | null = null;
  try {
    user = await getSessionUserData();
  } catch (error) {
    // Silently handle any errors - marketing pages should always be accessible
    // Even if session check fails, continue without user
    if (process.env.NODE_ENV === "development") {
      console.warn("Session check failed in marketing layout:", error);
    }
  }

  return (
    <div className={"flex min-h-screen flex-col"}>
      <SiteHeader user={user} />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
