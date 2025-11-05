import Link from 'next/link';

import {
  CardButton,
  CardButtonHeader,
  CardButtonTitle,
} from '@portal/ui/card-button';
import { Heading } from '@portal/ui/heading';
import { Page, PageBody, PageHeader } from '@portal/ui/page';

export const metadata = {
  title: 'Emails',
};

export default async function EmailsPage() {
  return (
    <Page style={'custom'}>
      <PageHeader
        displaySidebarTrigger={false}
        title="Emails"
        description={'Manage your application Email templates'}
      />

      <PageBody className={'gap-y-8'}>
        <div className={'flex flex-col space-y-4'}>
          <Heading level={5}>Supabase Auth Emails</Heading>

          <div className={'grid grid-cols-1 gap-4 md:grid-cols-4'}>
            <CardButton asChild>
              <Link href={'/emails/confirm-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>Confirm Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>

            <CardButton asChild>
              <Link href={'/emails/change-email-address-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>Change Email Address Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>

            <CardButton asChild>
              <Link href={'/emails/reset-password-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>Reset Password Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>

            <CardButton asChild>
              <Link href={'/emails/magic-link-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>Magic Link Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>
          </div>
        </div>

        <div className={'flex flex-col space-y-4'}>
          <Heading level={5}>Transactional Emails</Heading>

          <div className={'grid grid-cols-1 gap-4 md:grid-cols-4'}>
            <CardButton asChild>
              <Link href={'/emails/account-delete-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>Account Delete Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>

            <CardButton asChild>
              <Link href={'/emails/invite-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>Invite Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>

            <CardButton asChild>
              <Link href={'/emails/otp-email'}>
                <CardButtonHeader>
                  <CardButtonTitle>OTP Email</CardButtonTitle>
                </CardButtonHeader>
              </Link>
            </CardButton>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
