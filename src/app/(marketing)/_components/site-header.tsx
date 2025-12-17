import { AppLogo } from "~/components/app-logo";
import { Header } from "~/components/portal/marketing";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";

import { SiteHeaderAccountSection } from "./site-header-account-section";
import { SiteNavigation } from "./site-navigation";

export function SiteHeader(props: { user?: BetterAuthUser | null }) {
  return (
    <Header
      actions={<SiteHeaderAccountSection user={props.user ?? null} />}
      logo={<AppLogo />}
      navigation={<SiteNavigation />}
    />
  );
}
