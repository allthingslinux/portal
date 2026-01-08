import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { DevTools } from "@/components/dev-tools";
import { Providers } from "./providers";
import { WebVitalsReporter } from "./web-vitals";

import "@/styles/globals.css";

import { defaultMetadata } from "@/lib/seo";
import { geistMono, geistSans, inter } from "./fonts";

export async function generateMetadata(): Promise<Metadata> {
  // Add Sentry trace data for distributed tracing
  const { getTraceData } = await import("@sentry/nextjs");
  const traceData = getTraceData();

  // Filter out undefined values to avoid TypeScript errors
  const validTraceData: Record<string, string> = {};
  if (traceData["sentry-trace"]) {
    validTraceData["sentry-trace"] = traceData["sentry-trace"];
  }
  if (traceData.baggage) {
    validTraceData.baggage = traceData.baggage;
  }
  if (traceData.traceparent) {
    validTraceData.traceparent = traceData.traceparent;
  }

  return {
    ...defaultMetadata,
    other: {
      ...defaultMetadata.other,
      ...validTraceData,
    },
  };
}

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
