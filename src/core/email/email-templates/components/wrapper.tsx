import { Container } from "@react-email/components";

export function EmailWrapper(
  props: React.PropsWithChildren<{
    className?: string;
  }>
) {
  return (
    <Container
      style={{
        backgroundColor: "#fafafa",
        margin: "auto",
        fontFamily: "sans-serif",
        color: "#242424",
        width: "100%",
      }}
    >
      <Container
        className={`mx-auto px-[20px] py-[40px]${props.className || ""}`}
        style={{
          maxWidth: "720px",
          backgroundColor: "#fafafa",
          margin: "auto",
        }}
      >
        {props.children}
      </Container>
    </Container>
  );
}
