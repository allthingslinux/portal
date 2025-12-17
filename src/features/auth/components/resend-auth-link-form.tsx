"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Trans } from "~/components/makerkit/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { useResendVerification } from "~/core/auth/better-auth/hooks";

import { useCaptcha } from "../captcha/client";
import { EmailInput } from "./email-input";

export function ResendAuthLinkForm(props: {
  redirectPath?: string;
  captchaSiteKey?: string;
}) {
  const captcha = useCaptcha({ siteKey: props.captchaSiteKey });
  const resendLink = useResendLink(captcha.token);

  const form = useForm({
    resolver: zodResolver(z.object({ email: z.string().email() })),
    defaultValues: {
      email: "",
    },
  });

  if (resendLink.data && !resendLink.isPending) {
    return (
      <Alert variant={"success"}>
        <AlertTitle>
          <Trans i18nKey={"auth:resendLinkSuccess"} />
        </AlertTitle>

        <AlertDescription>
          <Trans
            defaults={"Success!"}
            i18nKey={"auth:resendLinkSuccessDescription"}
          />
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form
        className={"flex flex-col space-y-2"}
        onSubmit={form.handleSubmit((data) => {
          const promise = resendLink.mutateAsync({
            email: data.email,
            redirectPath: props.redirectPath,
          });

          promise.finally(() => {
            captcha.reset();
          });

          return promise;
        })}
      >
        <FormField
          name={"email"}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <EmailInput data-test="email-input" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={resendLink.isPending}>
          <Trans defaults={"Resend Link"} i18nKey={"auth:resendLink"} />
        </Button>
      </form>

      {captcha.field}
    </Form>
  );
}

function useResendLink(captchaToken: string) {
  const resendVerification = useResendVerification();

  return {
    mutateAsync: async (props: { email: string; redirectPath?: string }) =>
      resendVerification.mutateAsync({
        email: props.email,
        redirectPath: props.redirectPath,
        captchaToken,
      }),
    isPending: resendVerification.isPending,
    data: resendVerification.data,
    error: resendVerification.error,
  };
}
