import { useEffect, useMemo } from "react";

import { useMonitoring } from "./use-monitoring";

export function useCaptureException(error: unknown) {
  const service = useMonitoring();
  const normalizedError: Error | null = useMemo(() => {
    if (error instanceof Error) {
      return error;
    }

    if (error) {
      return new Error(String(error));
    }

    return null;
  }, [error]);

  useEffect(() => {
    if (!normalizedError) {
      return;
    }

    Promise.resolve(service.captureException(normalizedError)).catch(() => {
      // Ignore errors in error reporting
    });
  }, [normalizedError, service]);
}
