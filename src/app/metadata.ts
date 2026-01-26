// ============================================================================
// Metadata Re-exports (Backwards Compatibility)
// ============================================================================
// This file re-exports metadata utilities from the SEO module
// for backwards compatibility. New code should import directly from
// @/shared/seo instead.

// biome-ignore lint/performance/noBarrelFile: Backwards compatibility re-export
export {
  createPageMetadata,
  defaultMetadata,
} from "@/shared/seo";
