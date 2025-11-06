import { z } from 'zod';

import { NavigationConfigSchema } from '~/components/makerkit/navigation-config.schema';
import { SidebarNavigation } from '~/components/ui/sidebar';

export function TeamAccountLayoutSidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: z.infer<typeof NavigationConfigSchema>;
}>) {
  return <SidebarNavigation config={config} />;
}
