import { auth } from '@/auth';
import { Toaster } from '@/components/ui/sonner';
import NextTopLoader from 'nextjs-toploader';
import KBar from '@/components/kbar';
import SidebarNav from '@/components/layout/sidebar-nav';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import Providers from '@/components/layout/providers';

export const metadata: Metadata = {
  title: 'Portal',
  description: 'Your portal to All Things Linux'
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const cookieStore = cookies();

  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

  return (
    <html
      lang="en"
      className={`${inter.className}`}
      suppressHydrationWarning={true}
    >
      <body className="">
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <Toaster />
          <KBar>
            <SidebarProvider defaultOpen={defaultOpen}>
              <SidebarNav />
              <SidebarInset>
                <Header />
                {children}
              </SidebarInset>
            </SidebarProvider>
          </KBar>
        </Providers>
      </body>
    </html>
  );
}
