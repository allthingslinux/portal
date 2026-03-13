"use client";

import { AdminDashboardOverview } from "./admin-dashboard-overview";

/**
 * Admin dashboard component.
 * Renders overview with stats and quick links to Users and Sessions.
 * User management (unified table) lives at /app/admin/users.
 */
export function AdminDashboard() {
  return <AdminDashboardOverview />;
}
