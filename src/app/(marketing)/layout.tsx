import { requireUser } from '~/core/database/supabase/require-user';
import { getSupabaseServerClient } from '~/core/database/supabase/clients/server-client';

import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/shared/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  const client = getSupabaseServerClient();
  const user = await requireUser(client, { verifyMfa: false });

  return (
    <div className={'flex min-h-[100vh] flex-col'}>
      <SiteHeader user={user.data} />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
