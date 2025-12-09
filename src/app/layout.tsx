import { headers } from "next/headers";
import { cn } from "~/components/lib/utils";
import { RootProviders } from "~/components/root-providers";
import { Toaster } from "~/components/ui/sonner";
import { getFontsClassName } from "~/shared/lib/fonts";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { generateRootMetadata } from "~/shared/lib/root-metadata";
import { getRootTheme } from "~/shared/lib/root-theme";

import "../styles/globals.css";

export const generateMetadata = () => generateRootMetadata();

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
    <html className={className} lang={language} suppressHydrationWarning>
      <body>
        <RootProviders lang={language} nonce={nonce} theme={theme}>
          {children}
        </RootProviders>

        <Toaster position="top-center" richColors={true} theme={theme} />
      </body>
    </html>
  );
}

function getRootClassName() {
  const fontsClassName = getFontsClassName();

  return cn(
    "min-h-screen overscroll-y-none bg-background antialiased",
    fontsClassName
  );
}

async function getCspNonce() {
  const headersStore = await headers();

  return headersStore.get("x-nonce") ?? undefined;
}
