import { env } from "../../env";

const appConfig = {
  name: env.NEXT_PUBLIC_PRODUCT_NAME,
  title: env.NEXT_PUBLIC_SITE_TITLE,
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
  url: env.NEXT_PUBLIC_SITE_URL,
  locale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  theme: env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
  themeColor: env.NEXT_PUBLIC_THEME_COLOR,
  themeColorDark: env.NEXT_PUBLIC_THEME_COLOR_DARK,
  production: process.env.NODE_ENV === "production", // Use process.env directly for client-side access
};

export default appConfig;
