"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

import { PasswordSignInSchema } from "../schemas/password-sign-in.schema";
import { PasswordInput } from "./password-input";

export function PasswordSignInForm({
  onSubmit,
  loading = false,
  redirecting = false,
}: {
  onSubmit: (params: z.infer<typeof PasswordSignInSchema>) => unknown;
  loading: boolean;
  redirecting: boolean;
}) {
  const { t } = useTranslation("auth");

  const form = useForm<z.infer<typeof PasswordSignInSchema>>({
    resolver: zodResolver(PasswordSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className={"flex w-full flex-col gap-y-4"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className={"flex flex-col space-y-2.5"}>
          <FormField
            control={form.control}
            name={"email"}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon>
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>

                    <InputGroupInput
                      data-test={"email-input"}
                      placeholder={t("emailPlaceholder")}
                      required
                      type="email"
                      {...field}
                    />
                  </InputGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"password"}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>

                <FormMessage />

                <div>
                  <Button
                    asChild
                    className={"text-xs"}
                    size={"sm"}
                    type={"button"}
                    variant={"link"}
                  >
                    <Link href={"/auth/password-reset"}>
                      <Trans i18nKey={"auth:passwordForgottenQuestion"} />
                    </Link>
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button
          className={"group w-full"}
          data-test="auth-submit-button"
          disabled={loading || redirecting}
          type="submit"
        >
          {(() => {
            if (redirecting) {
              return (
                <span className={"fade-in slide-in-from-bottom-24 animate-in"}>
                  <Trans i18nKey={"auth:redirecting"} />
                </span>
              );
            }
            if (loading) {
              return (
                <span className={"fade-in slide-in-from-bottom-24 animate-in"}>
                  <Trans i18nKey={"auth:signingIn"} />
                </span>
              );
            }
            return (
              <span className={"fade-out flex animate-out items-center"}>
                <Trans i18nKey={"auth:signInWithEmail"} />

                <ArrowRight
                  className={
                    "zoom-in slide-in-from-left-2 h-4 animate-in fill-mode-both delay-500 duration-500"
                  }
                />
              </span>
            );
          })()}
        </Button>
      </form>
    </Form>
  );
}
