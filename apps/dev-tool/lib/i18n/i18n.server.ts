import { initializeServerI18n } from '@portal/i18n/server';

import { i18nResolver } from './i18n.resolver';
import { getI18nSettings } from './i18n.settings';

export function createI18nServerInstance(language?: string) {
  const settings = getI18nSettings(language);

  return initializeServerI18n(settings, i18nResolver);
}
