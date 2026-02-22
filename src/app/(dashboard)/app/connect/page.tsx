import {
  ArrowUpRight,
  BookOpen,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  MessageSquare,
  Share2,
  Terminal,
  Video,
  Youtube,
} from "lucide-react";
import type { Metadata } from "next";

import { PageContent, PageHeader } from "@/components/layout/page";
import { verifySession } from "@/auth/dal";
import { COMMUNITY_LINKS, SOCIAL_MEDIA_LINKS } from "@/config/community";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getRouteMetadata } from "@/shared/seo";

const ICON_MAP = {
  discord: MessageCircle,
  irc: Terminal,
  xmpp: MessageSquare,
  web: Globe,
  github: Github,
  wiki: BookOpen,
} as const;

const SOCIAL_ICON_MAP = {
  x: Share2,
  youtube: Youtube,
  mastodon: Share2,
  bluesky: Share2,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Video,
  tumblr: Share2,
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/connect", routeConfig, resolver);
}

function ExternalLinkTile({
  href,
  name,
  description,
  Icon,
  variant = "tile",
  external = true,
}: {
  href: string;
  name: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  variant?: "hero" | "tile" | "pill" | "inline";
  external?: boolean;
}) {
  const v = variant ?? "tile";
  const base =
    "group flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md dark:border-border/40 dark:bg-card/30 dark:hover:border-primary/30";

  const sizeClasses = {
    hero: "size-12 sm:size-14",
    tile: "size-10",
    pill: "size-8",
    inline: "size-8",
  };
  const iconSizes = {
    hero: "size-6 sm:size-7",
    tile: "size-4 sm:size-5",
    pill: "size-4 sm:size-5",
    inline: "size-4 sm:size-5",
  };

  const layoutClasses = {
    hero: "col-span-full sm:col-span-2 p-5 sm:p-6",
    tile: "p-4",
    pill: "inline-flex px-4 py-2.5",
    inline:
      "inline-flex min-w-0 px-3 py-2 rounded-md border-transparent bg-muted/50 hover:bg-muted",
  };

  return (
    <a
      className={`${base} ${layoutClasses[v]}`}
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ${sizeClasses[v]}`}
      >
        <Icon className={iconSizes[v]} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{name}</span>
        {(v === "hero" || v === "tile") && (
          <span className="mt-0.5 block text-muted-foreground text-sm">
            {description}
          </span>
        )}
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </a>
  );
}

export default async function ConnectPage() {
  await verifySession();
  const resolver = await getServerRouteResolver();

  const chatLinks = COMMUNITY_LINKS.filter((l) =>
    ["discord", "irc", "xmpp"].includes(l.id)
  );
  const domainLinks = COMMUNITY_LINKS.filter((l) =>
    ["atl-dev", "atl-chat", "atl-tools", "atl-sh"].includes(l.id)
  );
  const otherCommunity = COMMUNITY_LINKS.filter(
    (l) => !(chatLinks.includes(l) || domainLinks.includes(l))
  );

  return (
    <PageContent>
      <PageHeader pathname="/app/connect" resolver={resolver} />

      <div className="space-y-10">
        {/* Community — Discord hero + chat pills */}
        <section>
          <h2 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wider">
            Community
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Discord: hero tile */}
            {chatLinks
              .filter((l) => l.id === "discord")
              .map((link) => (
                <ExternalLinkTile
                  description={link.description}
                  href={link.href}
                  Icon={ICON_MAP[link.icon]}
                  key={link.id}
                  name={link.name}
                  variant="hero"
                />
              ))}

            {/* IRC + XMPP: smaller tiles */}
            {chatLinks
              .filter((l) => l.id !== "discord")
              .map((link) => (
                <ExternalLinkTile
                  description={link.description}
                  href={link.href}
                  Icon={ICON_MAP[link.icon]}
                  key={link.id}
                  name={link.name}
                  variant="tile"
                />
              ))}
          </div>

          {/* Domains: compact strip */}
          <div className="mt-3 flex flex-wrap gap-2">
            {domainLinks.map((link) => (
              <ExternalLinkTile
                description={link.description}
                href={link.href}
                Icon={ICON_MAP[link.icon]}
                key={link.id}
                name={link.name}
                variant="inline"
              />
            ))}
          </div>

          {/* Wiki + GitHub */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherCommunity.map((link) => (
              <ExternalLinkTile
                description={link.description}
                href={link.href}
                Icon={ICON_MAP[link.icon]}
                key={link.id}
                name={link.name}
                variant="tile"
              />
            ))}
          </div>
        </section>

        {/* Social — YouTube hero + others as pills */}
        <section>
          <h2 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wider">
            Social Media
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* YouTube: hero */}
            {SOCIAL_MEDIA_LINKS.filter((l) => l.id === "youtube").map(
              (link) => (
                <ExternalLinkTile
                  description={link.description}
                  href={link.href}
                  Icon={SOCIAL_ICON_MAP[link.icon]}
                  key={link.id}
                  name={link.name}
                  variant="hero"
                />
              )
            )}

            {/* Other social: tiles */}
            {SOCIAL_MEDIA_LINKS.filter((l) => l.id !== "youtube").map(
              (link) => (
                <ExternalLinkTile
                  description={link.description}
                  href={link.href}
                  Icon={SOCIAL_ICON_MAP[link.icon]}
                  key={link.id}
                  name={link.name}
                  variant="tile"
                />
              )
            )}
          </div>
        </section>
      </div>
    </PageContent>
  );
}
