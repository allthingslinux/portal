import { headers } from 'next/headers';

import { Toaster } from '~/components/ui/sonner';
import { cn } from '~/components/lib/utils';

import { RootProviders } from '~/components/root-providers';
import { getFontsClassName } from '~/shared/lib/fonts';
import { createI18nServerInstance } from '~/shared/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/shared/lib/root-metadata';
import { getRootTheme } from '~/shared/lib/root-theme';

import '../styles/globals.css';

export const generateMetadata = () => {
  return generateRootMetadata();
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, nonce, i18n] = await Promise.all([
    getRootTheme(),
    getCspNonce(),
    createI18nServerInstance(),
  ]);

  const className = getRootClassName();
  const language = i18n.language;

  return (
    <html lang={language} className={className} suppressHydrationWarning>
      <body>
        <RootProviders theme={theme} lang={language} nonce={nonce}>
          {children}
        </RootProviders>

        <Toaster richColors={true} theme={theme} position="top-center" />
      </body>
    </html>
  );
}

function getRootClassName() {
  const fontsClassName = getFontsClassName();

  return cn(
    'bg-background min-h-screen overscroll-y-none antialiased',
    fontsClassName,
  );
}

async function getCspNonce() {
  const headersStore = await headers();

  return headersStore.get('x-nonce') ?? undefined;
}
