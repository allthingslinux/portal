"use client";

// ============================================================================
// Breadcrumb Context
// ============================================================================
// React Context for allowing pages to override breadcrumbs dynamically.
// Pages can use useBreadcrumbs() hook to set custom breadcrumbs.

import { createContext, useContext, useState, type ReactNode } from "react";

import type { BreadcrumbItem } from "@/lib/breadcrumbs";

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[] | undefined;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[] | undefined) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[] | undefined>(
    undefined
  );

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext(): BreadcrumbItem[] | undefined {
  const context = useContext(BreadcrumbContext);
  return context?.breadcrumbs;
}

/**
 * Hook for pages to set custom breadcrumbs
 * Usage in a Client Component:
 *   const { setBreadcrumbs } = useBreadcrumbs();
 *   setBreadcrumbs([{ label: "Custom", href: "/custom" }]);
 */
export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within BreadcrumbProvider");
  }
  return context;
}
