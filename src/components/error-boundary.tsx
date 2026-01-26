"use client";

import type { ComponentType, ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type { FallbackProps } from "react-error-boundary";
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
import { formatError } from "@/shared/utils";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // Format error to handle unknown error types
  const errorMessage = formatError(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

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
            {errorMessage}
          </p>
          {process.env.NODE_ENV === "development" && errorStack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-muted-foreground text-sm">
                Stack trace (development only)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                {errorStack}
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
  fallback?: ComponentType<FallbackProps>;
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
