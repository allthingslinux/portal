"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trans } from "~/components/trans";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import {
  type UserProfileData,
  UserProfileSchema,
} from "~/features/accounts/schema/user-profile.schema";
import { updateUserProfileAction } from "~/features/accounts/server/user-profile-server-actions";
import { useToastAction } from "~/hooks/use-toast-action";

type UpdateUserProfileFormProps = {
  userId: string;
  currentName: string;
  currentEmail: string;
  onUpdate?: (data: UserProfileData) => void;
};

export function UpdateUserProfileForm({
  userId,
  currentName,
  currentEmail,
  onUpdate,
}: UpdateUserProfileFormProps) {
  const { t } = useTranslation("account");
  const { execute } = useToastAction({
    success: t("updateProfileSuccess"),
    error: t("updateProfileError"),
    loading: t("updateProfileLoading"),
  });

  const form = useForm<UserProfileData>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: currentName,
      email: currentEmail,
    },
  });

  const onSubmit = async (data: UserProfileData) => {
    execute(async () => {
      const result = await updateUserProfileAction(userId, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      onUpdate?.(data);
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="font-medium text-lg">
          <Trans i18nKey="account:profileSettings" />
        </h3>
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="account:profileSettingsDescription" />
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col space-y-4"
          data-test="update-user-profile-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="account:name" />
                </FormLabel>
                <FormControl>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon align="inline-start">
                      <User className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      data-test="user-name"
                      placeholder={t("account:namePlaceholder")}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="account:email" />
                </FormLabel>
                <FormControl>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon align="inline-start">
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      data-test="user-email"
                      placeholder={t("account:emailPlaceholder")}
                      type="email"
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              data-test="update-profile-button"
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              <Trans i18nKey="account:updateProfile" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
