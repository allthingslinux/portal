import { PageContent } from "@portal/ui/layout/page";

import { verifyAdminOrStaffSession } from "@/auth/dal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdminOrStaffSession();

  return <PageContent>{children}</PageContent>;
}
