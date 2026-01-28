import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { DevTools } from "@/components/dev-tools";
import { Providers } from "./providers";
import { WebVitalsReporter } from "./web-vitals";

import "@/styles/globals.css";

import { geistMono, geistSans, inter } from "./fonts";
import { createPageMetadata } from "@/shared/seo/metadata";

/** Default lang for prerender shell when locale is not yet resolved. */
const DEFAULT_LANG = "en";

// Static metadata so prerender never runs uncached code in generateMetadata.
// With cacheComponents, layout generateMetadata runs during build-time validation;
// connection()/getTraceData() would trigger "Uncached data outside Suspense".
// Trace metadata can be added by request-time layers if needed.
export const metadata: Metadata = createPageMetadata({});

async function RootLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Providers>{children}</Providers>
      </NextIntlClientProvider>
      <WebVitalsReporter />
    </>
  );
}

/** Shown while RootLayoutContent (connection + i18n) resolves. */
function RootLayoutFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <span className="text-muted-foreground text-sm">Loading…</span>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      lang={DEFAULT_LANG}
      suppressHydrationWarning
    >
      <head>
        <DevTools />
      </head>
      <body>
        <NuqsAdapter>
          <Suspense fallback={<RootLayoutFallback />}>
            <RootLayoutContent>{children}</RootLayoutContent>
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
