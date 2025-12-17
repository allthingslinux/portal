import type { Cms } from "~/features/cms/core";

import { DocsCard } from "./docs-card";

export function DocsCards({ cards }: { cards: Cms.ContentItem[] }) {
  const cardsSortedByOrder = [...cards].sort((a, b) => a.order - b.order);

  return (
    <div className={"absolute flex w-full flex-col gap-4 pb-48 lg:max-w-2xl"}>
      {cardsSortedByOrder.map((item) => (
        <DocsCard
          key={item.title}
          link={{
            url: `/docs/${item.slug}`,
          }}
          subtitle={item.description}
          title={item.title}
        />
      ))}
    </div>
  );
}
