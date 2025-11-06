import { JWTUserData } from '~/core/database/supabase/types';
import { Header } from '~/components/makerkit/marketing';

import { AppLogo } from '~/components/app-logo';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

export function SiteHeader(props: { user?: JWTUserData | null }) {
  return (
    <Header
      logo={<AppLogo />}
      navigation={<SiteNavigation />}
      actions={<SiteHeaderAccountSection user={props.user ?? null} />}
    />
  );
}
