"use client";

import { useEffect } from "react";
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

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js Error component
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    // Log error to error reporting service
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("error.title")}</CardTitle>
          <CardDescription>{t("error.description")}</CardDescription>
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
          <Button asChild variant="outline">
            <a href="/">{t("error.goHome")}</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
