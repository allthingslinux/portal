import {
  Bricolage_Grotesque as HeadingFont,
  Instrument_Sans as SansFont,
} from "next/font/google";

/**
 * @sans
 * @description Define here the sans font.
 */
const sans = SansFont({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = HeadingFont({
  subsets: ["latin"],
  variable: "--font-heading",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

export { sans, heading };

/**
 * @name getFontsClassName
 * @description Get the class name for the root layout.
 * Note: Fonts are applied globally via CSS variables, not class names.
 */
export function getFontsClassName() {
  // Fonts are applied globally through CSS variables (--font-sans, --font-heading)
  // defined in the Next.js font loading and theme.css, not through HTML class names
  return "";
}
