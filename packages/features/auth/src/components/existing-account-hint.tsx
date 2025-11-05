'use client';

import { useMemo } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@portal/ui/alert';
import { If } from '@portal/ui/if';
import { Trans } from '@portal/ui/trans';

import { useLastAuthMethod } from '../hooks/use-last-auth-method';

interface ExistingAccountHintProps {
  signInPath?: string;
  className?: string;
}

// we force dynamic import to avoid hydration errors
export const ExistingAccountHint = dynamic(
  async () => ({ default: ExistingAccountHintImpl }),
  {
    ssr: false,
  },
);

export function ExistingAccountHintImpl({
  signInPath = '/auth/sign-in',
  className,
}: ExistingAccountHintProps) {
  const { hasLastMethod, methodType, providerName, isOAuth } =
    useLastAuthMethod();

  const params = useSearchParams();
  const { t } = useTranslation();

  const isInvite = params.get('invite_token');

  if (isInvite) {
    signInPath = signInPath + '?invite_token=' + isInvite;
  }

  // Get the appropriate method description for the hint
  // This must be called before any conditional returns to follow Rules of Hooks
  const methodDescription = useMemo(() => {
    if (isOAuth && providerName) {
      return providerName;
    }

    switch (methodType) {
      case 'password':
        return 'auth:methodPassword';
      case 'otp':
        return 'auth:methodOtp';
      case 'magic_link':
        return 'auth:methodMagicLink';
      default:
        return 'auth:methodDefault';
    }
  }, [methodType, isOAuth, providerName]);

  // Don't show anything until loaded or if no last method
  if (!hasLastMethod) {
    return null;
  }

  return (
    <If condition={Boolean(methodDescription)}>
      <Alert data-test={'existing-account-hint'} className={className}>
        <UserCheck className="h-4 w-4" />

        <AlertDescription>
          <Trans
            i18nKey="auth:existingAccountHint"
            values={{ method: t(methodDescription) }}
            components={{
              method: <span className="font-medium" />,
              signInLink: (
                <Link href={signInPath} className="font-medium underline" />
              ),
            }}
          />
        </AlertDescription>
      </Alert>
    </If>
  );
}
