"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingOverlay } from "~/components/portal/loading-overlay";
import { authClient } from "~/core/auth/better-auth";
import { ConfirmationDialog } from "~/shared/components/confirmation-dialog";

import {
  type ImpersonationTokens,
  impersonateUserAction,
} from "../lib/server/admin-server-actions";
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
      onConfirm={async (params) => impersonateUserAction(params)}
      onSuccess={(result: ImpersonationTokens) => {
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
  return useQuery({
    queryKey: ["impersonate-user", tokens.accessToken, tokens.refreshToken],
    gcTime: 0,
    queryFn: async () => {
      // Sign out current session first
      await authClient.signOut();

      // Better Auth handles session via cookies, so we need to set the session
      // by calling the API endpoint with the tokens
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      const response = await fetch(`${baseURL}${apiPath}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to set impersonation session");
      }

      // use a hard refresh to avoid hitting cached pages
      window.location.replace("/home");
    },
  });
}
