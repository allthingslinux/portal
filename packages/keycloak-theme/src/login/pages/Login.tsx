import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useState } from "react";
import { cn } from "~/components/lib/utils";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { I18n } from "../i18n";
import type { KcContext } from "../KcContext";
import Template from "../Template";

export default function Login(
  props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>
) {
  const { kcContext, i18n } = props;
  const {
    social,
    realm,
    url,
    usernameHidden,
    login,
    registrationDisabled,
    messagesPerField,
  } = kcContext;
  const { msg } = i18n;
  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

  return (
    <Template
      displayInfo={
        realm.password && realm.registrationAllowed && !registrationDisabled
      }
      displayMessage={!messagesPerField.existsError("username", "password")}
      doUseDefaultCss={false}
      headerNode={
        <>
          <h1 className="font-semibold text-2xl tracking-tight">
            {msg("loginAccountTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Please enter your details
          </p>
        </>
      }
      i18n={i18n}
      infoNode={
        <div className="text-center text-sm">
          {msg("noAccount")}{" "}
          <a
            className="underline underline-offset-4 hover:text-primary"
            href={url.registrationUrl}
          >
            {msg("doRegister")}
          </a>
        </div>
      }
      kcContext={kcContext}
      socialProvidersNode={
        realm.password &&
        social?.providers !== undefined &&
        social.providers.length !== 0 && (
          <div className="grid gap-2">
            {social.providers.map((p) => (
              <Button
                asChild
                className="w-full"
                key={p.alias}
                variant="outline"
              >
                <a href={p.loginUrl}>{p.displayName}</a>
              </Button>
            ))}
          </div>
        )
      }
    >
      {messagesPerField.existsError("username", "password") && (
        <Alert variant="destructive">
          <AlertDescription>
            {kcSanitize(messagesPerField.getFirstError("username", "password"))}
          </AlertDescription>
        </Alert>
      )}

      {realm.password && (
        <form
          action={url.loginAction}
          className="grid gap-4"
          method="post"
          onSubmit={() => {
            setIsLoginButtonDisabled(true);
            return true;
          }}
        >
          {!usernameHidden && (
            <div className="grid gap-2">
              <Label htmlFor="username">
                {(() => {
                  if (!realm.password) {
                    return msg("username");
                  }
                  if (realm.loginWithEmailAllowed && realm.registrationEmailAsUsername) {
                    return msg("email");
                  }
                  if (realm.loginWithEmailAllowed) {
                    return msg("usernameOrEmail");
                  }
                  return msg("username");
                })()}
              </Label>
              <Input
                autoComplete="username"
                autoFocus
                className={cn(
                  messagesPerField.existsError("username", "password") &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                defaultValue={login.username ?? ""}
                id="username"
                name="username"
                type="text"
              />
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{msg("password")}</Label>
              {realm.resetPasswordAllowed && (
                <a
                  className="font-medium text-muted-foreground text-sm underline-offset-4 hover:text-primary hover:underline"
                  href={url.loginResetCredentialsUrl}
                >
                  {msg("doForgotPassword")}
                </a>
              )}
            </div>
            <Input
              autoComplete="current-password"
              className={cn(
                messagesPerField.existsError("username", "password") &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              id="password"
              name="password"
              type="password"
            />
          </div>

          {realm.rememberMe && !usernameHidden && (
            <div className="flex items-center gap-2">
              <input
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                defaultChecked={!!login.rememberMe}
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
              />
              <Label
                className="font-normal text-muted-foreground text-sm"
                htmlFor="rememberMe"
              >
                {msg("rememberMe")}
              </Label>
            </div>
          )}

          <input
            name="credentialId"
            type="hidden"
            value={kcContext.auth?.selectedCredential}
          />

          <Button
            className="w-full"
            disabled={isLoginButtonDisabled}
            name="login"
            type="submit"
          >
            {msg("doLogIn")}
          </Button>
        </form>
      )}
    </Template>
  );
}
