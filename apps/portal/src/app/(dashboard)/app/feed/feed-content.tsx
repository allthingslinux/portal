"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Globe, Rss, Search, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@portal/ui/ui/button";
import { Input } from "@portal/ui/ui/input";
import { Separator } from "@portal/ui/ui/separator";

import type { FeedCategory, FeedSource } from "@/config/feed";
import { FEED_CATEGORY_LABELS } from "@/config/feed";
import type { FeedArticle, FeedSourceResult } from "@/shared/feed";

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatRelativeDate(isoDate?: string, pubDate?: string): string {
  const dateStr = isoDate ?? pubDate;
  if (!dateStr) {
    return "";
  }
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: days > 365 ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

function getFaviconUrl(siteUrl: string): string | null {
  try {
    const { hostname } = new URL(siteUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceFavicon({
  siteUrl,
  className = "size-4",
}: {
  siteUrl: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = useMemo(() => getFaviconUrl(siteUrl), [siteUrl]);

  if (!url || failed) {
    return <Globe className={`${className} shrink-0 text-muted-foreground`} />;
  }

  return (
    <Image
      alt=""
      aria-hidden
      className={`${className} shrink-0 rounded-sm object-contain`}
      height={16}
      loading="eager"
      onError={() => setFailed(true)}
      src={url}
      unoptimized
      width={16}
    />
  );
}

type FeedSourceClient = Omit<FeedSource, "categoryPattern">;

interface FilterPanelProps {
  availableCategories: FeedCategory[];
  enabledSources: FeedSourceClient[];
  hasActiveFilters: boolean;
  onClear: () => void;
  onSearchChange: (v: string) => void;
  onToggleCategory: (cat: FeedCategory) => void;
  onToggleSource: (id: string) => void;
  search: string;
  selectedCategories: Set<FeedCategory>;
  selectedSources: Set<string>;
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <span className="w-24 shrink-0 pt-0.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium text-xs transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
          : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
      }`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function FilterPanel({
  search,
  onSearchChange,
  availableCategories,
  selectedCategories,
  onToggleCategory,
  enabledSources,
  selectedSources,
  onToggleSource,
  hasActiveFilters,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="rounded-none border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search articles, sources…"
          value={search}
        />
      </div>

      <Separator />

      {/* Category row */}
      <FilterRow label="Categories">
        {availableCategories.map((cat) => (
          <FilterPill
            active={selectedCategories.has(cat)}
            key={cat}
            onClick={() => onToggleCategory(cat)}
          >
            {FEED_CATEGORY_LABELS[cat]}
          </FilterPill>
        ))}
      </FilterRow>

      <Separator />

      {/* Source row */}
      <FilterRow label="Sources">
        {enabledSources.map((source) => (
          <FilterPill
            active={selectedSources.has(source.id)}
            key={source.id}
            onClick={() => onToggleSource(source.id)}
            title={source.description}
          >
            <SourceFavicon className="size-3.5" siteUrl={source.siteUrl} />
            {source.name}
          </FilterPill>
        ))}

        {hasActiveFilters && (
          <button
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
            onClick={onClear}
            type="button"
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </FilterRow>
    </div>
  );
}

function ArticleCard({ article }: { article: FeedArticle }) {
  const relDate = formatRelativeDate(article.isoDate, article.pubDate);

  return (
    <a
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50 transition-all duration-150 hover:border-primary/40 hover:shadow-md dark:border-border/40 dark:bg-card/30 dark:hover:border-primary/30"
      href={article.link}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* Source row */}
      <div className="flex items-center gap-2 border-border/40 border-b px-4 py-2.5 dark:border-border/30">
        <SourceFavicon siteUrl={article.siteUrl} />
        <span className="font-medium text-muted-foreground text-xs">
          {article.sourceName}
        </span>
        {relDate && (
          <span className="ml-auto text-muted-foreground/70 text-xs">
            {relDate}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 font-semibold text-foreground text-sm leading-snug transition-colors group-hover:text-primary">
          {article.title}
        </p>
        {article.summary && (
          <p className="line-clamp-3 text-muted-foreground text-xs leading-relaxed">
            {article.summary}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-1 pb-3">
        {article.categories.slice(0, 3).map((cat) => (
          <span
            className="rounded-full border border-border/50 px-2 py-0.5 text-muted-foreground text-xs dark:border-border/40"
            key={cat}
          >
            {cat}
          </span>
        ))}
        <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      </div>
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FeedContentProps {
  articles: FeedArticle[];
  results: FeedSourceResult[];
  sources: FeedSourceClient[];
}

export function FeedContent({ articles, results, sources }: FeedContentProps) {
  const [search, setSearch] = useState("");
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<
    Set<FeedCategory>
  >(new Set());

  const enabledSources = useMemo(
    () => sources.filter((s) => s.enabled),
    [sources]
  );

  const availableCategories = useMemo<FeedCategory[]>(() => {
    const seen = new Set<FeedCategory>();
    for (const source of enabledSources) {
      for (const cat of source.categories) {
        seen.add(cat);
      }
    }
    return Array.from(seen).sort();
  }, [enabledSources]);

  const filteredArticles = useMemo(() => {
    let list = articles;

    if (selectedSources.size > 0) {
      list = list.filter((a) => selectedSources.has(a.sourceId));
    }

    if (selectedCategories.size > 0) {
      const matchingSourceIds = new Set(
        enabledSources
          .filter((s) => s.categories.some((c) => selectedCategories.has(c)))
          .map((s) => s.id)
      );
      list = list.filter((a) => matchingSourceIds.has(a.sourceId));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary?.toLowerCase().includes(q) ||
          a.sourceName.toLowerCase().includes(q) ||
          a.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    return list;
  }, [articles, selectedSources, selectedCategories, search, enabledSources]);

  const erroredSources = results.filter((r) => r.error);

  function toggleSource(id: string) {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleCategory(cat: FeedCategory) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setSelectedSources(new Set());
    setSelectedCategories(new Set());
  }

  const hasActiveFilters =
    !!search.trim() || selectedSources.size > 0 || selectedCategories.size > 0;

  return (
    <div className="space-y-5">
      <FilterPanel
        availableCategories={availableCategories}
        enabledSources={enabledSources}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        onSearchChange={setSearch}
        onToggleCategory={toggleCategory}
        onToggleSource={toggleSource}
        search={search}
        selectedCategories={selectedCategories}
        selectedSources={selectedSources}
      />

      {erroredSources.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5">
          <p className="text-amber-600 text-xs dark:text-amber-400">
            Could not load: {erroredSources.map((r) => r.sourceName).join(", ")}
            . These feeds may be temporarily unavailable.
          </p>
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        {filteredArticles.length === articles.length
          ? `${articles.length} articles from ${results.length} sources`
          : `${filteredArticles.length} of ${articles.length} articles`}
      </p>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/50 py-16 dark:border-border/40 dark:bg-card/30">
          <Rss className="mb-3 size-8 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No articles found</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Try adjusting your filters or search query.
          </p>
          {hasActiveFilters && (
            <Button
              className="mt-4"
              onClick={clearFilters}
              size="sm"
              variant="outline"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
