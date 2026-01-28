"use client";

import { lazy } from "react";

/**
 * Root error boundary. Lazy-loads Error UI so next-intl/error chunk
 * loads only when the boundary runs (per next-intl error-files doc).
 */
export default lazy(() => import("./error-content"));
