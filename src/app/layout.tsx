import type { Metadata } from "next";
import Script from "next/script";

import { ReactScan } from "@/components/ReactScan";
import { Providers } from "./providers";

import "@/styles/globals.css";

import { geistMono, geistSans, inter } from "./fonts";

export const metadata: Metadata = {
  title: "Portal",
  description: "All Things Linux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-grab/dist/index.global.js"
            strategy="beforeInteractive"
          />
        )}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/@react-grab/cursor/dist/client.global.js"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body>
        <ReactScan />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
