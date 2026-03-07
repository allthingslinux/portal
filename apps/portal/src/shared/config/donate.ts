// ============================================================================
// Donation Links Configuration
// ============================================================================
// Used by the Donate page. Override via env vars if needed.

export interface DonationOption {
  description?: string;
  href: string;
  id: string;
  name: string;
}

const getEnv = (key: string, fallback: string) =>
  typeof process !== "undefined" ? (process.env[key] ?? fallback) : fallback;

export const DONATION_OPTIONS: DonationOption[] = [
  {
    id: "opencollective",
    name: "Open Collective",
    href: getEnv(
      "NEXT_PUBLIC_OPENCOLLECTIVE_URL",
      "https://opencollective.com/allthingslinux"
    ),
  },
  {
    id: "paypal",
    name: "PayPal",
    href: getEnv(
      "NEXT_PUBLIC_PAYPAL_DONATE_URL",
      "https://paypal.com/donate/?hosted_button_id=9R5Y3RDAMF6D8"
    ),
  },
  {
    id: "stripe-monthly",
    name: "Stripe (Monthly)",
    href: getEnv(
      "NEXT_PUBLIC_STRIPE_MONTHLY_URL",
      "https://donate.stripe.com/bJe8wQf5O2ZccHW06u1wY07"
    ),
  },
  {
    id: "stripe-onetime",
    name: "Stripe (One-Time)",
    href: getEnv(
      "NEXT_PUBLIC_STRIPE_ONETIME_URL",
      "https://donate.stripe.com/28EbJ27Dm9nAcHWdXk1wY06"
    ),
  },
  {
    id: "every-org",
    name: "Every.org (Crypto)",
    href: getEnv(
      "NEXT_PUBLIC_EVERY_ORG_CRYPTO_URL",
      "https://every.org/allthingslinux/donate/crypto"
    ),
  },
  {
    id: "cashapp",
    name: "Cash App",
    href: getEnv("NEXT_PUBLIC_CASHAPP_URL", "https://cash.app/$allthingslinux"),
  },
];
