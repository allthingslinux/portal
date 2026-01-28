// SEO utilities
/** biome-ignore-all lint/performance/noBarrelFile: Barrel file for SEO */

export {
  createPageMetadata,
  defaultMetadata,
  getRouteMetadata,
  getStaticRouteMetadataCached,
} from "./metadata";
export { generateRobots } from "./robots";
export { generateSitemap } from "./sitemap";
