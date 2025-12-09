"use client";

import { LoadingOverlay } from "~/components/makerkit/loading-overlay";
import { useSession } from "~/core/auth/better-auth/hooks";

import { UpdateEmailForm } from "./update-email-form";

export function UpdateEmailFormContainer(props: { callbackPath: string }) {
  const { data: user, isLoading: isPending } = useSession();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user?.email) {
    return null;
  }

  return (
    <UpdateEmailForm callbackPath={props.callbackPath} email={user.email} />
  );
}
