import { Mailer } from '@portal/mailers-shared';
import { createRegistry } from '@portal/shared/registry';

import { MailerProvider } from './provider-enum';

const mailerRegistry = createRegistry<Mailer, MailerProvider>();

mailerRegistry.register('nodemailer', async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createNodemailerService } = await import('@portal/nodemailer');

    return createNodemailerService();
  } else {
    throw new Error(
      'Nodemailer is not available on the edge runtime. Please use another mailer.',
    );
  }
});

export { mailerRegistry };
