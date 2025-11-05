'use server';

import { revalidatePath } from 'next/cache';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:url';
import { z } from 'zod';

import { getLogger } from '@portal/shared/logger';

const Schema = z.object({
  locale: z.string().min(1),
  namespace: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
});

const TranslateSchema = z.object({
  sourceLocale: z.string(),
  targetLocale: z.string(),
  namespace: z.string(),
  translations: z.record(z.string(), z.string()),
});

/**
 * Update a translation value in the specified locale and namespace.
 * @param props
 */
export async function updateTranslationAction(props: z.infer<typeof Schema>) {
  // Validate the input
  const { locale, namespace, key, value } = Schema.parse(props);

  const root = resolve(process.cwd(), '..');
  const filePath = `${root}apps/web/public/locales/${locale}/${namespace}.json`;

  try {
    // Read the current translations file
    const translationsFile = readFileSync(filePath, 'utf8');
    const translations = JSON.parse(translationsFile) as Record<string, any>;

    // Update the nested key value
    const keys = key.split('.') as string[];
    let current = translations;

    // Navigate through nested objects until the second-to-last key
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i] as string;

      if (!current[currentKey]) {
        current[currentKey] = {};
      }

      current = current[currentKey];
    }

    // Set the value at the final key
    const finalKey = keys[keys.length - 1] as string;
    current[finalKey] = value;

    // Write the updated translations back to the file
    writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');

    revalidatePath(`/translations`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update translation:', error);
    throw new Error('Failed to update translation');
  }
}

export const translateWithAIAction = async (
  data: z.infer<typeof TranslateSchema>,
) => {
  const logger = await getLogger();

  z.string().min(1).parse(process.env.OPENAI_API_KEY);

  try {
    const { sourceLocale, targetLocale, namespace, translations } =
      TranslateSchema.parse(data);

    // if the path does not exist, create it using an empty object
    const root = resolve(process.cwd(), '..');
    const folderPath = `${root}apps/web/public/locales/${targetLocale}`;

    if (!existsSync(folderPath)) {
      // create the directory if it doesn't exist
      mkdirSync(folderPath, { recursive: true });
    }

    const filePath = `${folderPath}/${namespace}.json`;

    if (!existsSync(filePath)) {
      // create the file if it doesn't exist
      writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf8');
    }

    const results: Record<string, string> = {};

    // Process translations in batches of 5 for efficiency
    const entries = Object.entries(translations);
    const batches = [];

    for (let i = 0; i < entries.length; i += 5) {
      batches.push(entries.slice(i, i + 5));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async ([key, value]) => {
        const prompt = `Translate the following text from ${sourceLocale} to ${targetLocale}. Maintain any placeholders (like {name} or %{count}) and HTML tags. Only return the translated text, nothing else.

Original text: ${value}`;

        const MODEL_NAME = process.env.LLM_MODEL_NAME ?? 'gpt-4o-mini';
        const model = openai(MODEL_NAME);

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.3,
          maxTokens: 200,
        });

        return [key, text.trim()] as [string, string];
      });

      const batchResults = await Promise.all(batchPromises);

      for (const [key, translation] of batchResults) {
        results[key] = translation;
      }
    }

    // Update each translation
    for (const [key, translation] of Object.entries(results)) {
      await updateTranslationAction({
        locale: targetLocale,
        namespace,
        key,
        value: translation,
      });
    }

    logger.info('AI translation completed', {
      sourceLocale,
      targetLocale,
      namespace,
      count: Object.keys(results).length,
    });

    revalidatePath('/translations');

    return { success: true, translations: results };
  } catch (error) {
    logger.error('AI translation failed', { error });
    throw error;
  }
};
