import type { CmsType } from "~/features/cms/types/cms.type";
import type { CmsClient } from "~/features/cms/types/cms-client";
import { createRegistry } from "~/shared/registry";

const VALID_CMS_TYPES = ["wordpress", "keystatic"] as const;

const CMS_CLIENT = process.env.CMS_CLIENT;

if (!CMS_CLIENT) {
  throw new Error("CMS_CLIENT environment variable is required");
}

if (!VALID_CMS_TYPES.includes(CMS_CLIENT as CmsType)) {
  throw new Error(
    `Invalid CMS_CLIENT: ${CMS_CLIENT}. Expected one of: ${VALID_CMS_TYPES.join(", ")}`
  );
}

const validatedCmsClient = CMS_CLIENT as CmsType;

const cmsRegistry = createRegistry<CmsClient, CmsType>();

cmsRegistry.register("wordpress", async () => {
  const { createWordpressClient } = await import("../wordpress");
  return createWordpressClient();
});

cmsRegistry.register("keystatic", async () => {
  const { createKeystaticClient } = await import("../keystatic");
  return createKeystaticClient();
});

export async function createCmsClient(type: CmsType = validatedCmsClient) {
  return cmsRegistry.get(type);
}
