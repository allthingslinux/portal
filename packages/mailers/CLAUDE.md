# Email Service Instructions

This file contains guidance for working with the email service supporting Nodemailer.

## Basic Usage

```typescript
import { getMailer } from '@portal/mailers';
import { renderAccountDeleteEmail } from '@portal/email-templates';

async function sendSimpleEmail() {
    // Get mailer instance
  const mailer = await getMailer();

  // Send simple email
  await mailer.sendEmail({
    to: 'user@example.com',
    from: 'noreply@yourdomain.com', 
    subject: 'Welcome!',
    html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
  });
}

async function sendComplexEmail() {
  // Send with email template
  const { html, subject } = await renderAccountDeleteEmail({
    userDisplayName: user.name,
    productName: 'My SaaS App',
  });

  await mailer.sendEmail({
    to: user.email,
    from: 'noreply@yourdomain.com',
    subject,
    html,
  });
}
```

## Email Templates

Email templates are located in `@portal/email-templates` and return `{ html, subject }`:

```typescript
import { 
  renderAccountDeleteEmail,
  renderWelcomeEmail,
  renderPasswordResetEmail 
} from '@portal/email-templates';

// Render template
const { html, subject } = await renderWelcomeEmail({
  userDisplayName: 'John Doe',
  loginUrl: 'https://app.com/login'
});

// Send rendered email
const mailer = await getMailer();

await mailer.sendEmail({
  to: user.email,
  from: 'welcome@yourdomain.com',
  subject,
  html,
});
```