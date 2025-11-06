import React from 'react';

import { Node } from '@markdoc/markdoc';

import {
  CustomMarkdocComponents,
  CustomMarkdocTags,
} from './custom-components';
import { MarkdocNodes } from './markdoc-nodes';

/**
 * @name renderMarkdoc
 * @description Renders a Markdoc tree to React
 */
export async function renderMarkdoc(node: Node) {
  const { transform, renderers } = await import('@markdoc/markdoc');

  const content = transform(node, {
    tags: {
      ...CustomMarkdocTags,
    },
    nodes: {
      ...MarkdocNodes,
    },
  });

  return renderers.react(content, React, {
    components: CustomMarkdocComponents,
  });
}
