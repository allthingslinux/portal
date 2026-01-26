"use client";

// ============================================================================
// Web Vitals Reporting
// ============================================================================
// Core Web Vitals metrics collection for production monitoring
// Uses Next.js built-in useReportWebVitals hook
// See: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
// See: https://nextjs.org/docs/app/building-your-application/optimizing/analytics
//
// Attribution Support:
// When experimental.webVitalsAttribution is enabled in next.config.js,
// metrics for CLS and LCP will include an 'entries' array with detailed
// performance event information for debugging and optimization.
// See: https://nextjs.org/docs/app/api-reference/config/next-config-js/webVitalsAttribution

import { useReportWebVitals } from "next/web-vitals";

/**
 * Web Vitals metric type from Next.js
 * This matches the type expected by useReportWebVitals callback
 */
type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

/**
 * Web Vitals metric type
 * When attribution is enabled, metrics include an 'entries' property with
 * detailed performance event information
 */
interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  label: "web-vital" | "custom";
  delta?: number;
  entries?: readonly PerformanceEntry[];
  navigationType?: string;
  rating?: "good" | "needs-improvement" | "poor";
}

/**
 * Layout shift attribution types
 */
interface LayoutShiftAttribution {
  node?: Node | null;
  previousRect?: DOMRectReadOnly;
  currentRect?: DOMRectReadOnly;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value?: number;
  hadRecentInput?: boolean;
  sources?: readonly LayoutShiftAttribution[];
}

/**
 * Largest Contentful Paint entry types
 */
interface LCPEntry extends PerformanceEntry {
  element?: Element | null;
  url?: string;
  size?: number;
  renderTime?: number;
  loadTime?: number;
}

/**
 * Formats a metric value with appropriate unit
 */
function formatMetricValue(name: string, value: number): string {
  if (name === "CLS") {
    return value.toFixed(4);
  }
  if (
    name === "TTFB" ||
    name === "FCP" ||
    name === "LCP" ||
    name === "INP" ||
    name.includes("render") ||
    name.includes("hydration")
  ) {
    return `${value.toFixed(2)}ms`;
  }
  return value.toFixed(2);
}

/**
 * Gets console styling based on metric rating
 */
function getMetricStyle(rating?: string): string[] {
  switch (rating) {
    case "good":
      return ["color: #10b981", "font-weight: bold"];
    case "needs-improvement":
      return ["color: #f59e0b", "font-weight: bold"];
    case "poor":
      return ["color: #ef4444", "font-weight: bold"];
    default:
      return ["color: #6b7280"];
  }
}

/**
 * Gets a rating emoji for visual feedback
 */
function getRatingEmoji(rating?: string): string {
  switch (rating) {
    case "good":
      return "✅";
    case "needs-improvement":
      return "⚠️";
    case "poor":
      return "❌";
    default:
      return "ℹ️";
  }
}

/**
 * Logs LCP attribution details
 */
function logLCPAttribution(lcpEntry: LCPEntry): void {
  const element =
    lcpEntry.element && "tagName" in lcpEntry.element
      ? lcpEntry.element.tagName
      : "unknown";
  const url =
    lcpEntry.url ||
    (lcpEntry.element instanceof HTMLImageElement
      ? lcpEntry.element.src
      : null);
  if (url || element !== "unknown") {
    console.log(`  └─ Element: ${element}${url ? ` (${url})` : ""}`);
  }
}

/**
 * Logs CLS attribution details
 */
function logCLSAttribution(clsEntry: LayoutShiftEntry): void {
  if (clsEntry.sources && clsEntry.sources.length > 0) {
    const source = clsEntry.sources[0];
    const nodeTagName =
      source.node && "tagName" in source.node
        ? String(source.node.tagName)
        : "unknown";
    console.log(`  └─ Source: ${nodeTagName}`);
  }
}

/**
 * Logs concise attribution information only for metrics that need attention
 */
function logAttributionIfNeeded(metric: WebVitalsMetric): void {
  // Only show detailed attribution for metrics that need improvement or are poor
  if (
    metric.rating === "good" ||
    !metric.entries ||
    metric.entries.length === 0
  ) {
    return;
  }

  if (metric.name === "LCP") {
    const lcpEntry = metric.entries.at(-1) as LCPEntry | undefined;
    if (lcpEntry) {
      logLCPAttribution(lcpEntry);
    }
    return;
  }

  if (metric.name === "CLS") {
    const clsEntry = metric.entries[0] as LayoutShiftEntry | undefined;
    if (clsEntry) {
      logCLSAttribution(clsEntry);
    }
  }
}

/**
 * Logs Web Vitals metrics in a concise, single-line format
 */
function logWebVitalsMetric(metric: WebVitalsMetric): void {
  const rating = metric.rating || "unknown";
  const [color, weight] = getMetricStyle(rating);
  const formattedValue = formatMetricValue(metric.name, metric.value);
  const emoji = getRatingEmoji(rating);

  // Single concise log line
  console.log(
    `%c${emoji} ${metric.name}%c ${formattedValue} (${rating.toUpperCase()})`,
    `${color}; ${weight}; font-size: 12px`,
    "color: #6b7280; font-weight: normal"
  );

  // Only show attribution details for metrics that need improvement
  logAttributionIfNeeded(metric);
}

/**
 * Tracks reported metric IDs to prevent duplicate logging
 * Each metric.id is unique per page load, so this prevents the same metric
 * from being logged multiple times if the callback is somehow called again
 * 
 * Uses a combination of metric.id and metric.name to handle edge cases where
 * the same metric might be reported multiple times (e.g., React Strict Mode)
 */
const reportedMetricIds = new Set<string>();

/**
 * Creates a unique key for a metric to prevent duplicates
 * Combines metric name and ID to handle edge cases
 */
function getMetricKey(metric: WebVitalsMetric): string {
  return `${metric.name}:${metric.id}`;
}

/**
 * Handles Web Vitals reporting
 * Automatically collects: TTFB, FCP, LCP, FID, CLS, INP
 * Also includes Next.js-specific metrics: hydration, route-change-to-render, render
 *
 * When webVitalsAttribution is enabled in next.config.js:
 * - CLS metrics include entries identifying which elements caused layout shifts
 * - LCP metrics include entries identifying the LCP element (and image URL if applicable)
 *
 * This callback is defined outside the component to ensure a stable reference,
 * preventing duplicate reporting as recommended by Next.js documentation.
 * 
 * Note: In development with React Strict Mode, components mount twice, which can
 * cause metrics to be reported multiple times. The duplicate detection handles this.
 */
const handleReportWebVitals: ReportWebVitalsCallback = (metric) => {
  const metricKey = getMetricKey(metric);
  
  // Prevent duplicate reporting (handles React Strict Mode double-mounting)
  if (reportedMetricIds.has(metricKey)) {
    // Only log warning in development, and only once per metric
    if (process.env.NODE_ENV === "development") {
      // Use a separate set to track if we've already warned about this specific metric
      const warningKey = `warned:${metricKey}`;
      if (!reportedMetricIds.has(warningKey)) {
        reportedMetricIds.add(warningKey);
        // Suppress duplicate warnings - this is expected in development with Strict Mode
        // console.warn(
        //   `[Web Vitals] Duplicate metric detected: ${metric.name} (${metric.id})`
        // );
      }
    }
    return;
  }
  reportedMetricIds.add(metricKey);

  // Log in development for debugging
  if (process.env.NODE_ENV === "development") {
    logWebVitalsMetric(metric);
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
};

/**
 * Web Vitals Reporter Component
 * Uses Next.js built-in useReportWebVitals hook for optimal performance
 * This component should be placed in the root layout to collect metrics across all pages
 * 
 * Note: In development with React Strict Mode, this component mounts twice,
 * but the duplicate detection in handleReportWebVitals prevents duplicate metrics.
 */
export function WebVitalsReporter() {
  useReportWebVitals(handleReportWebVitals);
  return null;
}
