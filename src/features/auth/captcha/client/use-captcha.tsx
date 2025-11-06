'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { TurnstileInstance } from '@marsidev/react-turnstile';

import { CaptchaField } from './captcha-field';

/**
 * @name useCaptcha
 * @description Zero-boilerplate hook for captcha integration.
 * Manages token state and instance internally, exposing a clean API.
 *
 * @example
 * ```tsx
 * function SignInForm({ captchaSiteKey }) {
 *   const captcha = useCaptcha({ siteKey: captchaSiteKey });
 *
 *   const handleSubmit = async (data) => {
 *     await signIn({ ...data, captchaToken: captcha.token });
 *     captcha.reset();
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {captcha.field}
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCaptcha(
  { siteKey, nonce }: { siteKey?: string; nonce?: string } = {
    siteKey: undefined,
    nonce: undefined,
  },
) {
  const [token, setToken] = useState('');
  const instanceRef = useRef<TurnstileInstance | null>(null);

  const reset = useCallback(() => {
    instanceRef.current?.reset();
    setToken('');
  }, []);

  const handleTokenChange = useCallback((newToken: string) => {
    setToken(newToken);
  }, []);

  const handleInstanceChange = useCallback(
    (instance: TurnstileInstance | null) => {
      instanceRef.current = instance;
    },
    [],
  );

  const field = useMemo(
    () => (
      <CaptchaField
        siteKey={siteKey}
        onTokenChange={handleTokenChange}
        onInstanceChange={handleInstanceChange}
        nonce={nonce}
      />
    ),
    [siteKey, nonce, handleTokenChange, handleInstanceChange],
  );

  return useMemo(
    () => ({
      /** The current captcha token */
      token,
      /** Reset the captcha (clears token and resets widget) */
      reset,
      /** The captcha field component to render */
      field,
    }),
    [token, reset, field],
  );
}
