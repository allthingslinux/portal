import { z } from 'zod';

import { NavigationConfigSchema } from '@portal/ui/navigation-schema';
import { SidebarNavigation } from '@portal/ui/shadcn-sidebar';

export function TeamAccountLayoutSidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: z.infer<typeof NavigationConfigSchema>;
}>) {
  return <SidebarNavigation config={config} />;
}
