"use client";

import { useEffect, useState } from "react";

import { APP_VERSION } from "@/config";

function useLiveTime(intervalMs = 1000) {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const format = () => {
      return new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    };
    setTime(format());
    const id = setInterval(() => setTime(format()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return time;
}

export function StatusBar() {
  const time = useLiveTime();
  const isDev = process.env.NODE_ENV === "development";

  return (
    <footer
      aria-live="polite"
      className="flex h-6 shrink-0 items-center justify-center gap-3 border-border border-t bg-sidebar px-3 font-mono text-[10px] text-sidebar-foreground"
    >
      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
        ATL
      </span>
      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary tabular-nums">
        {time}
      </span>
      {isDev && (
        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-500">
          dev
        </span>
      )}
      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
        v{APP_VERSION}
      </span>
    </footer>
  );
}
