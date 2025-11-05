import {
  renderAccountDeleteEmail,
  renderInviteEmail,
  renderOtpEmail,
} from '@portal/email-templates';

export async function loadEmailTemplate(id: string) {
  switch (id) {
    case 'account-delete-email':
      return renderAccountDeleteEmail({
        productName: 'Makerkit',
        userDisplayName: 'Giancarlo',
      });

    case 'invite-email':
      return renderInviteEmail({
        teamName: 'Makerkit',
        teamLogo: '',
        inviter: 'Giancarlo',
        invitedUserEmail: 'test@makerkit.dev',
        link: 'https://makerkit.dev',
        productName: 'Makerkit',
      });

    case 'otp-email':
      return renderOtpEmail({
        productName: 'Makerkit',
        otp: '123456',
      });

    case 'magic-link-email':
      return loadFromFileSystem('magic-link');

    case 'reset-password-email':
      return loadFromFileSystem('reset-password');

    case 'change-email-address-email':
      return loadFromFileSystem('change-email-address');

    case 'confirm-email':
      return loadFromFileSystem('confirm-email');

    default:
      throw new Error(`Email template not found: ${id}`);
  }
}

async function loadFromFileSystem(fileName: string) {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');

  const filePath = join(
    process.cwd(),
    `../web/supabase/templates/${fileName}.html`,
  );

  return {
    html: readFileSync(filePath, 'utf8'),
  };
}
