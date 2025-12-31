import { z } from "zod";
import { env } from "../../env";

type LanguagePriority = "user" | "application";

const FeatureFlagsSchema = z.object({
  enableThemeToggle: z
    .boolean()
    .describe("Enable theme toggle in the user interface."),
  enableAccountDeletion: z
    .boolean()
    .describe("Enable personal account deletion."),
  languagePriority: z
    .enum(["user", "application"])
    .describe(
      `If set to user, use the user's preferred language. If set to application, use the application's default language.`
    )
    .default("application"),
  enableNotifications: z
    .boolean()
    .describe("Enable notifications functionality"),
  realtimeNotifications: z
    .boolean()
    .describe("Enable realtime for the notifications functionality"),
  enableVersionUpdater: z.boolean().describe("Enable version updater"),
});

const featuresFlagConfig = FeatureFlagsSchema.parse({
  enableThemeToggle: env.NEXT_PUBLIC_ENABLE_THEME_TOGGLE ?? true,
  enableAccountDeletion:
    env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION ?? false,
  languagePriority: env.NEXT_PUBLIC_LANGUAGE_PRIORITY as LanguagePriority,
  enableNotifications: env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS ?? false,
  realtimeNotifications: env.NEXT_PUBLIC_REALTIME_NOTIFICATIONS ?? false,
  enableVersionUpdater: env.NEXT_PUBLIC_ENABLE_VERSION_UPDATER ?? false,
} satisfies z.infer<typeof FeatureFlagsSchema>);

export default featuresFlagConfig;
