import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { type ReactNode, useEffect } from "react";
import { cn } from "~/components/lib/utils";
import { AppLogo } from "../components/AppLogo";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";

export default function Template(
  props: TemplateProps<KcContext, I18n> & {
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    headerNode: ReactNode;
    socialProvidersNode?: ReactNode;
    infoNode?: ReactNode;
    children: ReactNode;
  }
) {
  const {
    displayInfo = false,
    displayMessage = true,
    headerNode,
    infoNode,
    kcContext,
    i18n,
    children,
  } = props;

  const {
    msg,
    msgStr,
    changeLocale,
    labelBySupportedLanguageTag,
    currentLanguageTag,
  } = i18n as any;

  useEffect(() => {
    document.title = msgStr("loginTitle", kcContext.realm.displayName);
    document.documentElement.classList.add("dark");
  }, [msgStr, kcContext.realm.displayName]);

  return (
    <div className="fade-in slide-in-from-top-12 zoom-in-95 flex h-svh animate-in flex-col items-center justify-center gap-y-8 bg-background duration-1000 lg:bg-muted/30">
      <AppLogo />

      <div className="flex w-full max-w-(--width-auth-shell) flex-col gap-y-6 rounded-lg border border-border/50 bg-card p-6 shadow-sm md:w-8/12 lg:w-5/12 xl:w-4/12 xl:p-8">
        {/* Language Selector (Floating inside card or top right of card if preferred, keeping simple for now) */}
        {kcContext.realm.internationalizationEnabled &&
          labelBySupportedLanguageTag &&
          Object.keys(labelBySupportedLanguageTag).length > 1 && (
            <div className="flex justify-end">
              <select
                className="cursor-pointer border-transparent border-b bg-transparent font-medium text-sm transition-colors hover:border-foreground focus:outline-none"
                onChange={(e) => changeLocale(e.target.value)}
                value={currentLanguageTag}
              >
                {Object.entries(labelBySupportedLanguageTag).map(
                  ([languageTag, label]) => (
                    <option key={languageTag} value={languageTag as string}>
                      {label as ReactNode}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">
            {headerNode}
          </h1>
        </div>

        {/* Messages/Alerts */}
        {displayMessage &&
          kcContext.message &&
          kcContext.message.type !== "warning" && (
            <div
              className={cn(
                "rounded-md p-3 font-medium text-sm",
                kcContext.message.type === "success" &&
                  "bg-green-500/15 text-green-600 dark:text-green-400",
                kcContext.message.type === "error" &&
                  "bg-destructive/15 text-destructive",
                kcContext.message.type === "info" &&
                  "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              )}
            >
              <span
                dangerouslySetInnerHTML={{ __html: kcContext.message.summary }}
              />
            </div>
          )}

        <div className="grid gap-6">{children}</div>

        {/* Social Providers */}
        {/* biome-ignore lint/suspicious/noExplicitAny: convenient access to social */}
        {(kcContext as any).social?.providers && (
          <div className="grid gap-2">
            {/* biome-ignore lint/suspicious/noExplicitAny: convenient access to social */}
            {(kcContext as any).social.providers.map((p: any) => (
              <a
                className={cn(
                  "inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                )}
                href={p.loginUrl}
                key={p.alias}
              >
                <span className="mr-2">
                  {/* Basic mapping for common providers */}
                  {p.alias === "google" && (
                    <svg className="h-4 w-4" role="img" viewBox="0 0 24 24">
                      <title>Google</title>
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.267 2.053-2.08 2.667-4.96 2.667-7.24 0-.587-.067-1.16-.16-1.573H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {p.alias === "github" && (
                    <svg className="h-4 w-4" role="img" viewBox="0 0 24 24">
                      <title>GitHub</title>
                      <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-1.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {p.alias === "discord" && (
                    <svg className="h-4 w-4" role="img" viewBox="0 0 24 24">
                      <title>Discord</title>
                      <path
                        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1645-1.8368-.276-3.6753-.276-5.4868 0-.169-.4032-.4134-.8055-.636-1.1735a.0756.0756 0 00-.0793-.0376 19.7363 19.7363 0 00-4.8818 1.5156.069.069 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057 13.2553 13.2553 0 01-1.879-.8914.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </span>
                {msg("identity-provider-login-label", p.displayName)}
              </a>
            ))}
          </div>
        )}

        {/* Footer Info */}
        {displayInfo && infoNode && (
          <div className="text-center text-muted-foreground text-sm">
            {infoNode}
          </div>
        )}
      </div>
    </div>
  );
}
