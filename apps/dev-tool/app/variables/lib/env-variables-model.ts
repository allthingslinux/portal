import { EnvMode } from '@/app/variables/lib/types';
import { z } from 'zod';

type ModelType =
  | 'string'
  | 'longString'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'url'
  | 'email';

type Values = Array<string | null>;

export type EnvVariableModel = {
  name: string;
  description: string;
  hint?: string;
  secret?: boolean;
  type?: ModelType;
  values?: Values;
  category: string;
  required?: boolean;
  deprecated?: {
    reason: string;
    alternative?: string;
  };
  validate?: ({
    value,
    variables,
    mode,
  }: {
    value: string;
    variables: Record<string, string>;
    mode: EnvMode;
  }) => z.SafeParseReturnType<unknown, unknown>;
  contextualValidation?: {
    dependencies: Array<{
      variable: string;
      condition: (value: string, variables: Record<string, string>) => boolean;
      message: string;
    }>;
    validate: ({
      value,
      variables,
      mode,
    }: {
      value: string;
      variables: Record<string, string>;
      mode: EnvMode;
    }) => z.SafeParseReturnType<unknown, unknown>;
  };
};

export const envVariables: EnvVariableModel[] = [
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    description:
      'The URL of your site, used for generating absolute URLs. Must include the protocol.',
    category: 'Site Configuration',
    required: true,
    type: 'url',
    hint: `Ex. https://example.com`,
    validate: ({ value, mode }) => {
      if (mode === 'development') {
        return z
          .string()
          .url({
            message: `The NEXT_PUBLIC_SITE_URL variable must be a valid URL`,
          })
          .safeParse(value);
      }

      return z
        .string()
        .url({
          message: `The NEXT_PUBLIC_SITE_URL variable must be a valid URL`,
        })
        .startsWith(
          'https',
          `The NEXT_PUBLIC_SITE_URL variable must start with https`,
        )
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_PRODUCT_NAME',
    description:
      "Your product's name, used consistently across the application interface.",
    category: 'Site Configuration',
    hint: `Ex. "My Product"`,
    required: true,
    type: 'string',
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_PRODUCT_NAME variable must be at least 1 character`,
        )
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SITE_TITLE',
    description:
      "The site's title tag content, crucial for SEO and browser display.",
    category: 'Site Configuration',
    required: true,
    hint: `Ex. "My Product, the best product ever"`,
    type: 'string',
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_SITE_TITLE variable must be at least 1 character`,
        )
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SITE_DESCRIPTION',
    type: 'longString',
    description:
      "Your site's meta description, important for SEO optimization.",
    category: 'Site Configuration',
    required: true,
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_SITE_DESCRIPTION variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_DEFAULT_LOCALE',
    type: 'string',
    description: 'Sets the default language for your application.',
    category: 'Localization',
    hint: `Ex. "en"`,
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_DEFAULT_LOCALE variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_AUTH_PASSWORD',
    description: 'Enables or disables password-based authentication.',
    category: 'Authentication',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_AUTH_MAGIC_LINK',
    description: 'Enables or disables magic link authentication.',
    category: 'Authentication',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_CAPTCHA_SITE_KEY',
    description: 'Your Cloudflare Captcha site key for form protection.',
    category: 'Security',
    type: 'string',
    validate: ({ value }) => {
      return z.string().optional().safeParse(value);
    },
  },
  {
    name: 'CAPTCHA_SECRET_TOKEN',
    description:
      'Your Cloudflare Captcha secret token for backend verification.',
    category: 'Security',
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'NEXT_PUBLIC_CAPTCHA_SITE_KEY',
          condition: (value) => {
            return value !== '';
          },
          message:
            'CAPTCHA_SECRET_TOKEN is required when NEXT_PUBLIC_CAPTCHA_SITE_KEY is set',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The CAPTCHA_SECRET_TOKEN variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The CAPTCHA_SECRET_TOKEN variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_USER_NAVIGATION_STYLE',
    description:
      'Controls user navigation layout. Options: sidebar, header, or custom.',
    category: 'Navigation',
    type: 'enum',
    values: ['sidebar', 'header', 'custom'],
    validate: ({ value }) => {
      return z
        .enum(['sidebar', 'header', 'custom'])
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED',
    description: 'Sets the default state of the home sidebar.',
    category: 'Navigation',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_TEAM_NAVIGATION_STYLE',
    description:
      'Controls team navigation layout. Options: sidebar, header, or custom.',
    category: 'Navigation',
    type: 'enum',
    values: ['sidebar', 'header', 'custom'],
    validate: ({ value }) => {
      return z
        .enum(['sidebar', 'header', 'custom'])
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_TEAM_SIDEBAR_COLLAPSED',
    description: 'Sets the default state of the team sidebar.',
    category: 'Navigation',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE',
    description:
      'Defines sidebar collapse behavior. Options: offcanvas, icon, or none.',
    category: 'Navigation',
    type: 'enum',
    values: ['offcanvas', 'icon', 'none'],
    validate: ({ value }) => {
      return z.enum(['offcanvas', 'icon', 'none']).optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_DEFAULT_THEME_MODE',
    description:
      'Controls the default theme appearance. Options: light, dark, or system.',
    category: 'Theme',
    type: 'enum',
    values: ['light', 'dark', 'system'],
    validate: ({ value }) => {
      return z.enum(['light', 'dark', 'system']).optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_THEME_TOGGLE',
    description: 'Controls visibility of the theme toggle feature.',
    category: 'Theme',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER',
    description: 'Controls visibility of the sidebar trigger feature.',
    category: 'Navigation',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION',
    description: 'Allows users to delete their personal accounts.',
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS',
    description: 'Master switch for team account functionality.',
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION',
    description: 'Controls ability to create new team accounts.',
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION',
    description: 'Allows team account deletion.',
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_NOTIFICATIONS',
    description: 'Controls the notification system.',
    category: 'Notifications',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_REALTIME_NOTIFICATIONS',
    description: 'Enables real-time notifications using Supabase Realtime.',
    category: 'Notifications',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Your Supabase project URL.',
    category: 'Supabase',
    hint: `Ex. https://your-project.supabase.co`,
    required: true,
    type: 'url',
    validate: ({ value, mode }) => {
      if (mode === 'development') {
        return z
          .string()
          .url({
            message: `The NEXT_PUBLIC_SUPABASE_URL variable must be a valid URL`,
          })
          .safeParse(value);
      }

      return z
        .string()
        .url({
          message: `The NEXT_PUBLIC_SUPABASE_URL variable must be a valid URL`,
        })
        .startsWith(
          'https',
          `The NEXT_PUBLIC_SUPABASE_URL variable must start with https`,
        )
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Your Supabase anonymous API key.',
    category: 'Supabase',
    required: true,
    type: 'string',
    deprecated: {
      reason: 'Replaced by new JWT signing key system',
      alternative: 'NEXT_PUBLIC_SUPABASE_PUBLIC_KEY',
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_SUPABASE_ANON_KEY variable must be at least 1 character`,
        )
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_PUBLIC_KEY',
    description: 'Your Supabase public API key.',
    category: 'Supabase',
    required: false,
    type: 'string',
    hint: 'Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY if not provided',
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_SUPABASE_PUBLIC_KEY variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Your Supabase service role key (keep this secret!).',
    category: 'Supabase',
    secret: true,
    required: true,
    type: 'string',
    deprecated: {
      reason: 'Renamed for consistency with new JWT signing key system',
      alternative: 'SUPABASE_SECRET_KEY',
    },
    validate: ({ value, variables }) => {
      return z
        .string()
        .min(
          1,
          `The SUPABASE_SERVICE_ROLE_KEY variable must be at least 1 character`,
        )
        .refine(
          (value) => {
            return value !== variables['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
          },
          {
            message: `The SUPABASE_SERVICE_ROLE_KEY variable must be different from NEXT_PUBLIC_SUPABASE_ANON_KEY`,
          },
        )
        .safeParse(value);
    },
  },
  {
    name: 'SUPABASE_SECRET_KEY',
    description:
      'Your Supabase secret key (preferred over SUPABASE_SERVICE_ROLE_KEY).',
    category: 'Supabase',
    secret: true,
    required: false,
    type: 'string',
    hint: 'Falls back to SUPABASE_SERVICE_ROLE_KEY if not provided',
    validate: ({ value, variables }) => {
      return z
        .string()
        .min(1, `The SUPABASE_SECRET_KEY variable must be at least 1 character`)
        .refine(
          (value) => {
            const anonKey =
              variables['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
              variables['NEXT_PUBLIC_SUPABASE_PUBLIC_KEY'];
            return value !== anonKey;
          },
          {
            message: `The SUPABASE_SECRET_KEY variable must be different from public keys`,
          },
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'SUPABASE_DB_WEBHOOK_SECRET',
    description: 'Secret key for Supabase webhook verification.',
    category: 'Supabase',
    secret: true,
    required: true,
    type: 'string',
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The SUPABASE_DB_WEBHOOK_SECRET variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    description:
    required: true,
    type: 'enum',
    validate: ({ value }) => {
    },
  },
  {
    required: false,
    type: 'enum',
    deprecated: {
      reason:
      alternative: undefined,
    },
    validate: ({ value }) => {
    },
  },
  {
    hint: `Ex. pk_test_123456789012345678901234`,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          message:
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
          )
          .refine(
            (value) => {
              return value.startsWith('pk_');
            },
            {
            },
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    hint: `Ex. sk_test_123456789012345678901234`,
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          message:
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .refine(
            (value) => {
              return value.startsWith('sk_') || value.startsWith('rk_');
            },
            {
            },
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .optional()
        .safeParse(value);
    },
  },
  {
    hint: `Ex. whsec_123456789012345678901234`,
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          message:
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
          )
          .refine(
            (value) => {
              return value.startsWith('whsec_');
            },
            {
            },
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'LEMON_SQUEEZY_SECRET_KEY',
    description: 'Your Lemon Squeezy secret key.',
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          message:
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The LEMON_SQUEEZY_SECRET_KEY variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The LEMON_SQUEEZY_SECRET_KEY variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'LEMON_SQUEEZY_STORE_ID',
    description: 'Your Lemon Squeezy store ID.',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          message:
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The LEMON_SQUEEZY_STORE_ID variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The LEMON_SQUEEZY_STORE_ID variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'LEMON_SQUEEZY_SIGNING_SECRET',
    description: 'Your Lemon Squeezy signing secret.',
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          message:
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The LEMON_SQUEEZY_SIGNING_SECRET variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The LEMON_SQUEEZY_SIGNING_SECRET variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'MAILER_PROVIDER',
    description: 'Your email service provider. Use nodemailer for SMTP-based email.',
    category: 'Email',
    required: true,
    type: 'enum',
    values: ['nodemailer'],
    validate: ({ value }) => {
      return z.enum(['nodemailer']).safeParse(value);
    },
  },
  {
    name: 'EMAIL_SENDER',
    description: 'Default sender email address.',
    category: 'Email',
    hint: `Ex. "Makerkit <admin@makerkit.dev>"`,
    required: true,
    type: 'string',
    validate: ({ value }) => {
      return z
        .string()
        .min(1, `The EMAIL_SENDER variable must be at least 1 character`)
        .safeParse(value);
    },
  },
  {
    name: 'CONTACT_EMAIL',
    description: 'Email address for contact form submissions.',
    category: 'Email',
    hint: `Ex. "Makerkit <admin@makerkit.dev>"`,
    required: true,
    type: 'email',
    validate: ({ value }) => {
      return z
        .string()
        .email()
        .min(1, `The CONTACT_EMAIL variable must be at least 1 character`)
        .safeParse(value);
    },
  },
  {
  {
    name: 'EMAIL_HOST',
    description: 'SMTP host for Nodemailer configuration.',
    category: 'Email',
    type: 'string',
    hint: `Ex. "smtp.example.com"`,
    contextualValidation: {
      dependencies: [
        {
          variable: 'MAILER_PROVIDER',
          condition: (value) => value === 'nodemailer',
          message:
            'EMAIL_HOST is required when MAILER_PROVIDER is set to "nodemailer"',
        },
      ],
      validate: ({ value, variables }) => {
        if (variables['MAILER_PROVIDER'] === 'nodemailer') {
          return z
            .string()
            .min(1, 'The EMAIL_HOST variable must be at least 1 character')
            .safeParse(value);
        }
        return z.string().optional().safeParse(value);
      },
    },
  },
  {
    name: 'EMAIL_PORT',
    description: 'SMTP port for Nodemailer configuration.',
    category: 'Email',
    type: 'number',
    hint: `Ex. 587 or 465`,
    contextualValidation: {
      dependencies: [
        {
          variable: 'MAILER_PROVIDER',
          condition: (value) => value === 'nodemailer',
          message:
            'EMAIL_PORT is required when MAILER_PROVIDER is set to "nodemailer"',
        },
      ],
      validate: ({ value, variables }) => {
        if (variables['MAILER_PROVIDER'] === 'nodemailer') {
          return z.coerce
            .number()
            .min(1, 'The EMAIL_PORT variable must be at least 1')
            .max(65535, 'The EMAIL_PORT variable must be at most 65535')
            .safeParse(value);
        }
        return z.coerce.number().optional().safeParse(value);
      },
    },
  },
  {
    name: 'EMAIL_USER',
    description: 'SMTP user for Nodemailer configuration.',
    category: 'Email',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'MAILER_PROVIDER',
          condition: (value) => value === 'nodemailer',
          message:
            'EMAIL_USER is required when MAILER_PROVIDER is set to "nodemailer"',
        },
      ],
      validate: ({ value, variables }) => {
        if (variables['MAILER_PROVIDER'] === 'nodemailer') {
          return z
            .string()
            .min(1, 'The EMAIL_USER variable must be at least 1 character')
            .safeParse(value);
        }

        return z.string().optional().safeParse(value);
      },
    },
  },
  {
    name: 'EMAIL_PASSWORD',
    description: 'SMTP password for Nodemailer configuration.',
    category: 'Email',
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'MAILER_PROVIDER',
          condition: (value) => value === 'nodemailer',
          message:
            'EMAIL_PASSWORD is required when MAILER_PROVIDER is set to "nodemailer"',
        },
      ],
      validate: ({ value, variables }) => {
        if (variables['MAILER_PROVIDER'] === 'nodemailer') {
          return z
            .string()
            .min(1, 'The EMAIL_PASSWORD variable must be at least 1 character')
            .safeParse(value);
        }
        return z.string().optional().safeParse(value);
      },
    },
  },
  {
    name: 'EMAIL_TLS',
    description:
      'Whether to use TLS for SMTP connection. Please check this in your SMTP provider settings.',
    category: 'Email',
    type: 'boolean',
    contextualValidation: {
      dependencies: [
        {
          variable: 'MAILER_PROVIDER',
          condition: (value) => value === 'nodemailer',
          message:
            'EMAIL_TLS is required when MAILER_PROVIDER is set to "nodemailer"',
        },
      ],
      validate: ({ value, variables }) => {
        if (variables['MAILER_PROVIDER'] === 'nodemailer') {
          return z.coerce.boolean().optional().safeParse(value);
        }
        return z.coerce.boolean().optional().safeParse(value);
      },
    },
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'CMS_CLIENT',
    description: 'Your chosen CMS system. Options: wordpress or keystatic.',
    category: 'CMS',
    type: 'enum',
    values: ['wordpress', 'keystatic'],
    validate: ({ value }) => {
      return z.enum(['wordpress', 'keystatic']).optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND',
    description: 'Your Keystatic storage kind. Options: local, cloud, github.',
    category: 'CMS',
    type: 'enum',
    values: ['local', 'cloud', 'github'],
    contextualValidation: {
      dependencies: [
        {
          variable: 'CMS_CLIENT',
          condition: (value) => value === 'keystatic',
          message:
            'NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND is required when CMS_CLIENT is set to "keystatic"',
        },
      ],
      validate: ({ value, variables }) => {
        if (variables['CMS_CLIENT'] === 'keystatic') {
          return z
            .enum(['local', 'cloud', 'github'])
            .optional()
            .safeParse(value);
        }
        return z.enum(['local', 'cloud', 'github']).optional().safeParse(value);
      },
    },
  },
  {
    name: 'NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO',
    description: 'Your Keystatic storage repo.',
    category: 'CMS',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'CMS_CLIENT',
          condition: (value, variables) =>
            value === 'keystatic' &&
            variables['NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND'] === 'github',
          message:
            'NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO is required when CMS_CLIENT is set to "keystatic"',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
  },
  {
    name: 'KEYSTATIC_GITHUB_TOKEN',
    description: 'Your Keystatic GitHub token.',
    category: 'CMS',
    secret: true,
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'CMS_CLIENT',
          condition: (value, variables) =>
            value === 'keystatic' &&
            variables['NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND'] === 'github',
          message:
            'KEYSTATIC_GITHUB_TOKEN is required when CMS_CLIENT is set to "keystatic"',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The KEYSTATIC_GITHUB_TOKEN variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
  },
  {
    name: 'KEYSTATIC_PATH_PREFIX',
    description: 'Your Keystatic path prefix.',
    category: 'CMS',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'CMS_CLIENT',
          condition: (value) => value === 'keystatic',
          message:
            'KEYSTATIC_PATH_PREFIX is required when CMS_CLIENT is set to "keystatic"',
        },
      ],
      validate: ({ value }) => {
        return z.string().safeParse(value);
      },
    },
  },
  {
    name: 'NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH',
    description: 'Your Keystatic content path.',
    category: 'CMS',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'CMS_CLIENT',
          condition: (value) => value === 'keystatic',
          message:
            'NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH is required when CMS_CLIENT is set to "keystatic"',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH variable must be at least 1 character`,
          )
          .optional()
          .safeParse(value);
      },
    },
  },
  {
    name: 'WORDPRESS_API_URL',
    description: 'WordPress API URL when using WordPress as CMS.',
    category: 'CMS',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'CMS_CLIENT',
          condition: (value) => value === 'wordpress',
          message:
            'WORDPRESS_API_URL is required when CMS_CLIENT is set to "wordpress"',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .url({
            message: `The WORDPRESS_API_URL variable must be a valid URL`,
          })
          .safeParse(value);
      },
    },
  },
  {
    name: 'NEXT_PUBLIC_LOCALES_PATH',
    description: 'The path to your locales folder.',
    category: 'Localization',
    type: 'string',
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_LOCALES_PATH variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_LANGUAGE_PRIORITY',
    description: 'The priority setting as to how infer the language.',
    category: 'Localization',
    type: 'enum',
    values: ['user', 'application'],
    validate: ({ value }) => {
      return z.enum(['user', 'application']).optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_VERSION_UPDATER',
    description:
      'Enables the version updater to poll the latest version and notify the user.',
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_VERSION_UPDATER_REFETCH_INTERVAL_SECONDS',
    description: 'The interval in seconds to check for updates.',
    category: 'Features',
    type: 'number',
    validate: ({ value }) => {
      return z.coerce
        .number()
        .min(
          1,
          `The NEXT_PUBLIC_VERSION_UPDATER_REFETCH_INTERVAL_SECONDS variable must be at least 1 character`,
        )
        .max(
          86400,
          `The NEXT_PUBLIC_VERSION_UPDATER_REFETCH_INTERVAL_SECONDS variable must be at most 86400`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: `ENABLE_REACT_COMPILER`,
    description: 'Enables the React compiler [experimental]',
    category: 'Build',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_MONITORING_PROVIDER',
    description: 'The monitoring provider to use.',
    category: 'Monitoring',
    type: 'enum',
    values: ['baselime', 'sentry', 'none'],
    validate: ({ value }) => {
      return z.enum(['baselime', 'sentry', '']).optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    description: 'The Sentry DSN to use.',
    category: 'Monitoring',
    type: `string`,
    contextualValidation: {
      dependencies: [
        {
          variable: 'NEXT_PUBLIC_MONITORING_PROVIDER',
          condition: (value) => value === 'sentry',
          message:
            'NEXT_PUBLIC_SENTRY_DSN is required when NEXT_PUBLIC_MONITORING_PROVIDER is set to "sentry"',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The NEXT_PUBLIC_SENTRY_DSN variable must be at least 1 character`,
          )
          .safeParse(value);
      },
    },
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
    description: 'The Sentry environment to use.',
    category: 'Monitoring',
    type: 'string',
    validate: ({ value }) => {
      return z.string().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_BASELIME_KEY',
    description: 'The Baselime key to use.',
    category: 'Monitoring',
    type: 'string',
    contextualValidation: {
      dependencies: [
        {
          variable: 'NEXT_PUBLIC_MONITORING_PROVIDER',
          condition: (value) => value === 'baselime',
          message:
            'NEXT_PUBLIC_BASELIME_KEY is required when NEXT_PUBLIC_MONITORING_PROVIDER is set to "baselime"',
        },
      ],
      validate: ({ value }) => {
        return z
          .string()
          .min(
            1,
            `The NEXT_PUBLIC_BASELIME_KEY variable must be at least 1 character`,
          )
          .optional()
          .safeParse(value);
      },
    },
  },
  {
    description: 'Enables trial plans without credit card.',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_THEME_COLOR',
    description: 'The default theme color.',
    category: 'Theme',
    type: 'string',
    required: true,
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_THEME_COLOR variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_THEME_COLOR_DARK',
    description: 'The default theme color for dark mode.',
    category: 'Theme',
    required: true,
    type: 'string',
    validate: ({ value }) => {
      return z
        .string()
        .min(
          1,
          `The NEXT_PUBLIC_THEME_COLOR_DARK variable must be at least 1 character`,
        )
        .optional()
        .safeParse(value);
    },
  },
  {
    name: 'NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX',
    description: 'Whether to display the terms checkbox during sign-up.',
    category: 'Features',
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
  {
    name: 'ENABLE_STRICT_CSP',
    description: 'Enables strict Content Security Policy (CSP) headers.',
    category: 'Security',
    required: false,
    type: 'boolean',
    validate: ({ value }) => {
      return z.coerce.boolean().optional().safeParse(value);
    },
  },
];
