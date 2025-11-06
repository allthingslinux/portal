import { cookies } from 'next/headers';

import { z } from 'zod';

/**
 * @name Theme
 * @description The theme mode enum.
 */
const Theme = z.enum(['light', 'dark', 'system'], {
  description: 'The theme mode',
});

/**
 * @name appDefaultThemeMode
 * @description The default theme mode set by the application.
 */
const appDefaultThemeMode = Theme.safeParse(
  process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
);

/**
 * @name fallbackThemeMode
 * @description The fallback theme mode if none of the other options are available.
 */
const fallbackThemeMode = `light`;

/**
 * @name getRootTheme
 * @description Get the root theme from the cookies or default theme.
 * @returns The root theme.
 */
export async function getRootTheme() {
  const cookiesStore = await cookies();
  const themeCookieValue = cookiesStore.get('theme')?.value;
  const theme = Theme.safeParse(themeCookieValue);

  // pass the theme from the cookie if it exists
  if (theme.success) {
    return theme.data;
  }

  // pass the default theme from the environment variable if it exists
  if (appDefaultThemeMode.success) {
    return appDefaultThemeMode.data;
  }

  // in all other cases, fallback to the default theme
  return fallbackThemeMode;
}
