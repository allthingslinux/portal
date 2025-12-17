import { initializeServerI18n } from "~/core/i18n/i18n.server";

export function initializeEmailI18n(params: {
  language: string | undefined;
  namespace: string;
}) {
  const language = params.language ?? "en";

  return initializeServerI18n(
    {
      supportedLngs: [language],
      lng: language,
      ns: params.namespace,
    },
    async (lang, ns) => {
      try {
        const data = await import(`../locales/${lang}/${ns}.json`);

        return data as Record<string, string>;
      } catch (error) {
        console.log(
          `Error loading i18n file: locales/${lang}/${ns}.json`,
          error
        );

        return {};
      }
    }
  );
}
