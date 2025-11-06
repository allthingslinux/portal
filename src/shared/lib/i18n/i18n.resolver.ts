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
    console.log(`Loading translation file: ${language}/${namespace}.json`);
    const data = await import(
      `../../../../public/locales/${language}/${namespace}.json`
    );

    console.log(`Successfully loaded translation file: ${language}/${namespace}.json`);
    return data as Record<string, string>;
  } catch (error) {
    console.group(
      `Error while loading translation file: ${language}/${namespace}`,
    );
    console.error('Translation file load error:', error);
    logger.error(`Failed to load translation file: ${error}`);
    logger.warn(
      `Please create a translation file for this language at "public/locales/${language}/${namespace}.json"`,
    );
    console.groupEnd();

    // return an empty object if the file could not be loaded to avoid loops
    return {};
  }
}
