"use client";

import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@portal/ui/ui/card";
import { Skeleton } from "@portal/ui/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

import type {
  UserContrib,
  UserInfo,
} from "@/features/integrations/lib/mediawiki/types";

interface WikiUserStatsResponse {
  contribs: UserContrib[];
  ok: boolean;
  userInfo: UserInfo;
}

async function fetchWikiUserStats(): Promise<WikiUserStatsResponse> {
  const response = await fetch("/api/integrations/mediawiki/user-stats");

  if (!response.ok) {
    throw new Error("Failed to load wiki stats");
  }

  return response.json() as Promise<WikiUserStatsResponse>;
}

function formatDate(dateStr: string): string {
  if (!dateStr) {
    return "—";
  }
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function WikiUserStatsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["integrations", "mediawiki", "user-stats"],
    queryFn: fetchWikiUserStats,
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Wiki Activity</CardTitle>
        <BookOpen className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading && <WikiUserStatsSkeleton />}
        {isError && (
          <p className="text-destructive text-sm">Failed to load wiki stats</p>
        )}
        {data?.ok && <WikiUserStatsContent data={data} />}
      </CardContent>
    </Card>
  );
}

function WikiUserStatsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

function WikiUserStatsContent({ data }: { data: WikiUserStatsResponse }) {
  const { userInfo, contribs } = data;
  const mostRecentEdit = contribs[0]?.timestamp;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="font-bold text-2xl tabular-nums">
          {userInfo.editCount.toLocaleString()}
        </div>
        <p className="text-muted-foreground text-xs">total edits</p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">
          Registered {formatDate(userInfo.registration)}
        </p>
        {mostRecentEdit && (
          <p className="text-muted-foreground text-xs">
            Last edit {formatDate(mostRecentEdit)}
          </p>
        )}
      </div>
    </div>
  );
}
