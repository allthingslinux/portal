import { PageHeader } from "~/components/makerkit/page";

export function HomeLayoutPageHeader(
  props: React.PropsWithChildren<{
    title: string | React.ReactNode;
    description: string | React.ReactNode;
  }>
) {
  return (
    <PageHeader description={props.description}>{props.children}</PageHeader>
  );
}
