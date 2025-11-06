// Or replace this with your own function
import { Config, Node, RenderableTreeNode, Tag } from '@markdoc/markdoc';

function generateID(
  children: Array<RenderableTreeNode>,
  attributes: Record<string, unknown>,
) {
  if (attributes.id && typeof attributes.id === 'string') {
    return attributes.id;
  }

  return children
    .filter((child) => typeof child === 'string')
    .join(' ')
    .replace(/[?]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

const heading = {
  children: ['inline'],
  attributes: {
    id: { type: String },
    level: { type: Number, required: true, default: 1 },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    const id = generateID(children, attributes);

    return new Tag(
      `h${node.attributes.level}`,
      { ...attributes, id },
      children,
    );
  },
};

export const MarkdocNodes = {
  heading,
};
