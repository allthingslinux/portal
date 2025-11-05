import type { PlopTypes } from '@turbo/gen';

// quick hack to avoid installing zod globally
import { z } from '../../../../apps/web/node_modules/zod';
import { generator } from '../../utils';

const BooleanStringEnum = z.enum(['true', 'false']);

const Schema: Record<string, z.ZodType> = {
  NEXT_PUBLIC_SITE_URL: z
    .string({
      description: `This is the URL of your website. It should start with https:// like https://makerkit.dev.`,
    })
    .url({
      message:
        'NEXT_PUBLIC_SITE_URL must be a valid URL. Please use HTTPS for production sites, otherwise it will fail.',
    })
    .refine(
      (url) => {
        return url.startsWith('https://');
      },
      {
        message: 'NEXT_PUBLIC_SITE_URL must start with https://',
        path: ['NEXT_PUBLIC_SITE_URL'],
      },
    ),
  NEXT_PUBLIC_PRODUCT_NAME: z
    .string({
      message: 'Product name must be a string',
      description: `This is the name of your product. It should be a short name like MakerKit.`,
    })
    .min(1),
  NEXT_PUBLIC_SITE_DESCRIPTION: z.string({
    message: 'Site description must be a string',
    description: `This is the description of your website. It should be a short sentence or two.`,
  }),
  NEXT_PUBLIC_DEFAULT_THEME_MODE: z.enum(['light', 'dark', 'system'], {
    message: 'Default theme mode must be light, dark or system',
    description: `This is the default theme mode for your website. It should be light, dark or system.`,
  }),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string({
    message: 'Default locale must be a string',
    description: `This is the default locale for your website. It should be a two-letter code like en or fr.`,
  }),
  CONTACT_EMAIL: z
    .string({
      message: 'Contact email must be a valid email',
      description: `This is the email address that will receive contact form submissions.`,
    })
    .email(),
  NEXT_PUBLIC_ENABLE_THEME_TOGGLE: BooleanStringEnum,
  NEXT_PUBLIC_AUTH_PASSWORD: BooleanStringEnum,
  NEXT_PUBLIC_AUTH_MAGIC_LINK: BooleanStringEnum,
  NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION: BooleanStringEnum,
  NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS: BooleanStringEnum,
  NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION: BooleanStringEnum,
  NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION: BooleanStringEnum,
  NEXT_PUBLIC_REALTIME_NOTIFICATIONS: BooleanStringEnum,
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: BooleanStringEnum,
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      description: `This is the URL to your hosted Supabase instance.`,
    })
    .url({
      message: 'Supabase URL must be a valid URL',
    }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string({
    message: 'Supabase anon key must be a string',
    description: `This is the key provided by Supabase. It is a public key used client-side.`,
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string({
    message: 'Supabase service role key must be a string',
    description: `This is the key provided by Supabase. It is a private key used server-side.`,
  }),
  }),
