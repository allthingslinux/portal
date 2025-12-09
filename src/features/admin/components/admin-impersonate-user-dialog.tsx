"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingOverlay } from "~/components/makerkit/loading-overlay";
import { useSupabase } from "~/core/database/supabase/hooks/use-supabase";
import { ConfirmationDialog } from "~/shared/components/confirmation-dialog";

import { impersonateUserAction } from "../lib/server/admin-server-actions";
import { ImpersonateUserSchema } from "../lib/server/schema/admin-actions.schema";

export function AdminImpersonateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>
) {
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  }>();

  if (tokens) {
    return (
      <>
        <ImpersonateUserAuthSetter tokens={tokens} />
        <LoadingOverlay>Setting up your session...</LoadingOverlay>
      </>
    );
  }

  return (
    <ConfirmationDialog
      buttonText="Impersonate User"
      confirmationDescription="Are you sure you want to impersonate this user?"
      defaultValues={{ userId: props.userId }}
      description={
        <div className={"flex flex-col space-y-1"}>
          <span>
            Are you sure you want to impersonate this user? You will be logged
            in as this user. To stop impersonating, log out.
          </span>
          <span>
            <b>NB:</b> If the user has 2FA enabled, you will not be able to
            impersonate them.
          </span>
        </div>
      }
      errorMessage="Failed to impersonate user. Please check the logs to understand what went wrong."
      onConfirm={impersonateUserAction}
      onSuccess={(result) => {
        setTokens(result);
      }}
      pendingText="Impersonating"
      schema={ImpersonateUserSchema}
      testId="admin-impersonate-user-form"
      title="Impersonate User"
    >
      {props.children}
    </ConfirmationDialog>
  );
}

function ImpersonateUserAuthSetter({
  tokens,
}: React.PropsWithChildren<{
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}>) {
  useSetSession(tokens);

  return <LoadingOverlay>Setting up your session...</LoadingOverlay>;
}

function useSetSession(tokens: { accessToken: string; refreshToken: string }) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["impersonate-user", tokens.accessToken, tokens.refreshToken],
    gcTime: 0,
    queryFn: async () => {
      await supabase.auth.signOut();

      await supabase.auth.setSession({
        refresh_token: tokens.refreshToken,
        access_token: tokens.accessToken,
      });

      // use a hard refresh to avoid hitting cached pages
      window.location.replace("/home");
    },
  });
}
