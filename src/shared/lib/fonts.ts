import {
  Bricolage_Grotesque as HeadingFont,
  Instrument_Sans as SansFont,
} from "next/font/google";

const sans = SansFont({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

const heading = HeadingFont({
  subsets: ["latin"],
  variable: "--font-heading",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

export { sans, heading };

export function getFontsClassName() {
  return "";
}
