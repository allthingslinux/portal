import { Mailer } from '~/core/email/mailers/shared';
import { createRegistry } from '~/shared/registry';

import { MailerProvider } from './provider-enum';

const mailerRegistry = createRegistry<Mailer, MailerProvider>();

mailerRegistry.register('nodemailer', async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createNodemailerService } = await import('~/core/email/mailers/nodemailer');

    return createNodemailerService();
  } else {
    throw new Error(
      'Nodemailer is not available on the edge runtime. Please use another mailer.',
    );
  }
});

export { mailerRegistry };
