"use client";

// ============================================================================
// Web Vitals Reporting
// ============================================================================
// Core Web Vitals metrics collection for production monitoring
// Uses Next.js built-in useReportWebVitals hook
// See: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
// See: https://nextjs.org/docs/app/building-your-application/optimizing/analytics

import { useReportWebVitals } from "next/web-vitals";

/**
 * Handles Web Vitals reporting
 * Automatically collects: TTFB, FCP, LCP, FID, CLS, INP
 * Also includes Next.js-specific metrics: hydration, route-change-to-render, render
 */
function handleReportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: "web-vital" | "custom";
  delta?: number;
}): void {
  // Log in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("[Web Vitals]", metric);
  }

  // Send to analytics service
  // Examples below - uncomment and configure as needed:

  // Option 1: Custom API endpoint
  // const body = JSON.stringify(metric);
  // const url = "/api/analytics";
  // if (navigator.sendBeacon) {
  //   navigator.sendBeacon(url, body);
  // } else {
  //   fetch(url, { body, method: "POST", keepalive: true });
  // }

  // Option 2: Vercel Analytics
  // if (typeof window !== "undefined" && typeof (window as any).va === "function") {
  //   (window as any).va("track", metric.name, metric.value);
  // }

  // Option 3: Google Analytics
  // if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
  //   (window as any).gtag("event", metric.name, {
  //     value: Math.round(
  //       metric.name === "CLS" ? metric.value * 1000 : metric.value
  //     ), // values must be integers
  //     event_label: metric.id, // id unique to current page load
  //     non_interaction: true, // avoids affecting bounce rate
  //   });
  // }

  // Option 4: Handle specific metrics
  // switch (metric.name) {
  //   case "FCP": {
  //     // Handle First Contentful Paint
  //     break;
  //   }
  //   case "LCP": {
  //     // Handle Largest Contentful Paint
  //     break;
  //   }
  //   case "CLS": {
  //     // Handle Cumulative Layout Shift
  //     break;
  //   }
  //   case "INP": {
  //     // Handle Interaction to Next Paint
  //     break;
  //   }
  //   case "TTFB": {
  //     // Handle Time to First Byte
  //     break;
  //   }
  //   case "Next.js-hydration": {
  //     // Handle Next.js hydration time
  //     break;
  //   }
  //   case "Next.js-route-change-to-render": {
  //     // Handle route change to render time
  //     break;
  //   }
  //   case "Next.js-render": {
  //     // Handle Next.js render time
  //     break;
  //   }
  // }
}

/**
 * Web Vitals Reporter Component
 * Uses Next.js built-in useReportWebVitals hook for optimal performance
 * This component should be placed in the root layout to collect metrics across all pages
 */
export function WebVitalsReporter() {
  useReportWebVitals(handleReportWebVitals);
  return null;
}
