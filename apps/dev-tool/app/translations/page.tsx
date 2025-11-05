import { Metadata } from 'next';

import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { Page, PageBody, PageHeader } from '@portal/ui/page';

import { TranslationsComparison } from './components/translations-comparison';
import { loadTranslations } from './lib/translations-loader';

export const metadata: Metadata = {
  title: 'Translations Comparison',
  description: 'Compare translations across different languages',
};

export default async function TranslationsPage() {
  const translations = await loadTranslations();

  return (
    <Page style={'custom'}>
      <PageHeader
        displaySidebarTrigger={false}
        title={'Translations'}
        description={
          'Compare translations across different languages. Ensure consistency and accuracy in your translations.'
        }
      />

      <PageBody className={'py-4'}>
        <TranslationsComparison translations={translations} />
      </PageBody>
    </Page>
  );
}
