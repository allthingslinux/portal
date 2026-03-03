"use client";

import { lazy } from "react";

/**
 * Dashboard app-segment error boundary. Lazy-loads AppError so next-intl/error
 * chunk loads only when the boundary runs (per next-intl error-files doc).
 */
export default lazy(() => import("./app-error"));
