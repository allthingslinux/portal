"use client";

import dynamic from "next/dynamic";

import { LoadingOverlay } from "~/components/portal/loading-overlay";

export const DashboardDemo = dynamic(() => import("./dashboard-demo-charts"), {
  ssr: false,
  loading: () => (
    <LoadingOverlay
      className={"flex flex-1 flex-col items-center justify-center"}
      fullPage={false}
    />
  ),
});
