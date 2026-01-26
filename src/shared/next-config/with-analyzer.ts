import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

/**
 * Add bundle analyzer configuration to Next.js config
 * Enables bundle size analysis when ANALYZE env var is set
 */
export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
