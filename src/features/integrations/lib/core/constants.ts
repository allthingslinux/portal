import type { IntegrationStatus } from "@/shared/utils/constants";

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
  deleted: "Deleted",
};
