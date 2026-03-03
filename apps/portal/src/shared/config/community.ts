// ============================================================================
// Community & Social Links Configuration
// ============================================================================
// Links to ATL community platforms. Used by the Connect page.
// Discord invite can be overridden via NEXT_PUBLIC_DISCORD_INVITE.

export interface CommunityLink {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: "discord" | "irc" | "xmpp" | "web" | "github" | "wiki";
  external?: boolean;
}

const discordInvite =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_DISCORD_INVITE
    : undefined;

export const COMMUNITY_LINKS: CommunityLink[] = [
  {
    id: "discord",
    name: "Discord",
    description: "Chat, voice, and community on Discord",
    href: discordInvite ?? "https://discord.gg/allthingslinux",
    icon: "discord",
    external: true,
  },
  {
    id: "irc",
    name: "IRC",
    description: "Connect to irc.atl.chat (TLS port 6697)",
    href: "ircs://irc.atl.chat:6697",
    icon: "irc",
    external: true,
  },
  {
    id: "xmpp",
    name: "XMPP",
    description: "Jabber / XMPP at xmpp.atl.chat",
    href: "xmpp:conference.xmpp.atl.chat",
    icon: "xmpp",
    external: true,
  },
  {
    id: "atl-dev",
    name: "atl.dev",
    description: "Main ATL website",
    href: "https://atl.dev",
    icon: "web",
    external: true,
  },
  {
    id: "atl-chat",
    name: "atl.chat",
    description: "Chat hub and services",
    href: "https://atl.chat",
    icon: "web",
    external: true,
  },
  {
    id: "atl-tools",
    name: "atl.tools",
    description: "Portal and developer tools",
    href: "https://atl.tools",
    icon: "web",
    external: true,
  },
  {
    id: "atl-sh",
    name: "atl.sh",
    description: "Shell and pubnix access",
    href: "https://atl.sh",
    icon: "web",
    external: true,
  },
  {
    id: "wiki",
    name: "Wiki",
    description: "Community wiki and documentation",
    href: "https://wiki.atl.dev",
    icon: "wiki",
    external: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "All Things Linux on GitHub",
    href: "https://github.com/allthingslinux",
    icon: "github",
    external: true,
  },
];

// ============================================================================
// Social Media Links
// ============================================================================
// Override via env: NEXT_PUBLIC_X_URL, NEXT_PUBLIC_YOUTUBE_URL, etc.

export interface SocialMediaLink {
  id: string;
  name: string;
  description: string;
  href: string;
  icon:
    | "x"
    | "youtube"
    | "mastodon"
    | "bluesky"
    | "linkedin"
    | "facebook"
    | "instagram"
    | "tiktok"
    | "tumblr";
  external?: boolean;
}

const getEnv = (key: string, fallback: string) =>
  typeof process !== "undefined" ? (process.env[key] ?? fallback) : fallback;

export const SOCIAL_MEDIA_LINKS: SocialMediaLink[] = [
  {
    id: "x",
    name: "X",
    description: "Follow us on X (Twitter)",
    href: getEnv("NEXT_PUBLIC_X_URL", "https://x.com/allthingslinux"),
    icon: "x",
    external: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Videos, tutorials, and livestreams",
    href: getEnv(
      "NEXT_PUBLIC_YOUTUBE_URL",
      "https://youtube.com/@allthingslinux"
    ),
    icon: "youtube",
    external: true,
  },
  {
    id: "mastodon",
    name: "Mastodon",
    description: "Fediverse / Mastodon",
    href: getEnv(
      "NEXT_PUBLIC_MASTODON_URL",
      "https://mastodon.social/@allthingslinux"
    ),
    icon: "mastodon",
    external: true,
  },
  {
    id: "bluesky",
    name: "Bluesky",
    description: "Decentralized social",
    href: getEnv(
      "NEXT_PUBLIC_BLUESKY_URL",
      "https://bsky.app/profile/allthingslinux.bsky.social"
    ),
    icon: "bluesky",
    external: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional network",
    href: getEnv(
      "NEXT_PUBLIC_LINKEDIN_URL",
      "https://linkedin.com/company/allthingslinux"
    ),
    icon: "linkedin",
    external: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Connect on Facebook",
    href: getEnv(
      "NEXT_PUBLIC_FACEBOOK_URL",
      "https://facebook.com/allthingslinux"
    ),
    icon: "facebook",
    external: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Photos and stories",
    href: getEnv(
      "NEXT_PUBLIC_INSTAGRAM_URL",
      "https://instagram.com/allthingslinux"
    ),
    icon: "instagram",
    external: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form videos",
    href: getEnv(
      "NEXT_PUBLIC_TIKTOK_URL",
      "https://tiktok.com/@allthingslinux"
    ),
    icon: "tiktok",
    external: true,
  },
  {
    id: "tumblr",
    name: "Tumblr",
    description: "Blogs and posts",
    href: getEnv("NEXT_PUBLIC_TUMBLR_URL", "https://allthingslinux.tumblr.com"),
    icon: "tumblr",
    external: true,
  },
];
