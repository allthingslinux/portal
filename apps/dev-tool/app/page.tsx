import { EnvMode } from '@/app/variables/lib/types';
import { EnvModeSelector } from '@/components/env-mode-selector';
import { ServiceCard } from '@/components/status-tile';

import { Page, PageBody, PageHeader } from '@portal/ui/page';

import { createConnectivityService } from './lib/connectivity-service';

type DashboardPageProps = React.PropsWithChildren<{
  searchParams: Promise<{ mode?: EnvMode }>;
}>;

export default async function DashboardPage(props: DashboardPageProps) {
  const mode = (await props.searchParams).mode ?? 'development';
  const connectivityService = createConnectivityService(mode);

    [
      connectivityService.checkSupabaseConnectivity(),
      connectivityService.checkSupabaseAdminConnectivity(),
    ],
  );

  return (
    <Page style={'custom'}>
      <PageHeader
        displaySidebarTrigger={false}
        title={'Dev Tool'}
      >
        <EnvModeSelector mode={mode} />
      </PageHeader>

      <PageBody className={'space-y-8 py-2'}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <ServiceCard name={'Supabase API'} status={supabaseStatus} />
          <ServiceCard name={'Supabase Admin'} status={supabaseAdminStatus} />
        </div>
      </PageBody>
    </Page>
  );
}
