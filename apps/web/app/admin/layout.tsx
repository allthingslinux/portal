import { use } from 'react';

import { cookies } from 'next/headers';

import { Page, PageMobileNavigation, PageNavigation } from '@portal/ui/page';
import { SidebarProvider } from '@portal/ui/shadcn-sidebar';

import { AdminSidebar } from '~/admin/_components/admin-sidebar';
import { AdminMobileNavigation } from '~/admin/_components/mobile-navigation';

export const metadata = {
  title: `Super Admin`,
};

export const dynamic = 'force-dynamic';

export default function AdminLayout(props: React.PropsWithChildren) {
  const state = use(getLayoutState());

  return (
    <SidebarProvider defaultOpen={state.open}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <AdminSidebar />
        </PageNavigation>

        <PageMobileNavigation>
          <AdminMobileNavigation />
        </PageMobileNavigation>

        {props.children}
      </Page>
    </SidebarProvider>
  );
}

async function getLayoutState() {
  const cookieStore = await cookies();
  const sidebarOpenCookie = cookieStore.get('sidebar:state');

  return {
    open: sidebarOpenCookie?.value !== 'true',
  };
}
