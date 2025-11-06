import { Container, Text } from '@react-email/components';

export function EmailFooter(props: React.PropsWithChildren) {
  return (
    <Container>
      <Text className="px-4 text-[12px] leading-[20px] text-gray-300">
        {props.children}
      </Text>
    </Container>
  );
}
