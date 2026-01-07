"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    // Log error to error reporting service
    console.error("Global error boundary caught:", error);
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
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                A critical error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-mono text-muted-foreground text-sm">
                  {error.message || "An unknown error occurred"}
                </p>
                {error.digest && (
                  <p className="text-muted-foreground text-xs">
                    Error ID: {error.digest}
                  </p>
                )}
                {process.env.NODE_ENV === "development" && error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-muted-foreground text-sm">
                      Stack trace (development only)
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
                Try again
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "/";
                }}
                variant="outline"
              >
                Go home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
