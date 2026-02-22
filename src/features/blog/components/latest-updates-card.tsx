import { ArrowUpRight, Newspaper } from "lucide-react";

import { fetchLatestBlogPosts } from "@/shared/feed";

const POST_LIMIT = 5;

function formatDate(isoDate?: string, pubDate?: string): string {
  const dateStr = isoDate ?? pubDate;
  if (!dateStr) {
    return "";
  }
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export async function LatestUpdatesCard() {
  const posts = await fetchLatestBlogPosts(POST_LIMIT);

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <Newspaper className="size-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Latest Blog Posts</h3>
        </div>
        <p className="mt-3 text-muted-foreground text-sm">
          No posts available right now. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="size-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Latest Blog Posts</h3>
        </div>
        <a
          className="font-medium text-primary text-xs hover:underline"
          href="https://allthingslinux.org/blog"
          rel="noopener noreferrer"
          target="_blank"
        >
          View all
        </a>
      </div>
      <ul className="flex flex-col gap-2">
        {posts.map((post) => (
          <li key={post.link}>
            <a
              className="group flex flex-col gap-0.5 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/50 dark:border-border/40"
              href={post.link}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 font-medium text-foreground text-sm group-hover:text-primary">
                  {post.title}
                </span>
                <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>
              {formatDate(post.isoDate, post.pubDate) && (
                <span className="text-muted-foreground text-xs">
                  {formatDate(post.isoDate, post.pubDate)}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
