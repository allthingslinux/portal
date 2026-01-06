"use client";

import type { ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          An error occurred while loading this content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="font-mono text-muted-foreground text-sm">
            {error.message}
          </p>
          {process.env.NODE_ENV === "development" && error.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-muted-foreground text-sm">
                Stack trace (development only)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary} variant="default">
          Try again
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
}

/**
 * Error Boundary with React Query integration
 *
 * This component wraps React Query's QueryErrorResetBoundary with
 * react-error-boundary to provide error handling for both Suspense
 * queries and regular queries with throwOnError.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <Suspense fallback={<Loading />}>
 *       <ComponentWithSuspenseQuery />
 *     </Suspense>
 *   </ErrorBoundary>
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ReactErrorBoundary
          FallbackComponent={fallback ?? ErrorFallback}
          onReset={reset}
        >
          {children}
        </ReactErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
