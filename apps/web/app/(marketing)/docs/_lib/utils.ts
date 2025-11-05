import { Cms } from '@portal/cms';

/**
 * @name buildDocumentationTree
 * @description Build a tree structure for the documentation pages.
 * @param pages
 */
export function buildDocumentationTree(pages: Cms.ContentItem[]) {
  const tree: Cms.ContentItem[] = [];

  pages.forEach((page) => {
    if (page.parentId) {
      const parent = pages.find((item) => item.slug === page.parentId);

      if (!parent) {
        return;
      }

      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(page);

      // sort children by order
      parent.children.sort((a, b) => a.order - b.order);
    } else {
      tree.push(page);
    }
  });

  return tree.sort((a, b) => a.order - b.order);
}
