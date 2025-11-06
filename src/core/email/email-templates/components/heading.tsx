import { Heading } from '@react-email/components';

export function EmailHeading(props: React.PropsWithChildren) {
  return (
    <Heading className="mx-0 p-0 font-sans text-[22px] font-semibold text-[#242424]">
      {props.children}
    </Heading>
  );
}
