import Link from "next/link";
import { CoverImage } from "~/(marketing)/blog/_components/cover-image";
import { DateFormatter } from "~/(marketing)/blog/_components/date-formatter";
import { If } from "~/components/makerkit/if";
import type { Cms } from "~/features/cms/core";

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
      className="flex flex-col gap-y-2.5 rounded-md p-4 transition-all hover:bg-muted/50 active:bg-muted"
      href={slug}
    >
      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mb-2 w-full" style={{ height }}>
            <CoverImage
              preloadImage={preloadImage}
              src={imageUrl}
              title={title}
            />
          </div>
        )}
      </If>

      <div className={"flex flex-col space-y-2"}>
        <div className={"flex flex-col space-y-2"}>
          <div className="flex flex-row items-center gap-x-3 text-xs">
            <div className="text-muted-foreground">
              <DateFormatter dateString={publishedAt} />
            </div>
          </div>

          <h2 className="font-medium text-lg leading-snug tracking-tight">
            <span className="hover:underline">{title}</span>
          </h2>
        </div>

        <p
          className="mb-4 text-muted-foreground text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: trimText(description ?? "", 200) }}
        />
      </div>
    </Link>
  );
}

function trimText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
