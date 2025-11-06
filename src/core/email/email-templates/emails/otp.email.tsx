import {
  Body,
  Button,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

import { BodyStyle } from '../components/body-style';
import { EmailContent } from '../components/content';
import { EmailFooter } from '../components/footer';
import { EmailHeader } from '../components/header';
import { EmailHeading } from '../components/heading';
import { EmailWrapper } from '../components/wrapper';
import { initializeEmailI18n } from '../lib/i18n';

interface Props {
  otp: string;
  productName: string;
  language?: string;
}

export async function renderOtpEmail(props: Props) {
  const namespace = 'otp-email';

  const { t } = await initializeEmailI18n({
    language: props.language,
    namespace,
  });

  const subject = t(`${namespace}:subject`, {
    productName: props.productName,
  });

  const previewText = subject;

  const heading = t(`${namespace}:heading`, {
    productName: props.productName,
  });

  const otpText = t(`${namespace}:otpText`, {
    otp: props.otp,
  });

  const mainText = t(`${namespace}:mainText`);
  const footerText = t(`${namespace}:footerText`);

  const html = await render(
    <Html>
      <Head>
        <BodyStyle />
      </Head>

      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body>
          <EmailWrapper>
            <EmailHeader>
              <EmailHeading>{heading}</EmailHeading>
            </EmailHeader>

            <EmailContent>
              <Text className="text-[16px] text-[#242424]">{mainText}</Text>

              <Text className="text-[16px] text-[#242424]">{otpText}</Text>

              <Section className="mt-[16px] mb-[16px] text-center">
                <Button className={'w-full rounded bg-neutral-950 text-center'}>
                  <Text className="text-[16px] leading-[16px] font-medium font-semibold text-white">
                    {props.otp}
                  </Text>
                </Button>
              </Section>

              <Text
                className="text-[16px] text-[#242424]"
                dangerouslySetInnerHTML={{ __html: footerText }}
              />
            </EmailContent>

            <EmailFooter>{props.productName}</EmailFooter>
          </EmailWrapper>
        </Body>
      </Tailwind>
    </Html>,
  );

  return {
    html,
    subject,
  };
}
