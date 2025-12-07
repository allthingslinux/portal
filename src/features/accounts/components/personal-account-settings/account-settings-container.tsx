'use client';

import type { Provider } from '@supabase/supabase-js';

import { useTranslation } from 'react-i18next';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { If } from '~/components/makerkit/if';
import { LanguageSelector } from '~/components/makerkit/language-selector';
import { LoadingOverlay } from '~/components/makerkit/loading-overlay';
import { Trans } from '~/components/makerkit/trans';

import { usePersonalAccountData } from '../../hooks/use-personal-account-data';
import { AccountDangerZone } from './account-danger-zone';
import { UpdateEmailFormContainer } from './email/update-email-form-container';
import { LinkAccountsList } from './link-accounts';
import { UpdatePasswordFormContainer } from './password/update-password-container';
import { UpdateAccountDetailsFormContainer } from './update-account-details-form-container';
import { UpdateAccountImageContainer } from './update-account-image-container';

export function PersonalAccountSettingsContainer(
  props: React.PropsWithChildren<{
    userId: string;

    features: {
      enableAccountDeletion: boolean;
      enablePasswordUpdate: boolean;
      enableAccountLinking: boolean;
    };

    paths: {
      callback: string;
    };

    providers: Provider[];
  }>,
) {
  const supportsLanguageSelection = useSupportMultiLanguage();
  const user = usePersonalAccountData(props.userId);

  if (!user.data || user.isPending) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <div className={'flex w-full flex-col space-y-4 pb-32'}>
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:accountImage'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:accountImageDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateAccountImageContainer
            user={{
              pictureUrl: user.data.picture_url,
              id: user.data.id,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:name'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:nameDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateAccountDetailsFormContainer user={user.data} />
        </CardContent>
      </Card>

      <If condition={supportsLanguageSelection}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:language'} />
            </CardTitle>

            <CardDescription>
              <Trans i18nKey={'account:languageDescription'} />
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LanguageSelector />
          </CardContent>
        </Card>
      </If>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:updateEmailCardTitle'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:updateEmailCardDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateEmailFormContainer callbackPath={props.paths.callback} />
        </CardContent>
      </Card>

      <If condition={props.features.enablePasswordUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:updatePasswordCardTitle'} />
            </CardTitle>

            <CardDescription>
              <Trans i18nKey={'account:updatePasswordCardDescription'} />
            </CardDescription>
          </CardHeader>

          <CardContent>
            <UpdatePasswordFormContainer callbackPath={props.paths.callback} />
          </CardContent>
        </Card>
      </If>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:linkedAccounts'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:linkedAccountsDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <LinkAccountsList
            providers={props.providers}
            enabled={props.features.enableAccountLinking}
            showEmailOption
            showPasswordOption
          />
        </CardContent>
      </Card>

      <If condition={props.features.enableAccountDeletion}>
        <Card className={'border-destructive'}>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:dangerZone'} />
            </CardTitle>

            <CardDescription>
              <Trans i18nKey={'account:dangerZoneDescription'} />
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AccountDangerZone />
          </CardContent>
        </Card>
      </If>
    </div>
  );
}

function useSupportMultiLanguage() {
  const { i18n } = useTranslation();
  const langs = (i18n?.options?.supportedLngs as string[]) ?? [];

  const supportedLangs = langs.filter((lang) => lang !== 'cimode');

  return supportedLangs.length > 1;
}
