import { z } from 'zod';

const MONITORING_PROVIDERS = [
  'sentry',
  '',
  // Add more providers here
] as const;

export const MONITORING_PROVIDER = z
  .enum(MONITORING_PROVIDERS)
  .optional()
  .transform((value) => value || undefined);

export type MonitoringProvider = z.infer<typeof MONITORING_PROVIDER>;

export function getMonitoringProvider() {
  return MONITORING_PROVIDER.parse(process.env.NEXT_PUBLIC_MONITORING_PROVIDER);
}
