import type { Cms, CmsClient } from "~/features/cms/types";

import { createKeystaticReader } from "./create-reader";
import type {
  DocumentationEntryProps,
  PostEntryProps,
} from "./keystatic.config";
import { renderMarkdoc } from "./markdoc";

export function createKeystaticClient() {
  return new KeystaticClient();
}

class KeystaticClient implements CmsClient {
  async getContentItems(options: Cms.GetContentItemsOptions) {
    const reader = await createKeystaticReader();

    const collection =
      options.collection as keyof (typeof reader)["collections"];

    if (!reader.collections[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const fetchContent = options.content ?? true;

    const startOffset = options?.offset ?? 0;
    const endOffset = startOffset + (options?.limit ?? 10);

    const docs = await reader.collections[collection].all();

    const filtered = docs
      .filter((item) => {
        const status = options?.status ?? "published";

        if (item.entry.status !== status) {
          return false;
        }

        const categoryMatch = options?.categories?.length
          ? options.categories.find((category) =>
              item.entry.categories.includes(category)
            )
          : true;

        if (!categoryMatch) {
          return false;
        }

        if (
          options.language &&
          item.entry.language &&
          item.entry.language !== options.language
        ) {
          return false;
        }

        const tagMatch = options?.tags?.length
          ? options.tags.find((tag) => item.entry.tags.includes(tag))
          : true;

        if (!tagMatch) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const direction = options.sortDirection ?? "asc";
        const sortBy = options.sortBy ?? "publishedAt";

        const transform = (value: string | number | undefined | null) => {
          if (typeof value === "string") {
            return new Date(value).getTime();
          }

          return value ?? 0;
        };

        const left = transform(a.entry[sortBy]);
        const right = transform(b.entry[sortBy]);

        if (direction === "asc") {
          return left - right;
        }

        return right - left;
      });

    function processItems(processedItems: typeof filtered) {
      const slugSet = new Set(processedItems.map((item) => item.slug));
      const indexFileCache = new Map<string, boolean>();
      const parentCache = new Map<string, string | null>();

      const isIndexFile = (slug: string): boolean => {
        if (indexFileCache.has(slug)) {
          return indexFileCache.get(slug) ?? false;
        }

        const parts = slug.split("/");

        const result =
          parts.length === 1 ||
          (parts.length >= 2 && parts.at(-1) === parts.at(-2));

        indexFileCache.set(slug, result);
        return result;
      };

      const findClosestValidParent = (pathParts: string[]): string | null => {
        const path = pathParts.join("/");

        if (parentCache.has(path)) {
          return parentCache.get(path) ?? null;
        }

        for (let i = pathParts.length - 1; i > 0; i--) {
          const parentParts = pathParts.slice(0, i);
          const lastPart = parentParts.at(-1);

          if (!lastPart) {
            continue;
          }

          const possibleIndexParent = parentParts.concat(lastPart).join("/");

          if (slugSet.has(possibleIndexParent)) {
            parentCache.set(path, possibleIndexParent);
            return possibleIndexParent;
          }

          const regularParent = parentParts.join("/");

          if (slugSet.has(regularParent)) {
            parentCache.set(path, regularParent);
            return regularParent;
          }
        }

        parentCache.set(path, null);
        return null;
      };

      const results = new Array(processedItems.length) as typeof processedItems;

      for (let i = 0; i < processedItems.length; i++) {
        const item = processedItems[i];

        if (!item) {
          continue;
        }

        // If the parent is already set, we don't need to do anything
        if (item.entry.parent !== null) {
          continue;
        }

        if (isIndexFile(item.slug)) {
          item.entry.parent = null;
          results[i] = item;
          continue;
        }

        const pathParts = item.slug.split("/");
        const parentParts = pathParts.slice(0, -1);
        const lastPart = parentParts.at(-1);

        if (!lastPart) {
          results[i] = item;
          continue;
        }
        const possibleIndexParent = parentParts.concat(lastPart).join("/");

        if (slugSet.has(possibleIndexParent)) {
          item.entry.parent = possibleIndexParent;
        } else {
          const regularParent = parentParts.join("/");
          if (slugSet.has(regularParent)) {
            item.entry.parent = regularParent;
          } else {
            item.entry.parent = findClosestValidParent(pathParts);
          }
        }

        results[i] = item;
      }

      return results;
    }

    const itemsWithParents = processItems(filtered);

    const items = await Promise.all(
      itemsWithParents
        .slice(startOffset, endOffset)
        .sort((a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0))
        .map((item) => {
          if (collection === "documentation") {
            return this.mapDocumentationPost(
              item as {
                entry: DocumentationEntryProps;
                slug: string;
              },
              { fetchContent }
            );
          }

          return this.mapPost(
            item as {
              entry: PostEntryProps;
              slug: string;
            },
            { fetchContent }
          );
        })
    );

    return {
      total: filtered.length,
      items,
    };
  }

  async getContentItemBySlug(params: {
    slug: string;
    collection: string;
    status?: Cms.ContentItemStatus;
  }) {
    const reader = await createKeystaticReader();

    const collection =
      params.collection as keyof (typeof reader)["collections"];

    if (!reader.collections[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const doc = await reader.collections[collection].read(params.slug);
    const status = params.status ?? "published";

    // verify that the document exists
    if (!doc) {
      return Promise.resolve(undefined);
    }

    // check the document matches the status provided in the params
    if (doc.status !== status) {
      return Promise.resolve(undefined);
    }

    return this.mapPost({ entry: doc as PostEntryProps, slug: params.slug });
  }

  async getCategories() {
    return Promise.resolve([]);
  }

  async getTags() {
    return Promise.resolve([]);
  }

  async getTagBySlug() {
    return Promise.resolve(undefined);
  }

  async getCategoryBySlug() {
    return Promise.resolve(undefined);
  }

  private async mapDocumentationPost<
    Type extends {
      entry: DocumentationEntryProps;
      slug: string;
    },
  >(
    item: Type,
    params: {
      fetchContent: boolean;
    } = {
      fetchContent: true,
    }
  ): Promise<Cms.ContentItem> {
    const publishedAt = item.entry.publishedAt
      ? new Date(item.entry.publishedAt)
      : new Date();

    const content = await item.entry.content();
    const html = params.fetchContent ? await renderMarkdoc(content.node) : [];

    return {
      id: item.slug,
      title: item.entry.title,
      label: item.entry.label,
      url: item.slug,
      slug: item.slug,
      description: item.entry.description,
      publishedAt: publishedAt.toISOString(),
      content: html as string,
      image: item.entry.image ?? undefined,
      status: item.entry.status as Cms.ContentItemStatus,
      collapsible: item.entry.collapsible,
      collapsed: item.entry.collapsed,
      categories:
        (item.entry.categories ?? []).map((category) => ({
          id: category,
          name: category,
          slug: category,
        })) ?? [],
      tags: (item.entry.tags ?? []).map((tag) => ({
        id: tag,
        name: tag,
        slug: tag,
      })),
      parentId: item.entry.parent ?? undefined,
      order: item.entry.order ?? 1,
      children: [],
    };
  }

  private async mapPost<
    Type extends {
      entry: PostEntryProps;
      slug: string;
    },
  >(
    item: Type,
    params: {
      fetchContent: boolean;
    } = {
      fetchContent: true,
    }
  ): Promise<Cms.ContentItem> {
    const publishedAt = item.entry.publishedAt
      ? new Date(item.entry.publishedAt)
      : new Date();

    const content = await item.entry.content();
    const html = params.fetchContent ? await renderMarkdoc(content.node) : [];

    return {
      id: item.slug,
      title: item.entry.title,
      label: item.entry.label,
      url: item.slug,
      slug: item.slug,
      description: item.entry.description,
      publishedAt: publishedAt.toISOString(),
      content: html as string,
      image: item.entry.image ?? undefined,
      status: item.entry.status as Cms.ContentItemStatus,
      categories:
        (item.entry.categories ?? []).map((category) => ({
          id: category,
          name: category,
          slug: category,
        })) ?? [],
      tags: (item.entry.tags ?? []).map((tag) => ({
        id: tag,
        name: tag,
        slug: tag,
      })),
      parentId: item.entry.parent ?? undefined,
      order: item.entry.order ?? 1,
      children: [],
    };
  }
}
