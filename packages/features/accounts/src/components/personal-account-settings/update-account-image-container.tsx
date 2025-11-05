'use client';

import { useCallback } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

import { useTranslation } from 'react-i18next';

import { Database } from '@portal/supabase/database';
import { useSupabase } from '@portal/supabase/hooks/use-supabase';
import { ImageUploader } from '@portal/ui/image-uploader';
import { toast } from '@portal/ui/sonner';
import { Trans } from '@portal/ui/trans';

import { useRevalidatePersonalAccountDataQuery } from '../../hooks/use-personal-account-data';

const AVATARS_BUCKET = 'account_image';

export function UpdateAccountImageContainer({
  user,
}: {
  user: {
    pictureUrl: string | null;
    id: string;
  };
}) {
  const revalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  return (
    <UploadProfileAvatarForm
      pictureUrl={user.pictureUrl ?? null}
      userId={user.id}
      onAvatarUpdated={() => revalidateUserDataQuery(user.id)}
    />
  );
}

function UploadProfileAvatarForm(props: {
  pictureUrl: string | null;
  userId: string;
  onAvatarUpdated: () => void;
}) {
  const client = useSupabase();
  const { t } = useTranslation('account');

  const createToaster = useCallback(
    (promise: () => Promise<unknown>) => {
      return toast.promise(promise, {
        success: t(`updateProfileSuccess`),
        error: t(`updateProfileError`),
        loading: t(`updateProfileLoading`),
      });
    },
    [t],
  );

  const onValueChange = useCallback(
    (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (props.pictureUrl) {
          return (
            deleteProfilePhoto(client, props.pictureUrl) ?? Promise.resolve()
          );
        }

        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingStorageFile().then(() =>
            uploadUserProfilePhoto(client, file, props.userId)
              .then((pictureUrl) => {
                return client
                  .from('accounts')
                  .update({
                    picture_url: pictureUrl,
                  })
                  .eq('id', props.userId)
                  .throwOnError();
              })
              .then(() => {
                props.onAvatarUpdated();
              }),
          );

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingStorageFile()
            .then(() => {
              return client
                .from('accounts')
                .update({
                  picture_url: null,
                })
                .eq('id', props.userId)
                .throwOnError();
            })
            .then(() => {
              props.onAvatarUpdated();
            });

        createToaster(promise);
      }
    },
    [client, createToaster, props],
  );

  return (
    <ImageUploader value={props.pictureUrl} onValueChange={onValueChange}>
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

function deleteProfilePhoto(client: SupabaseClient<Database>, url: string) {
  const bucket = client.storage.from(AVATARS_BUCKET);
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return;
  }

  return bucket.remove([fileName]);
}

async function uploadUserProfilePhoto(
  client: SupabaseClient<Database>,
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
