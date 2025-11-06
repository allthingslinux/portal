import { z } from 'zod';

/**
 * Returns and validates the Supabase client keys from the environment.
 */
export function getSupabaseClientKeys() {
  return z
    .object({
      url: z.string({
        description: `This is the URL of your hosted Supabase instance. Please provide the variable NEXT_PUBLIC_SUPABASE_URL.`,
        required_error: `Please provide the variable NEXT_PUBLIC_SUPABASE_URL`,
      }),
      publicKey: z.string({
        description: `This is the public key provided by Supabase. It is a public key used client-side. Please provide the variable NEXT_PUBLIC_SUPABASE_PUBLIC_KEY.`,
        required_error: `Please provide the variable NEXT_PUBLIC_SUPABASE_PUBLIC_KEY`,
      }),
    })
    .parse({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      publicKey:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
}
