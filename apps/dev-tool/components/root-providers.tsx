'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nProvider } from '@portal/i18n/provider';
import { Toaster } from '@portal/ui/sonner';

import { i18nResolver } from '../lib/i18n/i18n.resolver';
import { getI18nSettings } from '../lib/i18n/i18n.settings';

export function RootProviders(props: React.PropsWithChildren) {
  return (
    <I18nProvider settings={getI18nSettings('en')} resolver={i18nResolver}>
      <ReactQueryProvider>{props.children}</ReactQueryProvider>
    </I18nProvider>
  );
}

function ReactQueryProvider(props: React.PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}

      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
