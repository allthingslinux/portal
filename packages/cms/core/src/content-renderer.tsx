import { CmsType } from '@portal/cms-types';
import { createRegistry } from '@portal/shared/registry';

const CMS_CLIENT = process.env.CMS_CLIENT as CmsType;

interface ContentRendererProps {
  content: unknown;
  type?: CmsType;
}

// Create a registry for CMS client implementations
const cmsContentRendererRegistry = createRegistry<
  React.ComponentType<ContentRendererProps>,
  CmsType
>();

export async function ContentRenderer({
  content,
  type = CMS_CLIENT,
}: ContentRendererProps) {
  const Renderer = await cmsContentRendererRegistry.get(type);

  if (Renderer) {
    return <Renderer content={content} />;
  }

  // fallback to the raw content if no renderer is found
  return content as React.ReactNode;
}

cmsContentRendererRegistry.register('keystatic', async () => {
  const { KeystaticContentRenderer } = await import(
    '@portal/keystatic/renderer'
  );

  return KeystaticContentRenderer;
});

cmsContentRendererRegistry.register('wordpress', async () => {
  const { WordpressContentRenderer } = await import(
    '@portal/wordpress/renderer'
  );

  return WordpressContentRenderer;
});
