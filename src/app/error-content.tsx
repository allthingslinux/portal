"use client";

import { useEffect } from "react";
import { captureException } from "@sentry/nextjs";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Root error boundary content. Rendered lazily via app/error.tsx.
 * Uses next-intl "error" namespace per next-intl error-files doc.
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js Error component
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    try {
      captureException(error);
    } catch (sentryError) {
      // eslint-disable-next-line no-console
      console.error("Failed to capture error to Sentry:", sentryError);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-mono text-muted-foreground text-sm">
              {error.message || t("unknownError")}
            </p>
            {error.digest && (
              <p className="text-muted-foreground text-xs">
                {t("errorId")}: {error.digest}
              </p>
            )}
            {process.env.NODE_ENV === "development" && error.stack && (
              <details className="mt-4">
                <summary className="cursor-pointer text-muted-foreground text-sm">
                  {t("stackTrace")}
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
            {t("retry")}
          </Button>
          <Button asChild variant="outline">
            <a href="/">{t("goHome")}</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
