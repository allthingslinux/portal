import { EmailTesterForm } from '@/app/emails/[id]/components/email-tester-form';
import { loadEmailTemplate } from '@/app/emails/lib/email-loader';
import { getVariable } from '@/app/variables/lib/env-scanner';
import { EnvMode } from '@/app/variables/lib/types';
import { EnvModeSelector } from '@/components/env-mode-selector';
import { IFrame } from '@/components/iframe';

import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { Button } from '@portal/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@portal/ui/dialog';
import { Page, PageBody, PageHeader } from '@portal/ui/page';

type EmailPageProps = React.PropsWithChildren<{
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{ mode?: EnvMode }>;
}>;

export const metadata = {
  title: 'Email Template',
};

export default async function EmailPage(props: EmailPageProps) {
  const { id } = await props.params;
  const mode = (await props.searchParams).mode ?? 'development';

  const template = await loadEmailTemplate(id);
  const emailSettings = await getEmailSettings(mode);

  const values: Record<string, string> = {
    emails: 'Emails',
    'invite-email': 'Invite Email',
    'account-delete-email': 'Account Delete Email',
    'confirm-email': 'Confirm Email',
    'change-email-address-email': 'Change Email Address Email',
    'reset-password-email': 'Reset Password Email',
    'magic-link-email': 'Magic Link Email',
    'otp-email': 'OTP Email',
  };

  return (
    <Page style={'custom'}>
      <PageHeader
        displaySidebarTrigger={false}
        title={values[id]}
        description={<AppBreadcrumbs values={values} />}
      >
        <EnvModeSelector mode={mode} />
      </PageHeader>

      <PageBody className={'flex flex-1 flex-col gap-y-4'}>
        <p className={'text-muted-foreground py-1 text-xs'}>
          Remember that the below is an approximation of the email. Always test
          it in your inbox.{' '}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={'link'} className="p-0 underline">
                Test Email
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle>Send Test Email</DialogTitle>

              <EmailTesterForm settings={emailSettings} template={id} />
            </DialogContent>
          </Dialog>
        </p>

        <IFrame className={'flex flex-1 flex-col'}>
          <div
            className={'flex flex-1 flex-col'}
            dangerouslySetInnerHTML={{ __html: template.html }}
          />
        </IFrame>
      </PageBody>
    </Page>
  );
}

async function getEmailSettings(mode: EnvMode) {
  const sender = await getVariable('EMAIL_SENDER', mode);
  const host = await getVariable('EMAIL_HOST', mode);
  const port = await getVariable('EMAIL_PORT', mode);
  const tls = await getVariable('EMAIL_TLS', mode);
  const username = await getVariable('EMAIL_USER', mode);
  const password = await getVariable('EMAIL_PASSWORD', mode);

  return {
    sender,
    host,
    port: Number.isNaN(Number(port)) ? 487 : Number(port),
    tls: tls === 'true',
    username,
    password,
  };
}
