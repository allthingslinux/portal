import { Container, Text } from "@react-email/components";

export function EmailFooter(props: React.PropsWithChildren) {
  return (
    <Container>
      <Text className="px-4 text-[12px] text-gray-300 leading-[20px]">
        {props.children}
      </Text>
    </Container>
  );
}
