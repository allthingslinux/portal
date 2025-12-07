'use client';

import Link from 'next/link';

import { ArrowLeft, MessageCircle } from 'lucide-react';

import { useCaptureException } from '~/core/monitoring/api/hooks';
import { useSession } from '~/core/auth/nextauth/hooks';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Trans } from '~/components/makerkit/trans';

import { SiteHeader } from '~/(marketing)/_components/site-header';

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useCaptureException(error);

  const { data: user } = useSession();

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <SiteHeader user={user} />

      <div
        className={
          'container m-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-8'}>
          <div>
            <h1 className={'font-heading text-9xl font-semibold'}>
              <Trans i18nKey={'common:errorPageHeading'} />
            </h1>
          </div>

          <div className={'flex flex-col items-center space-y-8'}>
            <div
              className={
                'flex max-w-xl flex-col items-center gap-y-2 text-center'
              }
            >
              <div>
                <Heading level={2}>
                  <Trans i18nKey={'common:genericError'} />
                </Heading>
              </div>

              <p className={'text-muted-foreground text-lg'}>
                <Trans i18nKey={'common:genericErrorSubHeading'} />
              </p>
            </div>

            <div className={'flex space-x-4'}>
              <Button className={'w-full'} variant={'default'} onClick={reset}>
                <ArrowLeft className={'mr-2 h-4'} />

                <Trans i18nKey={'common:goBack'} />
              </Button>

              <Button className={'w-full'} variant={'outline'} asChild>
                <Link href={'/contact'}>
                  <MessageCircle className={'mr-2 h-4'} />

                  <Trans i18nKey={'common:contactUs'} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
