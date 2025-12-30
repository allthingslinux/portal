"use client";

import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { ImageUploader } from "~/components/image-uploader";
import { Trans } from "~/components/trans";
import { toast } from "~/components/ui/sonner";

const AVATARS_BUCKET = "account_image";

type AccountImageUploaderProps = {
  accountId: string;
  pictureUrl: string | null;
  onUpdate: (pictureUrl: string | null) => Promise<void>;
  translationNamespace: "account" | "teams";
  onSuccess?: () => void;
};

/**
 * Shared component for uploading account profile images.
 * Used by both personal and team account settings.
 */
export function AccountImageUploader({
  accountId,
  pictureUrl,
  onUpdate,
  translationNamespace,
  onSuccess,
}: AccountImageUploaderProps) {
  const { t } = useTranslation(translationNamespace);

  const getTranslationKey = useCallback(
    (key: string) => {
      if (translationNamespace === "teams") {
        const keyMap: Record<string, string> = {
          success: "updateTeamSuccessMessage",
          error: "updateTeamErrorMessage",
          loading: "updateTeamLoadingMessage",
        };
        return keyMap[key] || key;
      }
      // account namespace
      const keyMap: Record<string, string> = {
        success: "updateProfileSuccess",
        error: "updateProfileError",
        loading: "updateProfileLoading",
      };
      return keyMap[key] || key;
    },
    [translationNamespace]
  );

  const createToaster = useCallback(
    (promise: () => Promise<unknown>) =>
      toast.promise(promise, {
        success: t(getTranslationKey("success")),
        error: t(getTranslationKey("error")),
        loading: t(getTranslationKey("loading")),
      }),
    [t, getTranslationKey]
  );

  const onValueChange = useCallback(
    (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (pictureUrl) {
          return deleteProfilePhoto(pictureUrl) ?? Promise.resolve();
        }
        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingStorageFile()
            .then(() => uploadUserProfilePhoto(file, accountId))
            .then((newPictureUrl) => onUpdate(newPictureUrl))
            .then(() => {
              onSuccess?.();
            });

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingStorageFile()
            .then(() => onUpdate(null))
            .then(() => {
              onSuccess?.();
            });

        createToaster(promise);
      }
    },
    [accountId, pictureUrl, onUpdate, onSuccess, createToaster]
  );

  return (
    <ImageUploader onValueChange={onValueChange} value={pictureUrl}>
      <div className={"flex flex-col space-y-1"}>
        <span className={"text-sm"}>
          <Trans i18nKey={"account:profilePictureHeading"} />
        </span>

        <span className={"text-xs"}>
          <Trans i18nKey={"account:profilePictureSubheading"} />
        </span>
      </div>
    </ImageUploader>
  );
}

async function deleteProfilePhoto(url: string) {
  const fileName = url.split("/").pop()?.split("?")[0];

  if (!fileName) {
    return;
  }

  const { storageClient } = await import("~/core/storage/storage-client");

  return storageClient.deleteFile(AVATARS_BUCKET, fileName);
}

async function uploadUserProfilePhoto(photoFile: File, userId: string) {
  const bytes = await photoFile.arrayBuffer();
  const fileName = getAvatarFileName(userId);
  const { nanoid } = await import("nanoid");
  const cacheBuster = nanoid(16);

  const { storageClient } = await import("~/core/storage/storage-client");

  const result = await storageClient.uploadFile(
    AVATARS_BUCKET,
    fileName,
    bytes,
    {
      contentType: photoFile.type,
      upsert: true,
    }
  );

  if (!result.error && result.url) {
    return `${result.url}?v=${cacheBuster}`;
  }

  throw result.error || new Error("Failed to upload file");
}

function getAvatarFileName(userId: string) {
  return userId;
}
