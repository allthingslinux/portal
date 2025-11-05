import type { Cms } from '@portal/cms';
import { ContentRenderer } from '@portal/cms';

import { ChangelogHeader } from './changelog-header';
import { ChangelogNavigation } from './changelog-navigation';

interface ChangelogDetailProps {
  entry: Cms.ContentItem;
  content: unknown;
  previousEntry: Cms.ContentItem | null;
  nextEntry: Cms.ContentItem | null;
}

export function ChangelogDetail({
  entry,
  content,
  previousEntry,
  nextEntry,
}: ChangelogDetailProps) {
  return (
    <div>
      <ChangelogHeader entry={entry} />

      <div className="mx-auto flex max-w-3xl flex-col space-y-6 py-8">
        <article className="markdoc">
          <ContentRenderer content={content} />
        </article>
      </div>

      <ChangelogNavigation
        previousEntry={previousEntry}
        nextEntry={nextEntry}
      />
    </div>
  );
}
