"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
// Removed PostgrestError import - using standard Error type now
import { Check, Lock, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { toast } from "~/components/ui/sonner";
import { useUpdateUser } from "~/core/auth/better-auth/hooks";

import { PasswordUpdateSchema } from "~/features/accounts/schema/update-password.schema";

export const UpdatePasswordForm = ({
  email,
  callbackPath,
  onSuccess,
}: {
  email: string;
  callbackPath: string;
  onSuccess?: () => void;
}) => {
  const { t } = useTranslation("account");
  const updateUserMutation = useUpdateUser();
  const [needsReauthentication, setNeedsReauthentication] = useState(false);

  const updatePasswordFromCredential = (password: string) => {
    const redirectTo = [window.location.origin, callbackPath].join("");

    const promise = updateUserMutation
      .mutateAsync({ password, redirectTo })
      .then(onSuccess)
      .catch((error) => {
        if (
          typeof error === "string" &&
          error?.includes("Password update requires reauthentication")
        ) {
          setNeedsReauthentication(true);
        } else {
          throw error;
        }
      });

    toast
      .promise(() => promise, {
        success: t("updatePasswordSuccess"),
        error: t("updatePasswordError"),
        loading: t("updatePasswordLoading"),
      })
      .unwrap();
  };

  const updatePasswordCallback = async ({
    newPassword,
  }: {
    newPassword: string;
  }) => {
    // if the user does not have an email assigned, it's possible they
    // don't have an email/password factor linked, and the UI is out of sync
    if (!email) {
      return Promise.reject(t("cannotUpdatePassword"));
    }

    updatePasswordFromCredential(newPassword);
  };

  const form = useForm({
    resolver: zodResolver(
      PasswordUpdateSchema.withTranslation(t("passwordNotMatching"))
    ),
    defaultValues: {
      newPassword: "",
      repeatPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form
        data-test={"account-password-form"}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
      >
        <div className={"flex flex-col space-y-4"}>
          <If condition={updateUserMutation.data}>
            <SuccessAlert />
          </If>

          <If condition={updateUserMutation.error}>
            {(error) => {
              const errorObj =
                error instanceof Error
                  ? { code: error.message, message: error.message }
                  : (error as { code: string; message?: string });
              return <ErrorAlert error={errorObj} />;
            }}
          </If>

          <If condition={needsReauthentication}>
            <NeedsReauthenticationAlert />
          </If>

          <div className="flex flex-col space-y-2">
            <FormField
              name={"newPassword"}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup className="dark:bg-background">
                      <InputGroupAddon align="inline-start">
                        <Lock className="h-4 w-4" />
                      </InputGroupAddon>

                      <InputGroupInput
                        autoComplete={"new-password"}
                        data-test={"account-password-form-password-input"}
                        placeholder={t("account:newPassword")}
                        required
                        type={"password"}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={"repeatPassword"}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup className="dark:bg-background">
                      <InputGroupAddon align="inline-start">
                        <Lock className="h-4 w-4" />
                      </InputGroupAddon>

                      <InputGroupInput
                        data-test={
                          "account-password-form-repeat-password-input"
                        }
                        placeholder={t("account:repeatPassword")}
                        required
                        type={"password"}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={"account:repeatPasswordDescription"} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <Button disabled={updateUserMutation.isPending}>
              <Trans i18nKey={"account:updatePasswordSubmitLabel"} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

function ErrorAlert({ error }: { error: { code: string } }) {
  const { t } = useTranslation();

  return (
    <Alert variant={"destructive"}>
      <XIcon className={"h-4"} />

      <AlertTitle>
        <Trans i18nKey={"account:updatePasswordError"} />
      </AlertTitle>

      <AlertDescription>
        <Trans
          defaults={t("auth:resetPasswordError")}
          i18nKey={`auth:errors.${error.code}`}
        />
      </AlertDescription>
    </Alert>
  );
}

function SuccessAlert() {
  return (
    <Alert variant={"success"}>
      <Check className={"h-4"} />

      <AlertTitle>
        <Trans i18nKey={"account:updatePasswordSuccess"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"account:updatePasswordSuccessMessage"} />
      </AlertDescription>
    </Alert>
  );
}

function NeedsReauthenticationAlert() {
  return (
    <Alert variant={"warning"}>
      <ExclamationTriangleIcon className={"h-4"} />

      <AlertTitle>
        <Trans i18nKey={"account:needsReauthentication"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"account:needsReauthenticationDescription"} />
      </AlertDescription>
    </Alert>
  );
}
