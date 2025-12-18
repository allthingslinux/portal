import type { CmsType } from "~/features/cms/types/cms.type";
import type { CmsClient } from "~/features/cms/types/cms-client";
import { createRegistry } from "~/shared/registry";

const VALID_CMS_TYPES = ["wordpress", "keystatic"] as const;

const CMS_CLIENT = process.env.CMS_CLIENT as CmsType;

if (CMS_CLIENT && !VALID_CMS_TYPES.includes(CMS_CLIENT)) {
  throw new Error(`Invalid CMS_CLIENT: ${CMS_CLIENT}. Expected one of: ${VALID_CMS_TYPES.join(", ")}`);
}

const cmsRegistry = createRegistry<CmsClient, CmsType>();

cmsRegistry.register("wordpress", async () => {
  const { createWordpressClient } = await import("../wordpress");
  return createWordpressClient();
});

cmsRegistry.register("keystatic", async () => {
  const { createKeystaticClient } = await import("../keystatic");
  return createKeystaticClient();
});

export async function createCmsClient(type: CmsType = CMS_CLIENT) {
  return cmsRegistry.get(type);
}
