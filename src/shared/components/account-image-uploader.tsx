'use client';

import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { ImageUploader } from '~/components/makerkit/image-uploader';
import { toast } from '~/components/ui/sonner';
import { Trans } from '~/components/makerkit/trans';

const AVATARS_BUCKET = 'account_image';

interface AccountImageUploaderProps {
  accountId: string;
  pictureUrl: string | null;
  onUpdate: (pictureUrl: string | null) => Promise<void>;
  translationNamespace: 'account' | 'teams';
  onSuccess?: () => void;
}

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
      if (translationNamespace === 'teams') {
        const keyMap: Record<string, string> = {
          success: 'updateTeamSuccessMessage',
          error: 'updateTeamErrorMessage',
          loading: 'updateTeamLoadingMessage',
        };
        return keyMap[key] || key;
      }
      // account namespace
      const keyMap: Record<string, string> = {
        success: 'updateProfileSuccess',
        error: 'updateProfileError',
        loading: 'updateProfileLoading',
      };
      return keyMap[key] || key;
    },
    [translationNamespace],
  );

  const createToaster = useCallback(
    (promise: () => Promise<unknown>) => {
      return toast.promise(promise, {
        success: t(getTranslationKey('success')),
        error: t(getTranslationKey('error')),
        loading: t(getTranslationKey('loading')),
      });
    },
    [t, getTranslationKey],
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
    [accountId, pictureUrl, onUpdate, onSuccess, createToaster],
  );

  return (
    <ImageUploader value={pictureUrl} onValueChange={onValueChange}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm'}>
          <Trans i18nKey={'account:profilePictureHeading'} />
        </span>

        <span className={'text-xs'}>
          <Trans i18nKey={'account:profilePictureSubheading'} />
        </span>
      </div>
    </ImageUploader>
  );
}

async function deleteProfilePhoto(url: string) {
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return;
  }

  const { deleteFileFromStorage } = await import('~/core/storage/supabase-storage');

  return deleteFileFromStorage(AVATARS_BUCKET, fileName);
}

async function uploadUserProfilePhoto(photoFile: File, userId: string) {
  const bytes = await photoFile.arrayBuffer();
  const fileName = getAvatarFileName(userId);
  const { nanoid } = await import('nanoid');
  const cacheBuster = nanoid(16);

  const { uploadFileToStorage, getPublicUrl } = await import(
    '~/core/storage/supabase-storage'
  );

  const result = await uploadFileToStorage(AVATARS_BUCKET, fileName, bytes, {
    contentType: photoFile.type,
    upsert: true,
  });

  if (!result.error) {
    const url = getPublicUrl(AVATARS_BUCKET, fileName);
    return `${url}?v=${cacheBuster}`;
  }

  throw result.error;
}

function getAvatarFileName(userId: string) {
  return userId;
}

