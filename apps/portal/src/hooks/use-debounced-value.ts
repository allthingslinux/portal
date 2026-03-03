"use client";

import { useEffect, useState } from "react";

/**
 * Returns a value that updates only after `delayMs` of no changes.
 * Use for search/filter inputs to avoid flicker and reduce API calls while typing.
 * When value is empty/falsy, updates immediately so "clear" feels instant.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const isEmpty = value === "" || value === undefined || value === null;
    if (isEmpty) {
      setDebounced(value);
      return;
    }
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
