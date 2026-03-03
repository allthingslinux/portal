import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

/**
 * Load and merge all locale files from a directory
 * Files are loaded in a specific order and merged together
 */
async function loadLocaleMessages(locale: string) {
  try {
    // Try loading from locale/{locale}/ directory (split files)
    const [common, navigation, routes, auth, account, error, marketing] =
      await Promise.all([
        import(`../../locale/${locale}/common.json`).catch(() => null),
        import(`../../locale/${locale}/navigation.json`).catch(() => null),
        import(`../../locale/${locale}/routes.json`).catch(() => null),
        import(`../../locale/${locale}/auth.json`).catch(() => null),
        import(`../../locale/${locale}/account.json`).catch(() => null),
        import(`../../locale/${locale}/error.json`).catch(() => null),
        import(`../../locale/${locale}/marketing.json`).catch(() => null),
      ]);

    // If all files loaded successfully, merge them
    // Files are wrapped with their filename as the namespace key
    if (
      common &&
      navigation &&
      routes &&
      auth &&
      account &&
      error &&
      marketing
    ) {
      return {
        common: common.default, // Wrap common.json content under "common" key
        navigation: navigation.default, // Wrap navigation.json content under "navigation" key
        routes: routes.default, // Wrap routes.json content under "routes" key
        auth: auth.default, // Wrap auth.json content under "auth" key
        account: account.default, // Wrap account.json content under "account" key
        error: error.default, // Wrap error.json content under "error" key (includes notFound nested)
        marketing: marketing.default, // Wrap marketing.json content under "marketing" key
      };
    }
  } catch {
    // Fall through to single file fallback
  }

  // Fallback: try loading single locale file (backward compatibility)
  try {
    const singleFile = await import(`../../locale/${locale}.json`);
    return singleFile.default;
  } catch {
    // If locale file doesn't exist, return empty object
    return {};
  }
}

export default getRequestConfig(async () => {
  // Read locale from cookies, default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "en";

  return {
    locale,
    messages: await loadLocaleMessages(locale),
  };
});
