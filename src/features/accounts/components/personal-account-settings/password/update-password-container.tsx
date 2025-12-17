"use client";

import { LoadingOverlay } from "~/components/portal/loading-overlay";
import { useSession } from "~/core/auth/better-auth/hooks";

import { UpdatePasswordForm } from "./update-password-form";

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>
) {
  const { data: user, isLoading: isPending } = useSession();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user?.email) {
    return null;
  }

  return (
    <UpdatePasswordForm callbackPath={props.callbackPath} email={user.email} />
  );
}
