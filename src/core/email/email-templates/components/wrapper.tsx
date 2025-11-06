import { Container } from '@react-email/components';

export function EmailWrapper(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  return (
    <Container
      style={{
        backgroundColor: '#fafafa',
        margin: 'auto',
        fontFamily: 'sans-serif',
        color: '#242424',
        width: '100%',
      }}
    >
      <Container
        style={{
          maxWidth: '720px',
          backgroundColor: '#fafafa',
          margin: 'auto',
        }}
        className={'mx-auto px-[20px] py-[40px] ' + props.className || ''}
      >
        {props.children}
      </Container>
    </Container>
  );
}
