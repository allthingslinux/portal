import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { DevTools } from "@/components/dev-tools";
import { Providers } from "./providers";
import { WebVitalsReporter } from "./web-vitals";

import "@/styles/globals.css";

import { defaultMetadata } from "@/lib/seo";
import { geistMono, geistSans, inter } from "./fonts";

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {/* DevTools handles all development scripts (React Grab, React Scan) */}
        {/* DevTools is a client component, so it handles SSR checks internally */}
        <DevTools />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <WebVitalsReporter />
      </body>
    </html>
  );
}
