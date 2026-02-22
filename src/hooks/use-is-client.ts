import { useSyncExternalStore } from "react";

/**
 * Returns true on the client, false during SSR.
 * Use instead of useEffect(setState, []) for mount detection to avoid flash.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {
      /* no-op: client snapshot never changes */
    },
    () => true,
    () => false
  );
}
