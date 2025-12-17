import type { CmsType } from "~/features/cms/types/cms.type";
import type { CmsClient } from "~/features/cms/types/cms-client";
import { createRegistry } from "~/shared/registry";

/**
 * The type of CMS client to use.
 */
const CMS_CLIENT = process.env.CMS_CLIENT as CmsType;

const cmsRegistry = createRegistry<CmsClient, CmsType>();

cmsRegistry.register("wordpress", async () => {
  const { createWordpressClient } = await import("../wordpress");
  return createWordpressClient();
});

cmsRegistry.register("keystatic", async () => {
  const { createKeystaticClient } = await import("../keystatic");
  return createKeystaticClient();
});

/**
 * Creates a CMS client based on the specified type.
 *
 * @param {CmsType} type - The type of CMS client to create. Defaults to the value of the CMS_CLIENT environment variable.
 * @returns {Promise<CmsClient>} A Promise that resolves to the created CMS client.
 * @throws {Error} If the specified CMS type is unknown.
 */
export async function createCmsClient(type: CmsType = CMS_CLIENT) {
  return cmsRegistry.get(type);
}
