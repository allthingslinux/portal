import { Container } from '@react-email/components';

export function EmailContent({
  children,
  className,
}: React.PropsWithChildren<{
  className?: string;
  displayLogo?: boolean;
}>) {
  return (
    <Container
      className={
        'mx-auto rounded-xl bg-white px-[48px] py-[36px] ' + className || ''
      }
    >
      {children}
    </Container>
  );
}
