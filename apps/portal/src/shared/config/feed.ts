// ============================================================================
// Linux News Feed Configuration
// ============================================================================
// Configure RSS/Atom feed sources for the Feed page.
// Add or remove outlets here to control what appears in the feed reader.

export type FeedCategory =
  | "news"
  | "distro"
  | "security"
  | "development"
  | "community"
  | "enterprise";

export interface FeedSource {
  /** Categories this source covers */
  categories: FeedCategory[];
  /**
   * When true, extract the first path segment of the item link as a category
   * fallback (e.g. "news" or "review" from phoronix.com/news/…).
   * Only applied when no categories are found through other means.
   */
  categoryFromLinkPath?: boolean;
  /**
   * Optional regex to extract a category from the item description when the
   * feed provides none. The first capture group is used as the category value.
   */
  categoryPattern?: RegExp;
  /** Short description shown in the source filter */
  description: string;
  /** Whether to include this source by default */
  enabled: boolean;
  /** RSS/Atom feed URL */
  feedUrl: string;
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Link to the outlet's homepage */
  siteUrl: string;
}

/** Revalidate feeds every 10 minutes */
export const FEED_REVALIDATE_SECONDS = 600;

/** Maximum articles to fetch per source */
export const FEED_ITEMS_PER_SOURCE = 20;

/** Popular Linux/open-source news outlets */
export const LINUX_FEED_SOURCES: FeedSource[] = [
  {
    id: "linux-com",
    name: "Linux.com",
    description: "Linux Foundation's official news and tutorials",
    feedUrl: "https://www.linux.com/feed/",
    siteUrl: "https://www.linux.com",
    categories: ["news", "community"],
    enabled: true,
  },
  {
    id: "phoronix",
    name: "Phoronix",
    description: "Linux hardware news and benchmarks",
    feedUrl: "https://www.phoronix.com/rss.php",
    siteUrl: "https://www.phoronix.com",
    categories: ["news", "development"],
    enabled: true,
    // Phoronix's RSS exposes no <category> elements from any endpoint.
    // Extract the first URL path segment (e.g. "news", "review") as a coarse fallback.
    categoryFromLinkPath: true,
  },
  {
    id: "lwn",
    name: "LWN.net",
    description: "In-depth kernel and free software coverage",
    feedUrl: "https://lwn.net/headlines/rss",
    siteUrl: "https://lwn.net",
    categories: ["news", "development", "security"],
    enabled: true,
  },
  {
    id: "omglinux",
    name: "OMG! Linux",
    description: "Accessible Linux news and app reviews",
    feedUrl: "https://www.omglinux.com/feed/",
    siteUrl: "https://www.omglinux.com",
    categories: ["news", "community"],
    // Last post was August 2025 — source appears to be inactive
    enabled: false,
  },
  {
    id: "it-foss",
    name: "It's FOSS",
    description: "Linux tutorials, news, and reviews",
    feedUrl: "https://itsfoss.com/feed/",
    siteUrl: "https://itsfoss.com",
    categories: ["news", "community"],
    enabled: true,
  },
  {
    id: "fossforce",
    name: "FOSS Force",
    description: "Free and open-source software advocacy and news",
    feedUrl: "https://fossforce.com/feed/",
    siteUrl: "https://fossforce.com",
    categories: ["news", "community"],
    enabled: true,
  },
  {
    id: "linux-insider",
    name: "Linux Insider",
    description: "Enterprise Linux and open-source technology news",
    feedUrl: "https://www.linuxinsider.com/rss-feed/",
    siteUrl: "https://www.linuxinsider.com",
    categories: ["news", "enterprise"],
    // Feed is blocked by Cloudflare for automated clients
    enabled: false,
  },
  {
    id: "fedora-magazine",
    name: "Fedora Magazine",
    description: "Tips, tutorials, and news from the Fedora Project",
    feedUrl: "https://fedoramagazine.org/feed/",
    siteUrl: "https://fedoramagazine.org",
    categories: ["distro", "community"],
    enabled: true,
  },
  {
    id: "ubuntu-blog",
    name: "Ubuntu Blog",
    description: "Official Ubuntu and Canonical news",
    feedUrl: "https://ubuntu.com/blog/feed",
    siteUrl: "https://ubuntu.com/blog",
    categories: ["distro", "enterprise"],
    enabled: true,
  },
  {
    id: "red-hat-blog",
    name: "Red Hat Blog",
    description: "Enterprise Linux and open-source from Red Hat",
    feedUrl: "https://www.redhat.com/en/rss/blog",
    siteUrl: "https://www.redhat.com/en/blog",
    categories: ["enterprise", "development"],
    enabled: true,
  },
  {
    id: "kernel-org",
    name: "kernel.org",
    description: "Official Linux kernel project news",
    feedUrl: "https://www.kernel.org/feeds/kdist.xml",
    siteUrl: "https://www.kernel.org",
    categories: ["development"],
    enabled: true,
  },
  {
    id: "linux-security",
    name: "LinuxSecurity.com",
    description: "Security advisories and vulnerability news",
    feedUrl: "https://linuxsecurity.com/linuxsecurity_hybrid.xml",
    siteUrl: "https://linuxsecurity.com",
    categories: ["security"],
    enabled: true,
  },
  {
    id: "linux-journal",
    name: "Linux Journal",
    description: "In-depth articles, tutorials, and community content",
    feedUrl: "https://www.linuxjournal.com/node/feed",
    siteUrl: "https://www.linuxjournal.com",
    categories: ["news", "development", "community"],
    enabled: true,
  },
  {
    id: "gaming-on-linux",
    name: "GamingOnLinux",
    description: "Linux gaming news, reviews, and game releases",
    feedUrl: "https://www.gamingonlinux.com/article_rss.php",
    siteUrl: "https://www.gamingonlinux.com",
    categories: ["news", "community"],
    enabled: true,
  },
  {
    id: "linux-foundation",
    name: "Linux Foundation",
    description:
      "Open source strategy, research, and announcements from the Linux Foundation",
    feedUrl: "https://www.linuxfoundation.org/blog/rss.xml",
    siteUrl: "https://www.linuxfoundation.org",
    categories: ["news", "enterprise", "community"],
    enabled: true,
  },
  {
    id: "arch-linux",
    name: "Arch Linux",
    description: "Official Arch Linux news and announcements",
    feedUrl: "https://archlinux.org/feeds/news/",
    siteUrl: "https://archlinux.org",
    categories: ["distro", "news"],
    enabled: true,
  },
  {
    id: "kde-blog",
    name: "KDE Blog",
    description:
      "Official KDE community blog covering Plasma, apps, and development",
    feedUrl: "https://blogs.kde.org/index.xml",
    siteUrl: "https://blogs.kde.org",
    categories: ["development", "community"],
    enabled: true,
  },
  {
    id: "planet-gnome",
    name: "Planet GNOME",
    description:
      "Aggregated blog posts from GNOME contributors and community members",
    feedUrl: "https://planet.gnome.org/atom.xml",
    siteUrl: "https://planet.gnome.org",
    categories: ["development", "community"],
    enabled: true,
  },
];

export const FEED_CATEGORY_LABELS: Record<FeedCategory, string> = {
  news: "News",
  distro: "Distros",
  security: "Security",
  development: "Development",
  community: "Community",
  enterprise: "Enterprise",
};
