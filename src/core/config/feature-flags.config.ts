import { z } from "zod";

type LanguagePriority = "user" | "application";

const FeatureFlagsSchema = z.object({
  enableThemeToggle: z.boolean({
    description: "Enable theme toggle in the user interface.",
    required_error: "Provide the variable NEXT_PUBLIC_ENABLE_THEME_TOGGLE",
  }),
  enableAccountDeletion: z.boolean({
    description: "Enable personal account deletion.",
    required_error:
      "Provide the variable NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION",
  }),
  enableTeamDeletion: z.boolean({
    description: "Enable team deletion.",
    required_error:
      "Provide the variable NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION",
  }),
  enableTeamAccounts: z.boolean({
    description: "Enable team accounts.",
    required_error: "Provide the variable NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS",
  }),
  enableTeamCreation: z.boolean({
    description: "Enable team creation.",
    required_error:
      "Provide the variable NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION",
  }),
  languagePriority: z
    .enum(["user", "application"], {
      required_error: "Provide the variable NEXT_PUBLIC_LANGUAGE_PRIORITY",
      description: `If set to user, use the user's preferred language. If set to application, use the application's default language.`,
    })
    .default("application"),
  enableNotifications: z.boolean({
    description: "Enable notifications functionality",
    required_error: "Provide the variable NEXT_PUBLIC_ENABLE_NOTIFICATIONS",
  }),
  realtimeNotifications: z.boolean({
    description: "Enable realtime for the notifications functionality",
    required_error: "Provide the variable NEXT_PUBLIC_REALTIME_NOTIFICATIONS",
  }),
  enableVersionUpdater: z.boolean({
    description: "Enable version updater",
    required_error: "Provide the variable NEXT_PUBLIC_ENABLE_VERSION_UPDATER",
  }),
});

const featuresFlagConfig = FeatureFlagsSchema.parse({
  enableThemeToggle: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_THEME_TOGGLE,
    true
  ),
  enableAccountDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION,
    false
  ),
  enableTeamDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION,
    false
  ),
  enableTeamAccounts: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS,
    true
  ),
  enableTeamCreation: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION,
    true
  ),
  languagePriority: process.env
    .NEXT_PUBLIC_LANGUAGE_PRIORITY as LanguagePriority,
  enableNotifications: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
    false
  ),
  realtimeNotifications: getBoolean(
    process.env.NEXT_PUBLIC_REALTIME_NOTIFICATIONS,
    false
  ),
  enableVersionUpdater: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_VERSION_UPDATER,
    false
  ),
} satisfies z.infer<typeof FeatureFlagsSchema>);

export default featuresFlagConfig;

function getBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === "string") {
    return value === "true";
  }

  return defaultValue;
}
