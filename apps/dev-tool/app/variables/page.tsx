import { use } from 'react';

import {
  processEnvDefinitions,
  scanMonorepoEnv,
} from '@/app/variables/lib/env-scanner';
import { EnvMode } from '@/app/variables/lib/types';

import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { Page, PageBody, PageHeader } from '@portal/ui/page';

import { AppEnvironmentVariablesManager } from './components/app-environment-variables-manager';

type VariablesPageProps = {
  searchParams: Promise<{ mode?: EnvMode }>;
};

export const metadata = {
  title: 'Environment Variables',
};

export default function VariablesPage({ searchParams }: VariablesPageProps) {
  const { mode = 'development' } = use(searchParams);
  const apps = use(scanMonorepoEnv({ mode }));

  return (
    <Page style={'custom'}>
      <div className={'flex h-screen flex-col overflow-hidden'}>
        <PageHeader
          displaySidebarTrigger={false}
          title={'Environment Variables'}
          description={
            'Manage environment variables for your applications. Validate and set them up easily.'
          }
        />

        <PageBody className={'overflow-hidden'}>
          <div className={'flex h-full flex-1 flex-col space-y-4'}>
            {apps.map((app) => {
              const appEnvState = processEnvDefinitions(app, mode);

              return (
                <AppEnvironmentVariablesManager
                  key={app.appName}
                  state={appEnvState}
                />
              );
            })}
          </div>
        </PageBody>
      </div>
    </Page>
  );
}
