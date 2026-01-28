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

/**
 * Dashboard app-segment error boundary content. Rendered lazily via app/(dashboard)/app/error.tsx.
 * Uses next-intl "error" namespace; backToDashboard lives in error.json for this view.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("pageError")}</CardDescription>
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
            <a href="/app">{t("backToDashboard")}</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
