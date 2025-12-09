"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Trans } from "./trans";

// configure this as you wish
const COOKIE_CONSENT_STATUS = "cookie_consent_status";

const CONSENT_STATUS = {
  Accepted: "accepted",
  Rejected: "rejected",
  Unknown: "unknown",
} as const;

type ConsentStatus = (typeof CONSENT_STATUS)[keyof typeof CONSENT_STATUS];

export function CookieBanner() {
  const { status, accept, reject } = useCookieConsent();

  if (!isBrowser()) {
    return null;
  }

  if (status !== CONSENT_STATUS.Unknown) {
    return null;
  }

  return (
    <DialogPrimitive.Root modal={false} open>
      <DialogPrimitive.Content
        className={
          "fade-in zoom-in-95 slide-in-from-bottom-16 fixed bottom-0 w-full max-w-lg animate-in border bg-background fill-mode-both p-6 shadow-2xl delay-1000 duration-1000 lg:bottom-[2rem] lg:left-[2rem] lg:h-48 lg:rounded-lg dark:shadow-primary-500/40"
        }
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className={"flex flex-col space-y-4"}>
          <div>
            <Heading level={3}>
              <Trans i18nKey={"cookieBanner.title"} />
            </Heading>
          </div>

          <div className={"text-gray-500 dark:text-gray-400"}>
            <Trans i18nKey={"cookieBanner.description"} />
          </div>

          <div className={"flex justify-end space-x-2.5"}>
            <Button onClick={reject} variant={"ghost"}>
              <Trans i18nKey={"cookieBanner.reject"} />
            </Button>

            <Button autoFocus onClick={accept}>
              <Trans i18nKey={"cookieBanner.accept"} />
            </Button>
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  );
}

export function useCookieConsent() {
  const initialState = getStatusFromLocalStorage();
  const [status, setStatus] = useState<ConsentStatus>(initialState);

  const accept = useCallback(() => {
    const newStatus = CONSENT_STATUS.Accepted;

    setStatus(newStatus);
    storeStatusInLocalStorage(newStatus);
  }, []);

  const reject = useCallback(() => {
    const newStatus = CONSENT_STATUS.Rejected;

    setStatus(newStatus);
    storeStatusInLocalStorage(newStatus);
  }, []);

  const clear = useCallback(() => {
    const newStatus = CONSENT_STATUS.Unknown;

    setStatus(newStatus);
    storeStatusInLocalStorage(newStatus);
  }, []);

  return useMemo(
    () => ({
      clear,
      status,
      accept,
      reject,
    }),
    [clear, status, accept, reject]
  );
}

function storeStatusInLocalStorage(status: ConsentStatus) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(COOKIE_CONSENT_STATUS, status);
}

function getStatusFromLocalStorage() {
  if (!isBrowser()) {
    return CONSENT_STATUS.Unknown;
  }

  const status = localStorage.getItem(COOKIE_CONSENT_STATUS) as ConsentStatus;

  return status ?? CONSENT_STATUS.Unknown;
}

function isBrowser() {
  return typeof window !== "undefined";
}
