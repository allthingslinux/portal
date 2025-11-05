import { SidebarProvider } from '@portal/ui/shadcn-sidebar';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

// local imports
import { DocsNavigation } from './_components/docs-navigation';
import { getDocs } from './_lib/server/docs.loader';
import { buildDocumentationTree } from './_lib/utils';

async function DocsLayout({ children }: React.PropsWithChildren) {
  const { resolvedLanguage } = await createI18nServerInstance();
  const docs = await getDocs(resolvedLanguage);
  const tree = buildDocumentationTree(docs);

  return (
    <div className={'container h-[calc(100vh-56px)] overflow-y-hidden'}>
      <SidebarProvider
        className="lg:gap-x-6"
        style={{ '--sidebar-width': '17em' } as React.CSSProperties}
      >
        <HideFooterStyles />

        <DocsNavigation pages={tree} />

        {children}
      </SidebarProvider>
    </div>
  );
}

function HideFooterStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .site-footer {
            display: none;
          }
        `,
      }}
    />
  );
}

export default DocsLayout;
