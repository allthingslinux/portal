import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { createCmsClient } from "~/features/cms/core";

import { withI18n } from "~/shared/lib/i18n/with-i18n";

import { Post } from "../../blog/_components/post";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

const getPostBySlug = cache(postLoader);

async function postLoader(slug: string) {
  const client = await createCmsClient();

  return client.getContentItemBySlug({ slug, collection: "posts" });
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { title, publishedAt, description, image } = post;

  return Promise.resolve({
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: publishedAt,
      url: post.url,
      images: image
        ? [
            {
              url: image,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  });
}

async function BlogPost({ params }: BlogPageProps) {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className={"container sm:max-w-none sm:p-0"}>
      <Post content={post.content} post={post} />
    </div>
  );
}

export default withI18n(BlogPost);
