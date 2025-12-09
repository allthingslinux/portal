"use client";

import { CheckCircledIcon } from "@radix-ui/react-icons";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import { useCaptcha } from "../captcha/client";
import { usePasswordSignUpFlow } from "../hooks/use-sign-up-flow";
import { AuthErrorAlert } from "./auth-error-alert";
import { PasswordSignUpForm } from "./password-sign-up-form";

type EmailPasswordSignUpContainerProps = {
  displayTermsCheckbox?: boolean;
  defaultValues?: {
    email: string;
  };
  onSignUp?: (userId?: string) => unknown;
  emailRedirectTo: string;
  captchaSiteKey?: string;
};

export function EmailPasswordSignUpContainer({
  defaultValues,
  onSignUp,
  emailRedirectTo,
  displayTermsCheckbox,
  captchaSiteKey,
}: EmailPasswordSignUpContainerProps) {
  const captcha = useCaptcha({ siteKey: captchaSiteKey });

  const {
    signUp: onSignupRequested,
    loading,
    error,
    showVerifyEmailAlert,
  } = usePasswordSignUpFlow({
    emailRedirectTo,
    onSignUp,
    captchaToken: captcha.token,
    resetCaptchaToken: captcha.reset,
  });

  return (
    <>
      <If condition={showVerifyEmailAlert}>
        <SuccessAlert />
      </If>

      <If condition={!showVerifyEmailAlert}>
        <AuthErrorAlert error={error} />

        <div>
          <PasswordSignUpForm
            defaultValues={defaultValues}
            displayTermsCheckbox={displayTermsCheckbox}
            loading={loading}
            onSubmit={onSignupRequested}
          />

          {captcha.field}
        </div>
      </If>
    </>
  );
}

function SuccessAlert() {
  return (
    <Alert variant={"success"}>
      <CheckCircledIcon className={"w-4"} />

      <AlertTitle>
        <Trans i18nKey={"auth:emailConfirmationAlertHeading"} />
      </AlertTitle>

      <AlertDescription data-test={"email-confirmation-alert"}>
        <Trans i18nKey={"auth:emailConfirmationAlertBody"} />
      </AlertDescription>
    </Alert>
  );
}
