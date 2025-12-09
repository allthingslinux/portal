import { SiteFooter } from "~/(marketing)/_components/site-footer";
import { SiteHeader } from "~/(marketing)/_components/site-header";
import { requireUser } from "~/core/database/supabase/require-user";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

async function SiteLayout(props: React.PropsWithChildren) {
  const user = await requireUser();

  return (
    <div className={"flex min-h-screen flex-col"}>
      <SiteHeader user={user.data} />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
