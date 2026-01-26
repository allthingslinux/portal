import type { IntegrationStatus } from "@/lib/utils/constants";

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  deleted: "Deleted",
};
