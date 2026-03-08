"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import {
  ChangelogFilters,
  type EntryTypeFilterValue,
} from "@/features/changelog/components/changelog-filters";
import { TimelineView } from "@/features/changelog/components/timeline-view";
import { parseConventionalCommit } from "@/features/changelog/lib/parser";
import type {
  ConventionalCommitType,
  RepoError,
  RepoSummary,
  TimelineEntry,
} from "@/features/changelog/lib/types";

const PAGE_SIZE = 30;

interface ChangelogContentProps {
  entries: TimelineEntry[];
  errors: RepoError[];
  repos: RepoSummary[];
}

export function ChangelogContent({
  entries,
  errors,
  repos,
}: ChangelogContentProps) {
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [entryTypeFilter, setEntryTypeFilter] =
    useState<EntryTypeFilterValue>("all");
  const [selectedCommitTypes, setSelectedCommitTypes] = useState<
    Set<ConventionalCommitType>
  >(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredEntries = useMemo(() => {
    let list = entries;
    if (selectedRepos.size > 0) {
      list = list.filter((e) => selectedRepos.has(e.repoId));
    }
    if (entryTypeFilter === "releases") {
      list = list.filter((e) => e.type === "release");
    } else if (entryTypeFilter === "commits") {
      list = list.filter((e) => e.type === "commit");
    }
    if (selectedCommitTypes.size > 0) {
      list = list.filter((e) => {
        if (e.type !== "commit") {
          return false;
        }
        const parsed = parseConventionalCommit(e.message);
        return parsed.type !== null && selectedCommitTypes.has(parsed.type);
      });
    }
    return list;
  }, [entries, selectedRepos, entryTypeFilter, selectedCommitTypes]);

  function toggleRepo(repoId: string) {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }

  function handleEntryTypeChange(value: EntryTypeFilterValue) {
    setEntryTypeFilter(value);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleCommitType(type: ConventionalCommitType) {
    setSelectedCommitTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }

  function resetFilters() {
    setSelectedRepos(new Set());
    setEntryTypeFilter("all");
    setSelectedCommitTypes(new Set());
    setVisibleCount(PAGE_SIZE);
  }

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  if (entries.length === 0 && errors.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-16">
        <AlertTriangle className="mb-3 size-8 text-destructive/60" />
        <p className="font-medium text-foreground">
          Changelog data is temporarily unavailable
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ChangelogFilters
        entryType={entryTypeFilter}
        onCommitTypeToggle={toggleCommitType}
        onEntryTypeChange={handleEntryTypeChange}
        onRepoToggle={toggleRepo}
        onReset={resetFilters}
        repos={repos}
        selectedCommitTypes={selectedCommitTypes}
        selectedRepos={selectedRepos}
      />
      <TimelineView
        entries={filteredEntries}
        onLoadMore={loadMore}
        visibleCount={visibleCount}
      />
    </div>
  );
}
