"use client";

import { Lightbulb } from "lucide-react";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";

import { useLastAuthMethod } from "../hooks/use-last-auth-method";

type LastAuthMethodHintProps = {
  className?: string;
};

// we force dynamic import to avoid hydration errors
export const LastAuthMethodHint = dynamic(
  async () => ({ default: LastAuthMethodHintImpl }),
  {
    ssr: false,
  }
);

function LastAuthMethodHintImpl({ className }: LastAuthMethodHintProps) {
  const { hasLastMethod, methodType, providerName, isOAuth } =
    useLastAuthMethod();

  // Get the appropriate translation key based on the method - memoized
  // This must be called before any conditional returns to follow Rules of Hooks
  const methodKey = useMemo(() => {
    switch (methodType) {
      case "password":
        return "auth:methodPassword";
      case "otp":
        return "auth:methodOtp";
      case "magic_link":
        return "auth:methodMagicLink";
      case "oauth":
        return "auth:methodOauth";
      default:
        return null;
    }
  }, [methodType]);

  // Don't show anything until loaded or if no last method
  if (!hasLastMethod) {
    return null;
  }

  if (!methodKey) {
    return null; // If method is not recognized, don't render anything
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 text-muted-foreground/80 text-xs ${className || ""}`}
      data-test="last-auth-method-hint"
    >
      <Lightbulb className="h-3 w-3" />

      <span>
        <Trans i18nKey="auth:lastUsedMethodPrefix" />{" "}
        <If condition={isOAuth && Boolean(providerName)}>
          <Trans
            components={{
              provider: <span className="font-medium text-muted-foreground" />,
            }}
            i18nKey="auth:methodOauthWithProvider"
            values={{ provider: providerName }}
          />
        </If>
        <If condition={!(isOAuth && providerName)}>
          <span className="font-medium text-muted-foreground">
            <Trans i18nKey={methodKey} />
          </span>
        </If>
      </span>
    </div>
  );
}
