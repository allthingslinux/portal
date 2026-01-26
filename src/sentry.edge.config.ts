/*
 * This file configures the initialization of Sentry on the Edge runtime.
 * The config you add here will be used whenever Edge functions handle a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import { initializeSentry } from "@/shared/observability/edge";

initializeSentry();
