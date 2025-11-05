import 'server-only';

import { cache } from 'react';

// import { getSupabaseServerClient } from '@portal/supabase/server-client';

import { createAdminDashboardService } from '../services/admin-dashboard.service';

/**
 * @name loadAdminDashboard
 * @description Load the admin dashboard data.
 * @param params
 */
export const loadAdminDashboard = cache(adminDashboardLoader);

function adminDashboardLoader() {
  const service = createAdminDashboardService();

  return service.getDashboardData();
}
