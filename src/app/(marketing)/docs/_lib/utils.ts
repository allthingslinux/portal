import type { Cms } from "~/features/cms/core";

/**
 * @name buildDocumentationTree
 * @description Build a tree structure for the documentation pages.
 * @param pages
 */
export function buildDocumentationTree(pages: Cms.ContentItem[]) {
  const tree: Cms.ContentItem[] = [];

  for (const page of pages) {
    if (page.parentId) {
      const parent = pages.find((item) => item.slug === page.parentId);

      if (!parent) {
        continue;
      }

      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(page);

      // sort children by order
      parent.children.sort(
        (a: Cms.ContentItem, b: Cms.ContentItem) => a.order - b.order
      );
    } else {
      tree.push(page);
    }
  }

  return tree.sort(
    (a: Cms.ContentItem, b: Cms.ContentItem) => a.order - b.order
  );
}
