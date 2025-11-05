import { cache } from 'react';

import type { Metadata } from 'next';

import { createCmsClient } from '@portal/cms';
import { getLogger } from '@portal/shared/logger';
import { If } from '@portal/ui/if';
import { Trans } from '@portal/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { SitePageHeader } from '../_components/site-page-header';
import { BlogPagination } from './_components/blog-pagination';
import { PostPreview } from './_components/post-preview';

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

const BLOG_POSTS_PER_PAGE = 10;

export const generateMetadata = async (
  props: BlogPageProps,
): Promise<Metadata> => {
  const { t, resolvedLanguage } = await createI18nServerInstance();
  const searchParams = await props.searchParams;
  const limit = BLOG_POSTS_PER_PAGE;

  const page = searchParams.page ? parseInt(searchParams.page) : 0;
  const offset = page * limit;

  const { total } = await getContentItems(resolvedLanguage, limit, offset);

  return {
    title: t('marketing:blog'),
    description: t('marketing:blogSubtitle'),
    pagination: {
      previous: page > 0 ? `/blog?page=${page - 1}` : undefined,
      next: offset + limit < total ? `/blog?page=${page + 1}` : undefined,
    },
  };
};

const getContentItems = cache(
  async (language: string | undefined, limit: number, offset: number) => {
    const client = await createCmsClient();
    const logger = await getLogger();

    try {
      return await client.getContentItems({
        collection: 'posts',
        limit,
        offset,
        language,
        content: false,
        sortBy: 'publishedAt',
        sortDirection: 'desc',
      });
    } catch (error) {
      logger.error({ error }, 'Failed to load blog posts');

      return { total: 0, items: [] };
    }
  },
);

async function BlogPage(props: BlogPageProps) {
  const { t, resolvedLanguage: language } = await createI18nServerInstance();
  const searchParams = await props.searchParams;

  const limit = BLOG_POSTS_PER_PAGE;
  const page = searchParams.page ? parseInt(searchParams.page) : 0;
  const offset = page * limit;

  const { total, items: posts } = await getContentItems(
    language,
    limit,
    offset,
  );

  return (
    <>
      <SitePageHeader
        title={t('marketing:blog')}
        subtitle={t('marketing:blogSubtitle')}
      />

      <div className={'container flex flex-col space-y-6 py-8'}>
        <If
          condition={posts.length > 0}
          fallback={<Trans i18nKey="marketing:noPosts" />}
        >
          <PostsGridList>
            {posts.map((post, idx) => {
              return <PostPreview key={idx} post={post} />;
            })}
          </PostsGridList>

          <div>
            <BlogPagination
              currentPage={page}
              canGoToNextPage={offset + limit < total}
              canGoToPreviousPage={page > 0}
            />
          </div>
        </If>
      </div>
    </>
  );
}

export default withI18n(BlogPage);

function PostsGridList({ children }: React.PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-2 md:gap-y-12 lg:grid-cols-3">
      {children}
    </div>
  );
}
