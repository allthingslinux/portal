import type { IntegrationStatus } from "./types";

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  deleted: "Deleted",
};
