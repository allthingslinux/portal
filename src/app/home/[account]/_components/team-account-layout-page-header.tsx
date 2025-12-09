import { PageHeader } from "~/components/makerkit/page";

export function TeamAccountLayoutPageHeader(
  props: React.PropsWithChildren<{
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    account: string;
  }>
) {
  return (
    <PageHeader description={props.description}>{props.children}</PageHeader>
  );
}
