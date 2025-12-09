"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trans } from "~/components/makerkit/trans";
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
import { toast } from "~/components/ui/sonner";

import { TeamNameFormSchema } from "../../schema/update-team-name.schema";
import { updateTeamAccountName } from "../../server/actions/team-account-server-actions";

export const UpdateTeamAccountNameForm = (props: {
  account: {
    name: string;
    slug: string;
  };

  path: string;
}) => {
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation("teams");

  const form = useForm({
    resolver: zodResolver(TeamNameFormSchema),
    defaultValues: {
      name: props.account.name,
    },
  });

  return (
    <div className={"space-y-8"}>
      <Form {...form}>
        <form
          className={"flex flex-col space-y-4"}
          data-test={"update-team-account-name-form"}
          onSubmit={form.handleSubmit((data) => {
            startTransition(async () => {
              const toastId = toast.loading(t("updateTeamLoadingMessage"));

              try {
                const result = await updateTeamAccountName({
                  slug: props.account.slug,
                  name: data.name,
                  path: props.path,
                });

                if (result.success) {
                  toast.success(t("updateTeamSuccessMessage"), {
                    id: toastId,
                  });
                } else {
                  toast.error(t("updateTeamErrorMessage"), {
                    id: toastId,
                  });
                }
              } catch (error) {
                if (isRedirectError(error)) {
                  toast.success(t("updateTeamSuccessMessage"), {
                    id: toastId,
                  });
                } else {
                  toast.error(t("updateTeamErrorMessage"), {
                    id: toastId,
                  });
                }
              }
            });
          })}
        >
          <FormField
            name={"name"}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon align="inline-start">
                      <Building className="h-4 w-4" />
                    </InputGroupAddon>

                    <InputGroupInput
                      data-test={"team-name-input"}
                      placeholder={t("teams:teamNameInputLabel")}
                      required
                      {...field}
                    />
                  </InputGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button
              className={"w-full md:w-auto"}
              data-test={"update-team-submit-button"}
              disabled={pending}
            >
              <Trans i18nKey={"teams:updateTeamSubmitLabel"} />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
