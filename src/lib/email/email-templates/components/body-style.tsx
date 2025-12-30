import { COLORS } from "~/shared/constants/colors";

export function BodyStyle() {
  return (
    <style>
      {`
        body {
          background-color: ${COLORS.background};
          margin: auto;
          font-family: sans-serif;
          color: ${COLORS.foreground};
        }
    `}
    </style>
  );
}
