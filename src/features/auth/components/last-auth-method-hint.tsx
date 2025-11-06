'use client';

import { useMemo } from 'react';

import dynamic from 'next/dynamic';

import { Lightbulb } from 'lucide-react';

import { If } from '~/components/makerkit/if';
import { Trans } from '~/components/makerkit/trans';

import { useLastAuthMethod } from '../hooks/use-last-auth-method';

interface LastAuthMethodHintProps {
  className?: string;
}

// we force dynamic import to avoid hydration errors
export const LastAuthMethodHint = dynamic(
  async () => ({ default: LastAuthMethodHintImpl }),
  {
    ssr: false,
  },
);

function LastAuthMethodHintImpl({ className }: LastAuthMethodHintProps) {
  const { hasLastMethod, methodType, providerName, isOAuth } =
    useLastAuthMethod();

  // Get the appropriate translation key based on the method - memoized
  // This must be called before any conditional returns to follow Rules of Hooks
  const methodKey = useMemo(() => {
    switch (methodType) {
      case 'password':
        return 'auth:methodPassword';
      case 'otp':
        return 'auth:methodOtp';
      case 'magic_link':
        return 'auth:methodMagicLink';
      case 'oauth':
        return 'auth:methodOauth';
      default:
        return null;
    }
  }, [methodType]);

  // Don't show anything until loaded or if no last method
  if (!hasLastMethod) {
    return null;
  }

  if (!methodKey) {
    return null; // If method is not recognized, don't render anything
  }

  return (
    <div
      data-test="last-auth-method-hint"
      className={`text-muted-foreground/80 flex items-center justify-center gap-2 text-xs ${className || ''}`}
    >
      <Lightbulb className="h-3 w-3" />

      <span>
        <Trans i18nKey="auth:lastUsedMethodPrefix" />{' '}
        <If condition={isOAuth && Boolean(providerName)}>
          <Trans
            i18nKey="auth:methodOauthWithProvider"
            values={{ provider: providerName }}
            components={{
              provider: <span className="text-muted-foreground font-medium" />,
            }}
          />
        </If>
        <If condition={!isOAuth || !providerName}>
          <span className="text-muted-foreground font-medium">
            <Trans i18nKey={methodKey} />
          </span>
        </If>
      </span>
    </div>
  );
}
