import Link from "next/link";

export function DocsCard({
  title,
  subtitle,
  children,
  link,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string | null;
  link: { url: string; label?: string };
}>) {
  return (
    <Link className="flex flex-col" href={link.url}>
      <div
        className={
          "flex grow flex-col gap-y-0.5 rounded border p-4 hover:bg-muted/70"
        }
      >
        <h3 className="mt-0 font-medium text-lg hover:underline dark:text-white">
          {title}
        </h3>

        {subtitle && (
          <div className="text-muted-foreground text-sm">
            <p dangerouslySetInnerHTML={{ __html: subtitle }} />
          </div>
        )}

        {children && <div className="text-sm">{children}</div>}
      </div>
    </Link>
  );
}
