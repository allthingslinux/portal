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

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js Error component
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again.
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
          <Button asChild variant="outline">
            <a href="/">Go home</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
