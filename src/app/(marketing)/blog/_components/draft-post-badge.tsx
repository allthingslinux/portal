import type React from "react";

export function DraftPostBadge({ children }: React.PropsWithChildren) {
  return (
    <span className="rounded-md bg-yellow-200 px-4 py-2 font-semibold dark:text-dark-800">
      {children}
    </span>
  );
}
