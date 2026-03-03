import type { IntegrationStatus } from "@portal/utils/constants";

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
  deleted: "Deleted",
};
