import { Inter as SansFont } from 'next/font/google';

import { cn } from '~/components/lib/utils';

/**
 * @sans
 * @description Define here the sans font.
 * By default, it uses the Inter font from Google Fonts.
 */
const sans = SansFont({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = sans;

// we export these fonts into the root layout
export { sans, heading };

/**
 * @name getFontsClassName
 * @description Get the class name for the root layout.
 * Note: Fonts are applied globally via CSS variables, not class names.
 */
export function getFontsClassName() {
  // Fonts are applied globally through CSS variables (--font-sans, --font-heading)
  // defined in the Next.js font loading and theme.css, not through HTML class names
  return '';
}
