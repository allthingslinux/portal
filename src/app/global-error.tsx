"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { captureException } from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { geistMono, geistSans, inter } from "./fonts";

import "@/styles/globals.css";

/**
 * Global Error Boundary
 *
 * This component handles errors that occur in the root layout.
 * It must include <html> and <body> tags since it replaces the root layout.
 *
 * Global errors are less common but can occur when:
 * - The root layout itself throws an error
 * - Providers in the root layout throw errors
 * - Critical initialization code fails
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    // Log the error to Sentry
    try {
      captureException(error);
    } catch (sentryError) {
      // Fallback if Sentry is not available
      // eslint-disable-next-line no-console
      console.error("Failed to capture error to Sentry:", sentryError);
    }
  }, [error]);

  return (
    <html
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("error.title")}</CardTitle>
              <CardDescription>{t("error.criticalError")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-mono text-muted-foreground text-sm">
                  {error.message || t("error.unknownError")}
                </p>
                {error.digest && (
                  <p className="text-muted-foreground text-xs">
                    {t("error.errorId")}: {error.digest}
                  </p>
                )}
                {process.env.NODE_ENV === "development" && error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-muted-foreground text-sm">
                      {t("error.stackTrace")}
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-4 text-xs">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={reset} variant="default">
                {t("error.retry")}
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "/";
                }}
                variant="outline"
              >
                {t("error.goHome")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
