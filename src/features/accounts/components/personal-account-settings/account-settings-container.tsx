"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { If } from "~/components/if";
import { LanguageSelector } from "~/components/language-selector";
import { usePersonalAccountData } from "~/hooks/use-personal-account-data";
import { useSyncUserFromKeycloak } from "~/hooks/use-sync-user-from-keycloak";
import { AccountDangerZone } from "./account-danger-zone";
import { UpdateAccountImageContainer } from "./update-account-image-container";
import { UpdateUserProfileForm } from "./update-user-profile-form";

export function PersonalAccountSettingsContainer(
  props: React.PropsWithChildren<{
    userId: string;
    features: {
      enableAccountDeletion: boolean;
    };
  }>
) {
  const supportsLanguageSelection = useSupportMultiLanguage();
  const user = usePersonalAccountData(props.userId);
  const syncUser = useSyncUserFromKeycloak();
  const hasSyncedRef = React.useRef(false);

  React.useEffect(() => {
    if (!(hasSyncedRef.current || syncUser.isPending)) {
      hasSyncedRef.current = true;
      syncUser.mutate();
    }
  }, [syncUser.isPending, syncUser.mutate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-semibold text-3xl text-foreground">
            Account Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your profile and account preferences
          </p>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="rounded-xl border bg-card p-8">
            <div className="mb-8">
              <h2 className="mb-2 font-semibold text-xl">
                Profile Information
              </h2>
              <p className="text-muted-foreground">
                Update your personal details and profile picture
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Profile Form */}
              <div className="space-y-6">
                <UpdateUserProfileForm
                  currentEmail="admin@portal.local"
                  currentName="Portal Admin"
                  onUpdate={() => {
                    user.refetch();
                    syncUser.mutate();
                  }}
                  userId={props.userId}
                />
              </div>

              {/* Profile Picture */}
              {user.data && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-medium text-lg">
                      Profile Picture
                    </h3>
                    <p className="mb-6 text-muted-foreground text-sm">
                      Upload a profile picture to personalize your account
                    </p>
                  </div>
                  <UpdateAccountImageContainer
                    user={{
                      pictureUrl: user.data.picture_url,
                      id: user.data.id,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Preferences */}
            <If condition={supportsLanguageSelection}>
              <div className="rounded-xl border bg-card p-8">
                <div className="mb-6">
                  <h2 className="mb-2 font-semibold text-xl">Preferences</h2>
                  <p className="text-muted-foreground">
                    Customize your experience
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-medium text-lg">Language</h3>
                    <p className="mb-4 text-muted-foreground text-xs">
                      Choose your preferred language
                    </p>
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </If>

            {/* Danger Zone */}
            <If condition={props.features.enableAccountDeletion}>
              <div className="rounded-xl border border-destructive/20 bg-card p-8">
                <div className="mb-6">
                  <h2 className="mb-2 font-semibold text-destructive text-xl">
                    Delete Account
                  </h2>
                  <p className="text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <AccountDangerZone />
              </div>
            </If>
          </div>
        </div>
      </div>
    </div>
  );
}

function useSupportMultiLanguage() {
  const { i18n } = useTranslation();
  const langs = (i18n?.options?.supportedLngs as string[]) ?? [];
  const supportedLangs = langs.filter((lang) => lang !== "cimode");
  return supportedLangs.length > 1;
}
