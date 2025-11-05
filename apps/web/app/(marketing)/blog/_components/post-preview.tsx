import Link from 'next/link';

import { Cms } from '@portal/cms';
import { If } from '@portal/ui/if';

import { CoverImage } from '~/(marketing)/blog/_components/cover-image';
import { DateFormatter } from '~/(marketing)/blog/_components/date-formatter';

type Props = {
  post: Cms.ContentItem;
  preloadImage?: boolean;
  imageHeight?: string | number;
};

const DEFAULT_IMAGE_HEIGHT = 220;

export function PostPreview({
  post,
  preloadImage,
  imageHeight,
}: React.PropsWithChildren<Props>) {
  const { title, image, publishedAt, description } = post;
  const height = imageHeight ?? DEFAULT_IMAGE_HEIGHT;

  const slug = `/blog/${post.slug}`;

  return (
    <Link
      href={slug}
      className="hover:bg-muted/50 active:bg-muted flex flex-col gap-y-2.5 rounded-md p-4 transition-all"
    >
      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mb-2 w-full" style={{ height }}>
            <CoverImage
              preloadImage={preloadImage}
              title={title}
              src={imageUrl}
            />
          </div>
        )}
      </If>

      <div className={'flex flex-col space-y-2'}>
        <div className={'flex flex-col space-y-2'}>
          <div className="flex flex-row items-center gap-x-3 text-xs">
            <div className="text-muted-foreground">
              <DateFormatter dateString={publishedAt} />
            </div>
          </div>

          <h2 className="text-lg leading-snug font-medium tracking-tight">
            <span className="hover:underline">{title}</span>
          </h2>
        </div>

        <p
          className="text-muted-foreground mb-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: trimText(description ?? '', 200) }}
        />
      </div>
    </Link>
  );
}

function trimText(text: string, maxLength: number) {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
