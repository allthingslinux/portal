'use client';

import { useCallback } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

import { useTranslation } from 'react-i18next';

import { useSupabase } from '~/core/database/supabase/hooks/use-supabase';
import { ImageUploader } from '~/components/makerkit/image-uploader';
import { toast } from '~/components/ui/sonner';
import { Trans } from '~/components/makerkit/trans';

const AVATARS_BUCKET = 'account_image';

export function UpdateTeamAccountImage(props: {
  account: {
    id: string;
    name: string;
    pictureUrl: string | null;
  };
}) {
  const client = useSupabase();
  const { t } = useTranslation('teams');

  const createToaster = useCallback(
    (promise: () => Promise<unknown>) => {
      return toast.promise(promise, {
        success: t(`updateTeamSuccessMessage`),
        error: t(`updateTeamErrorMessage`),
        loading: t(`updateTeamLoadingMessage`),
      });
    },
    [t],
  );

  const onValueChange = useCallback(
    (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (props.account.pictureUrl) {
          return (
            deleteProfilePhoto(client, props.account.pictureUrl) ??
            Promise.resolve()
          );
        }

        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingStorageFile().then(() =>
            uploadUserProfilePhoto(client, file, props.account.id).then(
              (pictureUrl) => {
                return client
                  .from('accounts')
                  .update({
                    picture_url: pictureUrl,
                  })
                  .eq('id', props.account.id)
                  .throwOnError();
              },
            ),
          );

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingStorageFile().then(() => {
            return client
              .from('accounts')
              .update({
                picture_url: null,
              })
              .eq('id', props.account.id)
              .throwOnError();
          });

        createToaster(promise);
      }
    },
    [client, createToaster, props],
  );

  return (
    <ImageUploader
      value={props.account.pictureUrl}
      onValueChange={onValueChange}
    >
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

function deleteProfilePhoto(client: SupabaseClient, url: string) {
  const bucket = client.storage.from(AVATARS_BUCKET);
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return;
  }

  return bucket.remove([fileName]);
}

async function uploadUserProfilePhoto(
  client: SupabaseClient,
  photoFile: File,
  userId: string,
) {
  const bytes = await photoFile.arrayBuffer();
  const bucket = client.storage.from(AVATARS_BUCKET);
  const fileName = getAvatarFileName(userId);
  const { nanoid } = await import('nanoid');
  const cacheBuster = nanoid(16);

  const result = await bucket.upload(fileName, bytes, {
    contentType: photoFile.type,
    upsert: true,
  });

  if (!result.error) {
    const url = bucket.getPublicUrl(userId).data.publicUrl;
    return `${url}?v=${cacheBuster}`;
  }

  throw result.error;
}

function getAvatarFileName(userId: string) {
  return userId;
}
