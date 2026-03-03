import { redirect } from "next/navigation";

import { verifySession } from "@/auth/dal";

// Map Better Auth UI account segments (from account.basePath + viewPaths) to our nuqs tab values.
// With viewPaths: { SETTINGS: "account" }, links are /app/settings/account, /security, /api-keys.
const SEGMENT_TO_TAB: Record<string, string> = {
  account: "account",
  settings: "account", // fallback if viewPaths not used
  security: "security",
  "api-keys": "api-keys",
  organizations: "account", // No orgs tab; show account
};

interface SegmentPageProps {
  params: Promise<{ segment: string }>;
}

/**
 * Redirects /app/settings/[segment] to /app/settings?tab=X so Better Auth UI
 * account links (when account.basePath is "/app/settings") land on our nuqs-backed
 * settings page. See: https://better-auth-ui.com/advanced/custom-settings
 */
export default async function SettingsSegmentPage({
  params,
}: SegmentPageProps) {
  await verifySession();

  const { segment } = await params;
  const tab = SEGMENT_TO_TAB[segment] ?? "account";

  redirect(`/app/settings?tab=${tab}`);
}
