import { Container } from "@react-email/components";
import { COLORS } from "~/shared/constants/colors";

export function EmailWrapper(
  props: React.PropsWithChildren<{
    className?: string;
  }>
) {
  return (
    <Container
      style={{
        backgroundColor: COLORS.background,
        margin: "auto",
        fontFamily: "sans-serif",
        color: COLORS.foreground,
        width: "100%",
      }}
    >
      <Container
        className={`mx-auto px-[20px] py-[40px]${props.className || ""}`}
        style={{
          maxWidth: "720px",
          backgroundColor: COLORS.background,
          margin: "auto",
        }}
      >
        {props.children}
      </Container>
    </Container>
  );
}
