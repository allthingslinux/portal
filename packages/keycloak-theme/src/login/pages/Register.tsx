import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useState } from "react";
import { cn } from "~/components/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { I18n } from "../i18n";
import type { KcContext } from "../KcContext";
import Template from "../Template";

export default function Register(
  props: PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n>
) {
  const { kcContext, i18n } = props;
  const {
    url,
    messagesPerField,
    register,
    realm,
    passwordRequired,
    recaptchaRequired,
    recaptchaSiteKey,
  } = kcContext as any;
  const { msg } = i18n;
  const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] =
    useState(false);

  return (
    <Template
      displayInfo={realm.password && realm.registrationAllowed}
      displayMessage={messagesPerField.exists("global")}
      doUseDefaultCss={false}
      headerNode={msg("registerTitle")}
      i18n={i18n}
      infoNode={
        <div className="text-center text-sm md:text-left">
          <a
            className="underline underline-offset-4 hover:text-primary"
            href={url.loginUrl}
          >
            {msg("backToLogin")}
          </a>
        </div>
      }
      kcContext={kcContext}
    >
      <form
        action={url.registrationAction}
        className="grid gap-4"
        method="post"
        onSubmit={() => setIsRegisterButtonDisabled(true)}
      >
        {/* First Name */}
        <div className="grid gap-2">
          <Label htmlFor="firstName">{msg("firstName")}</Label>
          <Input
            className={cn(
              messagesPerField.existsError("firstName") &&
                "border-destructive focus-visible:ring-destructive"
            )}
            defaultValue={register.formData.firstName ?? ""}
            id="firstName"
            name="firstName"
            type="text"
          />
          {messagesPerField.existsError("firstName") && (
            <p className="text-destructive text-sm">
              {messagesPerField.get("firstName")}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="grid gap-2">
          <Label htmlFor="lastName">{msg("lastName")}</Label>
          <Input
            className={cn(
              messagesPerField.existsError("lastName") &&
                "border-destructive focus-visible:ring-destructive"
            )}
            defaultValue={register.formData.lastName ?? ""}
            id="lastName"
            name="lastName"
            type="text"
          />
          {messagesPerField.existsError("lastName") && (
            <p className="text-destructive text-sm">
              {messagesPerField.get("lastName")}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">{msg("email")}</Label>
          <Input
            autoComplete="email"
            className={cn(
              messagesPerField.existsError("email") &&
                "border-destructive focus-visible:ring-destructive"
            )}
            defaultValue={register.formData.email ?? ""}
            id="email"
            name="email"
            type="email"
          />
          {messagesPerField.existsError("email") && (
            <p className="text-destructive text-sm">
              {messagesPerField.get("email")}
            </p>
          )}
        </div>

        {/* Username */}
        {!realm.registrationEmailAsUsername && (
          <div className="grid gap-2">
            <Label htmlFor="username">{msg("username")}</Label>
            <Input
              autoComplete="username"
              className={cn(
                messagesPerField.existsError("username") &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              defaultValue={register.formData.username ?? ""}
              id="username"
              name="username"
              type="text"
            />
            {messagesPerField.existsError("username") && (
              <p className="text-destructive text-sm">
                {messagesPerField.get("username")}
              </p>
            )}
          </div>
        )}

        {/* Password */}
        {passwordRequired && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="password">{msg("password")}</Label>
              <Input
                autoComplete="new-password"
                className={cn(
                  messagesPerField.existsError("password") &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                id="password"
                name="password"
                type="password"
              />
              {messagesPerField.existsError("password") && (
                <p className="text-destructive text-sm">
                  {messagesPerField.get("password")}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password-confirm">{msg("passwordConfirm")}</Label>
              <Input
                autoComplete="new-password"
                className={cn(
                  messagesPerField.existsError("password-confirm") &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                id="password-confirm"
                name="password-confirm"
                type="password"
              />
              {messagesPerField.existsError("password-confirm") && (
                <p className="text-destructive text-sm">
                  {messagesPerField.get("password-confirm")}
                </p>
              )}
            </div>
          </>
        )}

        {/* Recaptcha */}
        {recaptchaRequired && (
          <div className="form-group">
            <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
          </div>
        )}

        <Button
          className="w-full"
          disabled={isRegisterButtonDisabled}
          type="submit"
        >
          {msg("doRegister")}
        </Button>
      </form>
    </Template>
  );
}
