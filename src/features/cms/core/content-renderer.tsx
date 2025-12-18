import type { CmsType } from "~/features/cms/types/cms.type";
import { createRegistry } from "~/shared/registry";

const CMS_CLIENT = process.env.CMS_CLIENT as CmsType;

type ContentRendererProps = {
  content: unknown;
  type?: CmsType;
};

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

cmsContentRendererRegistry.register("keystatic", async () => {
  const { KeystaticContentRenderer } = await import("../keystatic");

  return KeystaticContentRenderer;
});

cmsContentRendererRegistry.register("wordpress", async () => {
  const { WordpressContentRenderer } = await import("../wordpress");

  return WordpressContentRenderer;
});
