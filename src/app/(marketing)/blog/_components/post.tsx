import type { Cms } from "~/features/cms/core";
import { ContentRenderer } from "~/features/cms/core";

import { PostHeader } from "./post-header";

export function Post({
  post,
  content,
}: {
  post: Cms.ContentItem;
  content: unknown;
}) {
  return (
    <div>
      <PostHeader post={post} />

      <div className={"mx-auto flex max-w-3xl flex-col space-y-6 py-8"}>
        <article className="markdoc">
          <ContentRenderer content={content} />
        </article>
      </div>
    </div>
  );
}
