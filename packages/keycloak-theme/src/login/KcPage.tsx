import type { ClassKey } from "keycloakify/login";
import DefaultPage from "keycloakify/login/DefaultPage";
import { lazy, Suspense } from "react";
import { useI18n } from "./i18n";
import type { KcContext } from "./KcContext";
import Template from "./Template";

const UserProfileFormFields = lazy(
  () => import("keycloakify/login/UserProfileFormFields")
);
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props;

  const { i18n } = useI18n({ kcContext });

  return (
    <Suspense>
      {(() => {
        switch (kcContext.pageId) {
          case "login.ftl":
            return (
              <Login
                classes={classes}
                doUseDefaultCss={false}
                i18n={i18n}
                kcContext={kcContext}
                Template={Template}
              />
            );
          case "register.ftl":
            return (
              <Register
                classes={classes}
                doUseDefaultCss={false}
                i18n={i18n}
                kcContext={kcContext}
                Template={Template}
              />
            );
          default:
            return (
              <DefaultPage
                classes={classes}
                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                doUseDefaultCss={false}
                i18n={i18n}
                kcContext={kcContext}
                Template={Template}
                UserProfileFormFields={UserProfileFormFields}
              />
            );
        }
      })()}
    </Suspense>
  );
}

const classes = {} satisfies { [key in ClassKey]?: string };
