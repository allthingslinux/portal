import { getLogger } from '~/shared/logger';

/**
 * @name i18nResolver
 * @description Resolve the translation file for the given language and namespace in the current application.
 * @param language
 * @param namespace
 */
export async function i18nResolver(language: string, namespace: string) {
  const logger = await getLogger();

  try {
    logger.debug(`Loading translation file: ${language}/${namespace}.json`);
    const data = await import(
      `../../../../public/locales/${language}/${namespace}.json`
    );

    logger.debug(
      `Successfully loaded translation file: ${language}/${namespace}.json`,
    );
    return data as Record<string, string>;
  } catch (error) {
    logger.error(
      {
        error,
        language,
        namespace,
      },
      `Failed to load translation file: ${language}/${namespace}`,
    );
    logger.warn(
      `Please create a translation file for this language at "public/locales/${language}/${namespace}.json"`,
    );

    // return an empty object if the file could not be loaded to avoid loops
    return {};
  }
}
